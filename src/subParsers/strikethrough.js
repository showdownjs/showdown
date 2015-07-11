showdown.subParser('strikethrough', function (text, options) {
  'use strict';

  if (options.strikethrough) {
    text = text.replace(/(?:~T){2}([^~]+)(?:~T){2}/g, '<del>$1</del>');
  }

  return text;
});
