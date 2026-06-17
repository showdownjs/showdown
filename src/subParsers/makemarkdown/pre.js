showdown.subParser('makeMarkdown.pre', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.pre.onStart', node.outerHTML);
  startEvent
    .setOutput(null)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  startEvent = globals.converter.dispatch(startEvent);

  let result;
  if (startEvent.output && startEvent.output !== '') {
    result = startEvent.output;
  } else {
    var num  = node.getAttribute('prenum');
    result = '<pre>' + globals.preList[num] + '</pre>';
  }

  let endEvent = new showdown.Event('makeMarkdown.pre.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
