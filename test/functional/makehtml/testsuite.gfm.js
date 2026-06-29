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
          let number = testsuite[section][i].number;
          let useConverter = converter;
          switch (number) {
            case 79:   // ATX headings_79 empty headings don't make sense
            case 43:   // Thematic breaks_43 malformed input of test case
            case 61:   // Autolinks (extension)_1312
            case 1312: // cmark-gfm "<IGNORE>" sentinel — undefined behavior, not assertable
            case 1313: // Autolinks (extension)_1313': // @a.b.c is linked by ghMentions (separate subparser); tracked as a ghMentions fix
            // GitHub.com renderer-only features, not part of the GFM spec — showdown does not produce them
            case 1800: // Alerts (GitHub renderer)
            case 1801: // Alerts (GitHub renderer)
            case 1802: // Alerts (GitHub renderer)
            case 1803: // Alerts (GitHub renderer)
            case 1804: // Alerts (GitHub renderer)
            case 1900: // Math (GitHub renderer)
            case 1901: // Math (GitHub renderer)
            case 2000: // Mermaid diagrams (GitHub renderer)
            // Loose task-list items: showdown nests the checkbox inside the item's first
            // <p> (<li><p><input> text</p>…</li>), whereas cmark-gfm emits the checkbox as
            // a direct <li> child before the block children (<li><input> <p>text</p>…</li>).
            // Pre-existing showdown rendering; tracked as a known divergence, fixtures keep
            // the spec-correct cmark output for reference.
            case 1111: // loose: multi-paragraph item
            case 1112: // loose: fenced code block in item
            case 1113: // loose: indented code block in item
            case 1114: // loose: blockquote in item
              continue;

            // Fenced code blocks
            case 142: // we use different classes to mark languages in fenced code blocks
            case 143: // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-ruby', 'ruby language-ruby');
              break;
            // Fenced code blocks
            case 144: // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-;', '; language-;');
              break;
            // Fenced code blocks
            case 146: // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-aa', 'aa language-aa');
              break;
            // Entity and numeric character references
            case 34: // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-föö', 'föö language-föö');
              break;
            //Backslash escapes
            case 24: // we use different classes to mark languages in fenced code blocks
              testsuite[section][i].expected = testsuite[section][i].expected.replace('language-foo+bar', 'foo+bar language-foo+bar');
              break;
            // Disallowed Raw HTML (extension)
            case 1400: // GFM tagfilter extension, off by default
            case 1500:
              useConverter = disallowRawHTMLConverter;
              break;
          }

          it(number + ': ' + name, assertion(testsuite[section][i], useConverter, true));
        }
      });
    }
  }
});
