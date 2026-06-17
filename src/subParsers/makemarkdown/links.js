showdown.subParser('makeMarkdown.links', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.links.onStart', node.outerHTML);
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
      if (node.hasChildNodes() && node.hasAttribute('href')) {
        var children = node.childNodes,
            childrenLength = children.length;

        // special case for mentions
        // to simplify (and not make stuff really complicated) mentions will only work in this circumstance:
        // <a class="user-mention" href="https://github.com/user">@user</a>
        // that is, if there's a "user-mention" class and option ghMentions is true
        // otherwise is ignored
        var classes = node.getAttribute('class');
        if (options.ghMentions && /(?:^| )user-mention\b/.test(classes)) {
          for (var ii = 0; ii < childrenLength; ++ii) {
            txt += showdown.subParser('makeMarkdown.node')(children[ii], options, globals);
          }

        } else {
          txt = '[';
          for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
          }
          txt += '](';
          txt += '<' + node.getAttribute('href') + '>';
          if (node.hasAttribute('title')) {
            txt += ' "' + node.getAttribute('title') + '"';
          }
          txt += ')';
        }


      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.links.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
