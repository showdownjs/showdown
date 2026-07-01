/**
 * Unit tests for the `cmSpec` option (CommonMark 4-column tab-stop expansion
 * in block-structure indentation). Gated: off by default, enabled by the `commonmark`
 * flavor.
 */

describe('showdown.Converter cmSpec option (Tabs)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default (tabs after a marker not expanded to code)', function () {
      expect(norm(converter.makeHtml('-\t\tfoo'))).toBe(norm('<ul>\n<li>foo</li>\n</ul>'));
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should expand a leading tab to a 4-space indent (indented code)', function () {
      expect(norm(converter.makeHtml('\tfoo'))).toBe(norm('<pre><code>foo\n</code></pre>'));
    });

    it('should preserve content tabs inside the code', function () {
      expect(converter.makeHtml('\tfoo\tbar')).toBe('<pre><code>foo\tbar\n</code></pre>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should expand tabs after a list marker (code block in item)', function () {
      expect(norm(converter.makeHtml('-\t\tfoo'))
      ).toBe(norm('<ul>\n<li>\n<pre><code>  foo\n</code></pre>\n</li>\n</ul>'));
    });

    it('should let a tab continue a list-item paragraph', function () {
      expect(norm(converter.makeHtml('  - foo\n\n\tbar'))
      ).toBe(norm('<ul>\n<li>\n<p>foo</p>\n<p>bar</p>\n</li>\n</ul>'));
    });

    it('should still recognize a thematic break with tabs', function () {
      expect(norm(converter.makeHtml('*\t*\t*'))).toBe(norm('<hr />'));
    });
  });
});
