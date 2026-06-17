showdown.subParser('makeMarkdown.input', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.input.onStart', node.outerHTML);
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
    result = (function () {
      var txt = '';
      if (node.getAttribute('checked') !== null) {
        txt += '[x]';
      } else {
        txt += '[ ]';
      }
      var children = node.childNodes,
          childrenLength = children.length;
      for (var i = 0; i < childrenLength; ++i) {
        txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.input.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
