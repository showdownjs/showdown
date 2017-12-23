/**
 * Turn Markdown link shortcuts into XHTML <a> tags.
 */
showdown.subParser('makehtml.horizontalRule', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.horizontalRule.before', text, options, globals);

  var key = showdown.subParser('makehtml.hashBlock')('<hr />', options, globals);
  text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

  text = globals.converter._dispatch('makehtml.horizontalRule.after', text, options, globals);
  return text;
});
