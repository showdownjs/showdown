/**
 * @file      makehtml/inline/nakedUrl.js
 * @summary   GFM naked-URL / naked-mail autolinking (the `simplifiedAutoLink` option).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Links bare `http(s)://` / `ftp://` / `www.` runs, `xmpp:` and `mailto:` addresses and bare email
 * addresses. Emits capture/hash per built anchor under its OWN variant of the link family
 * (`makehtml.link.autolink.onCapture` / `.onHash`) — so listeners target autolinks precisely by the
 * variant name, and through the family umbrella every anchor also fires `makehtml.link.onCapture` /
 * `.onHash` for listeners that address all links at once. The variant covers the naked URL, the
 * `xmpp:`/`mailto:` and the bare-mail forms; the angle-bracket autolink construct
 * (inline/autolink.js) fires the same variant. The onStart/onEnd lifecycle belongs to the inline engine
 * (`makehtml.inlineEngine.onStart/onEnd`). A declined trigger letter emits nothing.
 *
 * Three registrations, sharing one body:
 *   - `makehtml.inline.nakedUrl` — the definition OBJECT (the primary, engine-dispatched form; see
 *     inlineEngine.js for the contract and entity.js for the fuller scan-convention explanation).
 *     Its handler is the atomic-token recognizer: it consumes a bare URL run at the cursor so the
 *     `_`/`*` inside it never become emphasis delimiters. It builds no anchor and fires no events —
 *     the linkify pass below does both. Deleting this file removes naked-URL / naked-mail
 *     autolinking and nothing else: the trigger letters `h`/`w`/`f` lose their owner and flow into
 *     ordinary plain-text runs.
 *
 *     GATE SPLIT (ruled): `enabled` is gated purely on `options.simplifiedAutoLink` — PARTICIPATION
 *     (whether this construct's handler AND its `serialized` entry, see below, are in the table at
 *     all) is the option alone, so the serialized pass runs under cmSpec/gfm too. A former version
 *     of this gate also excluded `cmSpec`, which — now that the SAME definition object carries the
 *     `serialized` field — would have silenced the linkify pass entirely for the gfm flavor, not
 *     just the atomic-run recognizer. The `cmSpec` exclusion survives, narrowed, as the HANDLER's
 *     own first-line gate: under cmSpec the CommonMark flanking rules already leave URL underscores
 *     intact, so the atomic-run recognition is unnecessary there (the serialized linkify pass alone
 *     is sufficient) and the handler declines immediately, same net effect as before.
 *
 *   - `makehtml.inline.nakedUrl.linkify` — the POST-SCAN pass, registered as a plain FUNCTION
 *     (text, options, globals) -> text, which the engine ignores by dispatch table (a bare function
 *     entry, not a definition object), so it stays dispatch-inert; it MUST stay registered under
 *     this name regardless, because inline/strikethrough.js and inline/emphasis.js call it by name
 *     over their own already-resolved inner content (ruled). Its body is the file-local
 *     `inlineNakedUrlLinkify`, so this registration is a thin wrapper.
 *
 *   - the `serialized` field of the `makehtml.inline.nakedUrl` definition object — a direct
 *     same-file reference to `inlineNakedUrlLinkify`, so the inline engine's epilogue (see
 *     inlineEngine.js) runs the very same pass automatically, once, over the top-level serialized
 *     output, with no separate wiring.
 *
 * The pass form (not a scan construct) is a RULED design endpoint, not migration debt: this
 * construct's extent semantics are defined over the SERIALIZED inline output, not over scan tokens
 * (the GFM trailing-punctuation, entity-reference and `&lt;` split rules all read the rendered
 * string, where `<` is already `&lt;` and real links / images / code spans are hashed and therefore
 * protected).
 */

/* jshint esnext: false, esversion: 9 */

// ---- the scan recognizer's patterns (stateless: non-global, only ever `.test`ed) ----
const inlineNakedUrlSchemeProbeRegex = /^(?:https?:\/\/|ftp:\/\/|www\.)/i,
    // the run terminator set: whitespace, angle/quote chars and the hash sentinel `¨`
    inlineNakedUrlRunStopRegex = /[\s\\`<>![\]"'´¨]/;

// ---- the linkify pass's patterns ----
//
// Hoisted and built ONCE at load (the originals were rebuilt per call). All of them are either
// non-global testers or `/g` patterns handed exclusively to String.replace — which resets
// lastIndex on entry — so sharing a single instance across conversions is safe.
//
// cmSpec/gfm: an explicit scheme (http/https/ftp) links any non-empty host (no dot or
// leading-char constraint); a `www.` shortcut is dot-and-leading-char validated. The
// Showdown flavors (legacy simplifiedAutoLink, link.js) apply the SAME host constraint to
// scheme URLs as to `www.` ones — the host must not start with `.`/`-` and must contain a
// `.` — so `http:///a`, `http://-a.b.co` and `http://3628126748` stay plain text and
// `http://.www.foo.bar/` links only its `www.foo.bar/` tail. Two patterns, one per gate side,
// so cmSpec stays byte-identical.
// The body classes exclude the hash sentinel `¨` so an adjacent hash placeholder
// (e.g. `¨C0C` for a hashed span) is never absorbed into the href and percent-encoded
// into `%C2%A8...` — the placeholder must survive intact to be unhashed later.
// The leading `([_*~]*?)` group carries the markdown magic chars for cases like
// `__https://www.google.com/foobar__`.
const inlineNakedUrlCmSpecRegex = /([_*~]*?)((?:https?|ftp):\/\/[^\s<>"'`´¨]+|www\.[^\s<>"'`´.¨-][^\s<>"'`´¨]*?\.[a-z\d.]+[^\s<>"'¨]*)\1/gi,
    inlineNakedUrlLegacyRegex = /([_*~]*?)((?:(?:https?|ftp):\/\/|www\.)[^\s<>"'`´.¨-][^\s<>"'`´¨]*?\.[a-z\d.]+[^\s<>"'¨]*)\1/gi,
    // `www.` shortcut test (drives the GFM `<` boundary rule, the host validation and the
    // scheme prefixing)
    inlineNakedUrlIsWwwRegex = /^www\./i,
    // GFM: a trailing `;` that completes an entity-reference-like `&name`
    inlineNakedUrlEntityTailRegex = /&(?:amp;)?[a-z\d]+$/i,
    // GFM: `<`/`>` terminate the link; by this pass they are already escaped
    inlineNakedUrlLtGtRegex = /&(?:lt|gt);/,
    // cmSpec percent-encoding of the href's non-ASCII characters
    // eslint-disable-next-line no-control-regex -- \x00-\x7F is the ASCII range
    inlineNakedUrlNonAsciiRegex = /[^\x00-\x7F]+/g,
    // the trailing-punctuation trim's character classes
    inlineNakedUrlTrailingPunctRegex = /[_*~,;:.!?]/,
    inlineNakedUrlClosingBracketRegex = /[)\]]/,
    // the mail forms' trailing-punctuation trim
    inlineNakedUrlMailTrailRegex = /[.,;:!?]$/,
    // GFM extended email autolink domain validation
    inlineNakedUrlDomainTailRegex = /[-_]$/,
    inlineNakedUrlUnderscoreRegex = /_/;

// The mail-address building blocks, assembled into their three patterns once at load.
// A scheme is only recognised when it is not part of a preceding word (so `mmmmailto:`
// does not count) — any non-alphanumeric character (including `/`) is a valid boundary.
const inlineNakedUrlLocalPart = '[A-Za-z\\d._+-]+',
    inlineNakedUrlDomainPart = '[A-Za-z\\d_-]+(?:\\.[A-Za-z\\d_-]+)*',
    inlineNakedUrlSchemeBoundary = '(^|[^A-Za-z\\d])',
    inlineNakedUrlAddress = inlineNakedUrlLocalPart + '@' + inlineNakedUrlDomainPart;

// `xmpp:` addresses keep their scheme and an optional `/resource`; `mailto:` addresses keep their
// scheme but never carry a path; a bare address must be preceded by the string start or a
// character that cannot be part of the local-part (which also keeps the pattern out of hash
// placeholders like the `¨E43E` produced for an escaped char).
const inlineNakedUrlXmppRegex = new RegExp(inlineNakedUrlSchemeBoundary + '(xmpp:)(' + inlineNakedUrlAddress + ')(\\/[A-Za-z\\d._-]*)?', 'gi'),
    inlineNakedUrlMailtoRegex = new RegExp(inlineNakedUrlSchemeBoundary + '(mailto:)(' + inlineNakedUrlAddress + ')', 'gi'),
    inlineNakedUrlBareMailRegex = new RegExp('(^|[^A-Za-z\\d._+\\-\\u00a8])(' + inlineNakedUrlAddress + ')', 'g');

/**
 * Encode a bare email address into `{mail, url}` (a `mailto:` href), applying the entity
 * obfuscation of `encodeEmails` when enabled. File-local (the bare-mail arm is its sole caller).
 * @param {string} mail
 * @param {{}} options
 * @returns {{mail: string, url: string}}
 */
function inlineNakedUrlParseMail (mail, options) {
  'use strict';

  let url = 'mailto:';
  mail = showdown.helper.unescapePlaceholders(mail);
  if (options.encodeEmails) {
    url = showdown.helper.encodeEmailAddress(url + mail);
    mail = showdown.helper.encodeEmailAddress(mail);
  } else {
    url = url + mail;
  }
  return {
    mail: mail,
    url: url
  };
}

/**
 * The naked-URL trailing-punctuation trim: walk the captured URL from the back, moving trailing
 * `_*~,;:.!?` and unbalanced `)`/`]` into a suffix that is emitted after the link. Returns the
 * trimmed url and the accumulated suffix. File-local (the naked-URL arm is its sole caller); the
 * GFM-specific trimming layered on top stays in the linkify pass below.
 * @param {string} url
 * @returns {{url: string, suffix: string}}
 */
function inlineNakedUrlTrimPunctuation (url) {
  'use strict';

  const len = url.length;
  let suffix = '';

  // Bracket counts of the *remaining* url, tallied once up front and decremented as chars are
  // chopped: counting them per chopped char (url.match(/\(/g) and friends) rescanned the whole
  // string every iteration, which is O(n^2) on a long trailing `)))...` run.
  let counts = {'(': 0, ')': 0, '[': 0, ']': 0};
  for (let i = 0; i < len; ++i) {
    let c = url.charAt(i);
    if (Object.prototype.hasOwnProperty.call(counts, c)) {
      counts[c]++;
    }
  }

  function chop (char) {
    url = url.slice(0, -1);
    // prepend to the suffix — the order matters, later passes read suffix.charAt(0)
    suffix = char + suffix;
    if (Object.prototype.hasOwnProperty.call(counts, char)) {
      counts[char]--;
    }
  }

  for (let i = len - 1; i >= 0; --i) {
    let char = url.charAt(i);
    if (inlineNakedUrlTrailingPunctRegex.test(char)) {
      // it's a punctuation char so we remove it from the url
      chop(char);
    } else if (inlineNakedUrlClosingBracketRegex.test(char)) {
      // it's a parenthesis so we need to check for "balance" (kinda)
      let opPar = char === ')' ? counts['('] : counts['['],
          clPar = char === ')' ? counts[')'] : counts[']'];
      if (opPar < clPar) {
        // there are more closing Parenthesis than opening so chop it!!!!!
        chop(char);
      } else {
        // it's (kinda) balanced so our work is done
        break;
      }
    } else {
      // it's not a punctuation or a parenthesis so our work is done
      break;
    }
  }
  return {url: url, suffix: suffix};
}

/**
 * GFM extended email autolink domain validation: the domain must have at least two labels, must not
 * end in `-` or `_`, and its last two labels must not contain `_`. File-local (the naked-mail and
 * xmpp/mailto arms are its only callers).
 * @param {string} addr
 * @returns {boolean}
 */
function inlineNakedUrlValidMailAddr (addr) {
  'use strict';

  let at = addr.lastIndexOf('@');
  if (at < 1) { return false; }
  let domain = addr.slice(at + 1),
      labels = domain.split('.');
  if (labels.length < 2) { return false; }
  if (inlineNakedUrlDomainTailRegex.test(domain)) { return false; }
  return !inlineNakedUrlUnderscoreRegex.test(labels.slice(-2).join('.'));
}

/**
 * Build one autolink anchor and run the construct's own capture/hash flow. Shared by all four arms
 * of the linkify pass below (naked URL, xmpp, mailto, bare mail); returns the final (UNHASHED)
 * anchor HTML — the convention for shared build functions is that the CALLER hash-protects the
 * result with its own context's primitive (here always `showdown.helper._hashHTMLSpan`, the same
 * primitive `scan.hashSpan` calls at scan time — see the ruled hash-primitive switch below at each
 * arm's call site). The href normalization is the EVENT-FREE helper
 * showdown.helper.prepareAnchorAttributes — the helper prepares, the subparser fires the events and
 * builds the tag (the taxonomy rule).
 * @param {RegExp} pattern the matching regex (event metadata)
 * @param {string} wholeMatch
 * @param {string} text the anchor body
 * @param {string} url the destination, before prepareAnchorAttributes' normalization
 * @param {{}} options
 * @param {{}} globals
 * @returns {string}
 */
function inlineNakedUrlBuild (pattern, wholeMatch, text, url, options, globals) {
  'use strict';

  // Gate 6: cmSpec pins the CommonMark href policy (CM_GFM_ANCHOR_URL_POLICY — safeMode,
  // cmNormalizeURL and the quote/angle attribute escape all skipped); the Showdown flavors reuse
  // the legacy link.js policy (LEGACY_ANCHOR_URL_POLICY) so these anchors stay byte-identical to
  // the non-cmSpec path.
  let policy = options.cmSpec ? showdown.helper.CM_GFM_ANCHOR_URL_POLICY : showdown.helper.LEGACY_ANCHOR_URL_POLICY,
      attributes = showdown.helper.prepareAnchorAttributes(url, null, options, policy);

  let capture = showdown.Event.dispatchCapture('makehtml.link.autolink.onCapture', wholeMatch, {
    regexp: pattern,
    matches: {
      _wholeMatch: wholeMatch,
      _url: url,
      text: text
    },
    attributes: attributes
  }, options, globals);
  let otp;
  if (capture.output && capture.output !== '') {
    // listener-produced output takes precedence and flows raw to the later passes
    otp = capture.output;
  } else {
    // render the (possibly listener-edited) captured text as the anchor body, with the
    // (possibly listener-edited) attributes. The arms below pass plain anchor text — a
    // pre-escaped naked URL or mail address — which never contains inline markdown, so there is
    // nothing to re-parse here.
    otp = '<a' + showdown.helper._populateAttributes(capture.attributes) + '>' + (capture.matches.text || '') + '</a>';
  }
  let hash = showdown.Event.dispatchHash('makehtml.link.autolink.onHash', otp, options, globals);
  return hash.output;
}

showdown.subParser('makehtml.inline.nakedUrl', {

  // Sole owner of `h`/`w`/`f` (either case) — no other construct registers these letters, so the
  // priority only has to exist (the engine requires it to be explicit), not to win against anyone.
  triggers: 'hHwWfF',
  priority: 10,

  // Option-gated: when `simplifiedAutoLink` is off the construct never enters the dispatch table
  // (neither the handler below nor the `serialized` field further down), so the letters are not
  // trigger characters at all and flow into plain-text runs at full speed. PARTICIPATION is the
  // option alone (no `cmSpec` exclusion here — see the file docblock's GATE SPLIT note): the
  // `cmSpec` skip that used to live in this gate now lives in the handler's own first line instead,
  // so it narrows only the atomic-run recognizer, not the serialized linkify pass too.
  enabled: function (options) {
    return !!options.simplifiedAutoLink;
  },

  // Recognize a naked URL at the cursor. Consumes the maximal `http(s)://` / `ftp://` / `www.`
  // run, stopping at whitespace, angle/quote chars and the hash sentinel `¨` so an adjacent hash
  // placeholder is never absorbed. `&` is deliberately KEPT in the run (legacy's naked-URL regex
  // included it) so a query string like `?a=1&b=2` stays one atomic node with a literal `&`;
  // splitting on `&` here would let the `&` be entity-escaped to `&amp;` before the linkify pass
  // re-links it. Trailing emphasis markers `_ * ~` are trimmed back off (and left for the scanner)
  // so a URL wrapped in emphasis — `__https://x__` — still emphasizes; every other
  // trailing-punctuation / GFM trim stays in the linkify pass. The run is a single negated-class
  // loop (linear / ReDoS-safe).
  //
  // The run is emitted RAW, not HTML-escaped: the legacy simplifiedAutoLink pass ran on unescaped
  // text, so `&` and non-ASCII chars stay literal in the captured URL; if the linkify pass does
  // not actually link it, the trailing encodeAmpsAndAngles pass encodes any bare `&` — matching
  // the legacy result either way. Declines (returns null) when there is no URL run at the cursor.
  // eslint-disable-next-line no-unused-vars -- `globals` unused but kept for the makehtml.inline.* (scan, options, globals) convention
  handler: function (scan, options, globals) {
    'use strict';

    // cmSpec: the atomic-run recognizer is unnecessary under CommonMark/gfm — the flanking rules
    // already leave URL underscores intact, so there is nothing here for it to protect — and the
    // serialized linkify pass (this construct's `serialized` field, below) still runs regardless of
    // this decline (see the GATE SPLIT note in the file docblock and at `enabled` above).
    if (options.cmSpec) { return null; }

    let str = scan.str,
        i = scan.pos;
    if (!inlineNakedUrlSchemeProbeRegex.test(str.slice(i, i + 8))) { return null; }
    let n = str.length,
        j = i;
    while (j < n && !inlineNakedUrlRunStopRegex.test(str.charAt(j))) { j++; }
    while (j > i) {
      let c = str.charAt(j - 1);
      if (c === '_' || c === '*' || c === '~') { j--; } else { break; }
    }
    if (j <= i) { return null; }
    scan.appendRaw(str.slice(i, j));
    return j;
  },

  // The `serialized` REGISTRATION (see inlineEngine.js's registration contract): a direct
  // same-file reference to `inlineNakedUrlLinkify` (hoisted below — a function declaration, so it
  // is available here regardless of its position later in the file). The engine's epilogue runs
  // this automatically, once, over the top-level serialized pass output, in the fixed tail order —
  // see inlineEngine.js for exactly where. `makehtml.inline.nakedUrl.linkify` further down is a
  // thin wrapper over the very same function, kept registered under its historic name because
  // strikethrough.js / emphasis.js still call it directly by name over already-resolved inner
  // content that the top-level epilogue never sees.
  serialized: inlineNakedUrlLinkify
});

/**
 * True when `pos` falls strictly inside one of the raw-anchor ranges computed by
 * `showdown.helper.rawAnchorRanges` — i.e. inside a user-written `<a>...</a>`'s already-rendered
 * inner content, where linking a NEW anchor would nest one inside the other (invalid HTML).
 * File-local (the linkify pass below is its only caller).
 * @param {Array<[number, number]>} ranges
 * @param {number} pos
 * @returns {boolean}
 */
function inlineNakedUrlInRanges (ranges, pos) {
  'use strict';
  for (let k = 0; k < ranges.length; ++k) {
    if (pos >= ranges[k][0] && pos < ranges[k][1]) { return true; }
  }
  return false;
}

// The POST-SCAN pass body (see the file docblock): turns the recognized runs — and `xmpp:` /
// `mailto:` / bare addresses — into `<a>` anchors over the serialized inline output, where real
// links, images and code spans are already hashed and therefore protected from these patterns.
// Hoisted into this file-local function so both the `serialized` field of the
// `makehtml.inline.nakedUrl` definition object (above) and the `makehtml.inline.nakedUrl.linkify`
// registration (below) share the one body — the engine's epilogue calls the former automatically;
// strikethrough.js / emphasis.js call the latter directly by name over already-resolved inner
// content.
//
// Each of the four arms below recomputes `showdown.helper.rawAnchorRanges` fresh, over the CURRENT
// `text`, immediately before its own `String.replace` call — rather than once at the top of the
// pass. A single upfront computation would go stale: every arm REPLACES matched substrings with
// placeholder-bearing anchor output, which both shifts every later offset and introduces new `¨C`
// placeholders of its own, so ranges taken before arm 1 could no longer line up with arm 4's
// offsets (or account for anchors arm 1 itself just hashed). Recomputing four times over
// already-short inline text costs nothing that matters; correctness beats cleverness here.
function inlineNakedUrlLinkify (text, options, globals) {
  'use strict';

  // 8. Handle naked links (if option is enabled)
  if (options.simplifiedAutoLink) {
    // 8.1. Check for naked URLs
    // An explicit scheme (http/https/ftp) does not require the host to contain a dot;
    // a `www.` shortcut does (and is domain-validated below). See the pattern consts above
    // for the cmSpec / legacy host-constraint gate.
    let nakedUrlRegex = options.cmSpec ? inlineNakedUrlCmSpecRegex : inlineNakedUrlLegacyRegex;
    let ranges = showdown.helper.rawAnchorRanges(text, globals);
    text = text.replace(nakedUrlRegex, function (wholeMatch, leadingMDChars, url, offset, fullText) {
      // bail if the match sits inside a user-written <a> — see the pass-level comment above
      if (inlineNakedUrlInRanges(ranges, offset)) { return wholeMatch; }
      let isWww = inlineNakedUrlIsWwwRegex.test(url);
      // GFM boundary rule: a "www." autolink (unlike a scheme URL) is not recognized when
      // preceded by "<". By this pass "<" has been escaped to "&lt;", so a www match sitting
      // right after it (e.g. the interior of a malformed <www.x.com foo> the angle recognizer
      // could not consume) is left untouched — matching cmark-gfm, which links <https://x bim>
      // but not <www.x bim>.
      let urlStart = offset + leadingMDChars.length;
      if (isWww && fullText.substring(urlStart - 4, urlStart) === '&lt;') { return wholeMatch; }
      // trim trailing punctuation / unbalanced brackets off the URL into a suffix (the same trim
      // link.js applies); the GFM-specific trimming below is layered on top.
      let trimmed = inlineNakedUrlTrimPunctuation(url);
      url = trimmed.url;
      let suffix = trimmed.suffix;

      // GFM: a trailing ";" that completes an entity-reference-like "&name" is excluded
      // from the link, so move the whole "&name;" into the suffix.
      if (suffix.charAt(0) === ';') {
        let entity = url.match(inlineNakedUrlEntityTailRegex);
        if (entity) {
          url = url.slice(0, -entity[0].length);
          suffix = entity[0] + suffix;
        }
      }

      // GFM: "<" terminates the link. By this pass it has already been escaped to "&lt;"
      // (and ">" to "&gt;"), so split there and keep the remainder as plain text.
      let ltMatch = url.match(inlineNakedUrlLtGtRegex);
      if (ltMatch) {
        let at = url.indexOf(ltMatch[0]);
        suffix = url.slice(at) + suffix;
        url = url.slice(0, at);
      }

      // GFM: the last two labels of the host may not contain "_"; otherwise it is not a
      // valid autolink.
      if (!showdown.helper.validAutolinkHost(url, isWww)) {
        return wholeMatch;
      }

      // we copy the treated url to the text variable
      let txt = url;
      // finally, if it's a www shortcut, we prepend http(s)
      // noinspection HttpUrlsUsage
      url = isWww ? (options.httpsAutoLinks ? 'https://' : 'http://') + url : url;
      // GFM/cmSpec: percent-encode non-ASCII characters in the href (the display text keeps
      // the literal characters). The Showdown flavors (legacy simplifiedAutoLink) leave the
      // href's non-ASCII characters literal, so this is gated to cmSpec to stay byte-identical
      // to the legacy path.
      if (options.cmSpec) {
        url = url.replace(inlineNakedUrlNonAsciiRegex, function (s) { return encodeURI(s); });
      }

      // url part is done so let's take care of text now
      // we need to escape the text (because of links such as www.example.com/foo__bar__baz)
      // showdown.helper.regexes.asteriskDashTildeAndColon (the regex inline: `/([*_:~])/g`)
      // escapes the magic chars that would re-trigger emphasis/emoji/strikethrough if left bare
      // in this literal anchor text. The shared constant is scheduled for a later refactor
      // (naming/location under review).
      txt = txt.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapePlaceholder);

      // and return the link tag, with the leadingMDChars and suffix. The leadingMDChars are added
      // at the end too because we consumed those characters in the regexp. This pass works on
      // serialized text (no scan), so the built anchor is hash-protected here directly with
      // `_hashHTMLSpan` (the same primitive `scan.hashSpan` calls at scan time — the ruled
      // hash-primitive switch: `hashHTMLSpans`' whole-text tag-pair scan is unneeded when the
      // caller already knows exactly which string to protect, and using it here silently missed
      // any built anchor whose OWN output wasn't a clean `<tag>…</tag>` pair, e.g. listener-replaced
      // output).
      return leadingMDChars +
        showdown.helper._hashHTMLSpan(inlineNakedUrlBuild(nakedUrlRegex, wholeMatch, txt, url, options, globals), globals) +
        suffix +
        leadingMDChars;
    });

    // 8.2. Check for naked mail (GFM extended email autolink).
    // 8.2.1. `xmpp:` addresses keep their scheme and an optional `/resource`.
    ranges = showdown.helper.rawAnchorRanges(text, globals);
    text = text.replace(inlineNakedUrlXmppRegex, function (wholeMatch, lead, scheme, addr, resource, offset) {
      if (inlineNakedUrlInRanges(ranges, offset)) { return wholeMatch; }
      resource = resource || '';
      let trail = '',
          body = resource || addr;
      while (inlineNakedUrlMailTrailRegex.test(body)) {
        trail = body.slice(-1) + trail;
        body = body.slice(0, -1);
      }
      if (resource) { resource = body; } else { addr = body; }
      if (!inlineNakedUrlValidMailAddr(addr)) { return wholeMatch; }
      let target = 'xmpp:' + addr + resource;
      return lead + showdown.helper._hashHTMLSpan(inlineNakedUrlBuild(inlineNakedUrlXmppRegex, wholeMatch, target, target, options, globals), globals) + trail;
    });

    // 8.2.2. `mailto:` addresses keep their scheme but never carry a path.
    ranges = showdown.helper.rawAnchorRanges(text, globals);
    text = text.replace(inlineNakedUrlMailtoRegex, function (wholeMatch, lead, scheme, addr, offset) {
      if (inlineNakedUrlInRanges(ranges, offset)) { return wholeMatch; }
      let trail = '';
      while (inlineNakedUrlMailTrailRegex.test(addr)) {
        trail = addr.slice(-1) + trail;
        addr = addr.slice(0, -1);
      }
      if (!inlineNakedUrlValidMailAddr(addr)) { return wholeMatch; }
      let target = 'mailto:' + addr;
      return lead + showdown.helper._hashHTMLSpan(inlineNakedUrlBuild(inlineNakedUrlMailtoRegex, wholeMatch, target, target, options, globals), globals) + trail;
    });

    // 8.2.3. Bare addresses become mailto: links (the lead-char class also keeps us out of hash
    // placeholders like the `¨E43E` produced for an escaped char — see the pattern consts above).
    ranges = showdown.helper.rawAnchorRanges(text, globals);
    text = text.replace(inlineNakedUrlBareMailRegex, function (wholeMatch, lead, addr, offset) {
      if (inlineNakedUrlInRanges(ranges, offset)) { return wholeMatch; }
      if (!inlineNakedUrlValidMailAddr(addr)) { return wholeMatch; }
      const m = inlineNakedUrlParseMail(addr, options);
      return lead + showdown.helper._hashHTMLSpan(inlineNakedUrlBuild(inlineNakedUrlBareMailRegex, wholeMatch, m.mail, m.url, options, globals), globals);
    });
  }
  return text;
}

// Historic registration, retained so strikethrough.js / emphasis.js can keep calling it by name
// over already-resolved inner content the engine's own epilogue never sees (see the file docblock).
// A thin wrapper: the engine ignores it (it is a plain function, not a definition object), so this
// registration is dispatch-inert.
showdown.subParser('makehtml.inline.nakedUrl.linkify', function (text, options, globals) {
  'use strict';
  return inlineNakedUrlLinkify(text, options, globals);
});
