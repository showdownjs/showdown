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
      hardLineBreaks: [
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: 'foo', result: true }
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
      'link.angleBrackets': [
        { event: 'onCapture', text: '<http://foo.com>', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '<http://foo.com>', result: true },
        { event: 'onHash', text: 'foo', result: false }
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
      taskListItem: [
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
      stripLinkDefinitions: [
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '[foo]: bar.com\n\n[foo]', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '[foo]: bar.com\n\n[foo]', result: true },
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
      'table.header': [
        { event: 'onCapture', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '|foo|bar|\n|---|---|\n|1|2|', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      'table.cell': [
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
      node: [
        { event: 'onStart', text: '<p>foo</p>', result: true },
        { event: 'onEnd', text: '<p>foo</p>', result: true }
      ],
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

    describe('makeHtml (document level)', function () {
      it('should trigger "makehtml.onStart" event', function () {
        let actual = false;
        new showdown.Converter()
          .listen('makehtml.onStart', function () { actual = true; })
          .makeHtml('foo');
        actual.should.equal(true);
      });

      it('should trigger "makehtml.onPreParse" event', function () {
        let actual = false;
        new showdown.Converter()
          .listen('makehtml.onPreParse', function () { actual = true; })
          .makeHtml('foo');
        actual.should.equal(true);
      });

      it('should trigger "makehtml.onEnd" event', function () {
        let actual = false;
        new showdown.Converter()
          .listen('makehtml.onEnd', function () { actual = true; })
          .makeHtml('foo');
        actual.should.equal(true);
      });

      it('onStart should see the raw (unescaped) source but onPreParse the escaped source', function () {
        let onStartInput, onPreParseInput;
        new showdown.Converter()
          .listen('makehtml.onStart', function (event) { onStartInput = event.input; return event; })
          .listen('makehtml.onPreParse', function (event) { onPreParseInput = event.input; return event; })
          .makeHtml('price is $5');
        // before escaping, the dollar sign is literal
        onStartInput.should.contain('$');
        // after escaping, `$` becomes the `¨D` placeholder
        onPreParseInput.should.contain('¨D');
        onPreParseInput.should.not.contain('$');
      });

      it('onStart listener can rewrite the raw markdown source', function () {
        let result = new showdown.Converter()
          .listen('makehtml.onStart', function () { return '# replaced'; })
          .makeHtml('original');
        result.should.match(/<h1[^>]*>replaced<\/h1>/);
      });

      it('onEnd listener can post-process the final HTML', function () {
        let result = new showdown.Converter()
          .listen('makehtml.onEnd', function (event) { return event.input.replace('<p>', '<p class="x">'); })
          .makeHtml('foo');
        result.should.contain('<p class="x">');
      });

      it('a lang extension and an onPreParse listener chain in registration order', function () {
        let converter = new showdown.Converter();
        // lang extension is registered first (turns `a` into `b`) ...
        converter.addExtension({type: 'lang', regex: /a/g, replace: 'b'});
        // ... then a hand-written listener turns `b` into `c`
        converter.listen('makehtml.onPreParse', function (event) { return event.input.replace(/b/g, 'c'); });
        converter.makeHtml('a').should.match(/c/);
      });
    });

    // autoLink capture/hash events need a converter with simplifiedAutoLink enabled, which the
    // shared converter above does not have, so they get their own dedicated converters here.
    describe('makehtml link.autoLink (requires simplifiedAutoLink)', function () {
      ['onCapture', 'onHash'].forEach(function (evt) {
        it('should trigger "makehtml.link.autoLink.' + evt + '" event', function () {
          let fired = false;
          new showdown.Converter({simplifiedAutoLink: true})
            .listen('makehtml.link.autoLink.' + evt, function (e) { fired = true; return e; })
            .makeHtml('http://foo.com');
          fired.should.equal(true);
        });
      });
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

  // Generic coverage sweep: every subparser that emits lifecycle events must fire its onStart
  // at least once across a feature-rich conversion. This guards against a subparser being added
  // (or silently losing its event dispatch) without a corresponding test. A failure lists the
  // subparser names whose onStart never fired.
  describe('event coverage sweep', function () {

    let makehtmlSubparsers = [
      'blockGamut', 'blockquote', 'cmInline', 'codeBlock', 'codeSpan', 'completeHTMLDocument',
      'decodeEntities', 'ellipsis', 'emoji', 'emphasisAndStrong', 'encodeAmpsAndAngles',
      'encodeBackslashEscapes', 'encodeCode', 'escapeSpecialCharsWithinTagAttributes',
      'githubCodeBlock', 'hardLineBreaks', 'hashBlock', 'hashCodeTags', 'hashHTMLBlocks',
      'hashHTMLSpans', 'hashPreCodeTags', 'heading', 'heading.atx', 'heading.setext',
      'horizontalRule', 'image', 'link', 'list', 'metadata', 'paragraphs', 'spanGamut',
      'strikethrough', 'stripLinkDefinitions', 'table', 'underline', 'unescapeSpecialChars',
      'unhashHTMLSpans'
    ];

    let makeMarkdownSubparsers = [
      'blockquote', 'break', 'codeBlock', 'codeSpan', 'emphasis', 'header', 'hr', 'image',
      'input', 'links', 'list', 'listItem', 'node', 'paragraph', 'pre', 'strikethrough',
      'strong', 'table', 'tableCell', 'txt', 'underline'
    ];

    // a feature-rich document that, across the two converters below, exercises every makehtml
    // subparser. The loose list with a heading reaches the `heading` wrapper (list.js); the
    // commonmark run reaches cmInline and decodeEntities (which the default flavor skips).
    let richMd = [
      '---', 'title: x', '---', '',
      '# ATX heading', '',
      'Setext heading', '==============', '',
      'Para with `codespan`, **strong**, *em*, ~~strike~~, __under__, ...ellipsis, ',
      'a [ref][1], an [inline](http://example.com "t"), <http://angle.com>, http://naked.com, ',
      'an ![img](pic.png), an emoji :smile:, a @mention, and <span title="a&b">html</span>.', '',
      '    indented code', '',
      '```', 'fenced', '```', '',
      '- list item', '', '- [ ] task', '', '- # heading in item', '',
      '> blockquote', '',
      '| h1 | h2 |', '|----|----|', '| a  | b  |', '',
      '---', '', '[1]: http://ref.com', ''
    ].join('\n');

    let richHtml = '<h1>h</h1><p>para <em>em</em> <strong>s</strong> <code>c</code> ' +
      '<a href="x">l</a> <img src="y" alt="z"> <u>u</u> <del>d</del> <br> text</p>' +
      '<blockquote>bq</blockquote><pre><code>block</code></pre><pre>raw pre</pre><hr>' +
      '<ul><li>item</li><li><input type="checkbox" checked> task</li></ul>' +
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table>';

    function collectMakehtml (opts) {
      let fired = {},
          conv = new showdown.Converter(opts);
      makehtmlSubparsers.forEach(function (name) {
        conv.listen('makehtml.' + name + '.onStart', function (e) { fired[name] = true; return e; });
      });
      conv.makeHtml(richMd);
      return fired;
    }

    it('every makehtml subparser should emit its onStart event', function () {
      let kitchen = {
            strikethrough: true, tables: true, ghCodeBlocks: true, tasklists: true,
            ghMentions: true, emoji: true, underline: true, ellipsis: true, metadata: true,
            simplifiedAutoLink: true, completeHTMLDocument: true
          },
          firedDefault = collectMakehtml(kitchen),
          firedCm = collectMakehtml(showdown.getFlavorOptions('commonmark')),
          missing = makehtmlSubparsers.filter(function (name) {
            return !firedDefault[name] && !firedCm[name];
          });
      missing.should.eql([]);
    });

    it('every makeMarkdown subparser should emit its onStart event', function () {
      let fired = {},
          conv = new showdown.Converter({tables: true, tasklists: true, strikethrough: true, underline: true});
      makeMarkdownSubparsers.forEach(function (name) {
        conv.listen('makeMarkdown.' + name + '.onStart', function (e) { fired[name] = true; return e; });
      });
      conv.makeMarkdown(richHtml);
      let missing = makeMarkdownSubparsers.filter(function (name) { return !fired[name]; });
      missing.should.eql([]);
    });
  });
});
