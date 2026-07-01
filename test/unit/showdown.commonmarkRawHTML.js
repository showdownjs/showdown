/**
 * Unit tests for the `cmSpec` option (strict CommonMark inline raw HTML).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (RawHTML)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should pass malformed tags through unescaped', function () {
      expect(converter.makeHtml('<33> <__>')).toBe('<p><33> <__></p>');
    });

    it('should keep a valid inline tag', function () {
      expect(converter.makeHtml('<a href="hi">ok</a>')).toBe('<p><a href="hi">ok</a></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should escape a tag with a numeric name', function () {
      expect(converter.makeHtml('<33> <__>')).toBe('<p>&lt;33&gt; &lt;__&gt;</p>');
    });

    it('should escape a tag with invalid attribute characters', function () {
      expect(converter.makeHtml('<a h*#ref="hi">')).toBe('<p>&lt;a h*#ref=&quot;hi&quot;&gt;</p>');
    });

    it('should keep an HTML comment containing -- raw', function () {
      expect(converter.makeHtml('foo <!-- a comment -- two hyphens -->')
      ).toBe('<p>foo <!-- a comment -- two hyphens --></p>');
    });

    it('should keep the empty comments <!--> and <!---> raw', function () {
      expect(converter.makeHtml('foo <!--> <!---> bar')
      ).toBe('<p>foo <!--> <!---> bar</p>');
    });

    it('should keep a CDATA section raw (no & encoding inside)', function () {
      expect(converter.makeHtml('foo <![CDATA[>&<]]>')).toBe('<p>foo <![CDATA[>&<]]></p>');
    });

    it('should keep a well-formed tag raw', function () {
      expect(converter.makeHtml('<a href="hi">ok</a>')).toBe('<p><a href="hi">ok</a></p>');
    });

    it('should not parse markup characters inside a tag as emphasis', function () {
      expect(converter.makeHtml('**<a href="**">')).toBe('<p>**<a href="**"></p>');
    });

    it('should keep a backslash literal inside a raw HTML attribute', function () {
      expect(converter.makeHtml('foo <a href="\\*">')).toBe('<p>foo <a href="\\*"></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should keep an entity reference verbatim inside a raw HTML attribute', function () {
      expect(converter.makeHtml('foo <a href="&ouml;">')).toBe('<p>foo <a href="&ouml;"></p>');
    });

    it('should not treat a backslash-escaped angle bracket as a tag', function () {
      expect(converter.makeHtml('\\<br/> not a tag')).toBe('<p>&lt;br/&gt; not a tag</p>');
    });
  });
});
