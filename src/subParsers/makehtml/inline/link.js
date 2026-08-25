/**
 * @file      makehtml/inline/link.js
 * @summary   Markdown links (`[..](..)` + reference forms) in the inline engine (CommonMark spec §6.3, §6.5).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Owns the `[` push and the LINK side of the `]` close-bracket resolution. The `![` push and the
 * IMAGE side of the close belong to inline/image.js — the two files share `]` as a trigger and
 * arbitrate it through the engine's priority-ordered bucket (link 10 → image 20), not through a
 * call from one file into the other. There is no cross-file orchestrator: link.js and image.js
 * each own their full close sequence end to end (see the docblock note on the ~15-line duplication
 * below).
 *
 * ---- the shared `]` bucket contract --------------------------------------------------------
 *
 * `scan.brackets` is the head of a stack of open `[`/`![` entries (pushed by this file and by
 * inline/image.js — see the entry shape below). Every construct in the `]` bucket follows the same
 * rule, proven first by the `<` trio (inline/rawHtml.js's wholeAnchor → inline/autolink.js →
 * inline/rawHtml.js's plain form):
 *
 *   - DECLINE (return `null`, no side effects at all — no pop, no appendText) when the top entry
 *     is not yours: `opener === null` (no open bracket) or `opener.image !== <this file's kind>`.
 *     A handler MUST NOT mutate `scan.brackets` or the node list before declining — the next
 *     handler in the bucket has to see untouched state, exactly as it sees the top of
 *     `scan.brackets` unchanged after a decline here.
 *   - Once a handler determines the top entry IS its kind, it OWNS the close and ALWAYS consumes
 *     from that point on — an inactive opener, a suffix/reference match failure, and a successful
 *     resolution are all "consume" outcomes (they just differ in what they emit).
 *
 * link.js sits at priority 10 in the `]` bucket, image.js at 20, so link is offered every `]`
 * first: it declines outright when the top opener is an image's `![` (`opener.image === true`),
 * handing the character to image.js next.
 *
 * ---- the bracket-entry shape ----------------------------------------------------------------
 *
 * `{node, prev, prevDelim, image, active, matchStart, sourceStart}` — `node` is the text node the
 * `[`/`![` push appended (so the close can truncate the list back to it); `prev` chains to the
 * next-outer open bracket; `prevDelim` is a GUARDED snapshot of `scan.memos.delimiters`, emphasis's
 * delimiter-stack top, read as `(scan.memos.delimiters || null)` — emphasis owns that memo key, so
 * a scan with no emphasis construct registered degrades to a `null` stack bottom instead of
 * throwing; the degradation stays confined to this one field. `image` distinguishes a `[` opener
 * (`false`) from a `![` opener (`true`); `active` starts `true` and is cleared by an INNER link's
 * successful resolution (see the deactivation loop below) so an outer link opener can no longer
 * resolve — "a link cannot contain a link". `matchStart` is the index of the opening `[`/`![`
 * (used to slice `wholeMatch`); `sourceStart` is the index where the label text begins (just past
 * the opener), used both to slice the raw reference-label source and, for an image opener, to
 * slice the raw alt-text label in image.js.
 *
 * inline/ghMentions.js reads `scan.brackets` (guarded, since it runs before this file existed on
 * the engine path too) to decline linking a `@mention` while any bracket is open, so `[ @user](x)`
 * keeps `@user` literal in the label instead of nesting an anchor inside the link.
 *
 * ---- emphasis fencing ----------------------------------------------------------------------
 *
 * A resolving link's label can contain unresolved `*`/`_` delimiters (`[*em* text](/url)`).
 * Resolving the link must (a) pair those delimiters NOW, scoped to the label, before the label is
 * rendered, and (b) remove them from emphasis's live stack afterward so they cannot pair again with
 * something outside the label. Both are GUARDED calls into emphasis's file-local functions
 * (`inlineEmphasisProcess`/`inlineEmphasisPruneDelimiters`, defined in inline/emphasis.js and
 * reachable here only because the concat model runs every source file in one shared scope) —
 * absent emphasis, the guards are no-ops and delimiter-stack fencing simply does not apply (there
 * is nothing to fence). `opener.prevDelim`, the stack bottom captured at push time, is what scopes
 * both calls to exactly the delimiters opened since this bracket.
 *
 * ---- variants -------------------------------------------------------------------------------
 *
 * Two capture/hash event variants, matching the legacy `link.js`/`image.js` split: `inline` for
 * `[text](dest "title")`, `reference` for every reference spelling — full `[text][ref]`, collapsed
 * `[text][]` and shortcut `[text]` all fold into `reference` (they always did; the shortcut/
 * collapsed distinction was never surfaced as its own variant). The event families are unchanged:
 * `makehtml.link.inline.*` / `makehtml.link.reference.*`.
 *
 * ---- the dropped hardLineBreak re-apply (RULED CHANGE) --------------------------------------
 *
 * This is the ONE deliberate behavioral difference from the retired makehtml/link.js: that file
 * ran `showdown.subParser('makehtml.hardLineBreaks')(innerHTML, ...)` on the resolved label after
 * rendering it (old link.js:212). That re-apply is DROPPED here. Hard line breaks are scan-native
 * now (see inline/hardLineBreak.js) — a `  \n` inside a resolving label was already dispatched to
 * the hardLineBreak construct while the scan built the label's nodes, long before the label is
 * rendered here, so the break is already present in `innerHTML` and re-running the whole-text pass
 * over it would be redundant. inline/underline.js, inline/strikethrough.js and inline/emphasis.js
 * made the identical removal at their own migrations, for the identical reason. The parity harness
 * pins this with a `  \n` inside a label case.
 *
 * ---- deletability -----------------------------------------------------------------------------
 *
 * Deleting this file removes ONLY link recognition: a `[` no longer opens a bracket, so `[x](y)`
 * renders as literal text (`scan.brackets` stays `null` forever and every `]` bucket entry that's
 * left — image.js's — declines on `opener === null`). Images are unaffected: `![x](y)` keeps
 * working exactly as before, because image.js owns its own `![`/`]` pair independently and shares
 * only the read-only cm* helpers with this file, not any state or call path. This is the reverse of
 * the historic coupling (the old image.js was an aux builder link.js's close-bracket resolution
 * invoked directly) — that coupling is retired.
 *
 * This is a `makehtml.inline.*` construct subparser (scan-state convention — (scan, options,
 * globals) instead of (text, options, globals); see inline/entity.js for the fuller scan-convention
 * explanation).
 */

/* jshint esnext: false, esversion: 9 */

/**
 * Render and hash-protect one resolved `<a>`. File-local to link.js (this construct's `]` arm is
 * its sole caller) — builds-never-hash: returns the UNHASHED anchor HTML, the caller wraps it with
 * `scan.hashSpan`.
 * @param {{}} scan
 * @param {{}} options
 * @param {{}} globals
 * @param {string} innerHTML the already-rendered label content
 * @param {string} dest the resolved (not yet normalized) destination
 * @param {(string|null|undefined)} title the resolved title, or null/undefined
 * @param {string} variant `inline` or `reference` — drives the capture/hash event family
 * @param {string} wholeMatch the full source text of the resolved construct
 * @returns {string}
 */
function inlineLinkBuild (scan, options, globals, innerHTML, dest, title, variant, wholeMatch) {
  'use strict';

  // safeMode: neutralize dangerous URL schemes (javascript:, vbscript:, data:, ...)
  let href = (options.safeMode && !showdown.helper.isSafeUrl(dest)) ? '' : showdown.helper.cmNormalizeAnchorDest(dest, options);
  // Emoji, strikethrough and ellipsis are all scan-native — the `:name:`/`~~`/`...` in the link
  // label are already resolved by the scan (emoji substituted inline for every flavor, strikethrough
  // via the pairing call above, ellipsis inline), so none are re-applied here. The GFM link passes
  // (naked URL/mail linkify) are deliberately NOT run on link text — a link cannot be nested inside
  // another link.
  let attributes = {href: href};
  showdown.helper.cmBuildTitleAttr(attributes, title, options);

  let capture = showdown.Event.dispatchCapture('makehtml.link.' + variant + '.onCapture', wholeMatch, {
    regexp: null,
    matches: {_wholeMatch: wholeMatch, _url: dest, _title: title, text: innerHTML},
    attributes: attributes
  }, options, globals);

  let otp;
  if (capture.output && capture.output !== '') {
    otp = capture.output;
  } else {
    attributes = capture.attributes;
    otp = '<a' + showdown.helper._populateAttributes(attributes) + '>' + (capture.matches.text || '') + '</a>';
  }
  let hash = showdown.Event.dispatchHash('makehtml.link.' + variant + '.onHash', otp, options, globals);
  return hash.output;
}

showdown.subParser('makehtml.inline.link', {

  // Owns the PUSH of `[` outright (no other construct opens a link bracket) and shares `]` with
  // inline/image.js — see the file docblock's bucket contract. `!` is image.js's alone.
  triggers: '[]',
  priority: 10,

  // Always on: links are core Markdown syntax in every flavor. The flavor differences (space-
  // tolerant references, base64 data-URI destinations, parseImgDimensions, safeMode, ...) are
  // internal gates of the handler and the cm* helpers it calls, not a participation gate.
  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        pos = scan.pos,
        ch = str.charAt(pos);

    if (ch === '[') {
      let node = scan.appendText('[');
      scan.brackets = {
        node: node,
        prev: scan.brackets,
        // GUARDED read of emphasis-owned state: emphasis owns scan.memos.delimiters; absent
        // emphasis (file deleted) this degrades to a null stack bottom, confined to this field.
        prevDelim: scan.memos.delimiters || null,
        image: false,
        active: true,
        matchStart: pos,       // index of the opening `[`
        sourceStart: pos + 1   // index where the label text begins
      };
      return pos + 1;
    }

    // ch === ']' — the shared bucket contract (see the file docblock).
    let opener = scan.brackets;

    // Decline: no open bracket, or the open bracket is an image's `![` — image.js's `]` arm
    // (priority 20, next in the bucket) owns that close. No side effects on either branch.
    if (opener === null || opener.image) { return null; }

    // From here link OWNS the close and ALWAYS consumes.

    if (!opener.active) {
      // Deactivated by an inner link's successful resolution (see the loop at the bottom of this
      // handler): a link cannot contain a link, so this bracket can never resolve — pop it and
      // render the `]` literally.
      scan.brackets = opener.prev;
      scan.appendText(']');
      return pos + 1;
    }

    let dest = null, title = null, endIdx = pos + 1, variant = 'inline';

    let suffix = showdown.helper.cmScanLinkSuffix(str, pos + 1, options);
    if (suffix) {
      dest = suffix.dest;
      title = suffix.title;
      endIdx = suffix.end;
    } else {
      variant = 'reference';
      let ref = showdown.helper.cmResolveLinkReference(str, pos, opener.sourceStart, options, globals);
      if (ref) {
        dest = ref.dest;
        title = ref.title;
        endIdx = ref.endIdx;
      }
    }

    if (dest === null) {
      // Neither an inline suffix nor a matching reference: pop and render the `]` literally.
      scan.brackets = opener.prev;
      scan.appendText(']');
      return pos + 1;
    }

    // Emphasis fencing (see the file docblock): resolve delimiters inside the label NOW, scoped to
    // this bracket, before the label is rendered. Guarded — see the docblock's emphasis-fencing note.
    if (typeof inlineEmphasisProcess === 'function') {
      inlineEmphasisProcess(scan, options, globals, opener.prevDelim);
    }

    // Strikethrough pairing: resolve tilde-run nodes inside the resolving label into `<del>`, AFTER
    // emphasis, scoped to the label's node range. This is what makes label strikethrough work for
    // ALL flavors — a cmSpec link label now strikes too. applyGfm is false (a link cannot nest a
    // link, so its inner is never linkified).
    if (options.strikethrough) {
      showdown.subParser('makehtml.inline.strikethrough.pair')(scan, options, globals, opener.node.next, null, false);
    }

    // collect and render the inner nodes
    let innerHTML = scan.renderNodes(opener.node.next, null),
        wholeMatch = str.slice(opener.matchStart, endIdx);

    // Hard line breaks are NOT re-applied here — see the file docblock's RULED CHANGE note.
    let otpHTML = inlineLinkBuild(scan, options, globals, innerHTML, dest, title, variant, wholeMatch);

    // drop the opener node and everything after it, append the built (now hashed) span
    scan.list.removeFrom(opener.node);
    scan.appendRaw(scan.hashSpan(otpHTML));

    // remove any emphasis delimiters that belonged to the consumed range (guarded, see above)
    if (typeof inlineEmphasisPruneDelimiters === 'function') {
      inlineEmphasisPruneDelimiters(scan, opener.prevDelim);
    }

    // a link cannot be nested in another link: deactivate every outer LINK opener (an outer image
    // opener is untouched — an image may still resolve around a nested link)
    for (let b = opener.prev; b !== null; b = b.prev) {
      if (!b.image) { b.active = false; }
    }

    scan.brackets = opener.prev;
    return endIdx;
  }
});
