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

  const ellipsisRegex = /\.\.\./g;
  text = text.replace(ellipsisRegex, function (wholeMatch) {

    let otp;
    let captureStartEvent = new showdown.Event('makehtml.ellipsis.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(ellipsisRegex)
      .setMatches({
        _wholeMatch: wholeMatch,
        ellipsis: wholeMatch
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      otp = '…';
    }

    let beforeHashEvent = new showdown.Event('makehtml.ellipsis.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  });

  let afterEvent = new showdown.Event('makehtml.ellipsis.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
