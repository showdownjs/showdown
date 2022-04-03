////
// makehtml/blockGamut.js
// Copyright (c) 2018 ShowdownJS
//
// These are all the transformations that form block-level
// tags like paragraphs, headers, and list items.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.blockGamut', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.blockGamut.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // we parse blockquotes first so that we can have headings and hrs
  // inside blockquotes
  text = showdown.subParser('makehtml.blockquote')(text, options, globals);
  text = showdown.subParser('makehtml.heading')(text, options, globals);

  // Do Horizontal Rules:
  text = showdown.subParser('makehtml.horizontalRule')(text, options, globals);

  text = showdown.subParser('makehtml.lists')(text, options, globals);
  text = showdown.subParser('makehtml.codeBlock')(text, options, globals);
  text = showdown.subParser('makehtml.tables')(text, options, globals);

  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
  // was to escape raw HTML in the original Markdown source. This time,
  // we're escaping the markup we've just created, so that we don't wrap
  // <p> tags around block-level tags.
  text = showdown.subParser('makehtml.hashHTMLBlocks')(text, options, globals);
  text = showdown.subParser('makehtml.paragraphs')(text, options, globals);

  let afterEvent = new showdown.Event('makehtml.blockGamut.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
