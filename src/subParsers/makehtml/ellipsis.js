showdown.subParser('makehtml.ellipsis', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.ellipsis.before', text, options, globals).getText();

  text = text.replace(/\.\.\./g, '…');

  text = globals.converter._dispatch('makehtml.ellipsis.after', text, options, globals).getText();

  return text;
});
