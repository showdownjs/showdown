/**
 * @file      makehtml/inline/rawHtml.js
 * @summary   Raw inline HTML in the unified inline scan (CommonMark spec §6.6) plus the Showdown-only whole-`<a>` swallow.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Two `makehtml.inline.*` construct definitions share this file, both triggered by `<` — the third
 * and lowest-priority member of the shared `<` bucket (wholeAnchor 10 → autolink 20, inline/autolink.js
 * → rawHtml 30, this file), reproducing the historic fixed try-order: the Showdown whole-anchor
 * swallow is tried first, then an angle autolink, and only then a bare raw-HTML tag/comment/PI/
 * declaration/CDATA. Declining (returning null) here lets the `<` render as literal text.
 *
 *   - `makehtml.inline.rawHtml.wholeAnchor` (priority 10, `enabled: !options.cmSpec`) — the
 *     Showdown-flavors-only anti-double-link mechanism: swallow a whole raw `<a ...>...</a>` as one
 *     atomic match so the simplifiedAutoLink naked-URL post-pass can never re-link the anchor's
 *     inner text. cmSpec never enters the dispatch table for this construct at all (the old file's
 *     in-handler `!options.cmSpec` test becomes the `enabled` gate instead — under cmSpec the
 *     CommonMark open/close-tag recognizer below handles the two tags of a hand-written anchor
 *     separately, parsing its inner content as ordinary Markdown, which is the CommonMark-correct
 *     behavior).
 *   - `makehtml.inline.rawHtml` (priority 30, `enabled: true`) — the CommonMark inline raw-HTML
 *     recognizer: one open tag, close tag, comment, processing instruction, declaration or CDATA
 *     section per match, active for every flavor.
 *
 * Both follow the scan-state calling convention — (scan, options, globals) — consuming (returning
 * the new cursor) or declining (returning null); see inline/entity.js for the fuller scan-convention
 * explanation.
 *
 * EVENTS (new with this file — the old dispatcher-free pair was a defect, the same one already
 * ruled for entity/backslash/hardLineBreak): every recognized piece of raw HTML — whichever arm
 * matched it — fires `makehtml.rawHtml.onCapture` / `.onHash` through one shared build function,
 * `inlineRawHtmlBuild`. This is a scan construct (capture/hash only; the surrounding lifecycle
 * belongs to the inline engine's onStart/onEnd) and a variant-less family (three dot-separated
 * segments, so the family umbrella never re-dispatches it under a different name). The wholeAnchor
 * swallow fires the family exactly ONCE for the entire swallow — its `wholeMatch` is the complete
 * `<a ...>...</a>`, not the opening tag alone. Payload contract: `matches.text` IS the html (there
 * is no separate "content" to extract from a tag/comment/PI/declaration/CDATA — the match already
 * is the finished markup), and a listener-edited `matches.text` commits VERBATIM on hash — unlike a
 * link or a `<br>`, there is no tag-building step to re-run the edit through, because the user's own
 * HTML *is* the output. `attributes` is present on the capture payload (every construct capture
 * carries one, per the event contract's shape), but nothing here reads it: no tag is built, so
 * there is nothing to apply attributes to.
 *
 * REGION TRACKER (a general mechanism, activated only for `<a>` pairs today — see
 * `inlineRawHtmlTrackedPairs`): as the plain recognizer walks real open/close tag matches across
 * the scan, it maintains `scan.memos.rawHtmlPairDepth`, a per-tag-name open/close depth counter,
 * so later constructs can tell whether the cursor sits inside a user-written `<tag>...</tag>` pair
 * without re-scanning anything themselves. Only `<a>` is tracked for now — a nested `<a>` is the
 * one case where raw, hand-written HTML is itself invalid (an anchor cannot contain an anchor),
 * which is exactly the gap this closes: `inline/ghMentions.js` reads the depth (guarded) to keep a
 * `@mention` from linking inside a hand-written `<a href="x">thanks @tivie</a>`, and its `.linkify`
 * aux (called on a resolved wrapper's already-rendered inner, where the tracker's own scan-time
 * read cannot reach) re-derives the same protection from the hashed placeholders directly via
 * `showdown.helper.rawAnchorRanges` (helpers/gfmAutolinks.js). Every consumer reads the tracker
 * state through a fully guarded expression — `scan.memos.rawHtmlPairDepth && scan.memos.rawHtmlPairDepth.a`
 * — so its absence (this file deleted, or no tag seen yet this scan) means simply "not inside": that
 * guard is the deletability contract, both for this file and for any future tag added to the
 * tracked set.
 *
 * REDOS MACHINERY (ported verbatim from the old file, renamed only): the whole-anchor swallow
 * guards its `[\s\S]*` match with a memoized "is there a `</a>` ahead" check before ever running
 * the regex, the plain recognizer's declaration/PI/CDATA productions get the same "is there a
 * terminator ahead" guard (`inlineRawHtmlCannotClose`), and the one production that guard cannot
 * cover — the HTML comment, whose content loop can step over a wrongly-spaced `-->` and run on to
 * end of input even with a terminator present — gets its own deterministic cursor scan
 * (`inlineRawHtmlScanComment`) with a per-position failure memo. All three exist because the naive
 * regex forms are quadratic on adversarial input; see the inline comments at each site for the
 * measured blowups and the fuzzing note backing the comment scanner's language.
 *
 * Deletability: removing this file removes inline raw-HTML recognition, the whole-anchor swallow
 * and the `<a>` region tracker together — `<` falls through to autolink.js's decline path and
 * renders as literal text, and every guarded `scan.memos.rawHtmlPairDepth` read elsewhere reverts
 * to "not inside" (see the region-tracker paragraph above).
 */

/* jshint esnext: false, esversion: 9 */

// Showdown flavors only (see the construct's `enabled` gate below): a whole raw inline
// `<a ...>...</a>` is consumed atomically so its inner text is never re-linked by the
// simplifiedAutoLink naked-URL post-pass (mirrors the "hash the whole <a>" step legacy
// link.js ran before naked links). Sticky + anchored at the scan cursor; a single
// `[\s\S]*` (linear backtrack to the last `</a>`) keeps it ReDoS-safe. cmSpec keeps the
// CommonMark behavior (open/close tags recognized separately, inner content parsed).
const inlineRawHtmlWholeAnchorRegex = /<a\s[^>]*>[\s\S]*<\/a>/y;

// The inline raw-HTML recognizer, built from the shared CommonMark HTML-tag source. This read of
// showdown.helper.regexes.cmHTMLTagSource happens at LOAD time (file-level const): cmHTMLTagSource
// is defined in a src/helpers file (helpers/regexes.js), and helpers load before subParsers in the
// concat ORDER, so a load-time read from a subParsers file is safe. Sticky + anchored at the scan
// cursor so it never slices the tail of the string.
const inlineRawHtmlTagRegex = new RegExp('(?:' + showdown.helper.regexes.cmHTMLTagSource + ')', 'y');

// Productions whose content class matches newlines and which only end at a required terminator:
// the sticky regex above scans to end-of-input before failing whenever the terminator is missing,
// and the engine dispatches at EVERY `<`, so an opener run costs one full scan each — O(n^2)
// (`'<!DOCTYPE x '.repeat(8000)` took ~3.2s). None of the other productions can match at these
// prefixes (an open tag needs `<` + letter, a close tag `</`, and `-`/`[` are not letters), so
// when the terminator is absent the whole attempt is skipped. Same reasoning as the whole-anchor
// guard above: a production that cannot close cannot match.
//
// NOTE `scan.str` is the current block's text, not the document, so "no terminator ahead" is
// scoped to this block — which is exactly the scope the match would have had.
const inlineRawHtmlEndings = [
  {prefix: '<![CDATA[', memo: 'cdata',       ends: [']]>']},
  {prefix: '<?',        memo: 'pi',          ends: ['?>']},
  {prefix: '<!',        memo: 'declaration', ends: ['>'], letterAfter: true}
];

// The region tracker's activation set (see the file docblock): general shape — any tag name could
// be added here in the future — but only `<a>` is tracked today, because a nested `<a>` is the one
// invalid-HTML case a construct downstream (inline/ghMentions.js) needs to avoid creating.
const inlineRawHtmlTrackedPairs = {a: true};

// Tag-name extraction for the region tracker: applied to a matched tag's text (`m[0]` from
// inlineRawHtmlTagRegex), so these never see a comment/PI/declaration/CDATA production (those
// don't start with a letter or `/` and so never match either).
const inlineRawHtmlOpenTagNameRegex = /^<([A-Za-z][A-Za-z0-9-]*)/,
    inlineRawHtmlCloseTagNameRegex = /^<\/([A-Za-z][A-Za-z0-9-]*)/,
    inlineRawHtmlSelfClosingRegex = /\/>$/;

/**
 * Length of the HTML comment starting at `i`, or -1 if there is none.
 *
 * Recognizes exactly the language of the `cmHTMLComment` production in helpers/regexes.js —
 * including the `<!-->`/`<!--->` literals and Showdown's deliberate `--!>` terminator — but as a
 * cursor scan, and so is used in place of that alternative. A terminator-presence guard cannot
 * cover this production: its content loop consumes dashes in threes, so it steps over a `-->`
 * whose preceding dash run is the wrong length and then runs on to end-of-input
 * (`'z <!--a---> '.repeat(8000)` took ~900ms, quadratic, with a terminator present throughout).
 *
 * The grammar is deterministic with at most four characters of lookahead, so the walk from a
 * given cursor is fixed. `failed` caches the cursors already known to run out of input, which is
 * what keeps a RUN of openers linear: two walks that meet at the same cursor have the same fate,
 * so a later opener stops as soon as it merges into an earlier failed walk. Without it each
 * opener would still pay a full scan — the scan is linear, the run of them was not.
 *
 * Equivalence with the regex verified by differential fuzzing over ~36M positions.
 *
 * Note the dash-run parity is CommonMark's actual comment language (content may not end in `-`),
 * verified against the reference implementation — it must be preserved exactly, not "simplified"
 * to a lazy `[\s\S]*?` scan, which would wrongly accept `<!--a--->`.
 */
function inlineRawHtmlScanComment (str, i, failed) {
  'use strict';
  let n = str.length;
  if (str.charAt(i) !== '<' || str.charAt(i + 1) !== '!' ||
      str.charAt(i + 2) !== '-' || str.charAt(i + 3) !== '-') { return -1; }
  // the two literal forms have no content section at all
  if (str.charAt(i + 4) === '>') { return 5; }
  if (str.charAt(i + 4) === '-' && str.charAt(i + 5) === '>') { return 6; }

  let j = i + 4,
      path = [];
  while (j < n) {
    if (failed[j] === 1) { break; }
    path.push(j);
    if (str.charAt(j) !== '-') { j++; continue; }
    if (j + 1 >= n) { break; }
    if (str.charAt(j + 1) !== '-') { j += 2; continue; }
    // at `--`: either a terminator, or content that consumes the pair plus what follows
    if (j + 2 >= n) { break; }
    let c2 = str.charAt(j + 2);
    if (c2 === '>') { return j + 3 - i; }
    if (c2 !== '!') { j += 3; continue; }
    if (j + 3 >= n) { break; }
    if (str.charAt(j + 3) === '>') { return j + 4 - i; }
    j += 4;
  }
  // no terminator reachable from any cursor on this walk
  for (let p = 0; p < path.length; ++p) { failed[path[p]] = 1; }
  return -1;
}

/**
 * True when the production that could start at `i` has no terminator ahead of it, so the regex
 * attempt is guaranteed to fail. Terminator positions are found once per production per scan and
 * memoized on `scan.memos` (fresh per scan object, and `scan.str` never changes under it).
 */
function inlineRawHtmlCannotClose (scan, str, i) {
  'use strict';
  let memo = scan.memos.rawHtmlEnds || (scan.memos.rawHtmlEnds = {});
  for (let k = 0; k < inlineRawHtmlEndings.length; ++k) {
    let e = inlineRawHtmlEndings[k];
    if (str.slice(i, i + e.prefix.length) !== e.prefix) { continue; }
    if (e.letterAfter && !/[A-Za-z]/.test(str.charAt(i + e.prefix.length))) { continue; }
    if (memo[e.memo] === undefined) {
      let last = -1;
      for (let t = 0; t < e.ends.length; ++t) {
        last = Math.max(last, str.lastIndexOf(e.ends[t]));
      }
      memo[e.memo] = last;
    }
    return memo[e.memo] < i;
  }
  return false;
}

/**
 * Run one recognized piece of raw HTML through the construct's capture -> hash flow and return the
 * FINAL html — UNHASHED (builds-never-hash convention: the caller wraps the result with
 * `scan.hashSpan`). Shared by BOTH registrations below, so a listener sees the same event family
 * regardless of which arm matched — the whole-anchor swallow calls it once with the complete
 * `<a>...</a>`, the plain recognizer calls it once per tag/comment/PI/declaration/CDATA.
 *
 * There is no tag to rebuild here: unlike an anchor or a `<br>`, the captured content already IS
 * the finished HTML the user wrote. A listener-produced `output` wins outright (the general
 * precedence rule shared by every construct); otherwise the (possibly listener-edited)
 * `matches.text` commits VERBATIM — there is no rendering step to re-run the edit through, because
 * there is no derivation from "text" to "html" here in the first place. `attributes` is present on
 * the capture payload per the event contract's shape (every construct capture carries one), but is
 * unused: no tag is built, so there is nothing to apply attributes to.
 * @param {string} wholeMatch the recognized raw HTML — the whole `<a>...</a>` swallow, or a single
 *   tag/comment/PI/declaration/CDATA production
 * @param {{}} options
 * @param {{}} globals
 * @returns {string}
 */
function inlineRawHtmlBuild (wholeMatch, options, globals) {
  'use strict';

  let capture = showdown.Event.dispatchCapture('makehtml.rawHtml.onCapture', wholeMatch, {
    regexp: null,
    matches: {
      _wholeMatch: wholeMatch,
      text: wholeMatch
    },
    attributes: {}
  }, options, globals);

  // listener-produced output takes precedence and flows raw; otherwise the (possibly
  // listener-edited) text commits verbatim — see the docblock above for why there is no
  // rendering step to re-derive it through.
  let otp = (capture.output && capture.output !== '') ? capture.output : capture.matches.text;

  let hash = showdown.Event.dispatchHash('makehtml.rawHtml.onHash', otp, options, globals);
  return hash.output;
}

/**
 * The region tracker (see the file docblock's REGION TRACKER section): called only from the plain
 * recognizer's inlineRawHtmlTagRegex-exec arm, once per matched OPEN or CLOSE tag (comments/PI/declarations/
 * CDATA are not tags and never reach here — `inlineRawHtmlOpenTagNameRegex` /
 * `inlineRawHtmlCloseTagNameRegex` simply fail to match their text, so this is a no-op for them).
 *
 * An opener only increments `scan.memos.rawHtmlPairDepth[name]` when a matching closer exists
 * AHEAD of the cursor — memoized per tag name on `scan.memos.rawHtmlPairCloseIndex`, mirroring the
 * wholeAnchor construct's `lastAnchorClose` idiom — because an opener with no closer ahead must
 * NOT open a region: it would otherwise stay "open" for the rest of the scan and mask every
 * downstream construct's guard for no reason, the same runaway the wholeAnchor guard exists to
 * prevent for its own swallow. A self-closing opener (`<tag ... />`) never opens a region either —
 * it has no separate closer to pair with.
 * @param {{}} scan
 * @param {string} str
 * @param {number} i index of the tag's opening `<`
 * @param {string} tag the matched tag text (`m[0]` from inlineRawHtmlTagRegex)
 */
function inlineRawHtmlTrackPair (scan, str, i, tag) {
  'use strict';

  let open = inlineRawHtmlOpenTagNameRegex.exec(tag);
  if (open) {
    let name = open[1].toLowerCase();
    if (!inlineRawHtmlTrackedPairs[name]) { return; }
    if (inlineRawHtmlSelfClosingRegex.test(tag)) { return; }

    let closeMemo = scan.memos.rawHtmlPairCloseIndex || (scan.memos.rawHtmlPairCloseIndex = {});
    if (closeMemo[name] === undefined) {
      closeMemo[name] = str.toLowerCase().lastIndexOf('</' + name + '>');
    }
    if (closeMemo[name] > i) {
      let depth = scan.memos.rawHtmlPairDepth || (scan.memos.rawHtmlPairDepth = {});
      depth[name] = (depth[name] || 0) + 1;
    }
    return;
  }

  let close = inlineRawHtmlCloseTagNameRegex.exec(tag);
  if (close) {
    let name = close[1].toLowerCase();
    if (!inlineRawHtmlTrackedPairs[name]) { return; }
    let depth = scan.memos.rawHtmlPairDepth;
    if (depth && depth[name]) { depth[name]--; }
  }
}

showdown.subParser('makehtml.inline.rawHtml.wholeAnchor', {

  // `<` is a SHARED trigger: wholeAnchor (10, this arm) → autolink (20, inline/autolink.js) →
  // rawHtml (30, the plain recognizer below), reproducing the historic fixed try-order.
  triggers: '<',
  priority: 10,

  // Showdown flavors only: under cmSpec this construct never enters the dispatch table at all, so
  // `<a` falls straight through to the autolink/rawHtml arms below it in the bucket — see the file
  // docblock for why cmSpec's per-tag recognition is the CommonMark-correct behavior here.
  enabled: function (options) {
    return !options.cmSpec;
  },

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;

    if (str.charAt(i + 1) === 'a' || str.charAt(i + 1) === 'A') {
      // Lazily-computed position of the LAST `</a>` (case-insensitive) in the string, memoized on
      // scan.memos across the scan; -2 = not yet computed, -1 = none. The whole-anchor swallow below
      // can only match when a `</a>` lies ahead of the cursor, so this guard caps its cost on
      // `</a>`-free input (each failed regex attempt would otherwise scan to EOF -> O(n^2) on
      // `'<a '.repeat(n)`).
      if (scan.memos.lastAnchorClose === undefined) { scan.memos.lastAnchorClose = -2; }
      if (scan.memos.lastAnchorClose === -2) { scan.memos.lastAnchorClose = str.toLowerCase().lastIndexOf('</a>'); }
      if (scan.memos.lastAnchorClose > i) {
        inlineRawHtmlWholeAnchorRegex.lastIndex = i;
        let a = inlineRawHtmlWholeAnchorRegex.exec(str);
        if (a) {
          scan.appendRaw(scan.hashSpan(inlineRawHtmlBuild(a[0], options, globals)));
          return i + a[0].length;
        }
      }
    }
    // Decline: not an `<a`, no `</a>` ahead, or no whole-anchor match at the cursor. The scanner
    // offers `<` to autolink next, then rawHtml, then finally to literal-text handling.
    return null;
  }
});

showdown.subParser('makehtml.inline.rawHtml', {

  // Lowest priority of the shared `<` bucket (see the file docblock) — active for every flavor.
  triggers: '<',
  priority: 30,

  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;

    // A comment is the one production the terminator guard cannot cover, so it gets the scanner;
    // nothing else in the grammar can match at a `<!--` prefix, hence the unconditional return.
    if (str.charAt(i + 2) === '-' && str.slice(i, i + 4) === '<!--') {
      let failed = scan.memos.commentFail || (scan.memos.commentFail = new Uint8Array(str.length));
      let len = inlineRawHtmlScanComment(str, i, failed);
      if (len === -1) { return null; }
      let wholeMatch = str.substr(i, len);
      scan.appendRaw(scan.hashSpan(inlineRawHtmlBuild(wholeMatch, options, globals)));
      return i + len;
    }
    if (inlineRawHtmlCannotClose(scan, str, i)) { return null; }

    // `inlineRawHtmlTagRegex` is shared and sticky, so `lastIndex` is stale after the early
    // returns above — harmless only because it is assigned here before every use.
    inlineRawHtmlTagRegex.lastIndex = i;
    let m = inlineRawHtmlTagRegex.exec(str);
    if (m === null) { return null; }

    // Region tracker (open/close tag matches only — see inlineRawHtmlTrackPair's docblock for why
    // a comment/PI/declaration/CDATA match never reaches this point in the first place).
    inlineRawHtmlTrackPair(scan, str, i, m[0]);

    scan.appendRaw(scan.hashSpan(inlineRawHtmlBuild(m[0], options, globals)));
    return i + m[0].length;
  }
});
