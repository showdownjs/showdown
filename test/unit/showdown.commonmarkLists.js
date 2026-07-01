/**
 * Unit tests for the `cmSpec` option (the CommonMark list container parser).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Lists)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default behavior (mixed bullets are one list)', function () {
      expect(converter.makeHtml('- foo\n- bar\n+ baz')
      ).toBe('<ul>\n<li>foo</li>\n<li>bar</li>\n<li>baz</li>\n</ul>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should start a new list when the bullet character changes', function () {
      expect(norm(converter.makeHtml('- foo\n- bar\n+ baz'))
      ).toBe(norm('<ul>\n<li>foo</li>\n<li>bar</li>\n</ul>\n<ul>\n<li>baz</li>\n</ul>'));
    });

    it('should start a new list when the ordered delimiter changes', function () {
      expect(norm(converter.makeHtml('1. foo\n2. bar\n3) baz'))
      ).toBe(norm('<ol>\n<li>foo</li>\n<li>bar</li>\n</ol>\n<ol start="3">\n<li>baz</li>\n</ol>'));
    });

    it('should keep the ordered list start number', function () {
      expect(norm(converter.makeHtml('123456789. ok'))
      ).toBe(norm('<ol start="123456789">\n<li>ok</li>\n</ol>'));
    });

    it('should render a loose list (blank line between items) with <p> wrapping', function () {
      expect(norm(converter.makeHtml('- a\n- b\n\n- c'))
      ).toBe(norm('<ul>\n<li>\n<p>a</p>\n</li>\n<li>\n<p>b</p>\n</li>\n<li>\n<p>c</p>\n</li>\n</ul>'));
    });

    it('should not let a non-1 ordered list interrupt a paragraph', function () {
      expect(norm(converter.makeHtml('The number of windows is\n14.  The number of doors is 6.'))
      ).toBe(norm('<p>The number of windows is\n14.  The number of doors is 6.</p>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should nest a sub-list by content indentation', function () {
      expect(norm(converter.makeHtml('- foo\n  - bar\n    - baz'))
      ).toBe(norm('<ul>\n<li>foo\n<ul>\n<li>bar\n<ul>\n<li>baz</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>'));
    });

    it('should render content indented past the item as a code block', function () {
      expect(norm(converter.makeHtml('- foo\n\n      bar'))
      ).toBe(norm('<ul>\n<li>\n<p>foo</p>\n<pre><code>bar\n</code></pre>\n</li>\n</ul>'));
    });

    it('should nest a list whose marker is on the same line', function () {
      expect(norm(converter.makeHtml('- - foo'))
      ).toBe(norm('<ul>\n<li>\n<ul>\n<li>foo</li>\n</ul>\n</li>\n</ul>'));
    });

    it('should not let a setext dash underline steal an empty list item', function () {
      expect(norm(converter.makeHtml('- foo\n-\n- bar'))
      ).toBe(norm('<ul>\n<li>foo</li>\n<li></li>\n<li>bar</li>\n</ul>'));
    });

    it('should treat an indented dash line inside an item as a setext underline', function () {
      expect(norm(converter.makeHtml('- # Foo\n- Bar\n  ---\n  baz'))
      ).toBe(norm('<ul>\n<li>\n<h1>Foo</h1>\n</li>\n<li>\n<h2>Bar</h2>\nbaz</li>\n</ul>'));
    });

    it('should keep an unindented dash line after a list item as a thematic break', function () {
      expect(norm(converter.makeHtml('- Foo\n---'))
      ).toBe(norm('<ul>\n<li>Foo</li>\n</ul>\n<hr />'));
    });

    it('should lazily continue a paragraph through nested block quote + list + block quote', function () {
      expect(norm(converter.makeHtml('> 1. > Blockquote\ncontinued here.'))
      ).toBe(norm('<blockquote>\n<ol>\n<li>\n<blockquote>\n<p>Blockquote\ncontinued here.</p>\n</blockquote>\n</li>\n</ol>\n</blockquote>'));
    });

    it('should keep outer lists tight when only a nested item is loose', function () {
      expect(norm(converter.makeHtml('- foo\n  - bar\n    - baz\n\n\n      bim'))
      ).toBe(norm('<ul>\n<li>foo\n<ul>\n<li>bar\n<ul>\n<li>\n<p>baz</p>\n<p>bim</p>\n</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>'));
    });

    it('should make only the nested list loose for an inner blank line', function () {
      expect(norm(converter.makeHtml('- a\n  - b\n\n    c\n- d'))
      ).toBe(norm('<ul>\n<li>a\n<ul>\n<li>\n<p>b</p>\n<p>c</p>\n</li>\n</ul>\n</li>\n<li>d</li>\n</ul>'));
    });
  });
});
