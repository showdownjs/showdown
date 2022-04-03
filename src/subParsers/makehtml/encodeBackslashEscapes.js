////
// makehtml/encodeBackslashEscapes.js
// Copyright (c) 2018 ShowdownJS
//
// Returns the string, with after processing the following backslash escape sequences.
//
// The polite way to do this is with the new escapeCharacters() function:
//
// text = escapeCharacters(text,"\\",true);
// text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
//
// ...but we're sidestepping its use of the (slow) RegExp constructor
// as an optimization for Firefox.  This function gets called a LOT.
//
// ***Author:***
// - attacklab
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.encodeBackslashEscapes', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.helper.Event('makehtml.encodeBackslashEscapes.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
  text = text.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, showdown.helper.escapeCharactersCallback);

  let afterEvent = new showdown.helper.Event('makehtml.encodeBackslashEscapes.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
