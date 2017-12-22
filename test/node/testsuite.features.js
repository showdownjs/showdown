/**
 * Created by Estevao on 08-06-2015.
 */
var bootstrap = require('../bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/features/'),
    tableSuite = bootstrap.getTestSuite('test/features/tables/'),
    simplifiedAutoLinkSuite = bootstrap.getTestSuite('test/features/simplifiedAutoLink/'),
    openLinksInNewWindowSuite = bootstrap.getTestSuite('test/features/openLinksInNewWindow/'),
    disableForced4SpacesIndentedSublistsSuite = bootstrap.getTestSuite('test/features/disableForced4SpacesIndentedSublists/'),
    rawHeaderIdSuite = bootstrap.getTestSuite('test/features/rawHeaderId/'),
    rawPrefixHeaderIdSuite = bootstrap.getTestSuite('test/features/rawPrefixHeaderId/'),
    emojisSuite = bootstrap.getTestSuite('test/features/emojis/'),
    underlineSuite = bootstrap.getTestSuite('test/features/underline/'),
    literalMidWordUnderscoresSuite = bootstrap.getTestSuite('test/features/literalMidWordUnderscores/'),
    literalMidWordAsterisksSuite = bootstrap.getTestSuite('test/features/literalMidWordAsterisks/'),
    completeHTMLOutputSuite = bootstrap.getTestSuite('test/features/completeHTMLOutput/'),
    metadataSuite = bootstrap.getTestSuite('test/features/metadata/'),
    splitAdjacentBlockquotesSuite = bootstrap.getTestSuite('test/features/splitAdjacentBlockquotes/');

describe('makeHtml() features testsuite', function () {
  'use strict';

  describe('issues', function () {
    for (var i = 0; i < testsuite.length; ++i) {
      var converter;
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
        converter = new showdown.Converter({simplifiedAutoLink: true, excludeTrailingPunctuationFromURLs: true});
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
      } else if (testsuite[i].name === 'enable-literalMidWordAsterisks') {
        converter = new showdown.Converter({literalMidWordAsterisks: true});
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
        converter = new showdown.Converter({simplifiedAutoLink: true, excludeTrailingPunctuationFromURLs: true});
      } else if (testsuite[i].name === '#374.escape-html-tags') {
        converter = new showdown.Converter({backslashEscapesHTMLTags: true});
      } else if (testsuite[i].name === '#379.openLinksInNewWindow-breaks-em-markdup') {
        converter = new showdown.Converter({openLinksInNewWindow: true});
      } else if (testsuite[i].name === '#398.literalMidWordAsterisks-treats-non-word-characters-as-characters') {
        converter = new showdown.Converter({literalMidWordAsterisks: true});
      } else {
        converter = new showdown.Converter();
      }
      it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
    }
  });

  /** test Table Syntax Support **/
  describe('table support', function () {
    var converter,
        suite = tableSuite;
    for (var i = 0; i < suite.length; ++i) {
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
    var converter,
        suite = simplifiedAutoLinkSuite;
    for (var i = 0; i < suite.length; ++i) {
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
    var converter,
        suite = openLinksInNewWindowSuite;
    for (var i = 0; i < suite.length; ++i) {
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
    var converter,
        suite = disableForced4SpacesIndentedSublistsSuite;
    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({disableForced4SpacesIndentedSublists: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test rawHeaderId support **/
  describe('rawHeaderId support', function () {
    var converter,
        suite = rawHeaderIdSuite;
    for (var i = 0; i < suite.length; ++i) {
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
    var converter,
        suite = rawPrefixHeaderIdSuite;
    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({rawPrefixHeaderId: true, prefixHeaderId: '/prefix/'});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test emojis support **/
  describe('emojis support', function () {
    var converter,
        suite = emojisSuite;
    for (var i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'simplifiedautolinks') {
        converter = new showdown.Converter({emoji: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({emoji: true});
      }

      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test underline support **/
  describe('underline support', function () {
    var converter,
        suite = underlineSuite;
    for (var i = 0; i < suite.length; ++i) {
      if (suite[i].name === 'simplifiedautolinks') {
        converter = new showdown.Converter({underline: true, simplifiedAutoLink: true});
      } else {
        converter = new showdown.Converter({underline: true});
      }
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test literalMidWordUnderscores option **/
  describe('literalMidWordUnderscores option', function () {
    var converter,
        suite = literalMidWordUnderscoresSuite;
    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({literalMidWordUnderscores: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test literalMidWordAsterisks option **/
  describe('literalMidWordAsterisks option', function () {
    var converter,
        suite = literalMidWordAsterisksSuite;
    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({literalMidWordAsterisks: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });


  /** test completeHTMLDocument option **/
  describe('completeHTMLDocument option', function () {
    var converter,
        suite = completeHTMLOutputSuite;
    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({completeHTMLDocument: true});

      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });

  /** test metadata option **/
  describe('metadata option', function () {
    var converter,
        suite = metadataSuite;

    for (var i = 0; i < suite.length; ++i) {
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
    var converter,
        suite = splitAdjacentBlockquotesSuite;

    for (var i = 0; i < suite.length; ++i) {
      converter = new showdown.Converter({splitAdjacentBlockquotes: true});
      it(suite[i].name.replace(/-/g, ' '), assertion(suite[i], converter));
    }
  });
});
