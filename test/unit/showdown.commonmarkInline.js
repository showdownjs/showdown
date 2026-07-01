/**
 * Unit tests for the `cmSpec` option (the unified CommonMark inline parser).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Inline)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default (outer link wins, nesting not handled)', function () {
      expect(converter.makeHtml('[foo [bar](/uri)](/uri)')
      ).toBe('<p><a href="/uri">foo [bar</a>](/uri)</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should not nest a link inside a link (inner link wins)', function () {
      expect(norm(converter.makeHtml('[foo [bar](/uri)](/uri)'))
      ).toBe(norm('<p>[foo <a href="/uri">bar</a>](/uri)</p>'));
    });

    it('should resolve emphasis interleaved with link brackets', function () {
      expect(norm(converter.makeHtml('[foo *[bar](/uri)*](/uri)'))
      ).toBe(norm('<p>[foo <em><a href="/uri">bar</a></em>](/uri)</p>'));
    });

    it('should parse a code span with embedded backticks', function () {
      expect(norm(converter.makeHtml('`` ` ``'))).toBe(norm('<p><code>`</code></p>'));
    });

    it('should keep a reference link working', function () {
      expect(norm(converter.makeHtml('[foo][ref]\n\n[ref]: /uri'))
      ).toBe(norm('<p><a href="/uri">foo</a></p>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should bind a code span before a raw HTML attribute boundary', function () {
      expect(norm(converter.makeHtml('<a href="`">`'))
      ).toBe(norm('<p><a href="`">`</p>'));
    });

    it('should flatten image alt text and keep a link non-nested', function () {
      expect(norm(converter.makeHtml('![foo *bar*](/url)'))
      ).toBe(norm('<p><img src="/url" alt="foo bar" /></p>'));
    });
  });
});
