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
      // only checkbox inputs map to task-list markdown, and only when tasklists are enabled;
      // anything else passes through as raw HTML
      if (node.getAttribute('type') !== 'checkbox' || !options.tasklists) {
        return node.outerHTML;
      }
      return (node.getAttribute('checked') !== null) ? '[x]' : '[ ]';
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
