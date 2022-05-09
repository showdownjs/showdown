showdown.subParser('makehtml.strikethrough', function (text, options, globals) {
  'use strict';
  if (!options.strikethrough) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.strikethrough.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  const strikethroughRegex = /~{2}([\s\S]+?)~{2}/g;
  text = text.replace(strikethroughRegex, function (wholeMatch, txt) {

    let otp;
    let captureStartEvent = new showdown.Event('makehtml.strikethrough.onCapture', txt);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(strikethroughRegex)
      .setMatches({
        _wholeMatch: wholeMatch,
        strikethrough: txt
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      otp = '<del' + showdown.helper._populateAttributes(captureStartEvent.attributes) + '>' +
            showdown.subParser('makehtml.hardLineBreaks')(txt, options, globals) +
            '</del>';
    }

    let beforeHashEvent = new showdown.Event('makehtml.strikethrough.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  });

  let afterEvent = new showdown.Event('makehtml.strikethrough.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
