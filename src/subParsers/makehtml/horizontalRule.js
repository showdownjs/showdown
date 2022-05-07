////
// makehtml/blockquote.js
// Copyright (c) 2018 ShowdownJS
//
// Turn Markdown horizontal rule shortcuts into <hr /> tags.
//
// Any 3 or more unindented consecutive hyphens, asterisks or underscores with or without a space beetween them
// in a single line is considered a horizontal rule
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////
showdown.subParser('makehtml.horizontalRule', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.horizontalRule.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;


  // parses: --- and - - -
  const rgx1 = /^ {0,3}( ?-){3,}[ \t]*$/gm;
  text = text.replace(rgx1, function (wholeMatch) {
    return parse(rgx1, wholeMatch);
  });
  // parses: -\t-\t-
  const rgx2 = /^ {0,3}(\t?-){3,}[ \t]*$/gm;
  text = text.replace(rgx2, function (wholeMatch) {
    return parse(rgx2, wholeMatch);
  });

  const rgx3 = /^ {0,3}( ?\*){3,}[ \t]*$/gm;
  text = text.replace(rgx3, function (wholeMatch) {
    return parse(rgx3, wholeMatch);
  });
  const rgx4 = /^ {0,3}(\t?\*){3,}[ \t]*$/gm;
  text = text.replace(rgx4, function (wholeMatch) {
    return parse(rgx4, wholeMatch);
  });

  const rgx5 = /^ {0,3}( ?\*){3,}[ \t]*$/gm;
  text = text.replace(rgx5, function (wholeMatch) {
    return parse(rgx5, wholeMatch);
  });
  const rgx6 = /^ {0,3}(\t?\*){3,}[ \t]*$/gm;
  text = text.replace(rgx6, function (wholeMatch) {
    return parse(rgx6, wholeMatch);
  });

  let afterEvent = new showdown.Event('makehtml.horizontalRule.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

  /**
   *
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @returns {string}
   */
  function parse (pattern, wholeMatch) {
    let otp;
    let captureStartEvent = new showdown.Event('makehtml.horizontalRule.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _whoteMatch: wholeMatch
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      otp = '<hr' + showdown.helper._populateAttributes(captureStartEvent.attributes) + ' />';
    }

    let beforeHashEvent = new showdown.Event('makehtml.horizontalRule.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    otp = showdown.subParser('makehtml.hashBlock')(otp, options, globals);
    return otp;
  }

});
