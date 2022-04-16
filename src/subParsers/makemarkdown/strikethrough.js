showdown.subParser('makeMarkdown.strikethrough', function (node, options, globals) {
  'use strict';

  var txt = '';
  if (node.hasChildNodes()) {
    txt += '~~';
    var children = node.childNodes,
        childrenLength = children.length;
    for (var i = 0; i < childrenLength; ++i) {
      txt += showdown.subParser('makeMarkdown.node')(children[i], options, globals);
    }
    txt += '~~';
  }
  return txt;
});
