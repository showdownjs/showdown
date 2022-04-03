////
// makehtml/ellipsis.js
// Copyright (c) 2018 ShowdownJS
//
// transform three dots (...) into ellipsis (…)
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.ellipsis', function (text, options, globals) {
  'use strict';

  if (!options.ellipsis) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.ellipsis.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = text.replace(/\.\.\./g, '…');

  let afterEvent = new showdown.Event('makehtml.ellipsis.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
