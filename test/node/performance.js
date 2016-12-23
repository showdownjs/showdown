/**
 * Created by Tivie on 21/12/2016.
 */
'use strict';
var fs = require('fs'),
    showdown = require('../bootstrap').showdown,
    converter = new showdown.Converter(),
    pkg = require('../../package.json'),
    performance = require('../performance/performance.js');

performance.setLibraryName(pkg.name);
performance.setVersion(pkg.version);
performance.setGithubLink('https://github.com/showdownjs/showdown/tree/');

var
  runTests = function () {
    new performance.Suite('Basic')
      .setOption('cycles', 100)
      .add('Simple "Hello World"', function () {
        converter.makeHtml('*Hello* **World**!');
      })
      .add('readme.md', {
        prepare: function () {
          return fs.readFileSync('README.md', 'utf8');
        },
        test: function (mdText) {
          converter.makeHtml(mdText);
        }
      });
  },
  generateLogs = function () {
    performance.generateLog();
  };

module.exports = {
  runTests: runTests,
  generateLogs: generateLogs
};
