/**
 * @file      makehtml/inline/hardLineBreak.js
 * @summary   Hard line breaks (trailing double-space or backslash before a newline) -> `<br />`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Owns the `\n` character. Recognizes the two hard-break spellings — two or more spaces before the
 * newline, and a single `\` before the newline — and renders each as a `<br />`, keeping the newline
 * that separated the source lines; under `simpleLineBreaks` every remaining line ending becomes a
 * break too. Anything else is an ordinary soft newline.
 *
 * This is an inline construct with a SINGLE entry point: the `makehtml.inline.hardLineBreak`
 * definition object, dispatched by the inline engine (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). There is no whole-text pass form, because
 * there is no text a break can appear in that the scan does not already walk: a wrapper construct
 * (emphasis, strikethrough, underline) resolves its span out of nodes the scan itself produced, so
 * every `\n` inside a wrapper's inner content was dispatched here — like any other trigger — while
 * the scan was building those nodes. The break is therefore already rendered by the time the wrapper
 * serializes its inner, and no construct needs to re-apply anything by name.
 *
 * `simpleLineBreaks` is an internal gate of the handler (arm 3 below), not an `enabled` gate: hard
 * breaks are core Markdown syntax in every flavor, and the option only adds the extra soft-newline
 * arm. That arm is suppressed when the text contains a hashed block (the special case for lists),
 * which is a whole-text property, so it is sniffed ONCE per scan and memoized on `scan.memos` under
 * a construct-owned key. Sniffing `scan.str` is equivalent to sniffing the serialized output: the
 * ¨K/¨M/¨R block placeholders are produced by the block parsers and restored by the pipeline — the
 * inline scan neither creates nor destroys them, so the same placeholders are present before and
 * after the scan.
 *
 * One line ending yields ONE break: a two-space or backslash spelling with `simpleLineBreaks` on
 * still produces a single `<br />`, exactly like a plain line ending (2026-08-23 ruling). The arms
 * are mutually exclusive and each consumes its whole line ending, so the two forms cannot compound.
 *
 * A break has no inner content, so its capture payload carries ONLY the read-only `_wholeMatch` —
 * there is no `text` key to rewrite. `attributes` are applied to the emitted `<br>`, so a listener
 * can tag or style individual breaks, and a listener may override `output` entirely. Every arm that
 * builds a break emits `makehtml.hardLineBreak.onCapture` / `.onHash`; the surrounding lifecycle
 * belongs to the inline engine (`makehtml.inlineEngine.onStart/onEnd`) per the event contract's two
 * phase-set classes. The soft arm constructs nothing and so emits nothing.
 *
 * The `<br />` is HASHED (`scan.hashSpan`) so the later entity-encoding pass leaves it intact; the
 * trailing `'\n'` stays OUTSIDE the hash.
 *
 * Deleting this file removes hard-break rendering and nothing else: `\n` loses its trigger owner and
 * every newline becomes a literal soft newline. No construct references this one by name, so the
 * deletion is free.
 */

/* jshint esnext: false, esversion: 9 */

// The `simpleLineBreaks` block sniffs: only add breaks when the text contains no block (the special
// case for lists). ¨K = a generated/hashed block; ¨M = a markdown="1"-processed block (early
// restore); ¨R = a raw HTML block (late restore). The ¨R sniff is newline-agnostic so it matches
// both the cmSpec single-newline and the legacy double-newline wrapper.
const inlineHardLineBreakHashedBlockSniffRegex = /\n\n¨K/,
    inlineHardLineBreakMdBlockSniffRegex = /\n\n¨M/,
    inlineHardLineBreakRawBlockSniffRegex = /\n¨R\d+R\n/;

// Tail testers / trimmer (stateless; the trimmer carries no /g, so a single replace strips the one
// trailing run).
const inlineHardLineBreakTwoSpacesRegex = / {2,}$/,
    inlineHardLineBreakBackslashTailRegex = /\\$/,
    inlineHardLineBreakTrimSpacesRegex = / +$/;

/**
 * Run one hard break through the construct's capture -> render -> hash flow and return the FINAL
 * `<br />` HTML — UNHASHED: per the builds-never-hash convention the caller hash-protects the result
 * with its own context's primitive (here, `scan.hashSpan`).
 *
 * A break has no inner content, so `matches` carries only the read-only `_wholeMatch` context — no
 * `text` key. `attributes` are applied to the emitted `<br>`, and a listener may override `output`
 * entirely. The capture event's `regexp` metadata is always null: the break is recognized from the
 * scan state, not by a whole-text regex.
 * @param {string} wholeMatch the user-facing source the break was built from
 * @param {{}} options
 * @param {{}} globals
 * @returns {string}
 */
function inlineHardLineBreakBuild (wholeMatch, options, globals) {
  'use strict';

  let otp;
  let captureStartEvent = showdown.Event.dispatchCapture('makehtml.hardLineBreak.onCapture', wholeMatch, {
    regexp: null,
    matches: {
      _wholeMatch: wholeMatch
    },
    attributes: {}
  }, options, globals);

  // if something was passed as output, it takes precedence and will be used as output
  if (captureStartEvent.output && captureStartEvent.output !== '') {
    otp = captureStartEvent.output;
  } else {
    otp = '<br' + showdown.helper._populateAttributes(captureStartEvent.attributes) + ' />';
  }

  let beforeHashEvent = showdown.Event.dispatchHash('makehtml.hardLineBreak.onHash', otp, options, globals);
  return beforeHashEvent.output;
}

showdown.subParser('makehtml.inline.hardLineBreak', {

  // Sole owner of `\n` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '\n',
  priority: 10,

  // Always on: hard breaks are core Markdown syntax in every flavor. `simpleLineBreaks` gates the
  // EXTRA soft-newline arm inside the handler, not whether this construct participates.
  enabled: true,

  // Always consumes, never declines — the newline is this construct's, whatever it turns out to be.
  // Four arms, in order: a text tail ending in two+ spaces, a text tail ending in `\`, the
  // `simpleLineBreaks` arm, and the ordinary soft newline. The first three emit a hashed `<br />`
  // (hashed so the later entity-encoding pass leaves it intact) plus the separating newline OUTSIDE
  // the hash; the last emits a literal newline, firing NO events (nothing was constructed). All but
  // the backslash arm trim the trailing spaces off a text tail. Reads and mutates the output list
  // tail through scan.list.
  handler: function (scan, options, globals) {
    'use strict';

    let list = scan.list,
        i = scan.pos,
        n = list.tail,
        isTextTail = !!n && n.type === 'text' && !n.raw;

    // 1. two or more spaces before the newline
    if (isTextTail && inlineHardLineBreakTwoSpacesRegex.test(n.literal)) {
      // `_wholeMatch` must present the user-facing SOURCE, so reconstruct the consumed trigger —
      // the trailing space run plus the newline — BEFORE the tail is trimmed.
      let spaces = inlineHardLineBreakTrimSpacesRegex.exec(n.literal)[0];
      n.literal = n.literal.replace(inlineHardLineBreakTrimSpacesRegex, '');
      scan.appendRaw(scan.hashSpan(inlineHardLineBreakBuild(spaces + '\n', options, globals)) + '\n');
      return i + 1;
    }

    // 2. a single backslash before the newline
    if (isTextTail && inlineHardLineBreakBackslashTailRegex.test(n.literal)) {
      n.literal = n.literal.slice(0, -1);
      scan.appendRaw(scan.hashSpan(inlineHardLineBreakBuild('\\\n', options, globals)) + '\n');
      return i + 1;
    }

    // 3. `simpleLineBreaks`: every remaining line ending becomes a break, unless this text carries a
    //    hashed block. The sniff is a property of the whole scanned string, so compute it once and
    //    memoize it — `scan.memos` is per-scan scratch, and a nested sub-scan gets a fresh one, so
    //    a wrapper's inner is sniffed on its own slice.
    if (options.simpleLineBreaks) {
      let clean = scan.memos.hardLineBreakSniff;
      if (typeof clean === 'undefined') {
        clean = scan.memos.hardLineBreakSniff =
          !inlineHardLineBreakHashedBlockSniffRegex.test(scan.str) &&
          !inlineHardLineBreakMdBlockSniffRegex.test(scan.str) &&
          !inlineHardLineBreakRawBlockSniffRegex.test(scan.str);
      }
      if (clean) {
        if (isTextTail) { n.literal = n.literal.replace(inlineHardLineBreakTrimSpacesRegex, ''); }
        // A run of consecutive newlines is ONE break, not one per newline — consume the whole run.
        let j = i;
        while (scan.str.charAt(j) === '\n') { ++j; }
        let run = scan.str.slice(i, j);
        scan.appendRaw(scan.hashSpan(inlineHardLineBreakBuild(run, options, globals)) + '\n');
        return j;
      }
    }

    // 4. an ordinary soft newline
    if (isTextTail) { n.literal = n.literal.replace(inlineHardLineBreakTrimSpacesRegex, ''); }
    scan.appendText('\n');
    return i + 1;
  }
});
