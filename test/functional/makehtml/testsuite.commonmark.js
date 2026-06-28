/**
 * Created by Estevao on 08-06-2015.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    // Run the CommonMark suite in CommonMark mode: derive options from the `commonmark`
    // flavor so that flavor-gated CommonMark behaviors (e.g. decodeEntities) are exercised.
    converter = new bootstrap.showdown.Converter(bootstrap.showdown.getFlavorOptions('commonmark')),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/commonmark.testsuite.json');
//const {tests} = require('commonmark-spec');

describe('makeHtml() commonmark testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (testsuite.hasOwnProperty(section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let name = testsuite[section][i].name;
          let number = testsuite[section][i].number;
          switch (name) {
            case 'ATX headings_79': // empty headings don't make sense
            case 'Thematic breaks_43': // malformed input of test case
            case 'Thematic breaks_61': // hr inside lists does not make sense
              continue;

            case 'Fenced code blocks_142': // we use different classes to mark languages in fenced code blocks
            case 'Fenced code blocks_143': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-ruby', 'ruby language-ruby');
              break;

            case 'Fenced code blocks_144': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-;', '; language-;');
              break;

            case 'Fenced code blocks_146': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-aa', 'aa language-aa');
              break;

            case 'Entity and numeric character references_34': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-föö', 'föö language-föö');
              break;

            case 'Backslash escapes_24': // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-foo+bar', 'foo+bar language-foo+bar');
              break;


          }
          it(number + ': ' + name, assertion(testsuite[section][i], converter, true));
        }
      });
    }
  }
});
