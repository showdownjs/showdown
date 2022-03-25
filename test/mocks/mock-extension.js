var showdown = require('../../.build/showdown.js');

var ext = {
  type: 'lang',
  regex: /foo/g,
  replace: 'bar'
};

showdown.extension('mockextension', function () {
  'use strict';
  return [ext];
});

module.exports = ext;
