/**
 * Created by Estevao on 15-01-2015.
 *
 * HTML → Markdown conversion behavior lives in test/functional/makemarkdown/cases/. What
 * remains here asserts an object identity the fixture format cannot express.
 */

describe('showdown.Converter', function () {
  'use strict';


  describe('makeMarkdown() parses into an inert document', function () {
    let converter = new showdown.Converter();

    it('should parse untrusted html in an inert document (no script/onerror execution)', function () {
      // parseHTML must not reuse the live ambient document; it parses into an inert
      // document (createHTMLDocument) so <img onerror>/<svg onload> never fire client-side.
      let div = showdown.helper.parseHTML('<img src=x onerror="window.__xss=1">');
      expect(div.ownerDocument).not.toBe(showdown.helper.document);
      // sanity: the markup still parsed and is walkable
      expect(converter.makeMarkdown('<img src=x onerror="window.__xss=1">')).toBe('![](<x>)');
    });

  });

  describe('makeMarkdown code blocks', function () {
    it('should preserve backticks inside fenced code blocks', function () {
      let converter = new showdown.Converter();
      let html = '<pre><code>' + '```js' + '\n' +
        'let x = 1;' + '\n' +
        '```</code></pre>';

      let markdown = converter.makeMarkdown(html);

      expect(markdown).toContain('````');
      expect(markdown).toContain('```js');
      expect(markdown).toContain('let x = 1;');
      expect(markdown.trim().endsWith('````')).toBe(true);
    });
  });
});
