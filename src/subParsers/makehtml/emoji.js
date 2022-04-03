////
// makehtml/emoji.js
// Copyright (c) 2018 ShowdownJS
//
// Turn emoji codes into emojis
// List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.emoji', function (text, options, globals) {
  'use strict';

  if (!options.emoji) {
    return text;
  }

  let startEvent = new showdown.helper.Event('makehtml.emoji.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let pattern = /:([\S]+?):/g;

  text = text.replace(pattern, function (wholeMatch, emojiCode) {
    let otp = '';
    let captureStartEvent = new showdown.helper.Event('makehtml.emoji.onCapture', emojiCode);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        emojiCode: emojiCode
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    // if something was passed as output, it takes precedence and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
      otp = showdown.helper.emojis[emojiCode];
    } else {
      otp = wm;
    }

    let beforeHashEvent = new showdown.helper.Event('makehtml.emoji.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);

    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  });

  let afterEvent = new showdown.helper.Event('makehtml.emoji.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
