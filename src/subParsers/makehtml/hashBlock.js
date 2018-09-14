showdown.subParser('makehtml.hashBlock', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashBlock.before', text, options, globals).getText();
  text = text.replace(/(^\n+|\n+$)/g, '');
  text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
  text = globals.converter._dispatch('makehtml.hashBlock.after', text, options, globals).getText();
  return text;
});
