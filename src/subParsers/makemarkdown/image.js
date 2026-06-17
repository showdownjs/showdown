showdown.subParser('makeMarkdown.image', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.image.onStart', node.outerHTML);
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
      if (node.hasAttribute('src') && node.getAttribute('src') !== '') {
        txt += '![' + (node.getAttribute('alt') || '') + '](';
        txt += '<' + node.getAttribute('src') + '>';
        if (node.hasAttribute('width') && node.hasAttribute('height')) {
          var width = node.getAttribute('width');
          var height = node.getAttribute('height');
          txt += ' =' + (width === 'auto' ? '*' : width) + 'x' + (height === 'auto' ? '*' : height);
        }

        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.image.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
