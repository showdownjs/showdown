/**
 * Unit tests for the `cmSpec` option (CommonMark container block quotes).
 * The behavior is gated: off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Blockquotes)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default behavior (bare > is a paragraph)', function () {
      expect(converter.makeHtml('>')).toBe('<p>&gt;</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should treat a bare > as an empty block quote', function () {
      expect(norm(converter.makeHtml('>'))).toBe(norm('<blockquote>\n</blockquote>'));
    });

    it('should split block quotes separated by a blank line', function () {
      expect(norm(converter.makeHtml('> foo\n\n> bar'))
      ).toBe(norm('<blockquote>\n<p>foo</p>\n</blockquote>\n<blockquote>\n<p>bar</p>\n</blockquote>'));
    });

    it('should not lazily continue after an empty > line', function () {
      expect(norm(converter.makeHtml('> bar\n>\nbaz'))
      ).toBe(norm('<blockquote>\n<p>bar</p>\n</blockquote>\n<p>baz</p>'));
    });

    it('should lazily continue a paragraph through nested block quotes', function () {
      expect(norm(converter.makeHtml('> > > foo\nbar'))
      ).toBe(norm('<blockquote>\n<blockquote>\n<blockquote>\n<p>foo\nbar</p>\n</blockquote>\n</blockquote>\n</blockquote>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should keep an inner list out of a markerless following list item', function () {
      expect(norm(converter.makeHtml('> - foo\n- bar'))
      ).toBe(norm('<blockquote>\n<ul>\n<li>foo</li>\n</ul>\n</blockquote>\n<ul>\n<li>bar</li>\n</ul>'));
    });
  });

  // Pathologically deep nesting (`> > > …` thousands deep) must not exhaust the call stack
  // (default mode) or blow up super-linearly (cmSpec). The nesting depth is capped, so this
  // resolves near-instantly; a regression would throw a RangeError or exceed the mocha
  // timeout. The cap leaves surplus markers as literal text, so the count is bounded.
  describe('deeply nested block quotes (denial-of-service guard)', function () {
    let deep = '> '.repeat(5000) + 'boom';

    it('should not overflow the stack in default mode', function () {
      let out = new showdown.Converter().makeHtml(deep);
      expect((out.match(/<blockquote>/g) || []).length).toBe(25);
    });

    it('should not blow up super-linearly in cmSpec mode', function () {
      let out = new showdown.Converter({cmSpec: true}).makeHtml(deep);
      expect((out.match(/<blockquote>/g) || []).length).toBe(25);
    });
  });
});
