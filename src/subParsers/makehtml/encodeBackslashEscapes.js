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

  let startEvent = new showdown.Event('makehtml.encodeBackslashEscapes.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = text
    .replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback)
    .replace(/\\([!#%'()*+,\-.\/:;=?@\[\]\\^_`{|}~])/g, showdown.helper.escapeCharactersCallback)
    .replace(/\\¨D/g, '¨D') // escape $ (which was already escaped as ¨D) (charcode is 36)
    .replace(/\\&/g, '&amp;') // escape &
    .replace(/\\"/g, '&quot;') // escaping "
    .replace(/\\</g, '&lt;') // escaping <
    .replace(/\\>/g, '&gt;'); // escaping <

  let afterEvent = new showdown.Event('makehtml.encodeBackslashEscapes.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
