/**
 * Created by Estevao on 15-01-2015.
 */

describe('showdown.Converter', function () {
  'use strict';

  require('source-map-support').install();
  require('chai').should();

  var showdown = require('../bootstrap').showdown;

  describe('Converter.options extensions', function () {
    showdown.extensions.testext = function () {
      return [{
        type: 'output',
        filter: function (text) {
          runCount = runCount + 1;
          return text;
        }
      }];
    };
    var runCount,
      converter = new showdown.Converter({extensions: ['testext']});

    it('output extensions should run once', function () {
      runCount = 0;
      converter.makeHtml('# testext');
      runCount.should.equal(1);
    });
  });

  describe('makeHtml() with option omitExtraWLInCodeBlocks', function () {
    var converter = new showdown.Converter({omitExtraWLInCodeBlocks: true}),
      text = 'var foo = bar;',
      html = converter.makeHtml('    ' + text);
    it('should omit extra line after code tag', function () {
      var expectedHtml = '<pre><code>' + text + '</code></pre>';
      html.should.equal(expectedHtml);
    });
  });

  describe('makeHtml() with option prefixHeaderId', function () {
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
});
