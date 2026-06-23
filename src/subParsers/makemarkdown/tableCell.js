showdown.subParser('makeMarkdown.tableCell', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.tableCell.onStart', node.outerHTML);
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
      let txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      let children = node.childNodes,
          childrenLength = children.length;

      for (let i = 0; i < childrenLength; ++i) {
        txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals, true);
      }
      return txt.trim();
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.tableCell.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
