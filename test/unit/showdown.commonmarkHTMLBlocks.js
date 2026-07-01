/**
 * Unit tests for the `cmSpec` option (the 7 CommonMark HTML block types).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (HTMLBlocks)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default behavior for a type 6 block', function () {
      expect(converter.makeHtml('<div>\n*foo*\n\n*bar*')
      ).toBe('<p><div>\n<em>foo</em></p>\n<p><em>bar</em></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should end a type 6 block at a blank line and parse following markdown', function () {
      expect(converter.makeHtml('<div>\n*foo*\n\n*bar*')
      ).toBe('<div>\n*foo*\n<p><em>bar</em></p>');
    });

    it('should parse markdown between a block tag and its close after blank lines', function () {
      expect(converter.makeHtml('<div>\n\n*Emphasized* text.\n\n</div>')
      ).toBe('<div>\n<p><em>Emphasized</em> text.</p>\n</div>');
    });

    it('should treat textarea (type 1) content as verbatim', function () {
      expect(converter.makeHtml('<textarea>\n\n*foo*\n\n</textarea>')
      ).toBe('<textarea>\n\n*foo*\n\n</textarea>');
    });

    it('should recognize a declaration (type 4) block', function () {
      expect(converter.makeHtml('<!DOCTYPE html>')).toBe('<!DOCTYPE html>');
    });

    it('should recognize a type 6 block whose start tag spans lines', function () {
      expect(converter.makeHtml('<div id="foo"\n*hi*')).toBe('<div id="foo"\n*hi*');
    });

    it('should end a script (type 1) block on its closing tag line', function () {
      expect(converter.makeHtml('<script>\nfoo\n</script>1. *bar*')
      ).toBe('<script>\nfoo\n</script>1. *bar*');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should not let a thematic break be swallowed by a generated list block', function () {
      expect(converter.makeHtml('- Foo\n---')
      ).toBe('<ul>\n<li>Foo</li>\n</ul>\n<hr />');
    });

    it('should keep entities in a raw HTML block verbatim, not decode them (spec #31)', function () {
      expect(converter.makeHtml('<a href="&ouml;&ouml;.html">')
      ).toBe('<a href="&ouml;&ouml;.html">');
    });

    it('should keep a raw HTML block inside a block quote verbatim', function () {
      expect(converter.makeHtml('> <a href="&amp;x">')
      ).toBe('<blockquote>\n  <a href="&amp;x">\n</blockquote>');
    });

    it('should still decode entities in a generated fenced-code class (spec #34)', function () {
      expect(converter.makeHtml('``` f&ouml;&ouml;\nfoo\n```')
      ).toBe('<pre><code class="föö language-föö">foo\n</code></pre>');
    });
  });
});
