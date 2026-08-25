/**
 * @file      makehtml/inline/ghMentions.js
 * @summary   GFM `@mention` linking, gated by the `ghMentions` option.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Links `@username` via `options.ghMentionsLink`. Emits capture/hash per linked mention under its
 * OWN variant of the link family (`makehtml.link.ghMention.onCapture` / `.onHash`) — a mention is
 * its own construct, so listeners target it precisely by the variant name, and through the family
 * umbrella every mention also fires `makehtml.link.onCapture`/`.onHash` for listeners that address
 * all links at once (the historic routing through `makehtml.link.reference.*`, indistinguishable
 * from real reference links, is retired with this file). The onStart/onEnd lifecycle belongs to the inline engine. A declined `@`
 * emits nothing.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). Deleting this file removes @mention
 * linking and nothing else — every `@` becomes ordinary literal text.
 *
 * The mention resolves DURING the scan (the historic post-scan pass moved inline), with three
 * ruled behaviors:
 *   - Mentions NEVER link inside a bracket construct — while any `[`/`![` opener is live on the
 *     bracket stack the handler declines, so `[ @user](x)` keeps `@user` literal in the label
 *     rather than nesting an `<a>` in the link. A mention in a bracket that never resolves
 *     (`text [ @user]`) is left literal too.
 *   - Mentions NEVER link inside a user-written `<a>` either — `<a href="x">thanks @tivie</a>`
 *     keeps `@tivie` literal rather than nesting an anchor, which would be invalid HTML. The
 *     raw-HTML construct (inline/rawHtml.js) maintains a per-tag open/close depth on `scan.memos`
 *     as it walks real `<a>`/`</a>` tag matches; the handler below reads it through a guarded
 *     expression, so the guard is a harmless no-op when that construct is absent or hasn't seen an
 *     anchor yet this scan (the deletability contract — see rawHtml.js's REGION TRACKER section).
 *     The `.linkify` aux below re-derives the same protection independently, from the resolved
 *     inner text's hashed placeholders, since it cannot see the scan-time tracker at all.
 *   - A mention links inside an underline region (`__@user__` -> `<u><a>@user</a></u>`),
 *     consistent with how emphasis inner content links.
 *   - The whole username is captured before emphasis runs, so `@user_name_here` links as one
 *     mention everywhere.
 *
 * The `(^|\s)` fragment anchor of the old pass is a scan-state boundary test: legal only at the
 * fragment start (scan.pos === 0), after a raw whitespace char, or when the node-list tail is a
 * pending emphasis DELIMITER node — the last case reproduces the old pass's fragment-^ match on
 * emphasis inner content (`*@user*`); it reads the `delim` nodes emphasis owns (see the shared
 * delimiter-state section in inline/emphasis.js). A finished raw/hashed or plain-text tail is NOT
 * a boundary (the pass saw a placeholder/word letter there, so `[x](y)@user` and `a@user` did not
 * match). The old pass's `(\\)?` escape arm has no scan analogue: `\@` is turned into a
 * `¨E<code>E` escape placeholder by the backslash construct before this ever runs, so the `@`
 * never reaches here.
 *
 * Two registrations:
 *   - `makehtml.inline.ghMentions` — the definition object (the primary, engine-dispatched form).
 *   - `makehtml.inline.ghMentions.linkify` — an INTERNAL text-convention aux entry
 *     (text, options, globals) -> text used only to link mentions inside a RESOLVED wrapper
 *     span's already-rendered inner content, where the scan cannot: a strikethrough `<del>` is
 *     resolved at pairing time (inline/strikethrough.js's buildDel) from `tilde`-typed nodes, not
 *     the `delim` nodes the boundary rule keys on, so its inner mentions are linked here instead.
 *     Emphasis/underline need no such call — an `*`/`_` run is a pending `delim` (the boundary
 *     rule links `*@user*` during the scan) and an underline region re-scans its inner from the
 *     fragment start; only strikethrough's node shape forces resolution-time linking. The aux
 *     entry is the historic post-scan pass body verbatim (same `(^|\s)` boundary regex on
 *     rendered inner), so a resolved `<del>` links exactly as before. The engine ignores function
 *     entries in the namespace, so it is dispatch-inert.
 */

/* jshint esnext: false, esversion: 9 */

// Username recognizer, `@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*)`, sticky-anchored at the scan cursor
// (lastIndex set before every exec, so reuse is safe) — same match set as the historic pass; the
// boundary is a scan-state test rather than a capture group.
const inlineGhMentionsUserRegex = /@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*)/yi,
    // the historic post-scan pass's boundary+username pattern (aux linkify form below); /g but only
    // ever handed to String.replace, which resets lastIndex, so reuse is safe
    inlineGhMentionsLinkifyRegex = /(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gi,
    // the `{u}` username token in options.ghMentionsLink
    inlineGhMentionsUrlTokenRegex = /\{u}/g,
    // whitespace tester for the boundary rule (stateless)
    inlineGhMentionsWhitespaceRegex = /\s/;

// Build the mention anchor and run the construct's own capture/hash flow. Shared by the scan
// handler and the linkify aux entry; returns the final (unhashed) anchor HTML. The href
// normalization is the EVENT-FREE helper showdown.helper.prepareAnchorAttributes — the helper
// prepares, the subparser fires the events and builds the tag (the taxonomy rule).
function inlineGhMentionsBuild (wholeMatch, mentions, username, options, globals) {
  'use strict';

  // Gate 6: cmSpec pins the CommonMark href policy (CM_GFM_ANCHOR_URL_POLICY — safeMode,
  // cmNormalizeURL and the quote/angle attribute escape all skipped); the Showdown flavors reuse
  // the legacy link.js policy (LEGACY_ANCHOR_URL_POLICY) so these anchors stay byte-identical to
  // the non-cmSpec path.
  let policy = options.cmSpec ? showdown.helper.CM_GFM_ANCHOR_URL_POLICY : showdown.helper.LEGACY_ANCHOR_URL_POLICY;
  // ghMentionsLink is validated at initialization: it is declared `type: 'string'` in options.js
  // and the Converter constructor's validateOptions (and setOption's re-validation) enforce the
  // declared type, so a non-string never reaches conversion.
  let url = options.ghMentionsLink.replace(inlineGhMentionsUrlTokenRegex, username),
      attributes = showdown.helper.prepareAnchorAttributes(url, null, options, policy);

  let capture = showdown.Event.dispatchCapture('makehtml.link.ghMention.onCapture', wholeMatch, {
    regexp: null,
    matches: {
      _wholeMatch: wholeMatch,
      _username: username,
      _url: url,
      text: mentions
    },
    attributes: attributes
  }, options, globals);
  let otp;
  if (capture.output && capture.output !== '') {
    // listener-produced output takes precedence and flows raw to the later passes
    otp = capture.output;
  } else {
    // render the (possibly listener-edited) captured text as the anchor body, with the
    // (possibly listener-edited) attributes
    otp = '<a' + showdown.helper._populateAttributes(capture.attributes) + '>' + (capture.matches.text || '') + '</a>';
  }
  let hash = showdown.Event.dispatchHash('makehtml.link.ghMention.onHash', otp, options, globals);
  return hash.output;
}

showdown.subParser('makehtml.inline.ghMentions', {

  // Sole owner of `@` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '@',
  priority: 10,

  // Option-gated: when `ghMentions` is off the construct never enters the dispatch table, so `@`
  // is not a trigger character at all and flows into plain-text runs at full speed.
  enabled: function (options) {
    return !!options.ghMentions;
  },

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        pos = scan.pos;

    // Mentions never link inside a bracket construct: while any `[`/`![` opener is live on the
    // bracket stack, decline so the `@username` stays literal in the (image alt / link) label.
    // (`scan.brackets` is the bracket constructs' stack head; until links/images migrate no
    // bracket opener can exist, so the guard is inert — it goes live with them.)
    if (scan.brackets) { return null; }

    // Mentions never link inside a user-written <a>: the raw-HTML construct maintains the pair
    // depth (inline/rawHtml.js); a guarded read means this is a harmless no-op when that
    // construct is absent or hasn't seen an anchor yet — the deletability contract.
    if (scan.memos.rawHtmlPairDepth && scan.memos.rawHtmlPairDepth.a) { return null; }

    let prev = pos > 0 ? str.charAt(pos - 1) : '',
        prevWs = pos > 0 && inlineGhMentionsWhitespaceRegex.test(prev),
        tail = scan.list.tail,
        tailIsDelim = !!tail && tail.type === 'delim';
    // BOUNDARY: fragment start, a whitespace char, or a pending emphasis delimiter run (the
    // emphasis inner-content case). Otherwise decline (a finished raw/hashed or plain-text tail
    // is not a boundary).
    if (pos !== 0 && !prevWs && !tailIsDelim) { return null; }

    inlineGhMentionsUserRegex.lastIndex = pos;
    let m = inlineGhMentionsUserRegex.exec(str);
    if (!m) { return null; }
    let username = m[1],
        mentions = m[0]; // `@` + username

    // wholeMatch mirrors the old pass's group 0 (`st + mentions`) so a listener reading
    // `_wholeMatch` sees the same value: `st` is the whitespace boundary char when the boundary
    // was whitespace, else ''.
    let st = prevWs ? prev : '';
    scan.appendRaw(scan.hashSpan(inlineGhMentionsBuild(st + mentions, mentions, username, options, globals)));
    return pos + mentions.length;
  }
});

/**
 * True when `pos` falls strictly inside one of the raw-anchor ranges computed by
 * `showdown.helper.rawAnchorRanges` — i.e. inside a user-written `<a>...</a>`'s already-rendered
 * inner content. File-local (the `.linkify` aux below is its only caller).
 * @param {Array<[number, number]>} ranges
 * @param {number} pos
 * @returns {boolean}
 */
function inlineGhMentionsInAnchorRange (ranges, pos) {
  'use strict';
  for (let k = 0; k < ranges.length; ++k) {
    if (pos >= ranges[k][0] && pos < ranges[k][1]) { return true; }
  }
  return false;
}

// INTERNAL aux entry — links mentions in a resolved wrapper span's already-rendered inner content
// (see the file docblock). Called only by inline/strikethrough.js's buildDel (a `<del>` is
// resolved from `tilde` nodes at pairing time, so the `delim`-keyed scan boundary never fired
// inside it, and so the scan-time raw-HTML region tracker never ran over this text either);
// emphasis and underline link their inner during the scan and never call this. It is the historic
// post-scan ghMentions pass verbatim — the same `(^|\s)` fragment-boundary regex over the rendered
// inner string — so a resolved `<del>` links exactly as it did before ghMentions moved into the
// scan. Real links / images / code spans in the inner are already hashed, so they are protected
// from the regex; a user-written `<a>...</a>` inside the inner is additionally protected by
// `rawAnchorRanges` below (the scan-time tracker in inline/rawHtml.js cannot see this text, since
// it runs at resolution time, after the scan).
showdown.subParser('makehtml.inline.ghMentions.linkify', function (text, options, globals) {
  'use strict';

  if (!options.ghMentions) {
    return text;
  }
  // Cheap fast path: skip the ranges computation entirely when the text carries no hashed span at
  // all (so no raw anchor could possibly be present).
  let anchorRanges = text.indexOf('¨C') !== -1 ? showdown.helper.rawAnchorRanges(text, globals) : [];
  return text.replace(inlineGhMentionsLinkifyRegex, function (wholeMatch, st, escape, mentions, username, offset) {
    // bail if the mentions was escaped
    if (escape === '\\') {
      return st + mentions;
    }
    // bail if the mention sits inside a user-written <a> — nesting a new anchor there would be
    // invalid HTML (see the file docblock and inline/rawHtml.js's REGION TRACKER section)
    if (inlineGhMentionsInAnchorRange(anchorRanges, offset + st.length)) {
      return wholeMatch;
    }
    // this form works on serialized text (no scan), so the built anchor is hash-protected here
    // directly with `_hashHTMLSpan` (the same primitive `scan.hashSpan` calls at scan time — the
    // ruled hash-primitive switch, same rationale as inline/nakedUrl.js's linkify arms)
    return st + showdown.helper._hashHTMLSpan(inlineGhMentionsBuild(wholeMatch, mentions, username, options, globals), globals);
  });
});
