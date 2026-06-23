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
      let txt = '';
      if (!node.hasChildNodes()) {
        return txt;
      }
      let children = node.childNodes,
          childrenLength = children.length;

      // anchors without an href (e.g. named anchors) lose their link semantics but keep their text
      if (!node.hasAttribute('href')) {
        for (let n = 0; n < childrenLength; ++n) {
          txt += showdown.subParser('makeMarkdown.node')(children[n], options, globals);
        }
        return txt;
      }

      // special case for mentions
      // to simplify (and not make stuff really complicated) mentions will only work in this circumstance:
      // <a class="user-mention" href="https://github.com/user">@user</a>
      // that is, if there's a "user-mention" class and option ghMentions is true
      // otherwise is ignored
      let classes = node.getAttribute('class');
      if (options.ghMentions && /(?:^| )user-mention\b/.test(classes)) {
        for (let ii = 0; ii < childrenLength; ++ii) {
          txt += showdown.subParser('makeMarkdown.node')(children[ii], options, globals);
        }
        return txt;
      }

      let innerTxt = '';
      for (let i = 0; i < childrenLength; ++i) {
        innerTxt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
      }
      let href = node.getAttribute('href');

      // autolink: when the link text is identical to the href and there's no title,
      // emit the compact <href> form instead of [href](<href>)
      if (!node.hasAttribute('title') && innerTxt === href) {
        return '<' + href + '>';
      }

      txt = '[' + innerTxt + '](<' + href + '>';
      if (node.hasAttribute('title')) {
        txt += ' "' + node.getAttribute('title') + '"';
      }
      txt += ')';
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
