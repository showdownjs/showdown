showdown.subParser('makeMarkdown.image', function (node) {
  'use strict';

  var txt = '';
  if (node.hasAttribute('src') && node.getAttribute('src') !== '') {
    txt += '![' + node.getAttribute('alt') + '](';
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
});
