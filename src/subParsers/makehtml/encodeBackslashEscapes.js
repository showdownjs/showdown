/**
 * Returns the string, with after processing the following backslash escape sequences.
 *
 * attacklab: The polite way to do this is with the new escapeCharacters() function:
 *
 *    text = escapeCharacters(text,"\\",true);
 *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
 *
 * ...but we're sidestepping its use of the (slow) RegExp constructor
 * as an optimization for Firefox.  This function gets called a LOT.
 */
showdown.subParser('makehtml.encodeBackslashEscapes', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.encodeBackslashEscapes.before', text, options, globals).getText();

  text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
  text = text.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, showdown.helper.escapeCharactersCallback);

  text = globals.converter._dispatch('makehtml.encodeBackslashEscapes.after', text, options, globals).getText();
  return text;
});
