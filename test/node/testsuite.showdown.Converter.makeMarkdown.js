/**
 * Created by Estevao on 15-01-2015.
 */

describe('showdown.Converter', function () {
  'use strict';

  require('source-map-support').install();
  require('chai').should();
  var jsdom = require('jsdom');
  var document = new jsdom.JSDOM('', {}).window.document; // jshint ignore:line
  var showdown = require('../bootstrap').showdown;

  describe('makeMarkdown()', function () {
    var converter = new showdown.Converter();

    it('should parse a simple html string', function () {
      var html = '<a href="/somefoo.html">a link</a>\n';
      var md   = '[a link](</somefoo.html>)';

      converter.makeMd(html, document).should.equal(md);
    });

  });
});
