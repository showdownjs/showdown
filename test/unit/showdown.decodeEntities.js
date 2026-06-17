/**
 * Unit tests for the `decodeEntities` option (CommonMark character reference decoding).
 * The behavior is gated: it is off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter decodeEntities option', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should preserve named entities verbatim', function () {
      converter.makeHtml('&copy;').should.equal('<p>&copy;</p>');
    });

    it('should preserve numeric entities verbatim', function () {
      converter.makeHtml('&#35;').should.equal('<p>&#35;</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({decodeEntities: true});

    it('should decode named references', function () {
      converter.makeHtml('&copy;').should.equal('<p>©</p>');
    });

    it('should decode decimal numeric references', function () {
      converter.makeHtml('&#35;').should.equal('<p>#</p>');
    });

    it('should decode hexadecimal numeric references', function () {
      converter.makeHtml('&#xcab;').should.equal('<p>ಫ</p>');
    });

    it('should escape invalid (unknown) entity references', function () {
      converter.makeHtml('&MadeUpEntity;').should.equal('<p>&amp;MadeUpEntity;</p>');
    });

    it('should replace disallowed code points with U+FFFD', function () {
      converter.makeHtml('&#0;').should.equal('<p>�</p>');
    });

    it('should treat a decoded markdown character as literal (not re-parsed)', function () {
      // &#42; is `*`; it must not become emphasis even next to real emphasis
      converter.makeHtml('&#42;foo&#42;').should.equal('<p>*foo*</p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should decode entities while keeping escaped ampersands escaped', function () {
      converter.makeHtml('&amp; &copy;').should.equal('<p>&amp; ©</p>');
    });
  });
});
