/**
 * Turn Markdown horizontal rule shortcuts into <hr /> tags.
 *
 * Any 3 or more unindented consecutive hyphens, asterisks or underscores with or without a space beetween them
 * in a single line is considered a horizontal rule
 */
showdown.subParser('makehtml.horizontalRule', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.horizontalRule.before', text, options, globals).getText();

  var key = showdown.subParser('makehtml.hashBlock')('<hr />', options, globals);
  text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
  text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

  text = globals.converter._dispatch('makehtml.horizontalRule.after', text, options, globals).getText();
  return text;
});
