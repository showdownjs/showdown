showdown.subParser('makehtml.underline', function (text, options, globals) {
  'use strict';

  if (!options.underline) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.underline.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  if (options.literalMidWordUnderscores) {

    const rgx1 = /\b___(\S[\s\S]*?)___\b/g;
    text = text.replace(rgx1, function (wm, txt) {
      return parse(rgx1, wm, txt);
    });

    const rgx2 = /\b__(\S[\s\S]*?)__\b/g;
    text = text.replace(rgx2, function (wm, txt) {
      return parse(rgx2, wm, txt);
    });
  } else {

    const rgx3 = /___(\S[\s\S]*?)___/g;
    text = text.replace(rgx3, function (wm, txt) {
      if (!(/\S$/.test(txt))) {
        return wm;
      }
      return parse(rgx3, wm, txt);
    });

    const rgx4 = /__(\S[\s\S]*?)__/g;
    text = text.replace(rgx4, function (wm, txt) {
      if (!(/\S$/.test(txt))) {
        return wm;
      }
      return parse(rgx4, wm, txt);
    });
  }

  // escape remaining underscores to prevent them being parsed by italic and bold
  text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

  text = globals.converter._dispatch('makehtml.underline.after', text, options, globals).getText();

  return text;


  function parse (pattern, wholeMatch, txt) {
    let otp;
    let captureStartEvent = new showdown.Event('makehtml.underline.onCapture', txt);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
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
      otp = '<u' + showdown.helper._populateAttributes(captureStartEvent.attributes) + '>' + txt + '</u>';
    }
    let beforeHashEvent = new showdown.Event('makehtml.underline.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  }


});
