/**
 * @file      helpers/gfmAutolinks.js
 * @summary   The shared GFM anchor machinery used by the inline anchor constructs that route through it (nakedUrl/ghMentions).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * `prepareAnchorAttributes` (the event-free anchor preparation: href/title normalization,
 * base URL, escaping — returns the validated attributes so the CALLING SUBPARSER can run its own
 * event flow and build the tag), the `validAutolinkHost` GFM host validator and the three
 * `*_ANCHOR_URL_POLICY` href-policy constants. Helpers never fire events — events belong to the
 * subparsers: every caller here dispatches its own event family, builds its tag from the
 * (possibly listener-edited) attributes and hash-protects the result itself. Callers are
 * `inline/link.js`, `inline/image.js`, `inline/autolink.js`, `inline/nakedUrl.js` and
 * `inline/ghMentions.js`; `validAutolinkHost` is shared by the autolink construct's `<www...>`
 * arm and the naked-URL linkify pass. The one real divergence between the LEGACY and CM_GFM
 * policies — the CM/GFM href policy deliberately does NOT run safeMode / cmNormalizeURL / the
 * quote-angle attribute escape on the href (doing so would corrupt the entity-encoded mailto
 * emitted by encodeEmails) — is injected through the `urlPolicy` argument rather than forked.
 *
 * A THIRD policy, `ANGLE_AUTOLINK_URL_POLICY`, backs the angle-bracket autolink construct
 * (`<uri>`/`<email>`/`<www...>`, CommonMark spec §6.5). It is not a third point on the same
 * LEGACY/CM_GFM spectrum — it is a genuinely different, narrower pipeline, because the spec treats
 * an autolink's enclosed text as the literal destination verbatim: no `applyBaseUrl`, no entity
 * decoding, no backslash-escape stripping (all of which `cmNormalizeURL` does for a link/image
 * destination — see `cmEncodeURI` vs `cmNormalizeURL` in helpers/commonmark.js for why the two
 * pipelines diverge on purpose), no `*`/`-`/`~`/`:` escape-placeholdering, no attribute quote/angle
 * hardening. Under this policy `prepareAnchorAttributes` takes an early, self-contained branch
 * (see below) rather than threading extra flags through the shared chain. Load-order safe: every
 * cross-helper / subParser / Event reference happens inside function bodies (call time).
 *
 * `rawAnchorRanges(text, globals)` is unrelated to anchor BUILDING: it locates the stretches of an
 * already-scanned text that sit inside a user-written `<a>...</a>` (recognized by inline/rawHtml.js
 * as a pair of hashed placeholders), so the naked-URL and ghMentions linkify passes can decline to
 * nest a new anchor inside one the user wrote by hand. Lives here rather than in inline/rawHtml.js because
 * its two callers are both linkify passes, not the raw-HTML construct itself.
 */

/**
 * The href post-processing a caller wants `prepareAnchorAttributes` to apply. The legacy anchor
 * policy enables all three; the CM/GFM policy (cmSpec, and the GFM naked-URL/mention overlay)
 * enables none of them. Each flag still respects the relevant runtime option (`safeMode` also
 * checks `options.safeMode`; `cmNormalize` also checks `options.cmSpec`).
 */
showdown.helper.LEGACY_ANCHOR_URL_POLICY = {safeMode: true, cmNormalize: true, escapeAttr: true};
showdown.helper.CM_GFM_ANCHOR_URL_POLICY = {safeMode: false, cmNormalize: false, escapeAttr: false};

/**
 * The angle-bracket autolink policy (CommonMark spec §6.5). A `<uri>`/`<www...>` href is
 * `cmEncodeURI`'d and its `&` entity-escaped, and NOTHING else — see the file docblock for why
 * this is a separate pipeline rather than another point on the LEGACY/CM_GFM spectrum. `angle: true`
 * is the discriminator `prepareAnchorAttributes` branches on below.
 */
showdown.helper.ANGLE_AUTOLINK_URL_POLICY = {angle: true};

/**
 * Prepare the attributes of an `<a>` anchor: apply the base URL, the policy-gated href
 * post-processing (safeMode scheme neutralization, cmSpec percent-encoding, the `*`/`-`/`~`/`:`
 * escape-placeholdering so later passes leave the url alone, the attribute-quote hardening) and
 * the title normalization. EVENT-FREE by design — helpers never fire events. The calling
 * subparser dispatches its own capture (with these attributes in the payload, so listeners can
 * edit them), builds the tag from the possibly-edited result (`_populateAttributes`) and hashes
 * it. Returns the validated properties rather than a finished tag because an evented caller
 * must capture BEFORE building.
 *
 * `urlPolicy === ANGLE_AUTOLINK_URL_POLICY` takes an early, self-contained branch: `url` is
 * `cmEncodeURI`'d and its `&` entity-escaped (CommonMark autolinks skip `applyBaseUrl`, entity
 * decoding and backslash-escape stripping entirely — see the file docblock), and `safeMode`
 * neutralizes to an EMPTY STRING href (not the legacy policy's own neutralization) while keeping
 * the visible text — the caller renders `capture.matches.text` regardless of `href`. `rawHref`
 * is angle-policy-only: the angle-bracket EMAIL arm hands a fully pre-built href (`mailto:...`,
 * possibly entity-encoded by `encodeEmailAddress`) that must survive completely untouched — no
 * percent-encoding and, matching the historic parser (which never safe-mode-checked the email
 * arm either), no safeMode check.
 * @param {string} url the resolved destination (before normalization)
 * @param {string|null} title the raw title, or null/undefined for none
 * @param {{}} options
 * @param {{safeMode: boolean, cmNormalize: boolean, escapeAttr: boolean}|{angle: boolean}} urlPolicy
 * @param {boolean} [rawHref] angle policy only: `url` is already a finished href — pass it through untouched
 * @returns {{href: string, title: (string|undefined)}}
 */
showdown.helper.prepareAnchorAttributes = function (url, title, options, urlPolicy, rawHref) {
  'use strict';

  let attributes = {};

  if (urlPolicy.angle) {
    let href = rawHref ? url : showdown.helper.cmEncodeURI(url).replace(/&/g, '&amp;');
    // safeMode: neutralize dangerous autolink schemes but keep the visible text. A pre-built
    // (rawHref) href is never safeMode-checked, matching the historic email-arm behavior.
    if (!rawHref && options.safeMode && !showdown.helper.isSafeUrl(url)) {
      href = '';
    }
    attributes.href = href;
    return attributes;
  }

  url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
  // safeMode: neutralize dangerous URL schemes (javascript:, vbscript:, data:, ...)
  if (urlPolicy.safeMode && options.safeMode && !showdown.helper.isSafeUrl(url)) {
    url = '';
  }
  // cmSpec flavors percent-encode the destination (policy-gated: the CM/GFM overlay skips it,
  // see the policy constants above)
  if (urlPolicy.cmNormalize && options.cmSpec) {
    url = showdown.helper.cmNormalizeURL(url);
  }
  // showdown.helper.regexes.asteriskDashTildeAndColon (the regex inline: `/([*_:~])/g`) escapes
  // the magic chars that would re-trigger emphasis/emoji/strikethrough if left bare in this
  // literal href text. The shared constant is scheduled for a later refactor (naming/location
  // under review).
  url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapePlaceholder);
  // escape characters that would otherwise break out of the quoted href attribute
  // (a `"` in the destination is an attribute-injection vector). cmSpec flavors already
  // percent-encode the URL above, so this is a no-op there.
  if (urlPolicy.escapeAttr) {
    url = url
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  attributes.href = url;

  if (title && showdown.helper.isString(title)) {
    if (options.cmSpec) {
      title = showdown.helper.cmEscapeTitle(title);
    } else {
      title = title
        .replace(/"/g, '&quot;');
    }
    // Same magic-char guard as the href above (`/([*_:~])/g`, via showdown.helper.regexes.
    // asteriskDashTildeAndColon — scheduled for a later refactor).
    title = title.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapePlaceholder);
    attributes.title = title;
  }

  return attributes;
};

/**
 * GFM extended www autolink host validation: the host must have at least two labels and the last
 * two must not contain `_`. Explicit-scheme (http/https/ftp) urls are not domain-validated. Shared
 * (≥2 call sites → helper per the project's rule) by the autolink construct (the `<www...>` arm)
 * and the simplifiedAutoLink naked-URL post-pass.
 * @param {string} url
 * @param {boolean} isWww
 * @returns {boolean}
 */
showdown.helper.validAutolinkHost = function (url, isWww) {
  if (!isWww) { return true; }
  let host = url.split(/[/?#]/)[0],
      labels = host.split('.');
  if (labels.length < 2) { return false; }
  return !/_/.test(labels.slice(-2).join('.'));
};

/**
 * The stretches of `text` that lie strictly between a raw-anchor OPENER placeholder and its
 * matching CLOSER placeholder — i.e. the already-hashed inner content of a user-written
 * `<a>...</a>` recognized by the raw-HTML construct (inline/rawHtml.js) as two separate tag
 * matches. Used to keep a linkify pass (naked-URL, ghMentions) from nesting a NEW anchor inside
 * one the user wrote by hand — an `<a>` cannot legally contain another `<a>`.
 *
 * A whole-anchor SWALLOW (the `wholeAnchor` construct: a complete `<a ...>...</a>` hashed as one
 * span in a single match, Showdown flavors only) must NOT open a region here: its inner text is
 * already fully protected by living inside one opaque placeholder, so treating its opening tag as
 * an OPENER would incorrectly keep a region open past its own closer (which is never seen as a
 * separate placeholder — there isn't one). The OPENER test excludes it structurally: a whole-anchor
 * span always contains its own `</a`, which a real standalone opening `<a ...>` tag never does.
 *
 * Walks the `¨C<n>C` span placeholders left to right, resolving each to its stored HTML via
 * `globals.gHtmlSpans`; an index with nothing stored (should not happen from real scan output, but
 * defensive here) is treated as plain text — neither an opener nor a closer. Depth-tracks nested
 * opener/closer pairs; an unclosed region at end of text closes at `text.length` (defensive — with
 * the raw-HTML construct's own "closer ahead" scan guard a real opener is never left unclosed by
 * scan output, but this function also runs on a resolved wrapper's inner text, e.g. inside
 * strikethrough, which is serialized text this helper has no scan guard over).
 *
 * Two callers (≥2 call sites, the project's helper threshold): the naked-URL linkify pass
 * (inline/nakedUrl.js) and the ghMentions linkify aux (inline/ghMentions.js).
 * @param {string} text
 * @param {{}} globals
 * @returns {Array<[number, number]>} `[start, end)` index pairs, in ascending order, each end
 *   exclusive
 */
showdown.helper.rawAnchorRanges = function (text, globals) {
  'use strict';

  let ranges = [],
      depth = 0,
      regionStart = -1,
      re = /¨C(\d+)C/g,
      m;

  while ((m = re.exec(text)) !== null) {
    let span = globals.gHtmlSpans[m[1]];
    if (span === undefined) { continue; }

    let isOpener = /^<a[\s>]/i.test(span) && !/<\/a/i.test(span),
        isCloser = /^<\/a(\s|>)/i.test(span);

    if (isOpener) {
      if (depth === 0) { regionStart = re.lastIndex; }
      depth++;
    } else if (isCloser && depth > 0) {
      depth--;
      if (depth === 0) {
        ranges.push([regionStart, m.index]);
        regionStart = -1;
      }
    }
  }
  if (depth > 0 && regionStart !== -1) {
    ranges.push([regionStart, text.length]);
  }

  return ranges;
};
