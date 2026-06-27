/**
 * Unit tests for the `cmSpec` option (strict CommonMark inline raw HTML).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter cmSpec option (RawHTML)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should pass malformed tags through unescaped', function () {
      converter.makeHtml('<33> <__>').should.equal('<p><33> <__></p>');
    });

    it('should keep a valid inline tag', function () {
      converter.makeHtml('<a href="hi">ok</a>').should.equal('<p><a href="hi">ok</a></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should escape a tag with a numeric name', function () {
      converter.makeHtml('<33> <__>').should.equal('<p>&lt;33&gt; &lt;__&gt;</p>');
    });

    it('should escape a tag with invalid attribute characters', function () {
      converter.makeHtml('<a h*#ref="hi">').should.equal('<p>&lt;a h*#ref=&quot;hi&quot;&gt;</p>');
    });

    it('should keep an HTML comment containing -- raw', function () {
      converter.makeHtml('foo <!-- a comment -- two hyphens -->')
        .should.equal('<p>foo <!-- a comment -- two hyphens --></p>');
    });

    it('should keep the empty comments <!--> and <!---> raw', function () {
      converter.makeHtml('foo <!--> <!---> bar')
        .should.equal('<p>foo <!--> <!---> bar</p>');
    });

    it('should keep a CDATA section raw (no & encoding inside)', function () {
      converter.makeHtml('foo <![CDATA[>&<]]>').should.equal('<p>foo <![CDATA[>&<]]></p>');
    });

    it('should keep a well-formed tag raw', function () {
      converter.makeHtml('<a href="hi">ok</a>').should.equal('<p><a href="hi">ok</a></p>');
    });

    it('should not parse markup characters inside a tag as emphasis', function () {
      converter.makeHtml('**<a href="**">').should.equal('<p>**<a href="**"></p>');
    });

    it('should keep a backslash literal inside a raw HTML attribute', function () {
      converter.makeHtml('foo <a href="\\*">').should.equal('<p>foo <a href="\\*"></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should keep an entity reference verbatim inside a raw HTML attribute', function () {
      converter.makeHtml('foo <a href="&ouml;">').should.equal('<p>foo <a href="&ouml;"></p>');
    });

    it('should not treat a backslash-escaped angle bracket as a tag', function () {
      converter.makeHtml('\\<br/> not a tag').should.equal('<p>&lt;br/&gt; not a tag</p>');
    });
  });
});
