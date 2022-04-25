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
      heading: [
        { event: 'onStart', text: '# foo', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '# foo', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '# foo', result: true },
        { event: 'onCapture', text: 'foo\n---', result: true },
        { event: 'onCapture', text: 'foo\n===', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '# foo', result: true },
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
        //{ event: 'onHash', text: '1. foo\n2.bar\n', result: true },
        //{ event: 'onHash', text: 'foo', result: false }
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
            let title = (testSpec.makehtml[parser][ts].result) ? 'should ' : 'should NOT ';
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
  });
});
