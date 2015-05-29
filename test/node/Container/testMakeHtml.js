/**
 * Created by Estevao on 15-01-2015.
 */

(function () {
  'use strict';

  require('source-map-support').install();
  require('chai').should();

  var fs = require('fs'),
      showdown = require('../../../dist/showdown.js'),
      cases = fs.readdirSync('test/cases/')
        .filter(filter())
        .map(map('test/cases/')),
      issues = fs.readdirSync('test/issues/')
        .filter(filter())
        .map(map('test/issues/'));

  //Tests
  describe('Converter.makeHtml() simple testcases', function () {
    var converter = new showdown.Converter();
    for (var i = 0; i < cases.length; ++i) {
      if (cases[i].name === 'github-style-at-start') {
        console.log(showdown.getOptions());
      }
      it(cases[i].name, assertion(cases[i], converter));
    }
  });

  describe('Converter.makeHtml() issues testcase', function () {
    var converter = new showdown.Converter();
    for (var i = 0; i < issues.length; ++i) {
      it(issues[i].name, assertion(issues[i], converter));
    }
  });

  describe('Converter.options omitExtraWLInCodeBlocks', function () {
    var converter = new showdown.Converter({omitExtraWLInCodeBlocks: true}),
        text = 'var foo = bar;',
        html = converter.makeHtml('    ' + text);
    it('should omit extra line after code tag', function () {
      var expectedHtml = '<pre><code>' + text + '</code></pre>';
      html.should.equal(expectedHtml);
    });
  });

  describe('Converter.options prefixHeaderId', function () {
    var converter = new showdown.Converter(),
        text = 'foo header';

    it('should prefix header id with "section"', function () {
      converter.setOption('prefixHeaderId', true);
      var html = converter.makeHtml('# ' + text),
          expectedHtml = '<h1 id="sectionfooheader">' + text + '</h1>';
      html.should.equal(expectedHtml);
    });

    it('should prefix header id with custom string', function () {
      converter.setOption('prefixHeaderId', 'blabla');
      var html = converter.makeHtml('# ' + text),
          expectedHtml = '<h1 id="blablafooheader">' + text + '</h1>';
      html.should.equal(expectedHtml);
    });
  });

  function filter() {
    return function (file) {
      var ext = file.slice(-3);
      return (ext === '.md');
    };
  }

  function map(dir) {
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

  //Normalize input/output
  function normalize(testCase) {

    // Normalize line returns
    testCase.expected = testCase.expected.replace(/\r/g, '');
    testCase.actual = testCase.actual.replace(/\r/g, '');

    // Ignore all leading/trailing whitespace
    testCase.expected = testCase.expected.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');
    testCase.actual = testCase.actual.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');

    // Remove extra lines
    testCase.expected = testCase.expected.trim();

    // Convert whitespace to a visible character so that it shows up on error reports
    testCase.expected = testCase.expected.replace(/ /g, '·');
    testCase.expected = testCase.expected.replace(/\n/g, '•\n');
    testCase.actual = testCase.actual.replace(/ /g, '·');
    testCase.actual = testCase.actual.replace(/\n/g, '•\n');

    return testCase;

  }

  function assertion(testCase, converter) {
    return function () {
      testCase.actual = converter.makeHtml(testCase.input);
      testCase = normalize(testCase);

      // Compare
      testCase.actual.should.equal(testCase.expected);
    };
  }
})();
