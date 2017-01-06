/**
 * Created by Estevao on 08-06-2015.
 */
var bootstrap = require('../bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/features/'),
    tableSuite = bootstrap.getTestSuite('test/features/tables/');

describe('makeHtml() features testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    var converter;
    if (testsuite[i].name === '#143.support-image-dimensions') {
      converter = new showdown.Converter({parseImgDimensions: true});
    } else if (testsuite[i].name === '#69.header-level-start') {
      converter = new showdown.Converter({headerLevelStart: 3});
    } else if (testsuite[i].name === '#164.1.simple-autolink' || testsuite[i].name === '#204.certain-links-with-at-and-dot-break-url') {
      converter = new showdown.Converter({simplifiedAutoLink: true});
    } else if (testsuite[i].name === '#164.2.disallow-underscore-emphasis-mid-word') {
      converter = new showdown.Converter({literalMidWordUnderscores: true});
    } else if (testsuite[i].name === '#164.3.strikethrough' || testsuite[i].name === '#214.escaped-markdown-chars-break-strikethrough') {
      converter = new showdown.Converter({strikethrough: true});
    } else if (testsuite[i].name === 'disable-gh-codeblocks') {
      converter = new showdown.Converter({ghCodeBlocks: false});
    } else if (testsuite[i].name === '#164.4.tasklists') {
      converter = new showdown.Converter({tasklists: true});
    } else if (testsuite[i].name === 'autolink-and-disallow-underscores') {
      converter = new showdown.Converter({literalMidWordUnderscores: true, simplifiedAutoLink: true});
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
    } else if (testsuite[i].name === 'excludeTrailingPunctuationFromURLs-option') {
      converter = new showdown.Converter({simplifiedAutoLink: true, excludeTrailingPunctuationFromURLs: true});
    } else if (testsuite[i].name === 'requireSpaceBeforeHeadingText') {
      converter = new showdown.Converter({requireSpaceBeforeHeadingText: true});
    } else if (testsuite[i].name === '#320.github-compatible-generated-header-id') {
      converter = new showdown.Converter({ghCompatibleHeaderId: true});
    } else if (testsuite[i].name === 'ghMentions') {
      converter = new showdown.Converter({ghMentions: true});
    } else {
      converter = new showdown.Converter();
    }
    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }

  describe('table support', function () {
    var converter;
    for (var i = 0; i < tableSuite.length; ++i) {
      if (tableSuite[i].name === 'basic-with-header-ids') {
        converter = new showdown.Converter({tables: true, tableHeaderId: true});
      } else if (tableSuite[i].name === '#179.parse-md-in-table-ths') {
        converter = new showdown.Converter({tables: true, strikethrough: true});
      } else {
        converter = new showdown.Converter({tables: true});
      }
      it(tableSuite[i].name.replace(/-/g, ' '), assertion(tableSuite[i], converter));
    }
  });

});
