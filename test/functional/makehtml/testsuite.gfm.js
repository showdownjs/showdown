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

// Cases skipped entirely (renderer-only features, malformed inputs, known divergences).
// Pre-filtered so a section whose cases are all skipped doesn't create an empty suite
// (Vitest errors on describe blocks with no tests, unlike Mocha).
//   79  ATX headings_79 empty headings don't make sense
//   43  Thematic breaks_43 malformed input of test case
//   61/1312  cmark-gfm "<IGNORE>" sentinel — undefined behavior, not assertable
//   1313  @a.b.c is linked by ghMentions (separate subparser); tracked as a ghMentions fix
//   1800-1804 Alerts, 1900/1901 Math, 2000 Mermaid — GitHub.com renderer-only, not GFM spec
//   1111-1114  loose task-list items: known showdown checkbox-nesting divergence
const SKIP = new Set([79, 43, 61, 1312, 1313, 1800, 1801, 1802, 1803, 1804, 1900, 1901, 2000, 1111, 1112, 1113, 1114]);

describe('makeHtml() gfm testsuite', function () {
  'use strict';

  for (let section in testsuite) {
    if (Object.prototype.hasOwnProperty.call(testsuite, section)) {
      let cases = testsuite[section].filter(function (tc) { return !SKIP.has(tc.number); });
      if (cases.length === 0) { continue; }
      describe(section, function () {
        for (let i = 0; i < cases.length; ++i) {
          let name = cases[i].name;
          let number = cases[i].number;
          let useConverter = converter;
          switch (number) {
            // Fenced code blocks
            case 142: // we use different classes to mark languages in fenced code blocks
            case 143: // we use different classes to mark languages in fenced code blocks
              cases[i].expected = cases[i].expected.replace('language-ruby', 'ruby language-ruby');
              break;
            // Fenced code blocks
            case 144: // we use different classes to mark languages in fenced code blocks
              cases[i].expected = cases[i].expected.replace('language-;', '; language-;');
              break;
            // Fenced code blocks
            case 146: // we use different classes to mark languages in fenced code blocks
              cases[i].expected = cases[i].expected.replace('language-aa', 'aa language-aa');
              break;
            // Entity and numeric character references
            case 34: // we use different classes to mark languages in fenced code blocks
              cases[i].expected = cases[i].expected.replace('language-föö', 'föö language-föö');
              break;
            //Backslash escapes
            case 24: // we use different classes to mark languages in fenced code blocks
              cases[i].expected = cases[i].expected.replace('language-foo+bar', 'foo+bar language-foo+bar');
              break;
            // Disallowed Raw HTML (extension)
            case 1400: // GFM tagfilter extension, off by default
            case 1500:
              useConverter = disallowRawHTMLConverter;
              break;
          }

          it(number + ': ' + name, assertion(cases[i], useConverter, true));
        }
      });
    }
  }
});
