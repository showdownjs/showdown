/**
 * Run language extensions
 */
showdown.subParser('runExtension', function (ext, text) {
  'use strict';

  if (ext.regex) {
    var re = new RegExp(ext.regex, 'g');
    return text.replace(re, ext.replace);
  } else if (ext.filter) {
    return ext.filter(text);
  }
});
