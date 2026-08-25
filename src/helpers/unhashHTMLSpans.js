/**
 * @file      helpers/unhashHTMLSpans.js
 * @summary   Restores `¨C…C` span placeholders back to their stored HTML, expanding nested placeholders (bounded depth).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * The inverse of `showdown.helper._hashHTMLSpan` (misc.js) and of the inline engine's file-local
 * span hasher. A `showdown.helper.*` mechanism, not a construct; emits no events.
 */


// Mechanism (not a construct): hash plumbing. Attached as a showdown.helper
// (no events) rather than registered as a subparser.
showdown.helper.unhashHTMLSpans = function (text, options, globals) {
  'use strict';

  // Resolve one span placeholder to its stored HTML, expanding any nested placeholders it
  // contains (bounded depth, mirrors the historical "assume 20 as limit for recurse").
  function resolveSpan (num) {
    let repText = globals.gHtmlSpans[num],
        limit = 0;
    while (/¨C(\d+)C/.test(repText)) {
      let n2 = repText.match(/¨C(\d+)C/)[1];
      repText = repText.replace('¨C' + n2 + 'C', globals.gHtmlSpans[n2]);
      if (limit === 10) {
        console.error('maximum nesting of 20 spans reached!!!');
        break;
      }
      ++limit;
    }
    return repText;
  }

  // Single pass over the document (was: one String.replace per span, i.e. O(spans × text) —
  // quadratic when the input produces many spans, e.g. `'a_'.repeat(n)`).
  text = text.replace(/¨C(\d+)C/g, function (whole, num) {
    return resolveSpan(num);
  });

  return text;
};
