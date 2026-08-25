/**
 * @file      makehtml/inline/image.js
 * @summary   Markdown images (`![..](..)` + reference forms) in the inline engine (CommonMark spec §6.4).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Owns the `![` push and the IMAGE side of the `]` close-bracket resolution — the full construct
 * now, not an aux builder. The historic shape (the old makehtml/image.js was a builder link.js's
 * close-bracket resolution invoked directly, sharing that file's opener bookkeeping) is retired:
 * this file recognizes its own opener, resolves its own close and renders its own `<img>`,
 * independently of inline/link.js. The two files share only the read-only cm* helpers
 * (helpers/commonmark.js) and the bracket-entry SHAPE convention, never state or a call path.
 *
 * ---- the shared `]` bucket contract --------------------------------------------------------
 *
 * `scan.brackets` is the head of a stack of open `[`/`![` entries. inline/link.js sits at priority
 * 10 in the `]` bucket, this file at 20, so link is offered every `]` first and declines outright
 * when the top opener is this file's `![` (`opener.image === true`) — see inline/link.js's docblock
 * for the full contract (decline with no side effects when the top entry isn't yours; once it is,
 * own the close and always consume). This file mirrors that contract from the image side: decline
 * when `opener === null` or `!opener.image` (a `[` opener is link.js's).
 *
 * ---- the bracket-entry shape ----------------------------------------------------------------
 *
 * Identical shape to inline/link.js's (`{node, prev, prevDelim, image, active, matchStart,
 * sourceStart}`; see that file's docblock) with `image: true` and `sourceStart` pointing just past
 * the `![` (so the raw alt-text label is `str.slice(opener.sourceStart, idx)`). `active` and the
 * link-in-link deactivation loop are ported for SHAPE PARITY with link's opener, but an image
 * opener is never actually deactivated by anything today — the deactivation loop in inline/link.js
 * only clears `!b.image` entries, i.e. it always skips image openers — so this file's `active`
 * check exists only to mirror the guard, not because it is reachable in practice.
 *
 * ---- emphasis fencing / strikethrough pairing / hard line breaks ----------------------------
 *
 * Same treatment as inline/link.js, applied unconditionally regardless of the `image` flag — the
 * old close-bracket resolution ran the fencing/pairing/render sequence once, before branching on
 * `opener.image` only for the final build step, so an image ALT label gets the identical emphasis-
 * fencing and strikethrough-pairing treatment a link label gets (a `![*em* alt](/img.png)` alt
 * text pairs its emphasis exactly like a link label would). Hard line breaks are scan-native and
 * are not re-applied to the alt content, for the identical reason inline/link.js drops its re-apply
 * (see that file's docblock).
 *
 * The close-sequence orchestration below (fence → pair → render → build → surgery → prune → pop) is
 * therefore near-identical to inline/link.js's, ~15 lines, and is DELIBERATELY DUPLICATED rather
 * than factored into a shared cross-construct function — each bracket construct stays fully
 * self-contained (principle 2: the subparser is the unit of design), the same call this refactor
 * already made for inline/codeSpan.js's `inlineCodeSpanSkipRun` (see the helper audit's skipRun
 * precedent): two call sites of a few lines is cheaper to read duplicated than indirected through a
 * shared orchestrator that would itself need an `image` branch.
 *
 * ---- the `<img>` builder ---------------------------------------------------------------------
 *
 * Ported from the retired aux entry `makehtml.inline.image.build` (old image.js): alt-text
 * flattening (cmSpec strips markup from the rendered label; the Showdown flavors keep the RAW
 * label literal, backslash-escaped and `* _ : ~`-escaped), `src` normalization (safeMode allows
 * `data:image/*` via `{allowDataImage: true}`, unlike a link's `href`), the parseImgDimensions
 * width/height gate, and the listener alt-override rule (a listener that rewrote `matches.text`
 * wins over the computed `alt` for the rendered `alt` attribute, even though `matches.text` is not
 * otherwise part of the `<img>` body the way it is an anchor's).
 *
 * Two capture/hash event variants (`inline`/`reference`, matching link.js) — the historic
 * `makehtml.image.<variant>.*` families are unchanged.
 *
 * ---- deletability -----------------------------------------------------------------------------
 *
 * Deleting this file removes ONLY image recognition: `!` no longer opens an image bracket (it
 * falls through to plain text), so `![x](y)` renders as a literal `!` followed by a normal link —
 * `x` still resolves as `[x](y)` because inline/link.js is untouched and does not depend on this
 * file existing. Deleting inline/link.js instead leaves images fully working: this file pushes and
 * resolves its own `![`/`]` pair independently.
 *
 * This is a `makehtml.inline.*` construct subparser (scan-state convention — (scan, options,
 * globals) instead of (text, options, globals); see inline/entity.js for the fuller scan-convention
 * explanation).
 */

/* jshint esnext: false, esversion: 9 */

// Resolve Markdown backslash escapes (`\*`, `\_`, …) into placeholder escapes so those characters
// lose their Markdown meaning. A character-level encoding pass (mechanism, not a construct; emits
// no events). Uses a hand-optimized replace chain that sidesteps the slow `RegExp` constructor.
// File-local to image.js — the non-cmSpec alt-text builder below is its sole caller. Ported
// byte-for-byte from the retired makehtml/image.js's `encodeBackslashEscapes`.
function inlineImageEncodeBackslashEscapes (text) {
  'use strict';

  text = text
    .replace(/\\(\\)/g, showdown.helper.escapePlaceholder)
    .replace(/\\([!#%'()*+,\-./:;=?@[\]\\^_`{|}~])/g, showdown.helper.escapePlaceholder)
    .replace(/\\¨D/g, '¨D') // escape $ (which was already escaped as ¨D) (charcode is 36)
    .replace(/\\&/g, '&amp;') // escape &
    .replace(/\\"/g, '&quot;') // escaping "
    .replace(/\\</g, '&lt;') // escaping <
    .replace(/\\>/g, '&gt;'); // escaping >

  return text;
}

/**
 * Render and hash-protect one resolved `<img>`. File-local to image.js (this construct's `]` arm is
 * its sole caller) — builds-never-hash: returns the UNHASHED `<img>` HTML, the caller wraps it with
 * `scan.hashSpan`.
 * @param {{}} scan
 * @param {{}} options
 * @param {{}} globals
 * @param {string} innerHTML the already-rendered label content (cmSpec alt source)
 * @param {string} dest the resolved (not yet normalized) destination
 * @param {(string|null|undefined)} title the resolved title, or null/undefined
 * @param {(string|null)} width
 * @param {(string|null)} height
 * @param {string} variant `inline` or `reference` — drives the capture/hash event family
 * @param {string} wholeMatch the full source text of the resolved construct
 * @param {string} rawLabel the raw (unrendered) source label — the non-cmSpec alt source
 * @returns {string}
 */
function inlineImageBuild (scan, options, globals, innerHTML, dest, title, width, height, variant, wholeMatch, rawLabel) {
  'use strict';

  let alt;
  if (options.cmSpec) {
    // CommonMark: alt text is the plain-text rendering of the label (markup stripped); the
    // inner spans are hashed, so restore them before flattening.
    alt = showdown.helper.unhashHTMLSpans(innerHTML, options, globals)
      .replace(/<img\b[^>]*?\salt="([^"]*)"[^>]*?\/?>/g, '$1')
      .replace(/<[^>]*>/g, '');
  } else {
    // Showdown flavors (legacy image.js parity): the alt is the RAW label text with inline
    // markup left literal — emphasis/links inside `![...]` are NOT processed into the alt, so
    // e.g. `![a_b_c]` keeps its underscores instead of emphasizing them away.
    alt = inlineImageEncodeBackslashEscapes(rawLabel)
      .replace(/"/g, '&quot;')
      // showdown.helper.regexes.asteriskDashTildeAndColon (the regex inline: `/([*_:~])/g`)
      // escapes the magic chars that would re-trigger emphasis/emoji/strikethrough if left bare
      // in this literal alt text. The shared constant is scheduled for a later refactor
      // (naming/location under review).
      .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapePlaceholder);
  }
  // safeMode: neutralize dangerous URL schemes; data:image/* stays allowed
  let src = (options.safeMode && !showdown.helper.isSafeUrl(dest, {allowDataImage: true})) ? '' : showdown.helper.cmNormalizeAnchorDest(dest, options);
  let attributes = {src: src, alt: alt};
  showdown.helper.cmBuildTitleAttr(attributes, title, options);
  // width/height gating copied from writeImageTag in the retired image.js (parseImgDimensions)
  if (options.parseImgDimensions) {
    if (width)  { attributes.width  = (width  === '*') ? 'auto' : width; }
    if (height) { attributes.height = (height === '*') ? 'auto' : height; }
  }

  let capture = showdown.Event.dispatchCapture('makehtml.image.' + variant + '.onCapture', wholeMatch, {
    regexp: null,
    matches: {_wholeMatch: wholeMatch, _url: dest, _title: title, _width: width, _height: height, text: alt},
    attributes: attributes
  }, options, globals);

  let otp;
  if (capture.output && capture.output !== '') {
    otp = capture.output;
  } else {
    attributes = capture.attributes;
    // honor a listener that rewrote the alt text via matches.text
    if (capture.matches.text !== alt) { attributes.alt = capture.matches.text; }
    otp = '<img' + showdown.helper._populateAttributes(attributes) + ' />';
  }
  let hash = showdown.Event.dispatchHash('makehtml.image.' + variant + '.onHash', otp, options, globals);
  return hash.output;
}

showdown.subParser('makehtml.inline.image', {

  // Owns `!` outright (the PUSH of a `![` opener) and shares `]` with inline/link.js at a lower
  // priority (20 vs. link's 10) — see the file docblock's bucket contract.
  triggers: '!]',
  priority: 20,

  // Always on: images are core Markdown syntax in every flavor. The flavor differences (alt-text
  // flattening, base64 data-URI destinations, parseImgDimensions, safeMode, ...) are internal gates
  // of the handler and the cm* helpers it calls, not a participation gate.
  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        pos = scan.pos,
        ch = str.charAt(pos);

    if (ch === '!') {
      if (str.charAt(pos + 1) !== '[') {
        // Decline: a bare `!` not followed by `[` is not an image opener at all.
        return null;
      }
      let node = scan.appendText('![');
      scan.brackets = {
        node: node,
        prev: scan.brackets,
        // GUARDED read of emphasis-owned state — see inline/link.js's docblock for the rationale.
        prevDelim: scan.memos.delimiters || null,
        image: true,
        active: true,
        matchStart: pos,       // index of the opening `!`
        sourceStart: pos + 2   // index where the alt-text label begins
      };
      return pos + 2;
    }

    // ch === ']' — mirror of inline/link.js's contract, from the image side.
    let opener = scan.brackets;

    // Decline: no open bracket, or the open bracket is a link's `[` — inline/link.js already
    // claimed (and consumed) that close before this construct is ever offered the character; this
    // branch only fires when link declined (i.e. it is unreachable in practice for a live `[`
    // opener, but stays for the general "not mine" case). No side effects.
    if (opener === null || !opener.image) { return null; }

    // From here image OWNS the close and ALWAYS consumes.

    if (!opener.active) {
      // Ported for shape parity with inline/link.js's opener (see the file docblock) — an image
      // opener is never actually deactivated by anything today, so this branch is unreachable in
      // practice, but the guard is preserved rather than assumed away.
      scan.brackets = opener.prev;
      scan.appendText(']');
      return pos + 1;
    }

    let dest = null, title = null, width = null, height = null, endIdx = pos + 1, variant = 'inline';

    let suffix = showdown.helper.cmScanLinkSuffix(str, pos + 1, options);
    if (suffix) {
      dest = suffix.dest;
      title = suffix.title;
      width = suffix.width;
      height = suffix.height;
      endIdx = suffix.end;
    } else {
      variant = 'reference';
      let ref = showdown.helper.cmResolveLinkReference(str, pos, opener.sourceStart, options, globals);
      if (ref) {
        dest = ref.dest;
        title = ref.title;
        width = ref.width;
        height = ref.height;
        endIdx = ref.endIdx;
      }
    }

    if (dest === null) {
      // Neither an inline suffix nor a matching reference: pop and render the `]` literally.
      scan.brackets = opener.prev;
      scan.appendText(']');
      return pos + 1;
    }

    // Emphasis fencing, unconditionally (see the file docblock) — guarded, see inline/link.js.
    if (typeof inlineEmphasisProcess === 'function') {
      inlineEmphasisProcess(scan, options, globals, opener.prevDelim);
    }

    // Strikethrough pairing on the alt label, unconditionally (see the file docblock). applyGfm is
    // false — the pairing's inner is never linkified (mirrors link.js's label treatment exactly;
    // the alt is later flattened to plain text anyway for the rendered attribute).
    if (options.strikethrough) {
      showdown.subParser('makehtml.inline.strikethrough.pair')(scan, options, globals, opener.node.next, null, false);
    }

    // collect and render the inner nodes (cmSpec alt source) and the raw label (non-cmSpec alt source)
    let innerHTML = scan.renderNodes(opener.node.next, null),
        wholeMatch = str.slice(opener.matchStart, endIdx),
        rawLabel = str.slice(opener.sourceStart, pos);

    // Hard line breaks are NOT re-applied here — same ruled removal as inline/link.js (scan-native).
    let otpHTML = inlineImageBuild(scan, options, globals, innerHTML, dest, title, width, height, variant, wholeMatch, rawLabel);

    // drop the opener node and everything after it, append the built (now hashed) span
    scan.list.removeFrom(opener.node);
    scan.appendRaw(scan.hashSpan(otpHTML));

    // remove any emphasis delimiters that belonged to the consumed range (guarded, see above)
    if (typeof inlineEmphasisPruneDelimiters === 'function') {
      inlineEmphasisPruneDelimiters(scan, opener.prevDelim);
    }

    // No deactivation loop here: an image never deactivates an outer bracket — images may nest
    // links/images freely (`[![img](/i.png)](/link)` resolves both), mirroring the retired
    // close-bracket resolution's `if (!opener.image) { ... }` guard, which only ever ran the
    // deactivation loop for the link branch.
    scan.brackets = opener.prev;
    return endIdx;
  }
});
