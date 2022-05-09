////
// makehtml/emphasisAndStrong.js
// Copyright (c) 2022 ShowdownJS
//
// Transforms MD emphasis and strong into `<em>` and `<strong>` html entities
//
// Markdown treats asterisks (*) and underscores (_) as indicators of emphasis.
// Text wrapped with one * or _ will be wrapped with an HTML <em> tag;
// double *’s or _’s will be wrapped with an HTML <strong> tag
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.hardLineBreaks', function (text, options) {

  // Do hard breaks
  if (options.simpleLineBreaks) {
    // GFM style hard breaks
    // only add line breaks if the text does not contain a block (special case for lists)
    if (!/\n\n¨K/.test(text)) {
      text = text.replace(/\n+/gm, '<br />\n');
    }
  } else {
    // Vanilla hard breaks
    text = text.replace(/  +\n/g, '<br />\n');
  }
  text = text.replace(/\\\n/g, '<br />\n');

  return text;

});
