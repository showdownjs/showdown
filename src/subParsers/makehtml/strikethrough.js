showdown.subParser('makehtml.strikethrough', function (text, options, globals) {
  'use strict';

  if (options.strikethrough) {
    text = globals.converter._dispatch('makehtml.strikethrough.before', text, options, globals).getText();
    text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) { return '<del>' + txt + '</del>'; });
    text = globals.converter._dispatch('makehtml.strikethrough.after', text, options, globals).getText();
  }

  return text;
});
