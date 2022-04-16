showdown.subParser('makeMarkdown.pre', function (node, options, globals) {
  'use strict';

  var num  = node.getAttribute('prenum');
  return '<pre>' + globals.preList[num] + '</pre>';
});
