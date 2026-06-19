/**
 * Unit tests for the `commonmarkContainers` option: leaf blocks (fenced code, HTML blocks,
 * link reference definitions, indented code) are parsed in the context of their containing
 * block quote / list item instead of being mis-parsed at the top level. Gated: off by
 * default, enabled by the `commonmark` flavor.
 */
chai.should();

describe('showdown.Converter commonmarkContainers option', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  // the commonmark flavor with this one feature turned back off, to prove the gate: the
  // CommonMark container-aware output is produced only when the flag is on. Clone first -
  // getFlavorOptions returns the live flavor object, so mutating it in place would poison
  // the preset for every other converter built from it.
  let flavorOff = JSON.parse(JSON.stringify(showdown.getFlavorOptions('commonmark')));
  flavorOff.commonmarkContainers = false;

  describe('disabled (default converter unchanged)', function () {
    let converter = new showdown.Converter();

    it('should keep Showdown default for a fenced block after a list', function () {
      norm(converter.makeHtml('- a\n- ```\n  c\n  ```'))
        .should.equal(norm(converter.makeHtml('- a\n- ```\n  c\n  ```')));
    });
  });

  describe('disabled (commonmark flavor minus the flag)', function () {
    let converter = new showdown.Converter(flavorOff);

    it('should mis-parse an item indented fence (pre-fix behavior)', function () {
      // the item closing fence is swallowed as a stray top-level code block
      norm(converter.makeHtml('1. ```\n   foo\n   ```\n\n   bar'))
        .should.not.equal(norm('<ol>\n<li>\n<pre><code>foo\n</code></pre>\n<p>bar</p>\n</li>\n</ol>'));
    });
  });

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('a list item fence with a nested block quote (spec #321)', function () {
      norm(converter.makeHtml('- a\n  > b\n  ```\n  c\n  ```\n- d'))
        .should.equal(norm('<ul>\n<li>a\n<blockquote>\n<p>b</p>\n</blockquote>\n<pre><code>c\n</code></pre>\n</li>\n<li>d</li>\n</ul>'));
    });

    it('an ordered item fence followed by a paragraph (spec #324)', function () {
      norm(converter.makeHtml('1. ```\n   foo\n   ```\n\n   bar'))
        .should.equal(norm('<ol>\n<li>\n<pre><code>foo\n</code></pre>\n<p>bar</p>\n</li>\n</ol>'));
    });

    it('a genuinely top-level indented fence is still parsed (spec #135)', function () {
      norm(converter.makeHtml('```\naaa\n  ```'))
        .should.equal(norm('<pre><code>aaa\n</code></pre>'));
    });

    it('an HTML block inside a block quote stays verbatim (spec #174)', function () {
      norm(converter.makeHtml('> <div>\n> foo\n\nbar'))
        .should.equal(norm('<blockquote>\n<div>\nfoo\n</blockquote>\n<p>bar</p>'));
    });

    it('a link reference definition inside a block quote is collected (spec #218)', function () {
      norm(converter.makeHtml('[foo]\n\n> [foo]: /url'))
        .should.equal(norm('<p><a href="/url">foo</a></p>\n<blockquote>\n</blockquote>'));
    });
  });
});
