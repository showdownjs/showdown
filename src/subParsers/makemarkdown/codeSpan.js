showdown.subParser('makeMarkdown.codeSpan', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.codeSpan.onStart', node.outerHTML);
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
    result = '`' + node.innerHTML + '`';
  }

  let endEvent = new showdown.Event('makeMarkdown.codeSpan.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
