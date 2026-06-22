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
    let code = showdown.helper.unescapeHTMLEntities(node.innerHTML);
    // pick a backtick fence longer than the longest run of backticks inside the content
    let backtickRuns = code.match(/`+/g),
        longestRun = 0;
    if (backtickRuns) {
      for (let b = 0; b < backtickRuns.length; ++b) {
        if (backtickRuns[b].length > longestRun) {
          longestRun = backtickRuns[b].length;
        }
      }
    }
    let fence = new Array(longestRun + 2).join('`'),
        pad = (longestRun > 0) ? ' ' : '';
    result = fence + pad + code + pad + fence;
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
