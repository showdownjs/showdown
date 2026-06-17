showdown.subParser('makeMarkdown.blockquote', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.blockquote.onStart', node.outerHTML);
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
      if (node.hasChildNodes()) {
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
          var innerTxt = showdown.subParser('makeMarkdown.node')(children[i], options, globals);

          if (innerTxt === '') {
            continue;
          }
          txt += innerTxt;
        }
      }
      // cleanup
      txt = txt.trim();
      txt = '> ' + txt.split('\n').join('\n> ');
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.blockquote.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
