/**
 * Unit tests for the `cmSpec` option (CommonMark links, images and link
 * reference definitions). The behavior is gated: off by default, enabled by the
 * `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Links)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep entities verbatim in the destination', function () {
      expect(converter.makeHtml('[link](foo%20b&auml;)')
      ).toBe('<p><a href="foo%20b&auml;">link</a></p>');
    });

    it('should not percent-encode non-ASCII destinations', function () {
      expect(converter.makeHtml('[αγω](/φου)')
      ).toBe('<p><a href="/φου">αγω</a></p>');
    });

    it('should keep entities verbatim in the title', function () {
      expect(converter.makeHtml('[foo](/f&ouml;&ouml; "f&ouml;&ouml;")')
      ).toBe('<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>');
    });

    it('should match reference labels case-insensitively (ASCII)', function () {
      expect(converter.makeHtml('[Foo]\n\n[FOO]: /u')).toBe('<p><a href="/u">Foo</a></p>');
    });

    it('should case-fold reference labels so ẞ matches SS', function () {
      expect(converter.makeHtml('[ẞ]\n\n[SS]: /url')).toBe('<p><a href="/url">ẞ</a></p>');
    });
  });

  describe('enabled - URL normalization', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should decode entities inside the destination and percent-encode them', function () {
      expect(converter.makeHtml('[link](foo%20b&auml;)')
      ).toBe('<p><a href="foo%20b%C3%A4">link</a></p>');
    });

    it('should preserve already percent-encoded sequences', function () {
      expect(converter.makeHtml('[link](/a%20b)')
      ).toBe('<p><a href="/a%20b">link</a></p>');
    });

    it('should percent-encode non-ASCII destinations', function () {
      expect(converter.makeHtml('[αγω](/φου)')
      ).toBe('<p><a href="/%CF%86%CE%BF%CF%85">αγω</a></p>');
    });

    it('should decode entities in both destination and title', function () {
      expect(converter.makeHtml('[foo](/f&ouml;&ouml; "f&ouml;&ouml;")')
      ).toBe('<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>');
    });

    it('should HTML-escape a bare ampersand in the title', function () {
      expect(converter.makeHtml('[foo](/url "a & b")')
      ).toBe('<p><a href="/url" title="a &amp; b">foo</a></p>');
    });
  });

  describe('enabled - inline destination/title parsing', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should allow balanced parentheses in a bare destination', function () {
      expect(converter.makeHtml('[link](foo(and(bar)))')
      ).toBe('<p><a href="foo(and(bar))">link</a></p>');
    });

    it('should not form a link when destination parens are unbalanced', function () {
      expect(converter.makeHtml('[link](foo(and(bar))')
      ).toBe('<p>[link](foo(and(bar))</p>');
    });

    it('should parse an angle-bracket destination and percent-encode spaces', function () {
      expect(converter.makeHtml('[link](</my uri>)')
      ).toBe('<p><a href="/my%20uri">link</a></p>');
    });

    it('should percent-encode a literal backslash in the destination', function () {
      expect(converter.makeHtml('[link](foo\\bar)')
      ).toBe('<p><a href="foo%5Cbar">link</a></p>');
    });

    it('should treat a quoted-only destination as the destination, not a title', function () {
      expect(converter.makeHtml('[link]("title")')
      ).toBe('<p><a href="%22title%22">link</a></p>');
    });

    it('should accept a title wrapped in parentheses', function () {
      expect(converter.makeHtml('[link](/url (title))')
      ).toBe('<p><a href="/url" title="title">link</a></p>');
    });

    it('should require whitespace between destination and title', function () {
      expect(converter.makeHtml('[link] (/uri)')
      ).toBe('<p>[link] (/uri)</p>');
    });

    it('should match the innermost opening bracket', function () {
      expect(converter.makeHtml('[link [bar](/uri)')
      ).toBe('<p>[link <a href="/uri">bar</a></p>');
    });

    it('should handle multiple levels of nested brackets in the label', function () {
      expect(converter.makeHtml('[link [foo [bar]]](/uri)')
      ).toBe('<p><a href="/uri">link [foo [bar]]</a></p>');
    });
  });

  describe('enabled - reference definitions', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should use the first definition when a label is defined twice', function () {
      expect(converter.makeHtml('[foo]\n\n[foo]: first\n[foo]: second')
      ).toBe('<p><a href="first">foo</a></p>');
    });

    it('should support an empty <> destination', function () {
      expect(converter.makeHtml('[foo]: <>\n\n[foo]')
      ).toBe('<p><a href="">foo</a></p>');
    });

    it('should support a multi-line definition with an angle-bracket destination', function () {
      expect(converter.makeHtml('[Foo bar]:\n<my url>\n\'title\'\n\n[Foo bar]')
      ).toBe('<p><a href="my%20url" title="title">Foo bar</a></p>');
    });

    it('should not treat a line with trailing junk after the title as a definition title', function () {
      expect(converter.makeHtml('[foo]: /url\n"title" ok')
      ).toBe('<p>&quot;title&quot; ok</p>');
    });

    it('should consume an unreferenced definition entirely', function () {
      expect(converter.makeHtml('[foo]: /url')
      ).toBe('');
    });

    it('should resolve a backslash-escaped punctuation char in a definition url', function () {
      expect(converter.makeHtml('[foo]: /bar\\*baz\n\n[foo]')
      ).toBe('<p><a href="/bar*baz">foo</a></p>');
    });

    it('should keep a backslash before a non-punctuation char as percent-encoded', function () {
      expect(converter.makeHtml('[foo]: /url\\bar\\*baz\n\n[foo]')
      ).toBe('<p><a href="/url%5Cbar*baz">foo</a></p>');
    });
  });

  describe('enabled - image alt-text flattening', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should strip emphasis markup from the alt text', function () {
      expect(converter.makeHtml('![foo *bar*](/u)')
      ).toBe('<p><img src="/u" alt="foo bar" /></p>');
    });

    it('should flatten a nested image to its alt text', function () {
      expect(converter.makeHtml('![foo ![bar](/url)](/url2)')
      ).toBe('<p><img src="/url2" alt="foo bar" /></p>');
    });

    it('should flatten a nested link to its text', function () {
      expect(converter.makeHtml('![foo [bar](/url)](/url2)')
      ).toBe('<p><img src="/url2" alt="foo bar" /></p>');
    });

    it('should parse an inline image with extra whitespace around the title', function () {
      expect(converter.makeHtml('My ![foo bar](/path/x.jpg  "title"   )')
      ).toBe('<p>My <img src="/path/x.jpg" alt="foo bar" title="title" /></p>');
    });

    it('should flatten alt text of a reference image', function () {
      expect(converter.makeHtml('![*foo* bar]\n\n[*foo* bar]: /url "title"')
      ).toBe('<p><img src="/url" alt="foo bar" title="title" /></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should normalize entity references in a reference definition url and title', function () {
      expect(converter.makeHtml('[foo]\n\n[foo]: /f&ouml;&ouml; "f&ouml;&ouml;"')
      ).toBe('<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>');
    });

    it('should let emphasis nest inside link text', function () {
      expect(converter.makeHtml('[foo *bar*](/url)')
      ).toBe('<p><a href="/url">foo <em>bar</em></a></p>');
    });

    it('should let a link nest inside emphasis', function () {
      expect(converter.makeHtml('**[foo](/url)**')
      ).toBe('<p><strong><a href="/url">foo</a></strong></p>');
    });

    it('should resolve backslash escapes in a definition url and title', function () {
      expect(converter.makeHtml('[foo]\n\n[foo]: /bar\\* "ti\\*tle"')
      ).toBe('<p><a href="/bar*" title="ti*tle">foo</a></p>');
    });
  });
});
