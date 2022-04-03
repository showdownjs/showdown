////
// makehtml/hashCodeTags.js
// Copyright (c) 2018 ShowdownJS
//
// Hash and escape <code> elements that should not be parsed as markdown
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.hashCodeTags', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.helper.Event('makehtml.hashCodeTags.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let repFunc = function (wholeMatch, match, left, right) {
    let codeblock = left + showdown.subParser('makehtml.encodeCode')(match, options, globals) + right;
    return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
  };

  // Hash naked <code>
  text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

  let afterEvent = new showdown.helper.Event('makehtml.hashCodeTags.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
