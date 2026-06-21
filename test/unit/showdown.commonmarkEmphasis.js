/**
 * Unit tests for the `cmSpec` option (CommonMark delimiter-run emphasis).
 * The behavior is gated: it is off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter cmSpec option (Emphasis)', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default intraword underscore emphasis', function () {
      converter.makeHtml('foo_bar_').should.equal('<p>foo<em>bar</em></p>');
    });

    it('should still parse simple emphasis', function () {
      converter.makeHtml('*foo*').should.equal('<p><em>foo</em></p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({cmSpec: true});

    it('should not treat intraword underscores as emphasis', function () {
      converter.makeHtml('foo_bar_').should.equal('<p>foo_bar_</p>');
    });

    it('should not treat underscores between digits as emphasis', function () {
      converter.makeHtml('5_6_78').should.equal('<p>5_6_78</p>');
    });

    it('should nest strong inside emphasis', function () {
      converter.makeHtml('*foo**bar**baz*').should.equal('<p><em>foo<strong>bar</strong>baz</em></p>');
    });

    it('should handle nested emphasis with punctuation flanking', function () {
      converter.makeHtml('*(*foo*)*').should.equal('<p><em>(<em>foo</em>)</em></p>');
    });

    it('should produce em > strong for triple delimiters', function () {
      converter.makeHtml('***foo***').should.equal('<p><em><strong>foo</strong></em></p>');
    });

    it('should keep internal underscores literal in a single emphasis run', function () {
      converter.makeHtml('_foo_bar_baz_').should.equal('<p><em>foo_bar_baz</em></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should encode quotes inside emphasis and nest correctly', function () {
      converter.makeHtml('**foo "*bar*" foo**')
        .should.equal('<p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>');
    });
  });
});
