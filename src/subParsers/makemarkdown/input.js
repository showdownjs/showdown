showdown.subParser('makeMarkdown.input', function (node, options, globals) {
  'use strict';

  var txt = '';
  if (node.getAttribute('checked') !== null) {
    txt += '[x]';
  } else {
    txt += '[ ]';
  }
  var children = node.childNodes,
      childrenLength = children.length;
  for (var i = 0; i < childrenLength; ++i) {
    txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
  }
  return txt;
});
