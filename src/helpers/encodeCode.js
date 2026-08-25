/**
 * @file      helpers/encodeCode.js
 * @summary   Entity-encodes and neutralizes Markdown-magic characters inside code spans/blocks.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Encodes `&`/`<`/`>`/`"` and escapes `*_{}[]\=~-` so code interiors render literally. A
 * character-level pass attached as a `showdown.helper.*` mechanism, not a construct; emits no events.
 */

// Mechanism (not a construct): a character-level encoding pass. Attached as a
// showdown.helper (no events) rather than registered as a subparser.
showdown.helper.encodeCode = function (text) {
  'use strict';

  // Code interiors render literally: entity-escape the HTML specials, then
  // placeholder-escape the code-context magic set (wider than the anchor-part set:
  // code must also survive the block passes — brackets, braces, backslashes, `=`/`-`).
  return showdown.helper.escapeHTMLEntities(text)
    .replace(/([*_{}[\]\\=~-])/g, showdown.helper.escapePlaceholder);
};
