const fs = require('fs');

describe('default class tutorial', function () {
  const tutorial = fs.readFileSync('docs/tutorials/add-default-class-to-html.md', 'utf8');
  const example = tutorial.match(/const bindings = [\s\S]*?(?=const conv =)/)[0];

  function convert (html, classMap) {
    // Execute the documented bindings so the regression covers the copyable example.
    const bindings = new Function('classMap', example + '\nreturn bindings;')(classMap);
    return new showdown.Converter({ extensions: bindings }).makeHtml(html);
  }

  it('adds a class to both links on the same line', function () {
    expect(convert('[one](/one) [two](/two)', { a: 'link' }))
      .toBe('<p><a class="link" href="/one">one</a> <a class="link" href="/two">two</a></p>');
  });

  it('does not match tag names that only share a prefix', function () {
    expect(convert('<article><a>one</a><abbr>two</abbr></article>', { a: 'link' }))
      .toBe('<article><a class="link">one</a><abbr>two</abbr></article>');
  });

  it('preserves quoted angle brackets in attributes', function () {
    expect(convert('<div><a title="1 > 0">one</a><a title="2 > 1">two</a></div>', { a: 'link' }))
      .toBe('<div><a class="link" title="1 > 0">one</a><a class="link" title="2 > 1">two</a></div>');
  });

  it('preserves attributes on multiple lines', function () {
    expect(convert('<div><a\n title="one">one</a></div>', { a: 'link' }))
      .toBe('<div><a class="link"\n title="one">one</a></div>');
  });

  it('adds classes to the list elements from the tutorial', function () {
    expect(convert('- one\n- two', { ul: 'list', li: 'item' }))
      .toBe('<ul class="list">\n<li class="item">one</li>\n<li class="item">two</li>\n</ul>');
  });
});
