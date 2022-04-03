////
// makehtml/hashHTMLSpans.js
// Copyright (c) 2018 ShowdownJS
//
// Hash span elements that should not be parsed as markdown
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.hashHTMLSpans', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.hashHTMLSpans.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // Hash Self Closing tags
  text = text.replace(/<[^>]+?\/>/gi, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash tags without properties
  text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash tags with properties
  text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash self closing tags without />
  text = text.replace(/<[^>]+?>/gi, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  let afterEvent = new showdown.Event('makehtml.hashHTMLSpans.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
