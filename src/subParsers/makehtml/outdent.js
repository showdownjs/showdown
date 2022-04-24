/**
 * Remove one level of line-leading tabs or spaces
 */
showdown.subParser('makehtml.outdent', function (text) {
  'use strict';
  return text.replace(/^(\t| {1,4})/gm, '');
});
