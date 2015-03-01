/**
 * Run language extensions
 */
showdown.subParser('outputModifiers', function (text, config, globals) {
  'use strict';

  showdown.helper.forEach(globals.outputModifiers, function (ext) {
    text = showdown.subParser('runExtension')(ext, text);
  });
  return text;
});
