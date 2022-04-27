/**
 * Swap back in all the special characters we've hidden.
 */
showdown.subParser('makehtml.unescapeSpecialChars', function (text, options, globals) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.unescapeSpecialChars.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
    let charCodeToReplace = parseInt(m1);
    return String.fromCharCode(charCodeToReplace);
  });

  let afterEvent = new showdown.Event('makehtml.unescapeSpecialChars.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
