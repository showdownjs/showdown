/**
 * Created by Estevao on 08-06-2015.
 */
const bootstrap = require('./makehtml.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/'),
    tableSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/tables/'),
    simplifiedAutoLinkSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/simplifiedAutoLink/'),
    openLinksInNewWindowSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/openLinksInNewWindow/'),
    disableForced4SpacesIndentedSublistsSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/disableForced4SpacesIndentedSublists/'),
    rawHeaderIdSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/rawHeaderId/'),
    rawPrefixHeaderIdSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/rawPrefixHeaderId/'),
    emojisSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/emojis/'),
    underlineSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/underline/'),
    ellipsisSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/ellipsis/'),
    literalMidWordUnderscoresSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/literalMidWordUnderscores/'),
    //literalMidWordAsterisksSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/literalMidWordAsterisks/'),
    completeHTMLOutputSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/completeHTMLOutput/'),
    metadataSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/metadata/'),
    splitAdjacentBlockquotesSuite = bootstrap.getTestSuite('test/functional/makehtml/cases/features/splitAdjacentBlockquotes/'),
    moreStyling = bootstrap.getTestSuite('test/functional/makehtml/cases/features/moreStyling/'),
    customizedHeaderId = bootstrap.getTestSuite('test/functional/makehtml/cases/features/customizedHeaderId/'),
    xfnRelAutoMe = bootstrap.getTestSuite('test/functional/makehtml/cases/features/xfnRelAutoMe/'),
    http = require('http'),
    https = require('https'),
    expect = require('chai').expect;

describe('makeHtml() features testsuite', function () {
  'use strict';

  describe('issues', function () {
    for (let i = 0; i < testsuite.length; ++i) {
      let converter;
      if (testsuite[i].name === '#143.support-image-dimensions') {
        converter = new showdown.Converter({parseImgDimensions: true});
      } else if (testsuite[i].name === '#69.header-level-start') {
        converter = new showdown.Converter({headerLevelStart: 3});
      } else if (testsuite[i].name === '#164.1.simple-autolink' || testsuite[i].name === '#204.certain-links-with-at-and-dot-break-url') {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      } else if (testsuite[i].name === 'literalMidWordUnderscores') {
        converter = new showdown.Converter({literalMidWordUnderscores: true});
      } else if (testsuite[i].name === '#164.2.disallow-underscore-emphasis-mid-word') {
        converter = new showdown.Converter({literalMidWordUnderscores: true});
      } else if (testsuite[i].name === '#164.3.strikethrough' || testsuite[i].name === '#214.escaped-markdown-chars-break-strikethrough') {
        converter = new showdown.Converter({strikethrough: true});
      } else if (testsuite[i].name === 'disable-gh-codeblocks') {
        converter = new showdown.Converter({ghCodeBlocks: false});
      } else if (testsuite[i].name === '#164.4.tasklists') {
        converter = new showdown.Converter({tasklists: true});
      } else if (testsuite[i].name === '#198.literalMidWordUnderscores-changes-behavior-of-asterisk') {
        converter = new showdown.Converter({literalMidWordUnderscores: true});
      } else if (testsuite[i].name === '#259.es6-template-strings-indentation-issues') {
        converter = new showdown.Converter({smartIndentationFix: true});
      } else if (testsuite[i].name === '#284.simplifiedAutoLink-does-not-match-GFM-style') {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      } else if (testsuite[i].name === 'disableForced4SpacesIndentedSublists') {
        converter = new showdown.Converter({disableForced4SpacesIndentedSublists: true});
      } else if (testsuite[i].name === '#206.treat-single-line-breaks-as-br') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === 'simpleLineBreaks2') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === '#316.new-simpleLineBreaks-option-breaks-lists') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === '#323.simpleLineBreaks-breaks-with-strong') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === '#318.simpleLineBreaks-does-not-work-with-chinese-characters') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === 'simpleLineBreaks-handle-html-pre') {
        converter = new showdown.Converter({simpleLineBreaks: true});
      } else if (testsuite[i].name === 'excludeTrailingPunctuationFromURLs-option') {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      } else if (testsuite[i].name === 'requireSpaceBeforeHeadingText') {
        converter = new showdown.Converter({requireSpaceBeforeHeadingText: true});
      } else if (testsuite[i].name === '#320.github-compatible-generated-header-id') {
        converter = new showdown.Converter({ghCompatibleHeaderId: true});
      } else if (testsuite[i].name === 'ghMentions') {
        converter = new showdown.Converter({ghMentions: true});
      } else if (testsuite[i].name === 'disable-email-encoding') {
        converter = new showdown.Converter({encodeEmails: false});
      } else if (testsuite[i].name === '#330.simplifiedAutoLink-drops-character-before-and-after-linked-mail') {
        converter = new showdown.Converter({encodeEmails: false, simplifiedAutoLink: true});
      } else if (testsuite[i].name === '#331.allow-escaping-of-tilde') {
        converter = new showdown.Converter({strikethrough: true});
      } else if (testsuite[i].name === 'prefixHeaderId-simple') {
        converter = new showdown.Converter({prefixHeaderId: true});
      } else if (testsuite[i].name === 'prefixHeaderId-string') {
        converter = new showdown.Converter({prefixHeaderId: 'my-prefix-'});
      } else if (testsuite[i].name === 'prefixHeaderId-string-and-ghCompatibleHeaderId') {
        converter = new showdown.Converter({prefixHeaderId: 'my-prefix-', ghCompatibleHeaderId: true});
      } else if (testsuite[i].name === 'prefixHeaderId-string-and-ghCompatibleHeaderId2') {
        converter = new showdown.Converter({prefixHeaderId: 'my prefix ', ghCompatibleHeaderId: true});
      } else if (testsuite[i].name === 'simplifiedAutoLink') {
        converter = new showdown.Converter({simplifiedAutoLink: true, strikethrough: true});
      } else if (testsuite[i].name === 'customizedHeaderId-simple') {
        converter = new showdown.Converter({customizedHeaderId: true});
      } else if (testsuite[i].name === '#378.simplifiedAutoLinks-with-excludeTrailingPunctuationFromURLs') {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      } else if (testsuite[i].name === '#374.escape-html-tags') {
        converter = new showdown.Converter({backslashEscapesHTMLTags: true});
      } else if (testsuite[i].name === '#379.openLinksInNewWindow-breaks-em-markdup') {
        converter = new showdown.Converter({openLinksInNewWindow: true});
      } else if (testsuite[i].name === '#355.simplifiedAutoLink-URLs-inside-parenthesis-followed-by-another-character-are-not-parsed-correctly') {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      } else if (testsuite[i].name === '#709.allow-whitespaces-after-end-in-metadata') {
        converter = new showdown.Converter({metadata: true});
      } else if (testsuite[i].name === 'relativePathBaseUrl') {
        converter = new showdown.Converter({relativePathBaseUrl: 'http://my.site.com/'});
      } else if (testsuite[i].name === 'xfnRelAutoMe') {
        converter = new showdown.Converter({xfnRelAutoMe: true});
      } else {
        converter = new showdown.Converter();
      }
      it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
    }
  });

  /** test Table Syntax Support **/
  describe('table support', function () {
    let converter,
        suite = tableSuite;
    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'basic-with-header-ids') {
        converter = new showdown.Converter({tables: true, tablesHeaderId: true});
      } else if (suite[i].name === '#179.parse-md-in-table-ths') {
        converter = new showdown.Converter({tables: true, strikethrough: true});
      } else {
        converter = new showdown.Converter({tables: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test simplifiedAutoLink Support **/
  describe('simplifiedAutoLink support in', function () {
    let converter,
        suite = simplifiedAutoLinkSuite;
    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'emphasis-and-strikethrough') {
        converter = new showdown.Converter({simplifiedAutoLink: true, strikethrough: true});
      } else if (suite[i].name === 'disallow-underscores') {
        converter = new showdown.Converter({literalMidWordUnderscores: true, simplifiedAutoLink: true});
      } else if (suite[i].name === 'disallow-asterisks') {
        converter = new showdown.Converter({literalMidWordAsterisks: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({simplifiedAutoLink: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test openLinksInNewWindow support **/
  describe('openLinksInNewWindow support in', function () {
    let converter,
        suite = openLinksInNewWindowSuite;
    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'simplifiedAutoLink') {
        converter = new showdown.Converter({openLinksInNewWindow: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({openLinksInNewWindow: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test disableForced4SpacesIndentedSublists support **/
  describe('disableForced4SpacesIndentedSublists support in', function () {
    let converter,
        suite = disableForced4SpacesIndentedSublistsSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({disableForced4SpacesIndentedSublists: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test rawHeaderId support **/
  describe('rawHeaderId support', function () {
    let converter,
        suite = rawHeaderIdSuite;
    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'with-prefixHeaderId') {
        converter = new showdown.Converter({rawHeaderId: true, prefixHeaderId: '/prefix/'});
      } else {
        converter = new showdown.Converter({rawHeaderId: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test rawPrefixHeaderId support **/
  describe('rawPrefixHeaderId support', function () {
    let converter,
        suite = rawPrefixHeaderIdSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({rawPrefixHeaderId: true, prefixHeaderId: '/prefix/'});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test emojis support **/
  describe('emojis support', function () {
    let converter,
        suite = emojisSuite,
        imgSrcRegexp = /<img[^>]+src=("https?:\/\/[^"]+"|'https?:\/\/[^']+')/g;

    function testImageUrlExists (imgUrl) {
      // Strip the quotes
      imgUrl = imgUrl.slice(1, -1);
      return function (done) {
        (imgUrl.startsWith('http://') ? http : https).get(imgUrl, function (res) {
          expect(res.statusCode).to.equal(200);
          // Make sure we get some data and that it's a png
          expect(parseInt(res.headers['content-length'], 10)).to.be.above(0);
          expect(res.headers['content-type']).to.equal('image/png');

          // Discard the data (but fetch it)
          res.on('data', function () {});

          res.on('end', function () {
            done();
          });
        }).on('error', function (e) {
          throw e;
        });
      };
    }

    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'simplifiedautolinks') {
        converter = new showdown.Converter({emoji: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({emoji: true});
      }

      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));

      let imgUrl = imgSrcRegexp.exec(suite[i].expected);
      if (imgUrl) {
        it('should use a working emoji URL', testImageUrlExists(imgUrl[1]));
      }
    }
  });

  /** test underline support **/
  describe('underline support', function () {
    let converter,
        suite = underlineSuite;
    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'simplifiedautolinks') {
        converter = new showdown.Converter({underline: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({underline: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test ellipsis option **/
  describe('ellipsis option', function () {
    let converter,
        suite = ellipsisSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({ellipsis: false});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test literalMidWordUnderscores option **/
  describe('literalMidWordUnderscores option', function () {
    let converter,
        suite = literalMidWordUnderscoresSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({literalMidWordUnderscores: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test literalMidWordAsterisks option **/
  /*
  describe('literalMidWordAsterisks option', function () {
    let converter,
        suite = literalMidWordAsterisksSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({literalMidWordAsterisks: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });
  */

  /** test completeHTMLDocument option **/
  describe('completeHTMLDocument option', function () {
    let converter,
        suite = completeHTMLOutputSuite;
    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({completeHTMLDocument: true});

      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test metadata option **/
  describe('metadata option', function () {
    let converter,
        suite = metadataSuite;

    for (let i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'embeded-in-output' ||
        suite[i].name === 'embeded-two-consecutive-metadata-blocks' ||
        suite[i].name === 'embeded-two-consecutive-metadata-blocks-different-symbols') {
        converter = new showdown.Converter({metadata: true, completeHTMLDocument: true});
      } else if (suite[i].name === 'ignore-metadata') {
        converter = new showdown.Converter({metadata: false});
      } else {
        converter = new showdown.Converter({metadata: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test metadata option **/
  describe('splitAdjacentBlockquotes option', function () {
    let converter,
        suite = splitAdjacentBlockquotesSuite;

    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({splitAdjacentBlockquotes: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test moreStyling option **/
  describe('moreStyling option', function () {
    let converter,
        suite = moreStyling;

    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({moreStyling: true, tasklists: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  describe('customizedHeaderId option', function () {
    let converter,
        suite = customizedHeaderId;

    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({customizedHeaderId: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  describe('xfnRelAutoMe option', function () {
    let converter,
        suite = xfnRelAutoMe;

    for (let i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({xfnRelAutoMe: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

});
