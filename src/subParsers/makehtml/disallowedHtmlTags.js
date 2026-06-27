////
// makehtml/disallowedHtmlTags.js
// Copyright (c) 2018 ShowdownJS
//
// GFM "disallowed raw HTML" extension (tagfilter): a small blacklist of HTML tags
// is neutralized in the output by escaping their leading `<` to `&lt;`. These tags
// are singled out because they change how the surrounding markup is interpreted
// (script/style/iframe/etc.). See https://github.github.com/gfm/#disallowed-raw-html-extension-
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.disallowedHtmlTags', function (text, options, globals) {
  'use strict';
  if (!options.disallowRawHTML) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.disallowedHtmlTags.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // Run over the (near final) output: Showdown never generates these tags from Markdown
  // and code blocks/spans already entity-escape `<`, so only genuine raw-HTML passthrough
  // is touched. Both opening and closing forms are filtered, case-insensitively.
  text = text.replace(
    /<(\/?(?:title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext))/gi,
    '&lt;$1'
  );

  let afterEvent = new showdown.Event('makehtml.disallowedHtmlTags.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
