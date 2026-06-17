showdown.subParser('makeMarkdown.underline', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.underline.onStart', node.outerHTML);
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
      // showdown's forward parser emits <u> for the `underline` option (e.g. __text__).
      // We mirror that here so <u> round-trips. Note: __ is standard-Markdown strong, so this
      // only round-trips cleanly through a converter that has the `underline` option enabled.
      var txt = '';
      if (node.hasChildNodes()) {
        txt += '__';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
        }
        txt += '__';
      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.underline.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
