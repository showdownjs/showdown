/**
 * Created by Estevao on 08-06-2015.
 */

//jscs:disable requireCamelCaseOrUpperCaseIdentifiers
(function () {
  'use strict';

  require('source-map-support').install();
  require('chai').should();
  var fs = require('fs');
  var jsdom = require('jsdom');
  var document = new jsdom.JSDOM('', {}).window.document; // jshint ignore:line

  function getTestSuite (dir) {
    return fs.readdirSync(dir)
      .filter(filter())
      .map(map(dir));
  }

  function getHtmlToMdTestSuite (dir) {
    return fs.readdirSync(dir)
      .filter(filter())
      .map(map2(dir));
  }

  function filter () {
    return function (file) {
      var ext = file.slice(-3);
      return (ext === '.md');
    };
  }

  function map (dir) {
    return function (file) {
      var name = file.replace('.md', ''),
          htmlPath = dir + name + '.html',
          html = fs.readFileSync(htmlPath, 'utf8'),
          mdPath = dir + name + '.md',
          md = fs.readFileSync(mdPath, 'utf8');

      return {
        name:     name,
        input:    md,
        expected: html
      };
    };
  }

  function map2 (dir) {
    return function (file) {
      var name = file.replace('.md', ''),
          htmlPath = dir + name + '.html',
          html = fs.readFileSync(htmlPath, 'utf8'),
          mdPath = dir + name + '.md',
          md = fs.readFileSync(mdPath, 'utf8');

      return {
        name:     name,
        input:    html,
        expected: md
      };
    };
  }

  function assertion (testCase, converter, type) {
    return function () {
      //var conv = (type === 'makeMd') ? converter.makeMd : converter.makeHtml;

      testCase.actual = (type === 'makeMd') ? converter.makeMd(testCase.input, document) : converter.makeHtml(testCase.input);
      testCase = normalize(testCase);

      // Compare
      testCase.actual.should.equal(testCase.expected);
    };
  }

  //Normalize input/output
  function normalize (testCase) {

    // Normalize line returns
    testCase.expected = testCase.expected.replace(/(\r\n)|\n|\r/g, '\n');
    testCase.actual = testCase.actual.replace(/(\r\n)|\n|\r/g, '\n');

    // Ignore all leading/trailing whitespace
    testCase.expected = testCase.expected.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');
    testCase.actual = testCase.actual.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');

    // Remove extra lines
    testCase.expected = testCase.expected.trim();
    testCase.actual = testCase.actual.trim();

    //Beautify
    //testCase.expected = beautify(testCase.expected, beauOptions);
    //testCase.actual = beautify(testCase.actual, beauOptions);

    // Normalize line returns
    testCase.expected = testCase.expected.replace(/(\r\n)|\n|\r/g, '\n');
    testCase.actual = testCase.actual.replace(/(\r\n)|\n|\r/g, '\n');

    return testCase;
  }

  module.exports = {
    getTestSuite: getTestSuite,
    getHtmlToMdTestSuite: getHtmlToMdTestSuite,
    assertion: assertion,
    normalize: normalize,
    showdown: require('../.build/showdown.js')
  };
})();

