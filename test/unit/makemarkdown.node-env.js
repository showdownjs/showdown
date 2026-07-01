// @vitest-environment node
//
// Runs makeMarkdown WITHOUT a DOM environment, so `showdown.helper.document` takes the lazy
// happy-dom fallback instead of an ambient window.document (every other suite runs under the
// jsdom environment and never exercises that branch).

describe('makeMarkdown() in a bare Node environment (happy-dom fallback)', function () {
  'use strict';

  let converter = new showdown.Converter({tables: true, tasklists: true});

  it('should run without a global window/document', function () {
    expect(typeof window).toBe('undefined');
    expect(converter.makeMarkdown('<h1>Title <em>em</em></h1>')).toBe('# Title *em*\n\n');
  });

  it('should convert a table with thead and tbody', function () {
    let html =
      '<table>' +
      '<thead><tr><th>a</th><th>b</th></tr></thead>' +
      '<tbody><tr><td>1</td><td>2</td></tr></tbody>' +
      '</table>';
    let md =
      '| a   | b   |\n' +
      '| --- | --- |\n' +
      '| 1   | 2   |\n\n';

    expect(converter.makeMarkdown(html)).toBe(md);
  });

  it('should convert a task list', function () {
    let html = '<ul><li><input type="checkbox" checked> done</li><li><input type="checkbox"> todo</li></ul>';
    let md   = '- [x] done\n- [ ] todo\n\n';

    expect(converter.makeMarkdown(html)).toBe(md);
  });
});
