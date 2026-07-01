/**
 * Unit tests for the `decodeEntities` option (CommonMark character reference decoding).
 * The behavior is gated: it is off by default and enabled by the `commonmark` flavor.
 */

describe('showdown.Converter decodeEntities option', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should preserve named entities verbatim', function () {
      expect(converter.makeHtml('&copy;')).toBe('<p>&copy;</p>');
    });

    it('should preserve numeric entities verbatim', function () {
      expect(converter.makeHtml('&#35;')).toBe('<p>&#35;</p>');
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({decodeEntities: true});

    it('should decode named references', function () {
      expect(converter.makeHtml('&copy;')).toBe('<p>©</p>');
    });

    it('should decode decimal numeric references', function () {
      expect(converter.makeHtml('&#35;')).toBe('<p>#</p>');
    });

    it('should decode hexadecimal numeric references', function () {
      expect(converter.makeHtml('&#xcab;')).toBe('<p>ಫ</p>');
    });

    it('should escape invalid (unknown) entity references', function () {
      expect(converter.makeHtml('&MadeUpEntity;')).toBe('<p>&amp;MadeUpEntity;</p>');
    });

    it('should replace disallowed code points with U+FFFD', function () {
      expect(converter.makeHtml('&#0;')).toBe('<p>�</p>');
    });

    it('should treat a decoded markdown character as literal (not re-parsed)', function () {
      expect(// &#42; is `*`; it must not become emphasis even next to real emphasis
        converter.makeHtml('&#42;foo&#42;')).toBe('<p>*foo*</p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should decode entities while keeping escaped ampersands escaped', function () {
      expect(converter.makeHtml('&amp; &copy;')).toBe('<p>&amp; ©</p>');
    });
  });
});
