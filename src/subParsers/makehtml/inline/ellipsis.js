/**
 * @file      makehtml/inline/ellipsis.js
 * @summary   Replaces literal `...` with the ellipsis character `…` when the `ellipsis` option is on.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * A scan-native per-match transform: there is no whole-text pass form. It emits capture/hash per
 * occurrence (`makehtml.ellipsis.onCapture` / `.onHash`); the onStart/onEnd lifecycle belongs to
 * the inline engine (`makehtml.inlineEngine.onStart/onEnd`), per the event contract's two phase-set
 * classes. Because the scan consumes `...` before link/image bracket resolution, the substitution
 * applies inside resolving link/image labels for every flavor (the former cmSpec literal-label
 * behavior was a pipeline artifact of running after link hashing, not a rule).
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). Deleting this file removes the ellipsis
 * substitution and nothing else — `...` stays three literal dots.
 */

/* jshint esnext: false, esversion: 9 */

showdown.subParser('makehtml.inline.ellipsis', {

  // Sole owner of `.` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '.',
  priority: 10,

  // Option-gated: when `ellipsis` is off the construct never enters the dispatch table, so `.`
  // is not a trigger character at all and flows into plain-text runs at full speed.
  enabled: function (options) {
    return !!options.ellipsis;
  },

  // Recognizes a literal `...` at the scan cursor (capture/hash per occurrence). On a match it
  // appends the substituted output RAW so a listener that produced markup flows to the later
  // passes; the default `…` contains no HTML-special chars, so raw vs escaped is byte-identical.
  // Declines (returns null) on a lone `.` or `..`, letting the engine's plain-text handling take it.
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;
    if (str.charAt(i + 1) !== '.' || str.charAt(i + 2) !== '.') {
      return null;
    }

    const wholeMatch = '...';
    let otp;
    let captureStartEvent = showdown.Event.dispatchCapture('makehtml.ellipsis.onCapture', wholeMatch, {
      regexp: null,
      matches: {
        _wholeMatch: wholeMatch,
        text: wholeMatch
      },
      attributes: {}
    }, options, globals);
    // if something was passed as output, it takes precedence and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      // honor a listener that rewrote matches.text: the ellipsis substitution is applied
      // to the (possibly edited) captured text, so the default `...` still yields `…`.
      otp = captureStartEvent.matches.text.replace(/\.\.\./g, '…');
    }

    let beforeHashEvent = showdown.Event.dispatchHash('makehtml.ellipsis.onHash', otp, options, globals);
    scan.appendRaw(beforeHashEvent.output);
    return i + 3;
  }
});
