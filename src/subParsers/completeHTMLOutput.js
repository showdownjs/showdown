/**
 * Turn Markdown link shortcuts into XHTML <a> tags.
 */
showdown.subParser('completeHTMLOutput', function (text, options, globals) {
  'use strict';

  if (!options.completeHTMLOutput) {
    return text;
  }

  text = globals.converter._dispatch('completeHTMLOutput.before', text, options, globals);

  text = '<html>\n<head>\n<meta charset="UTF-8">\n</head>\n<body>\n' + text.trim() + '\n</body>\n</html>';

  text = globals.converter._dispatch('completeHTMLOutput.after', text, options, globals);
  return text;
});
