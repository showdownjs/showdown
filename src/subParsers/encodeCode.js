/**
 * Encode/escape certain characters inside Markdown code runs.
 * The point is that in code, these characters are literals,
 * and lose their special Markdown meanings.
 */
showdown.subParser('encodeCode', function (text) {
  'use strict';

  // Encode all ampersands; HTML entities are not
  // entities within a Markdown code span.
  text = text
    .replace(/&/g, '&amp;')
  // Do the angle bracket song and dance:
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Now, escape characters that are magic in Markdown:
  //text = showdown.helper.escapeCharacters(text, '*_{}[]\\', false); // replaced line to improve performance
    .replace(/([*_{}\[\]\\])/g, showdown.helper.escapeCharactersCallback);

  // jj the line above breaks this:
  //---
  //* Item
  //   1. Subitem
  //            special char: *
  // ---

  return text;
});
