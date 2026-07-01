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

  let startEvent = new showdown.Event('makehtml.emoji.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let pattern = /:(\S+?):/g;

  text = text.replace(pattern, function (wholeMatch, emojiCode) {
    if (!Object.prototype.hasOwnProperty.call(showdown.helper.emojis, emojiCode)) {
      return wholeMatch;
    }
    let otp;
    let captureStartEvent = new showdown.Event('makehtml.emoji.onCapture', emojiCode);
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
    } else {
      otp = showdown.helper.emojis[emojiCode];
    }

    let beforeHashEvent = new showdown.Event('makehtml.emoji.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);

    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;

    // Image-based emoji (e.g. :octocat:) render as an <img> tag. Hash it so later
    // HTML-escaping passes don't turn its `<`/`>` into entities - under cmSpec the
    // generic span hashing skips void tags (it is meant to escape malformed raw HTML),
    // so the generated markup must protect itself here. Unicode emoji are returned as-is.
    if (/^\s*</.test(otp)) {
      otp = showdown.helper._hashHTMLSpan(otp, globals);
    }
    return otp;
  });

  let afterEvent = new showdown.Event('makehtml.emoji.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
