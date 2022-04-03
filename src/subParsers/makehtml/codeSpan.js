////
// makehtml/codeSpan.js
// Copyright (c) 2018 ShowdownJS
//
// Transforms MD code spans into `<code>` html entities
//
// Backtick quotes are used for <code></code> spans.
//
// You can use multiple backticks as the delimiters if you want to
// include literal backticks in the code span. So, this input:
//
// Just type ``foo `bar` baz`` at the prompt.
//
// Will translate to:
//
// <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
//
// There's no arbitrary limit to the number of backticks you
// can use as delimters. If you need three consecutive backticks
// in your code, use four for delimiters, etc.
//
// You can use spaces to get literal backticks at the edges:
// ... type `` `bar` `` ...
//
// Turns to:
// ... type <code>`bar`</code> ...
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.codeSpan', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.helper.Event('makehtml.codeSpan.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  startEvent = globals.converter.dispatch(startEvent);

  text = startEvent.output;

  if (showdown.helper.isUndefined((text))) {
    text = '';
  }

  let pattern = /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm;

  text = text.replace(pattern, function (wholeMatch, m1, m2, c) {
    let otp,
        attributes = {};

    c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
    c = c.replace(/[ \t]*$/g, '');	// trailing whitespace

    let captureStartEvent = new showdown.helper.Event('makehtml.codeSpan.onCapture', c);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        code: c
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = m1 + captureStartEvent.output;
    } else {
      c = captureStartEvent.matches.code;
      c = showdown.subParser('makehtml.encodeCode')(c, options, globals);
      otp = m1 + '<code' + showdown.helper._populateAttributes(attributes) + '>' +  c + '</code>';
    }

    let beforeHashEvent = new showdown.helper.Event('makehtml.codeSpan.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);

    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    return showdown.subParser('makehtml.hashHTMLSpans')(otp, options, globals);
  }
  );

  let afterEvent = new showdown.helper.Event('makehtml.codeSpan.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
