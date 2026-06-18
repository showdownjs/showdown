/**
 * Unit tests for the `commonmarkLinks` option (CommonMark links, images and link
 * reference definitions). The behavior is gated: off by default, enabled by the
 * `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter commonmarkLinks option', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should keep entities verbatim in the destination', function () {
      converter.makeHtml('[link](foo%20b&auml;)')
        .should.equal('<p><a href="foo%20b&auml;">link</a></p>');
    });

    it('should not percent-encode non-ASCII destinations', function () {
      converter.makeHtml('[αγω](/φου)')
        .should.equal('<p><a href="/φου">αγω</a></p>');
    });

    it('should keep entities verbatim in the title', function () {
      converter.makeHtml('[foo](/f&ouml;&ouml; "f&ouml;&ouml;")')
        .should.equal('<p><a href="/f&ouml;&ouml;" title="f&ouml;&ouml;">foo</a></p>');
    });
  });

  describe('enabled - URL normalization', function () {
    let converter = new showdown.Converter({commonmarkLinks: true});

    it('should decode entities inside the destination and percent-encode them', function () {
      converter.makeHtml('[link](foo%20b&auml;)')
        .should.equal('<p><a href="foo%20b%C3%A4">link</a></p>');
    });

    it('should preserve already percent-encoded sequences', function () {
      converter.makeHtml('[link](/a%20b)')
        .should.equal('<p><a href="/a%20b">link</a></p>');
    });

    it('should percent-encode non-ASCII destinations', function () {
      converter.makeHtml('[αγω](/φου)')
        .should.equal('<p><a href="/%CF%86%CE%BF%CF%85">αγω</a></p>');
    });

    it('should decode entities in both destination and title', function () {
      converter.makeHtml('[foo](/f&ouml;&ouml; "f&ouml;&ouml;")')
        .should.equal('<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>');
    });

    it('should HTML-escape a bare ampersand in the title', function () {
      converter.makeHtml('[foo](/url "a & b")')
        .should.equal('<p><a href="/url" title="a &amp; b">foo</a></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should normalize entity references in a reference definition url and title', function () {
      converter.makeHtml('[foo]\n\n[foo]: /f&ouml;&ouml; "f&ouml;&ouml;"')
        .should.equal('<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>');
    });
  });
});
