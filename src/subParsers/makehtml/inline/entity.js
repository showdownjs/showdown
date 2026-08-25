/**
 * @file      makehtml/inline/entity.js
 * @summary   HTML entity / numeric character references (CommonMark spec §2.5).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes a named entity (`&copy;`), a decimal (`&#35;`) or a hexadecimal (`&#xHH;`) numeric
 * character reference at the scan cursor. cmSpec decodes references to their literal character; the
 * Showdown flavors decode only when decodeEntities are on, otherwise they keep a valid reference
 * verbatim.
 *
 * Emits capture/hash per consumed reference (`makehtml.entity.onCapture` / `.onHash`); the
 * onStart/onEnd lifecycle belongs to the inline engine (`makehtml.inlineEngine.onStart/onEnd`).
 * A declined `&` (no valid reference at the cursor) emits nothing.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace, and the inline engine dispatches it (see inlineEngine.js for the contract). The
 * `triggers`/`priority` pair below is everything the engine knows about this construct — deleting
 * this file removes entity recognition and nothing else: every `&` becomes ordinary literal text.
 * The handler follows the scan-state calling convention — (scan, options, globals) instead of
 * (text, options, globals) — where `scan` bundles the string (`scan.str`), the cursor (`scan.pos`,
 * set by the engine immediately before dispatch) and the output-node appenders (`scan.appendText`
 * / `scan.appendRaw`). It either consumes — appending its output and returning the new cursor
 * index — or declines by returning `null`, letting the engine fall through to literal handling.
 */

/* jshint esnext: false, esversion: 9 */

// Sticky entity recognizer, anchored at the scan cursor (lastIndex) so it never slices the tail of
// the string — keeps the tokenizer linear on `&`-heavy input. the lastIndex is set before every exec,
// so reuse across invocations is safe.
const inlineEntityRegex = /&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]*);/y;

showdown.subParser('makehtml.inline.entity', {

  // Sole owner of `&` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '&',
  priority: 10,

  // Always on: cmSpec/decodeEntities gate HOW a reference renders (decoded vs. verbatim), not
  // whether the construct participates, so they are internal gates of the handler below.
  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;
    inlineEntityRegex.lastIndex = i;
    let m = inlineEntityRegex.exec(str);
    if (m === null) {
      // Decline: no entity match. The engine falls through to its literal handling — the `&`
      // renders as ordinary text (entity-escaped to `&amp;`).
      return null;
    }

    // Gate 2 (entity/numeric refs). cmSpec decodes character references to their literal
    // character (unconditionally, as it always has); the Showdown flavors decode only when
    // decodeEntities is on, otherwise they keep a valid reference verbatim. Emit the verbatim
    // reference raw so render-time escaping does not turn `&` into `&amp;`; the later
    // encodeAmpsAndAngles pass leaves a valid entity reference intact. The `|| options.cmSpec`
    // keeps this gate strictly `!cmSpec`-conditioned (cmSpec output is byte-identical).
    const wholeMatch = m[0],
        decode = options.cmSpec || options.decodeEntities,
        decoded = decode ? showdown.helper.cmDecodeEntities(wholeMatch) : null;
    if (decode && decoded === wholeMatch) {
      // Decline: a decode that produced an identical string (an unknown named reference). The
      // engine falls through to its literal handling, same as the no-match case above.
      return null;
    }

    let capture = showdown.Event.dispatchCapture('makehtml.entity.onCapture', wholeMatch, {
      regexp: null,
      matches: {
        _wholeMatch: wholeMatch,
        text: wholeMatch
      },
      attributes: {}
    }, options, globals);

    let otp;
    if (capture.output && capture.output !== '') {
      // listener-produced output takes precedence and flows raw to the later passes
      otp = capture.output;
    } else {
      // render the (possibly listener-edited) captured reference per the normal rules:
      // decode it on the decoding path, keep it verbatim otherwise. The decoded result is
      // pre-escaped here (byte-identical to appending it as a text node, which escapes at
      // render time), so the append below is uniformly raw.
      let text = capture.matches.text;
      if (decode) {
        otp = showdown.helper.escapeHTMLEntities(text === wholeMatch ? decoded : showdown.helper.cmDecodeEntities(text));
      } else {
        otp = text;
      }
    }

    let hash = showdown.Event.dispatchHash('makehtml.entity.onHash', otp, options, globals);
    scan.appendRaw(hash.output);
    return i + wholeMatch.length;
  }
});
