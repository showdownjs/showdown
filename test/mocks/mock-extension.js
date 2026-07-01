// Loaded by the spawned CLI (makehtml -e). Require the SAME bundle the CLI loaded so the
// extension registers on that showdown instance, not a separate copy.
var showdown = require(process.env.SHOWDOWN_CLI_BUNDLE || '../../dist/showdown.js');

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
