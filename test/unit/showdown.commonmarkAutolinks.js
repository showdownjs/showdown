/**
 * Unit tests for the `commonmarkAutolinks` option (CommonMark autolinks).
 * The behavior is gated: it is off by default and enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter commonmarkAutolinks option', function () {
  'use strict';

  describe('disabled (default)', function () {
    let converter = new showdown.Converter();

    it('should entity-encode email autolinks (Showdown default)', function () {
      converter.makeHtml('<foo@bar.example.com>').should.match(/&#1\d\d;/);
    });
  });

  describe('enabled', function () {
    let converter = new showdown.Converter({commonmarkAutolinks: true});

    it('should autolink arbitrary URI schemes', function () {
      converter.makeHtml('<irc://foo.bar:2233/baz>')
        .should.equal('<p><a href="irc://foo.bar:2233/baz">irc://foo.bar:2233/baz</a></p>');
    });

    it('should autolink made-up schemes', function () {
      converter.makeHtml('<made-up-scheme://foo,bar>')
        .should.equal('<p><a href="made-up-scheme://foo,bar">made-up-scheme://foo,bar</a></p>');
    });

    it('should autolink emails with a plain mailto: (no entity encoding)', function () {
      converter.makeHtml('<foo@bar.example.com>')
        .should.equal('<p><a href="mailto:foo@bar.example.com">foo@bar.example.com</a></p>');
    });

    it('should escape ampersands in the autolink href and text', function () {
      converter.makeHtml('<http://foo.bar.baz/test?q=hello&id=22&boolean>')
        .should.equal('<p><a href="http://foo.bar.baz/test?q=hello&amp;id=22&amp;boolean">' +
                      'http://foo.bar.baz/test?q=hello&amp;id=22&amp;boolean</a></p>');
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('should autolink a uppercase MAILTO scheme as a URI', function () {
      converter.makeHtml('<MAILTO:FOO@BAR.BAZ>')
        .should.equal('<p><a href="MAILTO:FOO@BAR.BAZ">MAILTO:FOO@BAR.BAZ</a></p>');
    });
  });
});
