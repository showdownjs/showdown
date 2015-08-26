/**
 * Strip any lines consisting only of spaces and tabs.
 * This makes subsequent regexs easier to write, because we can
 * match consecutive blank lines with /\n+/ instead of something
 * contorted like /[ \t]*\n+/
 */
showdown.subParser('stripBlankLines', function (text) {
  'use strict';
  return text.replace(/^[ \t]+$/mg, '');
});
