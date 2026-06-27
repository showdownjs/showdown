/**
 * Created by Estevao on 23-06-2026.
 */

// jshint ignore: start
let bootstrap = require('./makehtml.bootstrap.js'),
    // Run the gfm suite in gfm mode: derive options from the `gfm`
    // flavor so that flavor-gated gfm behaviors (e.g. decodeEntities) are exercised.
    converter = new bootstrap.showdown.Converter(bootstrap.showdown.getFlavorOptions('gfm')),
    // disallowRawHTML is off by default (even in the gfm flavor), so the inherited CommonMark
    // HTML-block cases keep their raw <script>/<style>/<textarea> output. The dedicated
    // "Disallowed Raw HTML (extension)" cases are run against a converter that opts in.
    disallowRawHTMLConverter = new bootstrap.showdown.Converter(
      Object.assign({}, bootstrap.showdown.getFlavorOptions('gfm'), {disallowRawHTML: true})
    ),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getJsonTestSuite('test/functional/makehtml/cases/gfm.testsuite.json');

describe('makeHtml() gfm testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (testsuite.hasOwnProperty(section)) {
      describe(section, function () {
        for (let i = 0; i < testsuite[section].length; ++i) {
          let name = testsuite[section][i].name;
          let useConverter = converter;
          switch (name) {
            case 'ATX headings_79': // empty headings don't make sense
            case 'Thematic breaks_43': // malformed input of test case
            case 'Thematic breaks_61': // hr inside lists does not make sense
            case 'Autolinks (extension)_1312': // cmark-gfm "<IGNORE>" sentinel — undefined behavior, not assertable
            case 'Autolinks (extension)_1313': // @a.b.c is linked by ghMentions (separate subparser); tracked as a ghMentions fix
            // GitHub.com renderer-only features, not part of the GFM spec — showdown does not produce them
            case 'Alerts (GitHub renderer)_1800':
            case 'Alerts (GitHub renderer)_1801':
            case 'Alerts (GitHub renderer)_1802':
            case 'Alerts (GitHub renderer)_1803':
            case 'Alerts (GitHub renderer)_1804':
            case 'Math (GitHub renderer)_1900':
            case 'Math (GitHub renderer)_1901':
            case 'Mermaid diagrams (GitHub renderer)_2000':
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

            case 'Disallowed Raw HTML (extension)_1400': // GFM tagfilter extension, off by default
            case 'Disallowed Raw HTML (extension)_1500':
              useConverter = disallowRawHTMLConverter;
              break;

          }
          it(name, assertion(testsuite[section][i], useConverter, true));
        }
      });
    }
  }
});
