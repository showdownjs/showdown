/**
 * Unit tests for the `cmSpec` option (the unified CommonMark inline parser).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter cmSpec option (Inline)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default (outer link wins, nesting not handled)', function () {
      converter.makeHtml('[foo [bar](/uri)](/uri)')
        .should.equal('<p><a href="/uri">foo [bar</a>](/uri)</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should not nest a link inside a link (inner link wins)', function () {
      norm(converter.makeHtml('[foo [bar](/uri)](/uri)'))
        .should.equal(norm('<p>[foo <a href="/uri">bar</a>](/uri)</p>'));
    });

    it('should resolve emphasis interleaved with link brackets', function () {
      norm(converter.makeHtml('[foo *[bar](/uri)*](/uri)'))
        .should.equal(norm('<p>[foo <em><a href="/uri">bar</a></em>](/uri)</p>'));
    });

    it('should parse a code span with embedded backticks', function () {
      norm(converter.makeHtml('`` ` ``')).should.equal(norm('<p><code>`</code></p>'));
    });

    it('should keep a reference link working', function () {
      norm(converter.makeHtml('[foo][ref]\n\n[ref]: /uri'))
        .should.equal(norm('<p><a href="/uri">foo</a></p>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should bind a code span before a raw HTML attribute boundary', function () {
      norm(converter.makeHtml('<a href="`">`'))
        .should.equal(norm('<p><a href="`">`</p>'));
    });

    it('should flatten image alt text and keep a link non-nested', function () {
      norm(converter.makeHtml('![foo *bar*](/url)'))
        .should.equal(norm('<p><img src="/url" alt="foo bar" /></p>'));
    });
  });
});
