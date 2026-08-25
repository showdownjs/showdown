/**
 * @file      makehtml/inline/underline.js
 * @summary   Converts `__`/`___` runs into `<u>` when the `underline` option is enabled.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Emits capture/hash per claimed `__`/`___` region (`makehtml.underline.onCapture` / `.onHash`);
 * the onStart/onEnd lifecycle belongs to the inline engine. The construct honors
 * `literalMidWordUnderscores`.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). It shares its trigger with emphasis and
 * takes FIRST REFUSAL on every `_` run (lower priority number): it either claims a `__`/`___`
 * region as `<u>` — inner rendered by a nested sub-scan — or consumes the run as inert literal
 * text, so when the option is on a `_` never reaches the emphasis stack. `*` is unaffected.
 * Deleting this file removes underline and nothing else — every `_` falls through to emphasis
 * (or to literal text where emphasis declines it).
 *
 * Two behaviors sharpened by the scan-native form (both intended, kept from the retired pass's
 * migration): a boundary-crossing construct (a code span, autolink, raw-HTML tag, `*`-emphasis or
 * an underscore run that opens inside `__..__` and closes outside) yields well-formed output; and
 * underscores inside a protected construct are never escaped (the old whole-text pass rewrote
 * every `_` in the document before the scan, corrupting `_`-bearing emoji shortcodes, naked URLs,
 * @mentions and code-span backslashes).
 */

/* jshint esnext: false, esversion: 9 */

// ---- claim computation ---------------------------------------------------------------------
//
// The retired whole-text pass resolved underline as two SEQUENTIAL regex sweeps over the whole
// text: first the triple-underscore pattern, then the double-underscore pattern (each honoring
// `literalMidWordUnderscores`). Reproducing that faithfully from a single left-to-right cursor is
// subtle, because the second sweep re-examines regions the first sweep MATCHED-BUT-REJECTED
// (content not ending in `\S`) while NOT re-examining inside regions the first sweep CLAIMED. A
// naive per-cursor "try the sticky regex; on non-claim skip the run" would diverge (e.g.
// `__a __b__ c__`, where the double sweep's lastIndex skips past a rejected `__a __` so the inner
// `__b__` is never claimed). So the claim SET for a given string is computed once (cached on
// `scan.memos`) by replaying the two sweeps exactly, and the handler just looks up whether a
// claim opens at the cursor. Inner content is scanned by a nested `scan.subParse`, which re-runs
// this same machinery on the slice — so a `__x__` nested inside a claimed `___..___` is
// re-discovered there, matching the second sweep's ability to claim inside the first sweep's
// `<u>...</u>` content.

// The four sweep patterns (normal / literalMidWordUnderscores mode, triple / double markers).
// All /g, but only ever handed to String.replace (which resets lastIndex), so reuse is safe.
const inlineUnderlineTripleRegex = /___(\S[\s\S]*?)___/g,
    inlineUnderlineTripleLiteralRegex = /\b___(\S[\s\S]*?)___\b/g,
    inlineUnderlineDoubleRegex = /__(\S[\s\S]*?)__/g,
    inlineUnderlineDoubleLiteralRegex = /\b__(\S[\s\S]*?)__\b/g,
    // normal-mode claim test: the inner content must end in non-whitespace
    inlineUnderlineNonWsEndRegex = /\S$/,
    // escaped underscores are masked out of the claim computation (see inlineUnderlineClaimAt)
    inlineUnderlineEscapedRegex = /\\_/g;

// Blank a claimed span with same-length filler that contains no `_` and whose edges are non-word
// (mirroring the opaque `<u>...</u>` the sequential pass left in place, whose `<`/`>` edges are
// non-word so an adjacent `\b`/flanking test in the second sweep decides identically). Used only
// for claim computation, never rendered.
function inlineUnderlineBlank (n) {
  return new Array(n + 1).join('.');
}

// One regex sweep of the whole (masked/working) string, mirroring the pass's
// `String.replace(rgx, …)`: on a CLAIM record {start, innerStart, innerEnd, end} (indices into
// the ORIGINAL string, which the masked string is length-identical to) and blank the span so the
// next sweep can't re-match inside; on a normal-mode REJECT (`/\S$/` fails) leave the span intact
// for the next sweep, exactly as the pass's callback returned the whole match unchanged.
// `markerLen` is 3 (triple) or 2 (double).
function inlineUnderlineRunPass (work, rgx, markerLen, literal, claims) {
  return work.replace(rgx, function (wm, inner, offset) {
    if (!literal && !(inlineUnderlineNonWsEndRegex.test(inner))) {
      return wm;
    }
    claims.push({
      start: offset,
      innerStart: offset + markerLen,
      innerEnd: offset + wm.length - markerLen,
      end: offset + wm.length
    });
    return inlineUnderlineBlank(wm.length);
  });
}

// Compute the full ordered claim set for `masked` (the string with escaped `\_` already
// neutralized), replaying the triple sweep then the double sweep. The `\b` literal-mode
// prechecks live in the regexes themselves.
function inlineUnderlineComputeClaims (masked, literal) {
  let claims = [],
      p1 = literal ? inlineUnderlineTripleLiteralRegex : inlineUnderlineTripleRegex,
      p2 = literal ? inlineUnderlineDoubleLiteralRegex : inlineUnderlineDoubleRegex,
      work = inlineUnderlineRunPass(masked, p1, 3, literal, claims);
  inlineUnderlineRunPass(work, p2, 2, literal, claims);
  return claims;
}

// The claim (if any) that OPENS at the scan cursor, keyed on `scan.memos` so the sweeps run once
// per (sub)scan. The masked string swaps each escaped underscore `\_` for the length-preserving,
// edge-equivalent filler `¨E` so it can neither open nor close a claim and cursor indices still
// map 1:1 into the original string (the real `\_` is resolved by the backslash construct at
// render).
function inlineUnderlineClaimAt (scan, options) {
  let memos = scan.memos;
  if (!memos.underlineClaims) {
    let masked = scan.str.replace(inlineUnderlineEscapedRegex, '¨E'),
        claims = inlineUnderlineComputeClaims(masked, !!options.literalMidWordUnderscores),
        byStart = {};
    for (let k = 0; k < claims.length; ++k) { byStart[claims[k].start] = claims[k]; }
    memos.underlineClaims = byStart;
  }
  return Object.prototype.hasOwnProperty.call(memos.underlineClaims, scan.pos) ?
    memos.underlineClaims[scan.pos] :
    null;
}

showdown.subParser('makehtml.inline.underline', {

  // Shares `_` with emphasis and must be offered FIRST (spec-fixed local precedence on the
  // shared trigger char): underline either claims the region or consumes the run as inert
  // literal, so `_` never falls through to emphasis while the option is on. Emphasis registers
  // `_` at a higher priority number.
  triggers: '_',
  priority: 10,

  // Option-gated: when `underline` is off the construct never enters the dispatch table, so
  // every `_` run goes straight to emphasis.
  enabled: function (options) {
    return !!options.underline;
  },

  // Never declines: on a claim it appends the hashed `<u>` span (inner rendered by a nested
  // sub-scan) and returns the cursor past the claim; otherwise it consumes the whole `_` run as
  // inert literal text (so an unmatched or single `_` is never handed to emphasis, reproducing
  // the retired pass's rule 3).
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos,
        claim = inlineUnderlineClaimAt(scan, options);

    if (!claim) {
      let j = i;
      while (j < str.length && str.charAt(j) === '_') { ++j; }
      scan.appendText(str.slice(i, j));
      return j;
    }

    let rawInner = str.slice(claim.innerStart, claim.innerEnd),
        otp;
    let capture = showdown.Event.dispatchCapture('makehtml.underline.onCapture', rawInner, {
      regexp: null,
      matches: {
        _wholeMatch: str.slice(claim.start, claim.end),
        text: rawInner
      },
      attributes: {}
    }, options, globals);
    // listener output takes precedence and is used verbatim; otherwise build the `<u>` with the
    // (possibly listener-edited) inner content rendered by a nested sub-scan — which resolves the
    // inner's hard line breaks along with everything else — and the (possibly listener-edited)
    // attributes.
    if (capture.output && capture.output !== '') {
      otp = capture.output;
    } else {
      otp = '<u' + showdown.helper._populateAttributes(capture.attributes) + '>' +
        scan.subParse(capture.matches.text) +
        '</u>';
    }

    let hash = showdown.Event.dispatchHash('makehtml.underline.onHash', otp, options, globals);
    scan.appendRaw(scan.hashSpan(hash.output));
    return claim.end;
  }
});
