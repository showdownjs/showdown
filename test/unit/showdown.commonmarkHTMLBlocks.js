/**
 * Unit tests for the `commonmarkHTMLBlocks` option (the 7 CommonMark HTML block types).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter commonmarkHTMLBlocks option', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default behavior for a type 6 block', function () {
      converter.makeHtml('<div>\n*foo*\n\n*bar*')
        .should.equal('<p><div>\n<em>foo</em></p>\n<p><em>bar</em></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({commonmarkHTMLBlocks: true});

    it('should end a type 6 block at a blank line and parse following markdown', function () {
      converter.makeHtml('<div>\n*foo*\n\n*bar*')
        .should.equal('<div>\n*foo*\n<p><em>bar</em></p>');
    });

    it('should parse markdown between a block tag and its close after blank lines', function () {
      converter.makeHtml('<div>\n\n*Emphasized* text.\n\n</div>')
        .should.equal('<div>\n<p><em>Emphasized</em> text.</p>\n</div>');
    });

    it('should treat textarea (type 1) content as verbatim', function () {
      converter.makeHtml('<textarea>\n\n*foo*\n\n</textarea>')
        .should.equal('<textarea>\n\n*foo*\n\n</textarea>');
    });

    it('should recognize a declaration (type 4) block', function () {
      converter.makeHtml('<!DOCTYPE html>').should.equal('<!DOCTYPE html>');
    });

    it('should recognize a type 6 block whose start tag spans lines', function () {
      converter.makeHtml('<div id="foo"\n*hi*').should.equal('<div id="foo"\n*hi*');
    });

    it('should end a script (type 1) block on its closing tag line', function () {
      converter.makeHtml('<script>\nfoo\n</script>1. *bar*')
        .should.equal('<script>\nfoo\n</script>1. *bar*');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should not let a thematic break be swallowed by a generated list block', function () {
      converter.makeHtml('- Foo\n---')
        .should.equal('<ul>\n<li>Foo</li>\n</ul>\n<hr />');
    });

    it('should keep entities in a raw HTML block verbatim, not decode them (spec #31)', function () {
      converter.makeHtml('<a href="&ouml;&ouml;.html">')
        .should.equal('<a href="&ouml;&ouml;.html">');
    });

    it('should keep a raw HTML block inside a block quote verbatim', function () {
      converter.makeHtml('> <a href="&amp;x">')
        .should.equal('<blockquote>\n  <a href="&amp;x">\n</blockquote>');
    });

    it('should still decode entities in a generated fenced-code class (spec #34)', function () {
      converter.makeHtml('``` f&ouml;&ouml;\nfoo\n```')
        .should.equal('<pre><code class="föö language-föö">foo\n</code></pre>');
    });
  });
});
