showdown.subParser('makeMarkdown.header', function (node, options, globals, headerLevel) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.header.onStart', node.outerHTML);
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
      let headerMark = new Array(headerLevel + 1).join('#'),
          txt = '';

      if (node.hasChildNodes()) {
        txt = headerMark + ' ';
        let children = node.childNodes,
            childrenLength = children.length;

        for (let i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
        }
      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.header.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
