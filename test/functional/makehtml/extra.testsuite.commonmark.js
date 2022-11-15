/**
 * Created by Estevao on 08-06-2015.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    converter = new bootstrap.showdown.Converter({
      noHeaderId: true,
      requireSpaceBeforeHeadingText: true
    }),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/commonmark.testsuite.json');
const {tests} = require('commonmark-spec');

describe('makeHtml() commonmark testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (testsuite.hasOwnProperty(section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let name = testsuite[section][i].name;
          switch (name) {
            case 'ATX headings_79': // empty headings don't make sense
            case 'Setext headings_93': // spec says it cannot be lazy continuation but then proceeds to make it a lazy continuation.
            case 'Thematic breaks_43': // malformed input of test case
            case 'Thematic breaks_61': // hr inside lists does not make sense
            case 'Fenced code blocks_146': // as of date, github doesn't support this so we don't either
            //case 'Raw HTML_619': // breaks prettifier so the test fails
              continue;

            case 'Fenced code blocks_142': // we use different classes to mark languages in fenced code blocks
            case 'Fenced code blocks_143': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-ruby', 'ruby language-ruby');
              break;

            case 'Fenced code blocks_144': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-;', '; language-;');
              break;


          }
          it(name, assertion(testsuite[section][i], converter, true));
        }
      });
    }
  }
});
