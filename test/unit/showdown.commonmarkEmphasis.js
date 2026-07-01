/**
 * Unit tests for the `cmSpec` option (CommonMark delimiter-run emphasis).
 * The behavior is gated: it is off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Emphasis)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default intraword underscore emphasis', function () {
      expect(converter.makeHtml('foo_bar_')).toBe('<p>foo<em>bar</em></p>');
    });

    it('should still parse simple emphasis', function () {
      expect(converter.makeHtml('*foo*')).toBe('<p><em>foo</em></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should not treat intraword underscores as emphasis', function () {
      expect(converter.makeHtml('foo_bar_')).toBe('<p>foo_bar_</p>');
    });

    it('should not treat underscores between digits as emphasis', function () {
      expect(converter.makeHtml('5_6_78')).toBe('<p>5_6_78</p>');
    });

    it('should nest strong inside emphasis', function () {
      expect(converter.makeHtml('*foo**bar**baz*')).toBe('<p><em>foo<strong>bar</strong>baz</em></p>');
    });

    it('should handle nested emphasis with punctuation flanking', function () {
      expect(converter.makeHtml('*(*foo*)*')).toBe('<p><em>(<em>foo</em>)</em></p>');
    });

    it('should produce em > strong for triple delimiters', function () {
      expect(converter.makeHtml('***foo***')).toBe('<p><em><strong>foo</strong></em></p>');
    });

    it('should keep internal underscores literal in a single emphasis run', function () {
      expect(converter.makeHtml('_foo_bar_baz_')).toBe('<p><em>foo_bar_baz</em></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should encode quotes inside emphasis and nest correctly', function () {
      expect(converter.makeHtml('**foo "*bar*" foo**')
      ).toBe('<p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>');
    });
  });
});
