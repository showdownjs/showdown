////
// makehtml/hardLineBreaks.js
// Copyright (c) 2022 ShowdownJS
//
// Transforms hard line breaks (trailing spaces / backslash) into `<br />` tags.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.hardLineBreaks', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.hardLineBreaks.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

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

  let afterEvent = new showdown.Event('makehtml.hardLineBreaks.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

});
