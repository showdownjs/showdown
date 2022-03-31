/**
 * Created by Estevao on 15-01-2015.
 */
//let showdown = require('../../.build/showdown.js') || require('showdown');
chai.should();

describe('showdown.Converter', function () {
  'use strict';


  describe('makeMarkdown()', function () {
    let converter = new showdown.Converter();

    it('should parse a simple html string', function () {
      let html = '<a href="/somefoo.html">a link</a>\n';
      let md   = '[a link](</somefoo.html>)';

      converter.makeMarkdown(html).should.equal(md);
    });

  });
});
