////
// makehtml/unhashHTMLSpans.js
// Copyright (c) 2018 ShowdownJS
//
// Unhash HTML spans
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.unhashHTMLSpans', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.unhashHTMLSpans.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  for (let i = 0; i < globals.gHtmlSpans.length; ++i) {
    let repText = globals.gHtmlSpans[i],
        // limiter to prevent infinite loop (assume 20 as limit for recurse)
        limit = 0;

    while (/¨C(\d+)C/.test(repText)) {
      let num = repText.match(/¨C(\d+)C/)[1];
      repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
      if (limit === 10) {
        console.error('maximum nesting of 20 spans reached!!!');
        break;
      }
      ++limit;
    }
    text = text.replace('¨C' + i + 'C', repText);
  }

  let afterEvent = new showdown.Event('makehtml.unhashHTMLSpans.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
