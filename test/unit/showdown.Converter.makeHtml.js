/**
 * Created by Estevao on 15-01-2015.
 */
require('source-map-support').install();
require('chai').should();
require('sinon');
var showdown = require('../../.build/showdown.js');

describe('showdown.Converter', function () {
  'use strict';

  describe('Converter.options extensions', function () {
    var runCount;
    showdown.extension('testext', function () {
      return [{
        type: 'output',
        filter: function (text) {
          runCount = runCount + 1;
          return text;
        }
      }];
    });

    var converter = new showdown.Converter({extensions: ['testext']});

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

  describe('makeHtml() with option metadata', function () {
    var converter = new showdown.Converter(),
        text1 =
          '---SIMPLE\n' +
          'foo: bar\n' +
          'baz: bazinga\n' +
          '---\n',
        text2 =
          '---TIVIE\n' +
          'a: b\n' +
          'c: 123\n' +
          '---\n';

    it('should correctly set metadata', function () {
      converter.setOption('metadata', true);

      var expectedHtml = '',
          expectedObj = {foo: 'bar', baz: 'bazinga'},
          expectedRaw = 'foo: bar\nbaz: bazinga',
          expectedFormat = 'SIMPLE';
      converter.makeHtml(text1).should.equal(expectedHtml);
      converter.getMetadata().should.eql(expectedObj);
      converter.getMetadata(true).should.equal(expectedRaw);
      converter.getMetadataFormat().should.equal(expectedFormat);
    });

    it('consecutive calls should reset metadata', function () {
      converter.makeHtml(text2);
      var expectedObj = {a: 'b', c: '123'},
          expectedRaw = 'a: b\nc: 123',
          expectedFormat = 'TIVIE';
      converter.getMetadata().should.eql(expectedObj);
      converter.getMetadata(true).should.equal(expectedRaw);
      converter.getMetadataFormat().should.equal(expectedFormat);
    });
  });
});
