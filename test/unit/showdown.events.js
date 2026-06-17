/**
 * Created by Tivie on 04/03/2022.
 */

// in node, if bootstrap is pre-loaded, there's a mock of XMLHttpRequest which
// internally just calls fs.readFileSync

describe('showdown.Event', function () {
  'use strict';
  //const subparserList = showdown.getSubParserList();

  const testSpec = {
    makehtml: {
      doesNotExist: [
        { event: 'onStart', text: 'foo', result: false },
        { event: 'onEnd', text: 'foo', result: false },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: 'foo', result: false }
      ],
      blockquote: [
        { event: 'onStart', text: '> foo', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '> foo', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '> foo', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '> foo', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      codeBlock: [
        { event: 'onStart', text: '    foo\n    bar', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '    foo\n    bar', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '    foo\n    bar', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '    foo\n    bar', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      codeSpan: [
        { event: 'onStart', text: '`foo`', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '`foo`', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '`foo`', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '`foo`', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      ellipsis: [
        { event: 'onCapture', text: '...', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '...', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      emoji: [
        { event: 'onStart', text: ':smile:', result: true },
        { event: 'onStart', text: 'smile', result: true },
        { event: 'onEnd', text: ':smile:', result: true },
        { event: 'onEnd', text: 'smile', result: true },
        { event: 'onCapture', text: ':smile:', result: true },
        { event: 'onCapture', text: ':blablablablabla:', result: false }, // this emoji does not exist
        { event: 'onCapture', text: 'smile', result: false },
        { event: 'onHash', text: ':smile:', result: true },
        { event: 'onHash', text: ':blablablablabla:', result: false }, // this emoji does not exist
        { event: 'onHash', text: 'smile', result: false }
      ],
      emphasisAndStrong: [
        { event: 'onStart', text: '*foo*', result: true },
        { event: 'onStart', text: '**foo**', result: true },
        { event: 'onStart', text: '***foo***', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '*foo*', result: true },
        { event: 'onEnd', text: '**foo**', result: true },
        { event: 'onEnd', text: '***foo***', result: true },
        { event: 'onEnd', text: 'foo', result: true }
      ],
      'emphasisAndStrong.emphasis': [
        { event: 'onCapture', text: '*foo*', result: true },
        { event: 'onCapture', text: '**foo**', result: false },
        { event: 'onCapture', text: '***foo***', result: false },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '*foo*', result: true },
        { event: 'onHash', text: '**foo**', result: false },
        { event: 'onHash', text: '***foo***', result: false },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'emphasisAndStrong.strong': [
        { event: 'onCapture', text: '*foo*', result: false },
        { event: 'onCapture', text: '**foo**', result: true },
        { event: 'onCapture', text: '***foo***', result: false },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '*foo*', result: false },
        { event: 'onHash', text: '**foo**', result: true },
        { event: 'onHash', text: '***foo***', result: false },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'emphasisAndStrong.emphasisAndStrong': [
        { event: 'onCapture', text: '*foo*', result: false },
        { event: 'onCapture', text: '**foo**', result: false },
        { event: 'onCapture', text: '***foo***', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '*foo*', result: false },
        { event: 'onHash', text: '**foo**', result: false },
        { event: 'onHash', text: '***foo***', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      githubCodeBlock: [
        { event: 'onStart', text: '```\nfoo\n```', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '```\nfoo\n```', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '```\nfoo\n```', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '```\nfoo\n```', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'heading.atx': [
        { event: 'onStart', text: '# foo', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '# foo', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '# foo', result: true },
        { event: 'onCapture', text: 'foo\n---', result: false },
        { event: 'onCapture', text: 'foo\n===', result: false },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '# foo', result: true },
        { event: 'onHash', text: 'foo\n---', result: false },
        { event: 'onHash', text: 'foo\n===', result: false },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'heading.setext': [
        { event: 'onStart', text: 'foo\n---', result: true },
        { event: 'onStart', text: 'foo\n===', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: 'foo\n---', result: true },
        { event: 'onEnd', text: 'foo\n===', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '# foo', result: false },
        { event: 'onCapture', text: 'foo\n---', result: true },
        { event: 'onCapture', text: 'foo\n===', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '# foo', result: false },
        { event: 'onHash', text: 'foo\n---', result: true },
        { event: 'onHash', text: 'foo\n===', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      horizontalRule: [
        { event: 'onStart', text: '---', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '---', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '---', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '---', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      image: [
        { event: 'onStart', text: '![foo](bar.jpg)', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '![foo](bar.jpg)', result: true },
        { event: 'onEnd', text: 'foo', result: true }
      ],
      'image.inline': [
        { event: 'onCapture', text: '![foo](bar.jpg)', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '![foo](bar.jpg)', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'image.reference': [
        { event: 'onCapture', text: '![foo][1]\n\n[1]: bar.jpg', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '![foo][1]\n\n[1]: bar.jpg', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      link: [
        { event: 'onStart', text: '[foo](bar.jpg)', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '[foo](bar.jpg)', result: true },
        { event: 'onEnd', text: 'foo', result: true }
      ],
      'link.inline': [
        { event: 'onCapture', text: '[foo](bar.jpg)', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '[foo](bar.jpg)', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'link.reference': [
        { event: 'onCapture', text: '[foo][1]\n\n[1]: bar.jpg', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '[foo][1]\n\n[1]: bar.jpg', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      list: [
        { event: 'onStart', text: '1. foo\n2.bar\n', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '1. foo\n2.bar\n', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '1. foo\n2.bar\n', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '1. foo\n2.bar\n', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'list.listItem': [
        { event: 'onCapture', text: '1. foo\n2.bar\n', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '1. foo\n2.bar\n', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'list.taskListItem': [
        { event: 'onCapture', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'list.taskListItem.checkbox': [
        { event: 'onCapture', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      metadata: [
        { event: 'onStart', text: '«««yaml\nfoo: bar\n»»»\n', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '«««yaml\nfoo: bar\n»»»\n', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '«««yaml\nfoo: bar\n»»»\n', result: true },
        { event: 'onCapture', text: '---yaml\nfoo: bar\n---\n', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '«««yaml\nfoo: bar\n»»»\n', result: true },
        { event: 'onHash', text: '---yaml\nfoo: bar\n---\n', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      paragraphs: [
        { event: 'onStart', text: 'foo\n\nbar', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: 'foo\n\nbar', result: true },
        { event: 'onEnd', text: 'foo', result: true }
      ],
      strikethrough: [
        { event: 'onStart', text: '~~foo~~', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '~~foo~~', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '~~foo~~', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '~~foo~~', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      table: [
        { event: 'onStart', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      underline: [
        { event: 'onStart', text: '__foo__', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '__foo__', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '__foo__', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '__foo__', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ]
    },
    makeMarkdown: {
      header: [
        { event: 'onStart', text: '<h1>foo</h1>', result: true },
        { event: 'onStart', text: '<p>foo</p>', result: false },
        { event: 'onEnd', text: '<h2>foo</h2>', result: true }
      ],
      paragraph: [
        { event: 'onStart', text: '<p>foo</p>', result: true },
        { event: 'onStart', text: '<h1>foo</h1>', result: false },
        { event: 'onEnd', text: '<p>foo</p>', result: true }
      ],
      blockquote: [
        { event: 'onStart', text: '<blockquote>foo</blockquote>', result: true },
        { event: 'onEnd', text: '<blockquote>foo</blockquote>', result: true }
      ],
      emphasis: [
        { event: 'onStart', text: '<p><em>foo</em></p>', result: true },
        { event: 'onStart', text: '<p>foo</p>', result: false },
        { event: 'onEnd', text: '<p><em>foo</em></p>', result: true }
      ],
      strong: [
        { event: 'onStart', text: '<p><strong>foo</strong></p>', result: true },
        { event: 'onEnd', text: '<p><strong>foo</strong></p>', result: true }
      ],
      links: [
        { event: 'onStart', text: '<p><a href="bar.jpg">foo</a></p>', result: true },
        { event: 'onEnd', text: '<p><a href="bar.jpg">foo</a></p>', result: true }
      ],
      image: [
        { event: 'onStart', text: '<p><img src="bar.jpg" alt="foo"></p>', result: true },
        { event: 'onEnd', text: '<p><img src="bar.jpg" alt="foo"></p>', result: true }
      ],
      codeSpan: [
        { event: 'onStart', text: '<p><code>foo</code></p>', result: true },
        { event: 'onEnd', text: '<p><code>foo</code></p>', result: true }
      ],
      list: [
        { event: 'onStart', text: '<ul><li>foo</li></ul>', result: true },
        { event: 'onEnd', text: '<ul><li>foo</li></ul>', result: true }
      ],
      table: [
        { event: 'onStart', text: '<table><thead><tr><th>foo</th></tr></thead><tbody><tr><td>bar</td></tr></tbody></table>', result: true },
        { event: 'onEnd', text: '<table><thead><tr><th>foo</th></tr></thead><tbody><tr><td>bar</td></tr></tbody></table>', result: true }
      ]
    }
  };

  describe('event triggering', function () {

    let converter;

    before(function () {
      converter = new showdown.Converter({
        strikethrough: true,
        tables: true,
        ghCodeBlocks: true,
        tasklists: true,
        ghMentions: true,
        emoji: true,
        underline: true,
        ellipsis: true,
        metadata: true
      });
    });

    describe('makehtml', function () {
      /* jshint -W083*/
      for (let parser in testSpec.makehtml) {

        describe(parser, function () {
          for (let ts in testSpec.makehtml[parser]) {
            let event = 'makehtml.' + parser + '.' + testSpec.makehtml[parser][ts].event;

            let md = testSpec.makehtml[parser][ts].text;
            let title = '«' + md + '» ';
            title += (testSpec.makehtml[parser][ts].result) ? 'should ' : 'should NOT ';
            title += 'trigger "' + event + ' event"';
            let expected = testSpec.makehtml[parser][ts].result;
            let actual = false;

            it(title, function () {
              converter.listen(event, function () {
                actual = true;
              });
              converter.makeHtml(md);
              expected.should.equal(actual);
            });
          }
        });
      }
      /* jshint +W083*/
    });

    describe('makeMarkdown', function () {
      /* jshint -W083*/
      for (let parser in testSpec.makeMarkdown) {

        describe(parser, function () {
          for (let ts in testSpec.makeMarkdown[parser]) {
            let event = 'makeMarkdown.' + parser + '.' + testSpec.makeMarkdown[parser][ts].event;

            let html = testSpec.makeMarkdown[parser][ts].text;
            let title = '«' + html + '» ';
            title += (testSpec.makeMarkdown[parser][ts].result) ? 'should ' : 'should NOT ';
            title += 'trigger "' + event + ' event"';
            let expected = testSpec.makeMarkdown[parser][ts].result;
            let actual = false;

            it(title, function () {
              converter.listen(event, function () {
                actual = true;
              });
              converter.makeMarkdown(html);
              expected.should.equal(actual);
            });
          }
        });
      }
      /* jshint +W083*/
    });

    describe('makeMarkdown (document level)', function () {
      it('should trigger "makeMarkdown.onStart" event', function () {
        let actual = false;
        converter.listen('makeMarkdown.onStart', function () {
          actual = true;
        });
        converter.makeMarkdown('<p>foo</p>');
        actual.should.equal(true);
      });

      it('should trigger "makeMarkdown.onEnd" event', function () {
        let actual = false;
        converter.listen('makeMarkdown.onEnd', function () {
          actual = true;
        });
        converter.makeMarkdown('<p>foo</p>');
        actual.should.equal(true);
      });
    });
  });
});
