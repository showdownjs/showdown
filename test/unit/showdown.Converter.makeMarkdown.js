/**
 * Created by Estevao on 15-01-2015.
 */
require('source-map-support').install();
require('chai').should();
require('sinon');
var showdown = require('../../.build/showdown.js');

describe('showdown.Converter', function () {
  'use strict';


  describe('makeMarkdown()', function () {
    var converter = new showdown.Converter();

    it('should parse a simple html string', function () {
      var html = '<a href="/somefoo.html">a link</a>\n';
      var md   = '[a link](</somefoo.html>)';

      converter.makeMarkdown(html).should.equal(md);
    });

  });
});
