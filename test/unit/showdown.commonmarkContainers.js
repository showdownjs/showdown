/**
 * Unit tests for the `cmSpec` option: leaf blocks (fenced code, HTML blocks,
 * link reference definitions, indented code) are parsed in the context of their containing
 * block quote / list item instead of being mis-parsed at the top level. Gated: off by
 * default, enabled by the `commonmark` flavor.
 */

describe('showdown.Converter cmSpec option (Containers)', function () {
  'use strict';

  let norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  describe('enabled via the commonmark flavor', function () {
    let converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));

    it('a list item fence with a nested block quote (spec #321)', function () {
      expect(norm(converter.makeHtml('- a\n  > b\n  ```\n  c\n  ```\n- d'))
      ).toBe(norm('<ul>\n<li>a\n<blockquote>\n<p>b</p>\n</blockquote>\n<pre><code>c\n</code></pre>\n</li>\n<li>d</li>\n</ul>'));
    });

    it('an ordered item fence followed by a paragraph (spec #324)', function () {
      expect(norm(converter.makeHtml('1. ```\n   foo\n   ```\n\n   bar'))
      ).toBe(norm('<ol>\n<li>\n<pre><code>foo\n</code></pre>\n<p>bar</p>\n</li>\n</ol>'));
    });

    it('a genuinely top-level indented fence is still parsed (spec #135)', function () {
      expect(norm(converter.makeHtml('```\naaa\n  ```'))
      ).toBe(norm('<pre><code>aaa\n</code></pre>'));
    });

    it('an indented opener with an indent-0 closing fence is paired correctly (spec #131)', function () {
      expect(// the indent-0 closing fence must not be mistaken for a new opener (which used to
      // run to EOF and leak the sentinel); content kept unindented to avoid the unrelated
      // fence-content de-indentation convention.
        norm(converter.makeHtml(' ```\naaa\naaa\n```'))
      ).toBe(norm('<pre><code>aaa\naaa\n</code></pre>'));
    });

    it('an HTML block inside a block quote stays verbatim (spec #174)', function () {
      expect(norm(converter.makeHtml('> <div>\n> foo\n\nbar'))
      ).toBe(norm('<blockquote>\n<div>\nfoo\n</blockquote>\n<p>bar</p>'));
    });

    it('a link reference definition inside a block quote is collected (spec #218)', function () {
      expect(norm(converter.makeHtml('[foo]\n\n> [foo]: /url'))
      ).toBe(norm('<p><a href="/url">foo</a></p>\n<blockquote>\n</blockquote>'));
    });

    it('indented code revealed after a block quote is a separate code block (spec #236)', function () {
      expect(norm(converter.makeHtml('>     foo\n    bar'))
      ).toBe(norm('<blockquote>\n<pre><code>foo\n</code></pre>\n</blockquote>\n<pre><code>bar\n</code></pre>'));
    });

    it('an open HTML block absorbs a following fence (spec #161)', function () {
      expect(norm(converter.makeHtml('<div></div>\n``` c\nint x = 33;\n```'))
      ).toBe(norm('<div></div>\n``` c\nint x = 33;\n```'));
    });

    it('a fenced block still escapes HTML-like lines inside it', function () {
      expect(norm(converter.makeHtml('```\n<div>\n```'))
      ).toBe(norm('<pre><code>&lt;div&gt;\n</code></pre>'));
    });

    it('an empty marker with indented code on the next line is a code block (spec #278)', function () {
      expect(norm(converter.makeHtml('-\n      baz'))
      ).toBe(norm('<ul>\n<li>\n<pre><code>baz\n</code></pre>\n</li>\n</ul>'));
    });

    it('blank lines inside an item fence do not make the list loose (spec #318)', function () {
      expect(// the blank lines belong to the fenced code block, so the surrounding items stay
      // tight (`a` and `c` are not wrapped in <p>)
        norm(converter.makeHtml('- a\n- ```\n  b\n\n\n  ```\n- c'))
      ).toBe(norm('<ul>\n<li>a</li>\n<li>\n<pre><code>b\n</code></pre>\n</li>\n<li>c</li>\n</ul>'));
    });
  });
});
