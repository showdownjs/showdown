showdown.subParser('makeMarkdown.codeBlock', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.codeBlock.onStart', node.outerHTML);
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
    var lang = node.getAttribute('language'),
        num  = node.getAttribute('precodenum'),
        code = globals.preList[num];
    if (options.ghCodeBlocks) {
      result = '```' + lang + '\n' + code + '\n```';
    } else {
      // fenced code blocks disabled -> emit raw HTML (re-escape the special chars that
      // substitutePreCodeTags decoded when it stashed the content)
      var escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
          langClass = lang ? ' class="' + lang + '"' : '';
      result = '<pre><code' + langClass + '>' + escaped + '</code></pre>';
    }
  }

  let endEvent = new showdown.Event('makeMarkdown.codeBlock.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
