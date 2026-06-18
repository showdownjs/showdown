/**
 * Unit tests for the `commonmarkBlockquotes` option (CommonMark container block quotes).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter commonmarkBlockquotes option', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default behavior (bare > is a paragraph)', function () {
      converter.makeHtml('>').should.equal('<p>&gt;</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({commonmarkBlockquotes: true});

    it('should treat a bare > as an empty block quote', function () {
      norm(converter.makeHtml('>')).should.equal(norm('<blockquote>\n</blockquote>'));
    });

    it('should split block quotes separated by a blank line', function () {
      norm(converter.makeHtml('> foo\n\n> bar'))
        .should.equal(norm('<blockquote>\n<p>foo</p>\n</blockquote>\n<blockquote>\n<p>bar</p>\n</blockquote>'));
    });

    it('should not lazily continue after an empty > line', function () {
      norm(converter.makeHtml('> bar\n>\nbaz'))
        .should.equal(norm('<blockquote>\n<p>bar</p>\n</blockquote>\n<p>baz</p>'));
    });

    it('should lazily continue a paragraph through nested block quotes', function () {
      norm(converter.makeHtml('> > > foo\nbar'))
        .should.equal(norm('<blockquote>\n<blockquote>\n<blockquote>\n<p>foo\nbar</p>\n</blockquote>\n</blockquote>\n</blockquote>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should keep an inner list out of a markerless following list item', function () {
      norm(converter.makeHtml('> - foo\n- bar'))
        .should.equal(norm('<blockquote>\n<ul>\n<li>foo</li>\n</ul>\n</blockquote>\n<ul>\n<li>bar</li>\n</ul>'));
    });
  });
});
