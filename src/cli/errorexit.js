module.exports = exports = function errorExit(e) {
  'use strict';
  console.error('ERROR: ' + e.message);
  console.error('Run \'showdown <command> -h\' for help');
  process.exit(1);
};
