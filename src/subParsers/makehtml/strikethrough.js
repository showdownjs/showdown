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

  // GFM strikethrough: a run of one or two tildes, matched in length, with flanking
  // (the run must hug non-whitespace on the inside) and rejecting runs of three or more.
  // Group 1 captures the character before the opening run (or the string start) so it can
  // be restored; group 3 is the struck-through content.
  const strikethroughRegex = /(^|[^~])(~{1,2})(?=[^\s~])([\s\S]*?[^\s~])\2(?!~)/g;
  text = text.replace(strikethroughRegex, function (wholeMatch, prefix, run, txt) {

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
    // restore the character that preceded the opening run
    return prefix + beforeHashEvent.output;
  });

  let afterEvent = new showdown.Event('makehtml.strikethrough.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
