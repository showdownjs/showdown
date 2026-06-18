/**
 * Unit tests for the `commonmarkTabs` option (CommonMark 4-column tab-stop expansion
 * in block-structure indentation). Gated: off by default, enabled by the `commonmark`
 * flavor.
 */
chai.should();

describe('showdown.Converter commonmarkTabs option', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default (tabs after a marker not expanded to code)', function () {
      norm(converter.makeHtml('-\t\tfoo')).should.equal(norm('<ul>\n<li>foo</li>\n</ul>'));
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({commonmarkTabs: true});

    it('should expand a leading tab to a 4-space indent (indented code)', function () {
      norm(converter.makeHtml('\tfoo')).should.equal(norm('<pre><code>foo\n</code></pre>'));
    });

    it('should preserve content tabs inside the code', function () {
      converter.makeHtml('\tfoo\tbar').should.equal('<pre><code>foo\tbar\n</code></pre>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should expand tabs after a list marker (code block in item)', function () {
      norm(converter.makeHtml('-\t\tfoo'))
        .should.equal(norm('<ul>\n<li>\n<pre><code>  foo\n</code></pre>\n</li>\n</ul>'));
    });

    it('should let a tab continue a list-item paragraph', function () {
      norm(converter.makeHtml('  - foo\n\n\tbar'))
        .should.equal(norm('<ul>\n<li>\n<p>foo</p>\n<p>bar</p>\n</li>\n</ul>'));
    });

    it('should still recognize a thematic break with tabs', function () {
      norm(converter.makeHtml('*\t*\t*')).should.equal(norm('<hr />'));
    });
  });
});
