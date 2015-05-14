/**
 * Run language extensions
 */
showdown.subParser('languageExtensions', function (text, config, globals) {
  'use strict';

  showdown.helper.forEach(globals.langExtensions, function (ext) {
    text = showdown.subParser('runExtension')(ext, text);
  });
  return text;
});
