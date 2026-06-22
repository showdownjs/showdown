showdown.subParser('makeMarkdown.listItem', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.listItem.onStart', node.outerHTML);
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
      let listItemTxt = '';

      let children = node.childNodes,
          childrenLenght = children.length;

      for (let i = 0; i < childrenLenght; ++i) {
        listItemTxt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
      }
      // if it's only one liner, we need to add a newline at the end
      if (!/\n$/.test(listItemTxt)) {
        listItemTxt += '\n';
      } else {
        // it's multiparagraph, so we need to indent
        listItemTxt = listItemTxt
          .split('\n')
          .join('\n    ')
          .replace(/^ {4}$/gm, '')
          .replace(/\n\n+/g, '\n\n');
      }

      return listItemTxt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.listItem.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
