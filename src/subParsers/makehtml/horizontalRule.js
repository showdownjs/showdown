////
// makehtml/blockquote.js
// Copyright (c) 2018 ShowdownJS
//
// Turn Markdown horizontal rule shortcuts into <hr /> tags.
//
// Any 3 or more unindented consecutive hyphens, asterisks or underscores with or without a space beetween them
// in a single line is considered a horizontal rule
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////
showdown.subParser('makehtml.horizontalRule', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.horizontalRule.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let key = showdown.subParser('makehtml.hashBlock')('<hr />', options, globals);
  text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

  let afterEvent = new showdown.Event('makehtml.horizontalRule.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
