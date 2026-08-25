// noinspection HtmlUnknownTarget

/**
 * Created by Tivie on 04/03/2022.
 */

// in node, if bootstrap is pre-loaded, there's a mock of XMLHttpRequest which
// internally just calls fs.readFileSync

describe('showdown.Event', function () {
  'use strict';
  //const subparserList = showdown.getSubParserList();

  // noinspection HtmlUnknownTarget
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
      // A bare inline code span is recognized by the inline engine, which fires codeSpan's
      // capture/hash but not its lifecycle (the engine owns the onStart/onEnd for the whole inline
      // pass). The codeSpan subparser's own
      // onStart/onEnd still fire when it is invoked directly (table cell splitting) — exercised by
      // the coverage sweep below.
      codeSpan: [
        { event: 'onCapture', text: '`foo`', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '`foo`', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      // Ellipsis is scan-native (recognized inline by the engine), so it fires only its
      // capture/hash per `...` occurrence — the onStart/onEnd lifecycle belongs to the engine, not
      // to ellipsis. It has no whole-text pass form any more.
      ellipsis: [
        { event: 'onCapture', text: '...', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '...', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      // Emoji is scan-native (recognized inline by the engine), so it fires only its
      // capture/hash per substituted shortcode — the onStart/onEnd lifecycle belongs to the engine,
      // not to emoji. It has no whole-text pass form any more.
      emoji: [
        { event: 'onCapture', text: ':smile:', result: true },
        { event: 'onCapture', text: ':blablablablabla:', result: false }, // this emoji does not exist
        { event: 'onCapture', text: 'smile', result: false },
        { event: 'onHash', text: ':smile:', result: true },
        { event: 'onHash', text: ':blablablablabla:', result: false }, // this emoji does not exist
        { event: 'onHash', text: 'smile', result: false }
      ],
      // Emphasis is resolved by the inline engine's delimiter-stack resolver, which fires the
      // SEPARATE makehtml.emphasis / makehtml.strong
      // families (capture/hash) instead of the retired makehtml.emphasisAndStrong family. There
      // is no combined `***foo***` event any more: `***foo***` is `<em><strong>foo</strong></em>`,
      // so it fires BOTH a strong capture (inner `<strong>`) and an emphasis capture (outer
      // `<em>`). The lifecycle for the pass belongs to the engine (checked in taxonomy coverage).
      emphasis: [
        { event: 'onCapture', text: '*foo*', result: true },
        { event: 'onCapture', text: '**foo**', result: false },
        { event: 'onCapture', text: '***foo***', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '*foo*', result: true },
        { event: 'onHash', text: '**foo**', result: false },
        { event: 'onHash', text: '***foo***', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      strong: [
        { event: 'onCapture', text: '*foo*', result: false },
        { event: 'onCapture', text: '**foo**', result: true },
        { event: 'onCapture', text: '***foo***', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '*foo*', result: false },
        { event: 'onHash', text: '**foo**', result: true },
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
      // The hard break is a SCAN construct: the inline engine resolves `  \n` / `\\\n` on its own
      // single pass and the singular makehtml.hardLineBreak family fires capture/hash per break.
      // There is no whole-text pass form any more (the plural makehtml.hardLineBreaks family died
      // with its subparser at the flip), so the lifecycle belongs to the inline engine, not here.
      hardLineBreak: [
        { event: 'onCapture', text: 'foo  \nbar', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: 'foo  \nbar', result: true },
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
      htmlBlock: [
        // source recognition: a top-level raw HTML block fires the full lifecycle + per-block
        // capture/hash; plain text fires only the always-run onStart/onEnd.
        { event: 'onStart', text: '<div>\nfoo\n</div>', result: true },
        { event: 'onStart', text: 'foo', result: true },
        { event: 'onEnd', text: '<div>\nfoo\n</div>', result: true },
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: '<div>\nfoo\n</div>', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '<div>\nfoo\n</div>', result: true },
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
      // Links and images are recognized by the inline engine, which fires the per-variant
      // capture/hash families below (image.inline / image.reference / link.inline /
      // link.reference) — there is no image/link lifecycle, since the engine owns the inline pass.
      // The angle-bracket variant (link.angleBrackets) is RETIRED: `<uri>`/`<email>`/`<www…>` and
      // the simplifiedAutoLink naked URLs are one construct family now and both fire
      // makehtml.link.autolink (covered by its own describe block below, which needs
      // simplifiedAutoLink; the angle arm fires it without that option).
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
      // the angle-bracket spelling of an autolink, firing the shared `autolink` variant
      'link.autolink': [
        { event: 'onCapture', text: '<https://foo.com>', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '<https://foo.com>', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ],
      // ghMentions fire their own `ghMention` variant of the link family (they used to be routed
      // through link.reference, which is retired).
      'link.ghMention': [
        { event: 'onCapture', text: 'hi @tivie', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: 'hi @tivie', result: true },
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
      'list.taskListItem.checkbox': [
        // a registered subparser, so it now emits lifecycle events too — but only when the
        // list parser actually invokes it (i.e. there is a list item); a plain 'foo' is not
        // a list, so the checkbox subparser is never called and none of its events fire.
        { event: 'onStart', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onStart', text: 'foo', result: false },
        { event: 'onEnd', text: '1. [X] foo\n2. [x] bar\n', result: true },
        { event: 'onEnd', text: 'foo', result: false },
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
        { event: 'onEnd', text: 'foo', result: true },
        { event: 'onCapture', text: 'foo\n\nbar', result: true },
        // '# foo' is hashed as a heading block, so the paragraphs pass sees only a placeholder
        // and wraps nothing — no per-graf capture fires.
        { event: 'onCapture', text: '# foo', result: false },
        { event: 'onHash', text: 'foo\n\nbar', result: true },
        { event: 'onHash', text: '# foo', result: false }
      ],
      // Strikethrough is scan-native (recognized inline by the engine), so it fires only its
      // capture/hash per resolved `~~..~~` run — the onStart/onEnd lifecycle belongs to the engine,
      // not to strikethrough. It has no whole-text pass form any more.
      strikethrough: [
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
      // Underline is scan-native (recognized inline by the engine), so it fires only its
      // capture/hash per claimed `__..__`/`___..___` region — the onStart/onEnd lifecycle belongs to
      // the engine, not to underline. It has no whole-text pass form any more.
      underline: [
        { event: 'onCapture', text: '__foo__', result: true },
        { event: 'onCapture', text: 'foo', result: false },
        { event: 'onHash', text: '__foo__', result: true },
        { event: 'onHash', text: 'foo', result: false }
      ]
    },
    makeMarkdown: {
      // node is the recursive dispatcher: it emits onStart/onEnd for every node plus a
      // per-node onCapture (the override hook for comments / unknown elements). It has no
      // onHash (nothing is hashed on this side).
      node: [
        { event: 'onStart', text: '<p>foo</p>', result: true },
        { event: 'onCapture', text: '<p>foo</p>', result: true },
        { event: 'onEnd', text: '<p>foo</p>', result: true },
        { event: 'onHash', text: '<p>foo</p>', result: false }
      ],
      header: [
        { event: 'onStart', text: '<h1>foo</h1>', result: true },
        { event: 'onStart', text: '<p>foo</p>', result: false },
        { event: 'onCapture', text: '<h1>foo</h1>', result: true },
        { event: 'onCapture', text: '<p>foo</p>', result: false },
        { event: 'onEnd', text: '<h2>foo</h2>', result: true },
        { event: 'onHash', text: '<h1>foo</h1>', result: false }
      ],
      paragraph: [
        { event: 'onStart', text: '<p>foo</p>', result: true },
        { event: 'onStart', text: '<h1>foo</h1>', result: false },
        { event: 'onCapture', text: '<p>foo</p>', result: true },
        { event: 'onCapture', text: '<h1>foo</h1>', result: false },
        { event: 'onEnd', text: '<p>foo</p>', result: true },
        { event: 'onHash', text: '<p>foo</p>', result: false }
      ],
      blockquote: [
        { event: 'onStart', text: '<blockquote>foo</blockquote>', result: true },
        { event: 'onCapture', text: '<blockquote>foo</blockquote>', result: true },
        { event: 'onEnd', text: '<blockquote>foo</blockquote>', result: true }
      ],
      emphasis: [
        { event: 'onStart', text: '<p><em>foo</em></p>', result: true },
        { event: 'onStart', text: '<p>foo</p>', result: false },
        { event: 'onCapture', text: '<p><em>foo</em></p>', result: true },
        { event: 'onCapture', text: '<p>foo</p>', result: false },
        { event: 'onEnd', text: '<p><em>foo</em></p>', result: true }
      ],
      strong: [
        { event: 'onStart', text: '<p><strong>foo</strong></p>', result: true },
        { event: 'onCapture', text: '<p><strong>foo</strong></p>', result: true },
        { event: 'onEnd', text: '<p><strong>foo</strong></p>', result: true }
      ],
      links: [
        { event: 'onStart', text: '<p><a href="bar.jpg">foo</a></p>', result: true },
        { event: 'onCapture', text: '<p><a href="bar.jpg">foo</a></p>', result: true },
        { event: 'onEnd', text: '<p><a href="bar.jpg">foo</a></p>', result: true }
      ],
      image: [
        { event: 'onStart', text: '<p><img src="bar.jpg" alt="foo"></p>', result: true },
        { event: 'onCapture', text: '<p><img src="bar.jpg" alt="foo"></p>', result: true },
        { event: 'onEnd', text: '<p><img src="bar.jpg" alt="foo"></p>', result: true }
      ],
      codeSpan: [
        { event: 'onStart', text: '<p><code>foo</code></p>', result: true },
        { event: 'onCapture', text: '<p><code>foo</code></p>', result: true },
        { event: 'onEnd', text: '<p><code>foo</code></p>', result: true }
      ],
      list: [
        { event: 'onStart', text: '<ul><li>foo</li></ul>', result: true },
        { event: 'onCapture', text: '<ul><li>foo</li></ul>', result: true },
        { event: 'onEnd', text: '<ul><li>foo</li></ul>', result: true }
      ],
      table: [
        { event: 'onStart', text: '<table><thead><tr><th>foo</th></tr></thead><tbody><tr><td>bar</td></tr></tbody></table>', result: true },
        { event: 'onCapture', text: '<table><thead><tr><th>foo</th></tr></thead><tbody><tr><td>bar</td></tr></tbody></table>', result: true },
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
              expect(expected).toBe(actual);
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
              expect(expected).toBe(actual);
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
        expect(actual).toBe(true);
      });

      it('should trigger "makehtml.onPreParse" event', function () {
        let actual = false;
        new showdown.Converter()
          .listen('makehtml.onPreParse', function () { actual = true; })
          .makeHtml('foo');
        expect(actual).toBe(true);
      });

      it('should trigger "makehtml.onEnd" event', function () {
        let actual = false;
        new showdown.Converter()
          .listen('makehtml.onEnd', function () { actual = true; })
          .makeHtml('foo');
        expect(actual).toBe(true);
      });

      it('onStart should see the raw (unescaped) source but onPreParse the escaped source', function () {
        let onStartInput, onPreParseInput;
        new showdown.Converter()
          .listen('makehtml.onStart', function (event) { onStartInput = event.input; return event; })
          .listen('makehtml.onPreParse', function (event) { onPreParseInput = event.input; return event; })
          .makeHtml('price is $5');
        expect(// before escaping, the dollar sign is literal
          onStartInput).toContain('$');
        expect(// after escaping, `$` becomes the `¨D` placeholder
          onPreParseInput).toContain('¨D');
        expect(onPreParseInput).not.toContain('$');
      });

      it('onStart listener can rewrite the raw markdown source', function () {
        let result = new showdown.Converter()
          .listen('makehtml.onStart', function () { return '# replaced'; })
          .makeHtml('original');
        expect(result).toMatch(/<h1[^>]*>replaced<\/h1>/);
      });

      it('onEnd listener can post-process the final HTML', function () {
        let result = new showdown.Converter()
          .listen('makehtml.onEnd', function (event) { return event.input.replace('<p>', '<p class="x">'); })
          .makeHtml('foo');
        expect(result).toContain('<p class="x">');
      });

      it('a lang extension and an onPreParse listener chain in registration order', function () {
        let converter = new showdown.Converter();
        // lang extension is registered first (turns `a` into `b`) ...
        converter.addExtension({type: 'lang', regex: /a/g, replace: 'b'});
        // ... then a hand-written listener turns `b` into `c`
        converter.listen('makehtml.onPreParse', function (event) { return event.input.replace(/b/g, 'c'); });
        expect(converter.makeHtml('a')).toMatch(/c/);
      });
    });

    // The NAKED spelling of the autolink variant needs a converter with simplifiedAutoLink
    // enabled, which the shared converter above does not have, so it gets its own converter here.
    // (The angle spelling `<https://foo.com>` fires the same variant without the option — covered
    // by the link.autolink entries in the spec table above.) Registered with the legacy `autoLink`
    // camelCase spelling on purpose: event names are lowercased on the wire, so this pins that
    // `makehtml.link.autoLink.*` and `makehtml.link.autolink.*` remain the same subscription.
    describe('makehtml link.autolink, naked spelling (requires simplifiedAutoLink)', function () {
      ['onCapture', 'onHash'].forEach(function (evt) {
        it('should trigger "makehtml.link.autoLink.' + evt + '" event', function () {
          let fired = false;
          new showdown.Converter({simplifiedAutoLink: true})
            .listen('makehtml.link.autoLink.' + evt, function (e) { fired = true; return e; })
            .makeHtml('https://foo.com');
          expect(fired).toBe(true);
        });
      });
    });

    // Payload regression guards: these capture events once carried a mislabeled matches
    // key (underline) or the wrong regexp (YAML-delimited metadata), which the fire-only
    // checks above cannot catch — so assert on the payload contents themselves.
    describe('capture event payloads', function () {
      it('underline.onCapture should expose the captured text under the `text` matches key', function () {
        let matches;
        new showdown.Converter({underline: true})
          .listen('makehtml.underline.onCapture', function (event) { matches = event.matches; return event; })
          .makeHtml('__foo__');
        expect(matches).toHaveProperty('text', 'foo');
        expect(matches).not.toHaveProperty('strikethrough');
        expect(matches).not.toHaveProperty('underline');
      });

      it('metadata.onCapture should carry the regexp of the delimiter that actually matched', function () {
        let source;
        new showdown.Converter({metadata: true})
          .listen('makehtml.metadata.onCapture', function (event) { source = event.regexp.source; return event; })
          .makeHtml('---\ntitle: x\n---\n\nfoo');
        expect(source).toContain('---');
        expect(source).not.toContain('«««');
      });
    });

    // Constructor validation pin: the non-string name check must keep throwing, so that a
    // refactor of the guard in event.js cannot silently drop the throw.
    describe('Event constructor validation', function () {
      it('should throw a TypeError when name is not a string', function () {
        expect(function () {
          new showdown.Event(123, 'x');
        }).toThrow(/must be a string/);
      });

      it('should construct normally with a string name', function () {
        let event = new showdown.Event('makehtml.foo.onStart', 'txt');
        expect(event.name).toBe('makehtml.foo.onstart');
        expect(event.input).toBe('txt');
      });
    });

    // The event contract documents options as read-only context: a listener mutating
    // event.options must not be able to change the converter's actual configuration. The
    // dispatch path must therefore never hand listeners the converter's live options object
    // by reference — the `options` getter in event.js serves a lazily-cloned copy instead.
    describe('event options are read-only context', function () {
      it('listener mutations of event.options must not leak into the converter', function () {
        let converter = new showdown.Converter({tables: true});
        converter
          .listen('makehtml.heading.atx.onCapture', function (event) {
            event.options.tables = false;
            event.options.injectedByListener = true;
            return event;
          })
          .makeHtml('# foo');
        expect(converter.getOption('tables')).toBe(true);
        expect(converter.getOption('injectedByListener')).toBeUndefined();
      });
    });

    describe('makeMarkdown (document level)', function () {
      it('should trigger "makeMarkdown.onStart" event', function () {
        let actual = false;
        converter.listen('makeMarkdown.onStart', function () {
          actual = true;
        });
        converter.makeMarkdown('<p>foo</p>');
        expect(actual).toBe(true);
      });

      it('should trigger "makeMarkdown.onEnd" event', function () {
        let actual = false;
        converter.listen('makeMarkdown.onEnd', function () {
          actual = true;
        });
        converter.makeMarkdown('<p>foo</p>');
        expect(actual).toBe(true);
      });
    });
  });

  // Generic coverage sweep: every subparser that emits lifecycle events must fire its onStart
  // at least once across a feature-rich conversion. This guards against a subparser being added
  // (or silently losing its event dispatch) without a corresponding test. A failure lists the
  // subparser names whose onStart never fired.
  describe('event coverage sweep', function () {

    // Only registered subparsers that emit lifecycle events remain here. The demoted mechanism
    // passes (encode*/escape*/hash*/unhash*) are showdown.helper.* functions with no events;
    // blockGamut (dispatcher) and decodeEntities were stripped of their events in D10 — so they do
    // not appear below. inlineEngine DOES appear: it owns the inline-pass onStart/onEnd lifecycle
    // for every flavor. Every INLINE construct is absent — link, image, autolink, ghMentions,
    // emphasis, strong, ellipsis, strikethrough, emoji, underline, entity, backslash, rawHtml and
    // the singular hardLineBreak are all scan constructs resolved by the engine, so they emit
    // capture/hash only (covered by the event contract conformance suite below) and have no
    // lifecycle of their own. codeSpan is the one exception: it keeps a whole-text PASS form that
    // table.js invokes directly for cell splitting, so its own lifecycle still fires there.
    let makehtmlSubparsers = [
      'blockquote', 'inlineEngine', 'codeBlock', 'codeSpan', 'completeHTMLDocument',
      'disallowedHtmlTags', 'footnotes',
      'githubCodeBlock', 'htmlBlock',
      'heading.atx', 'heading.setext', 'horizontalRule',
      'list', 'list.taskListItem.checkbox', 'metadata', 'paragraphs',
      'stripLinkDefinitions', 'table'
    ];

    let makeMarkdownSubparsers = [
      'blockquote', 'break', 'codeBlock', 'codeSpan', 'emphasis', 'footnotes', 'header',
      'hr', 'image', 'input', 'links', 'list', 'listItem', 'node', 'paragraph', 'pre',
      'strikethrough', 'strong', 'table', 'tableCell', 'txt', 'underline'
    ];

    // a feature-rich document that, across the two converters below, exercises every makehtml
    // subparser. List-item content flows through blockGamut, which dispatches heading.setext and
    // heading.atx directly (the heading construct is covered by those two variants); the
    // commonmark run additionally reaches decodeEntities (which the default flavor skips).
    let richMd = [
      '---', 'title: x', '---', '',
      '# ATX heading', '',
      'Setext heading', '==============', '',
      'Para with `codespan`, **strong**, *em*, ~~strike~~, __under__, ...ellipsis, ',
      'a [ref][1], an [inline](https://example.com "t"), <https://angle.com>, https://naked.com, ',
      'an ![img](pic.png), an emoji :smile:, a @mention, and <span title="a&b">html</span>.', '',
      '    indented code', '',
      '```', 'fenced', '```', '',
      '- list item', '', '- [ ] task', '', '- # heading in item', '',
      '> blockquote', '',
      '| h1 | h2 |', '|----|----|', '| a  | b  |', '',
      'A note.[^fn] and a disallowed <iframe></iframe> tag.', '',
      '---', '', '[1]: https://ref.com', '', '[^fn]: footnote body', ''
    ].join('\n');

    let richHtml = '<h1>h</h1><p>para <em>em</em> <strong>s</strong> <code>c</code> ' +
      '<a href="x">l</a> <img src="y" alt="z"> <u>u</u> <del>d</del> <br> text' +
      ' a note<sup class="footnote-ref"><a href="#fn-a">1</a></sup></p>' +
      '<blockquote>bq</blockquote><pre><code>block</code></pre><pre>raw pre</pre><hr>' +
      '<ul><li>item</li><li><input type="checkbox" checked> task</li></ul>' +
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table>' +
      '<section class="footnotes"><ol><li id="fn-a">the body<a class="footnote-backref" href="#">back</a></li></ol></section>';

    // tracks BOTH lifecycle phases so a subparser cannot silently lose its onEnd either
    function collectMakehtml (opts) {
      let started = {},
          ended = {},
          conv = new showdown.Converter(opts);
      /* jshint -W083 */
      makehtmlSubparsers.forEach(function (name) {
        conv.listen('makehtml.' + name + '.onStart', function (e) { started[name] = true; return e; });
        conv.listen('makehtml.' + name + '.onEnd', function (e) { ended[name] = true; return e; });
      });
      /* jshint +W083 */
      conv.makeHtml(richMd);
      return {started: started, ended: ended};
    }

    it('every makehtml subparser should emit its onStart and onEnd events', function () {
      let kitchen = {
            strikethrough: true, tables: true, ghCodeBlocks: true, tasklists: true,
            ghMentions: true, emoji: true, underline: true, ellipsis: true, metadata: true,
            simplifiedAutoLink: true, completeHTMLDocument: true, footnotes: true,
            disallowRawHTML: true
          },
          firedDefault = collectMakehtml(kitchen),
          firedCm = collectMakehtml(showdown.getFlavorOptions('commonmark')),
          missingStart = makehtmlSubparsers.filter(function (name) {
            return !firedDefault.started[name] && !firedCm.started[name];
          }),
          missingEnd = makehtmlSubparsers.filter(function (name) {
            return !firedDefault.ended[name] && !firedCm.ended[name];
          });
      expect(missingStart).toEqual([]);
      expect(missingEnd).toEqual([]);
    });

    it('every makeMarkdown subparser should emit its onStart and onEnd events', function () {
      let started = {},
          ended = {},
          conv = new showdown.Converter({tables: true, tasklists: true, strikethrough: true, underline: true, footnotes: true});
      /* jshint -W083 */
      makeMarkdownSubparsers.forEach(function (name) {
        conv.listen('makeMarkdown.' + name + '.onStart', function (e) { started[name] = true; return e; });
        conv.listen('makeMarkdown.' + name + '.onEnd', function (e) { ended[name] = true; return e; });
      });
      /* jshint +W083 */
      conv.makeMarkdown(richHtml);
      let missingStart = makeMarkdownSubparsers.filter(function (name) { return !started[name]; }),
          missingEnd = makeMarkdownSubparsers.filter(function (name) { return !ended[name]; });
      expect(missingStart).toEqual([]);
      expect(missingEnd).toEqual([]);
    });
  });

  // Generic event-contract conformance: drive every makehtml per-match construct over a
  // feature-rich document and assert the payload shape of every capture/hash event it emits
  // against the ratified contract (see docs/event-system.md). This guards the whole bug class
  // of mislabeled matches keys and wrong regexp — a subparser cannot drift from the contract
  // without failing here.
  describe('event contract conformance', function () {

    // Every construct that emits onCapture/onHash, with whether it carries a `text` matches key.
    // `text` is required wherever the construct has main inner content; the two exceptions
    // (documented in the contract) produce no inner content: a horizontal rule is a bare
    // delimiter, and a link reference definition is stored, never rendered inline.
    let captureConstructs = [
      { event: 'makehtml.strikethrough', hasText: true },
      { event: 'makehtml.underline', hasText: true },
      { event: 'makehtml.ellipsis', hasText: true },
      { event: 'makehtml.emoji', hasText: true },
      { event: 'makehtml.codeSpan', hasText: true },
      { event: 'makehtml.horizontalRule', hasText: false },
      { event: 'makehtml.heading.atx', hasText: true },
      { event: 'makehtml.heading.setext', hasText: true },
      { event: 'makehtml.blockquote', hasText: true },
      { event: 'makehtml.codeBlock', hasText: true },
      { event: 'makehtml.githubCodeBlock', hasText: true },
      { event: 'makehtml.metadata', hasText: true },
      { event: 'makehtml.table', hasText: true },
      { event: 'makehtml.table.header', hasText: true },
      { event: 'makehtml.table.cell', hasText: true },
      { event: 'makehtml.link.inline', hasText: true },
      { event: 'makehtml.link.reference', hasText: true },
      // one `autolink` variant for both spellings: `<uri>`/`<email>`/`<www…>` angle autolinks and
      // the simplifiedAutoLink naked URLs/mails (the separate `angleBrackets` variant is retired)
      { event: 'makehtml.link.autolink', hasText: true },
      // @-mentions fire their own variant of the link family (they used to route through
      // link.reference)
      { event: 'makehtml.link.ghMention', hasText: true },
      { event: 'makehtml.image.inline', hasText: true },
      { event: 'makehtml.image.reference', hasText: true },
      // The inline engine fires the SEPARATE emphasis/strong capture families for every flavor.
      // The combined makehtml.emphasisAndStrong family (including the `***foo***` combined event)
      // is retired.
      { event: 'makehtml.emphasis', hasText: true },
      { event: 'makehtml.strong', hasText: true },
      { event: 'makehtml.list', hasText: true },
      { event: 'makehtml.list.listItem', hasText: true },
      { event: 'makehtml.list.taskListItem', hasText: true },
      { event: 'makehtml.list.taskListItem.checkbox', hasText: true },
      { event: 'makehtml.stripLinkDefinitions', hasText: false },
      // source-recognized raw HTML block: its capture carries the raw block source as text
      { event: 'makehtml.htmlBlock', hasText: true },
      // D10 additions: paragraphs carry their graf text; a hard break has no inner content
      // (like a horizontal rule), so it carries no `text` key.
      { event: 'makehtml.paragraphs', hasText: true },
      { event: 'makehtml.hardLineBreak', hasText: false },
      // The remaining scan constructs the inline engine resolves. rawHtml carries the recognized
      // tag/comment source, entity the character reference and backslash the escaped sequence —
      // all three are the construct's own main content, so all three carry `text`.
      { event: 'makehtml.rawHtml', hasText: true },
      { event: 'makehtml.entity', hasText: true },
      { event: 'makehtml.backslash', hasText: true },
      // remaining capture families: footnote definitions carry the body, references render a
      // generated <sup> (no inner content); disallowedHtmlTags carries the matched tag opening;
      // heading.id is the capture-only slug hook (its onHash never fires).
      { event: 'makehtml.footnotes.definition', hasText: true },
      { event: 'makehtml.footnotes.reference', hasText: false },
      { event: 'makehtml.disallowedHtmlTags', hasText: true },
      { event: 'makehtml.heading.id', hasText: true }
    ];

    // A document that, across the two converters below, triggers every construct above.
    let conformanceMd = [
      '---', 'title: x', '---', '',
      '# ATX heading', '',
      'Setext heading', '==============', '',
      'Para `codespan` **strong** *em* ***both*** ~~strike~~ __under__ ...ellipsis ',
      'a [ref][1] an [inline](https://example.com "t") <https://angle.com> https://naked.com ',
      'an ![img](pic.png) a ![refimg][1] an emoji :smile: <span title="a&b">html</span>.', '',
      'A hard break here  ', 'then an entity &amp; an escape \\* and a @mention.', '',
      '    indented code', '',
      '```js', 'fenced', '```', '',
      '- list item', '', '- [ ] task', '', '- # heading in item', '',
      '> blockquote', '',
      '<div>a raw html block</div>', '',
      '| h1 | h2 |', '|----|----|', '| a  | b  |', '',
      'A note.[^fn] and a disallowed <iframe></iframe> tag.', '',
      '- - -', '', '[1]: https://ref.com "rt"', '', '[^fn]: footnote body', ''
    ].join('\n');

    function validateCaptureEvent (c, event, errors) {
      let ev = c.event + '.onCapture';
      if (event.output !== null) {
        errors.push(ev + ': output must be null on capture, got ' + JSON.stringify(event.output));
      }
      if (event.regexp !== null && !(event.regexp instanceof RegExp)) {
        errors.push(ev + ': regexp must be a RegExp or null, got ' + typeof event.regexp);
      }
      if (event.matches === null || typeof event.matches !== 'object') {
        errors.push(ev + ': matches must be an object');
      } else if (!Object.prototype.hasOwnProperty.call(event.matches, '_wholeMatch')) {
        errors.push(ev + ': matches must include a "_wholeMatch" key');
      }
      if (c.hasText && (typeof event.matches.text !== 'string')) {
        errors.push(ev + ': matches.text must be a string (main captured content)');
      }
      if (!c.hasText && Object.prototype.hasOwnProperty.call(event.matches, 'text')) {
        errors.push(ev + ': should NOT carry a "text" key (no inner content)');
      }
      if (event.attributes === null || typeof event.attributes !== 'object') {
        errors.push(ev + ': attributes must be an object');
      }
    }

    function validateHashEvent (c, event, errors) {
      let ev = c.event + '.onHash';
      if (!showdown.helper.isString(event.input)) {
        errors.push(ev + ': input must be a string');
      }
      if (!showdown.helper.isString(event.output)) {
        errors.push(ev + ': output must be a string');
      }
    }

    function run (opts, errors, fired) {
      let conv = new showdown.Converter(opts);
      /* jshint -W083 */
      captureConstructs.forEach(function (c) {
        conv.listen(c.event + '.onCapture', function (event) {
          fired[c.event] = true;
          validateCaptureEvent(c, event, errors);
          return event;
        });
        conv.listen(c.event + '.onHash', function (event) {
          validateHashEvent(c, event, errors);
          return event;
        });
      });
      /* jshint +W083 */
      conv.makeHtml(conformanceMd);
    }

    it('every capture/hash event emitted matches the payload contract', function () {
      let errors = [],
          fired = {},
          kitchen = {
            strikethrough: true, tables: true, ghCodeBlocks: true, tasklists: true,
            ghMentions: true, emoji: true, underline: true, ellipsis: true, metadata: true,
            simplifiedAutoLink: true, parseImgDimensions: true, footnotes: true,
            disallowRawHTML: true
          };
      run(kitchen, errors, fired);
      run(showdown.getFlavorOptions('commonmark'), errors, fired);
      expect(errors).toEqual([]);
    });

    it('the core capture constructs each fire at least once', function () {
      let errors = [],
          fired = {},
          kitchen = {
            strikethrough: true, tables: true, ghCodeBlocks: true, tasklists: true,
            ghMentions: true, emoji: true, underline: true, ellipsis: true, metadata: true,
            simplifiedAutoLink: true, parseImgDimensions: true, footnotes: true,
            disallowRawHTML: true
          };
      run(kitchen, errors, fired);
      run(showdown.getFlavorOptions('commonmark'), errors, fired);
      // a representative core set that the document above must exercise across both flavors
      let core = [
        'makehtml.strikethrough', 'makehtml.underline', 'makehtml.ellipsis', 'makehtml.emoji',
        'makehtml.codeSpan', 'makehtml.horizontalRule', 'makehtml.heading.atx',
        'makehtml.heading.setext', 'makehtml.blockquote', 'makehtml.codeBlock',
        'makehtml.githubCodeBlock', 'makehtml.metadata', 'makehtml.table', 'makehtml.table.header',
        'makehtml.table.cell', 'makehtml.link.inline', 'makehtml.link.reference',
        'makehtml.link.autolink', 'makehtml.link.ghMention',
        'makehtml.image.inline', 'makehtml.image.reference', 'makehtml.emphasis',
        'makehtml.strong', 'makehtml.list', 'makehtml.list.listItem',
        'makehtml.list.taskListItem', 'makehtml.list.taskListItem.checkbox',
        'makehtml.stripLinkDefinitions', 'makehtml.paragraphs', 'makehtml.htmlBlock',
        'makehtml.footnotes.definition', 'makehtml.footnotes.reference',
        'makehtml.disallowedHtmlTags', 'makehtml.heading.id',
        // the inline scan constructs with no pass form of their own
        'makehtml.rawHtml', 'makehtml.entity', 'makehtml.backslash', 'makehtml.hardLineBreak'
      ];
      let missing = core.filter(function (name) { return !fired[name]; });
      expect(missing).toEqual([]);
    });
  });

  // Mutation honoring: a listener that rewrites matches.text in an onCapture handler must be
  // reflected in the construct's rendered output. Covers a representative sample of the
  // constructs the D3 sweep taught to read matches.text back when building their output.
  describe('matches.text mutation honoring', function () {

    function mutate (opts, event, md, newText) {
      return new showdown.Converter(opts)
        .listen(event, function (e) { e.matches.text = newText; return e; })
        .makeHtml(md);
    }

    it('strikethrough honors a rewritten matches.text', function () {
      expect(mutate({strikethrough: true}, 'makehtml.strikethrough.onCapture', '~~foo~~', 'BAR'))
        .toContain('<del>BAR</del>');
    });

    it('underline honors a rewritten matches.text', function () {
      expect(mutate({underline: true}, 'makehtml.underline.onCapture', '__foo__', 'BAR'))
        .toContain('<u>BAR</u>');
    });

    it('ellipsis honors a rewritten matches.text', function () {
      expect(mutate({ellipsis: true}, 'makehtml.ellipsis.onCapture', 'x...y', 'a...b'))
        .toContain('a…b');
    });

    it('emoji honors a rewritten matches.text', function () {
      let heart = new showdown.Converter({emoji: true}).makeHtml(':heart:');
      expect(mutate({emoji: true}, 'makehtml.emoji.onCapture', ':smile:', 'heart'))
        .toBe(heart);
    });

    it('heading honors a rewritten matches.text', function () {
      expect(mutate({}, 'makehtml.heading.atx.onCapture', '# foo', 'BAR'))
        .toMatch(/<h1[^>]*>BAR<\/h1>/);
    });

    it('codeSpan honors a rewritten matches.text', function () {
      expect(mutate({}, 'makehtml.codeSpan.onCapture', '`foo`', 'BAR'))
        .toContain('<code>BAR</code>');
    });

    it('link (inline) honors a rewritten matches.text', function () {
      expect(mutate({}, 'makehtml.link.inline.onCapture', '[foo](https://x.com)', 'BAR'))
        .toMatch(/<a href="https:\/\/x\.com">BAR<\/a>/);
    });

    it('image (inline) honors a rewritten matches.text', function () {
      expect(mutate({}, 'makehtml.image.inline.onCapture', '![foo](pic.png)', 'BAR'))
        .toContain('alt="BAR"');
    });

    it('table cell honors a rewritten matches.text', function () {
      let out = mutate({tables: true}, 'makehtml.table.cell.onCapture',
        '| h1 | h2 |\n|----|----|\n| a  | b  |', 'BAR');
      expect(out).toContain('<td>BAR</td>');
    });

    it('paragraphs honors a rewritten matches.text', function () {
      expect(mutate({}, 'makehtml.paragraphs.onCapture', 'foo', '**BAR**'))
        .toContain('<p><strong>BAR</strong></p>');
    });
  });

  // D10 taxonomy: assert the complete expected phase set per class. Constructs emit all four
  // phases (checked elsewhere); here we lock down the two other classes and the deliberate
  // exceptions so a future change can't silently re-add (or drop) an event.
  describe('taxonomy phase coverage', function () {

    // Register listeners for all four phases of `name` and return which fired after converting
    // `md` with the given options.
    function firedPhases (name, opts, md) {
      let fired = {},
          conv = new showdown.Converter(opts);
      /* jshint -W083 */
      ['onStart', 'onEnd', 'onCapture', 'onHash'].forEach(function (phase) {
        conv.listen('makehtml.' + name + '.' + phase, function (e) { fired[phase] = true; return e; });
      });
      /* jshint +W083 */
      conv.makeHtml(md);
      return fired;
    }

    // A feature-rich document that exercises the demoted mechanisms and the dispatchers.
    let richMd = [
      '# heading', '', 'para with `code`, **bold**, a <span>tag</span> and \\* an escape.', '',
      '    indented code', '', '<div>raw block</div>', '', '> quote', '', '- item', ''
    ].join('\n');

    // The demoted mechanism passes + blockGamut (dispatcher) + decodeEntities + the deleted
    // hashElement/runExtension/spanGamut: none of these may emit ANY of the four events, in any
    // flavor. (inlineEngine is NOT here: it owns the inline-pass lifecycle.)
    let noEventNames = [
      'blockGamut', 'decodeEntities', 'spanGamut',
      'encodeAmpsAndAngles', 'encodeBackslashEscapes', 'encodeCode',
      'escapeSpecialCharsWithinTagAttributes', 'unescapeSpecialChars',
      'hashBlock', 'hashCodeTags', 'hashPreCodeTags', 'hashHTMLBlocks',
      'hashHTMLSpans', 'unhashHTMLSpans', 'hashElement', 'runExtension',
      'hardLineBreaks'
    ];

    /* jshint -W083 */
    noEventNames.forEach(function (name) {
      it(name + ' emits no events (demoted to a helper / dispatcher / deleted)', function () {
        let def = firedPhases(name, {tables: true, ghCodeBlocks: true, completeHTMLDocument: true}, richMd),
            cm = firedPhases(name, showdown.getFlavorOptions('commonmark'), richMd);
        expect(Object.keys(def)).toEqual([]);
        expect(Object.keys(cm)).toEqual([]);
      });
    });
    /* jshint +W083 */

    it('completeHTMLDocument is lifecycle-only (onStart/onEnd, no capture/hash)', function () {
      let fired = firedPhases('completeHTMLDocument', {completeHTMLDocument: true}, richMd);
      expect(fired.onStart).toBe(true);
      expect(fired.onEnd).toBe(true);
      expect(fired.onCapture).toBeUndefined();
      expect(fired.onHash).toBeUndefined();
    });

    it('inlineEngine is lifecycle-only (onStart/onEnd, no capture/hash)', function () {
      let fired = firedPhases('inlineEngine', showdown.getFlavorOptions('commonmark'), richMd);
      expect(fired.onStart).toBe(true);
      expect(fired.onEnd).toBe(true);
      expect(fired.onCapture).toBeUndefined();
      expect(fired.onHash).toBeUndefined();
    });

    it('heading.id is capture-only (onCapture, no lifecycle/hash)', function () {
      let fired = firedPhases('heading.id', {headerIds: true}, '# a heading');
      expect(fired.onCapture).toBe(true);
      expect(fired.onStart).toBeUndefined();
      expect(fired.onEnd).toBeUndefined();
      expect(fired.onHash).toBeUndefined();
    });
  });

  // D10 new capture events: the per-match constructs that gained a capture surface, plus the
  // heading.id custom-slug hook. Each needs its own converter (special options).
  describe('new capture events', function () {

    it('disallowedHtmlTags fires per-tag capture/hash and a listener can whitelist a tag', function () {
      let captured = [];
      let out = new showdown.Converter({disallowRawHTML: true})
        .listen('makehtml.disallowedHtmlTags.onCapture', function (e) {
          captured.push(e.matches.text);
          // whitelist <script> by returning it unescaped (output precedence)
          if (/^<script/i.test(e.matches.text)) { e.output = e.matches.text; }
          return e;
        })
        .makeHtml('<script>a</script> and <iframe></iframe>');
      // both the opening <script and the <iframe were seen
      expect(captured).toContain('<script');
      expect(captured).toContain('<iframe');
      // the whitelisted <script survived unescaped, the iframe was neutralized
      expect(out).toContain('<script>');
      expect(out).toContain('&lt;iframe');
    });

    it('footnotes fire per-definition and per-reference capture events', function () {
      let defBodies = [], refLabels = [];
      new showdown.Converter({footnotes: true})
        .listen('makehtml.footnotes.definition.onCapture', function (e) { defBodies.push(e.matches.text); return e; })
        .listen('makehtml.footnotes.reference.onCapture', function (e) { refLabels.push(e.matches._rawLabel); return e; })
        .makeHtml('A note.[^a]\n\n[^a]: the body\n');
      expect(defBodies).toContain('the body');
      expect(refLabels).toContain('a');
    });

    it('footnotes definition honors a rewritten body via matches.text', function () {
      let out = new showdown.Converter({footnotes: true})
        .listen('makehtml.footnotes.definition.onCapture', function (e) { e.matches.text = 'REPLACED'; return e; })
        .makeHtml('A note.[^a]\n\n[^a]: original\n');
      expect(out).toContain('REPLACED');
      expect(out).not.toContain('original');
    });

    it('footnotes reference output can be overridden by a listener', function () {
      let out = new showdown.Converter({footnotes: true})
        .listen('makehtml.footnotes.reference.onCapture', function (e) { e.output = '<b>REF</b>'; return e; })
        .makeHtml('A note.[^a]\n\n[^a]: body\n');
      expect(out).toContain('<b>REF</b>');
    });

    it('heading.id capture exposes the generated id and honors a custom slug', function () {
      let seen;
      let out = new showdown.Converter({headerIds: true})
        .listen('makehtml.heading.id.onCapture', function (e) {
          seen = e.matches.text;            // the generated slug
          e.matches.text = 'custom-slug';    // custom-slugify
          return e;
        })
        .makeHtml('# My Heading');
      expect(seen).toBe('my-heading');
      expect(out).toMatch(/<h1 id="custom-slug">/);
    });
  });

  // makeMarkdown event-contract conformance: drive makeMarkdown() over a feature-rich HTML
  // document and assert the payload shape of every capture event against the D11 contract —
  // regexp is ALWAYS null, attributes is ALWAYS null (markdown output has no HTML attributes),
  // matches carries the read-only `_wholeMatch`/`_node` context, and `text` is present iff the
  // construct has inner content. The recursive `node` dispatcher is the documented exception:
  // it emits a capture (the override hook for comments / unknown elements) but carries no text.
  describe('makeMarkdown event contract conformance', function () {

    let captureConstructs = [
      { event: 'makeMarkdown.blockquote', hasText: true },
      { event: 'makeMarkdown.break', hasText: false },
      { event: 'makeMarkdown.codeBlock', hasText: true },
      { event: 'makeMarkdown.codeSpan', hasText: true },
      { event: 'makeMarkdown.emphasis', hasText: true },
      { event: 'makeMarkdown.footnotes', hasText: true },
      { event: 'makeMarkdown.header', hasText: true },
      { event: 'makeMarkdown.hr', hasText: false },
      { event: 'makeMarkdown.image', hasText: true },
      { event: 'makeMarkdown.input', hasText: false },
      { event: 'makeMarkdown.links', hasText: true },
      { event: 'makeMarkdown.list', hasText: true },
      { event: 'makeMarkdown.listItem', hasText: true },
      { event: 'makeMarkdown.node', hasText: false },
      { event: 'makeMarkdown.paragraph', hasText: true },
      { event: 'makeMarkdown.pre', hasText: true },
      { event: 'makeMarkdown.strikethrough', hasText: true },
      { event: 'makeMarkdown.strong', hasText: true },
      { event: 'makeMarkdown.table', hasText: true },
      { event: 'makeMarkdown.tableCell', hasText: true },
      { event: 'makeMarkdown.txt', hasText: true },
      { event: 'makeMarkdown.underline', hasText: true }
    ];

    // an HTML document that, converted below, exercises every construct above
    let conformanceHtml =
      '<h1>heading</h1>' +
      '<p>para <em>em</em> <strong>s</strong> <code>c</code> <del>d</del> <u>u</u> ' +
      '<a href="https://x.com" title="t">l</a> <img src="pic.png" alt="a" title="ti"> line<br>break ' +
      'a note<sup class="footnote-ref"><a href="#fn-a">1</a></sup>.</p>' +
      '<blockquote><p>quote</p></blockquote>' +
      '<pre><code class="language-js">var a = 1;</code></pre>' +
      '<pre>raw pre</pre>' +
      '<hr>' +
      '<ul><li>item</li><li><input type="checkbox" checked> task</li></ul>' +
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>cell</td></tr></tbody></table>' +
      '<section class="footnotes"><ol><li id="fn-a">the body<a class="footnote-backref" href="#">back</a></li></ol></section>';

    let opts = {
      tables: true, tasklists: true, strikethrough: true, underline: true, emoji: true,
      ghMentions: true, ghCodeBlocks: true, parseImgDimensions: true, footnotes: true, ellipsis: true
    };

    function validateCapture (c, event, errors) {
      let ev = c.event + '.onCapture';
      if (event.output !== null) {
        errors.push(ev + ': output must be null on capture, got ' + JSON.stringify(event.output));
      }
      if (event.regexp !== null) {
        errors.push(ev + ': regexp must be null (makeMarkdown captures are node-based)');
      }
      if (event.attributes !== null) {
        errors.push(ev + ': attributes must be null (markdown output has no attributes)');
      }
      if (event.matches === null || typeof event.matches !== 'object') {
        errors.push(ev + ': matches must be an object');
      } else {
        if (!Object.prototype.hasOwnProperty.call(event.matches, '_wholeMatch')) {
          errors.push(ev + ': matches must include a "_wholeMatch" key');
        }
        if (!Object.prototype.hasOwnProperty.call(event.matches, '_node')) {
          errors.push(ev + ': matches must include a read-only "_node" key');
        }
      }
      if (c.hasText && typeof event.matches.text !== 'string') {
        errors.push(ev + ': matches.text must be a string (main captured content)');
      }
      if (!c.hasText && Object.prototype.hasOwnProperty.call(event.matches, 'text')) {
        errors.push(ev + ': should NOT carry a "text" key (no inner content)');
      }
    }

    it('every makeMarkdown capture event matches the payload contract', function () {
      let errors = [],
          fired = {},
          conv = new showdown.Converter(opts);
      /* jshint -W083 */
      captureConstructs.forEach(function (c) {
        conv.listen(c.event + '.onCapture', function (event) {
          fired[c.event] = true;
          validateCapture(c, event, errors);
          return event;
        });
      });
      /* jshint +W083 */
      conv.makeMarkdown(conformanceHtml);
      expect(errors).toEqual([]);
      let missing = captureConstructs.filter(function (c) { return !fired[c.event]; })
        .map(function (c) { return c.event; });
      expect(missing).toEqual([]);
    });

    it('makeMarkdown constructs are three-phase (onStart/onCapture/onEnd, never onHash)', function () {
      let phases = {},
          conv = new showdown.Converter(opts);
      /* jshint -W083 */
      ['onStart', 'onCapture', 'onEnd', 'onHash'].forEach(function (phase) {
        conv.listen('makeMarkdown.header.' + phase, function (e) { phases[phase] = true; return e; });
      });
      /* jshint +W083 */
      conv.makeMarkdown('<h1>foo</h1>');
      expect(phases.onStart).toBe(true);
      expect(phases.onCapture).toBe(true);
      expect(phases.onEnd).toBe(true);
      expect(phases.onHash).toBeUndefined();
    });

    it('the node dispatcher exception is three-phase with a capture but no text/hash', function () {
      let phases = {},
          hadText = false,
          conv = new showdown.Converter(opts);
      /* jshint -W083 */
      ['onStart', 'onCapture', 'onEnd', 'onHash'].forEach(function (phase) {
        conv.listen('makeMarkdown.node.' + phase, function (e) { phases[phase] = true; return e; });
      });
      /* jshint +W083 */
      conv.listen('makeMarkdown.node.onCapture', function (e) {
        if (Object.prototype.hasOwnProperty.call(e.matches, 'text')) { hadText = true; }
        return e;
      });
      conv.makeMarkdown('<p>foo</p><!-- a comment -->');
      expect(phases.onStart).toBe(true);
      expect(phases.onCapture).toBe(true);
      expect(phases.onEnd).toBe(true);
      expect(phases.onHash).toBeUndefined();
      expect(hadText).toBe(false);
    });

    it('a makeMarkdown capture with a RegExp or an attributes object throws (validator shape)', function () {
      let globals = { converter: new showdown.Converter() };
      expect(function () {
        showdown.Event.dispatchCapture('makeMarkdown.header.onCapture', 'x',
          { regexp: /x/, matches: { _wholeMatch: 'x' } }, {}, globals);
      }).toThrow();
      expect(function () {
        showdown.Event.dispatchCapture('makeMarkdown.header.onCapture', 'x',
          { matches: { _wholeMatch: 'x' }, attributes: {} }, {}, globals);
      }).toThrow();
    });
  });

  // makeMarkdown mutation honoring: a listener that rewrites matches.text (or a descriptive
  // extra like `url`) on an onCapture handler must be reflected in the rendered markdown.
  describe('makeMarkdown matches mutation honoring', function () {

    function mutateMd (opts, event, html, mutator) {
      return new showdown.Converter(opts)
        .listen(event, function (e) { mutator(e); return e; })
        .makeMarkdown(html);
    }

    it('links honors a rewritten matches.url', function () {
      let out = mutateMd({}, 'makeMarkdown.links.onCapture', '<p><a href="https://x.com">link</a></p>',
        function (e) { e.matches.url = 'https://y.com'; });
      expect(out).toContain('https://y.com');
      expect(out).not.toContain('https://x.com');
    });

    it('header honors a rewritten matches.text', function () {
      let out = mutateMd({}, 'makeMarkdown.header.onCapture', '<h1>foo</h1>',
        function (e) { e.matches.text = 'BAR'; });
      expect(out).toContain('# BAR');
    });

    it('emphasis honors a rewritten matches.text', function () {
      let out = mutateMd({}, 'makeMarkdown.emphasis.onCapture', '<p><em>foo</em></p>',
        function (e) { e.matches.text = 'BAR'; });
      expect(out).toContain('*BAR*');
    });

    it('txt honors a rewritten matches.text', function () {
      let out = mutateMd({}, 'makeMarkdown.txt.onCapture', '<p>foo</p>',
        function (e) { e.matches.text = 'BAR'; });
      expect(out).toContain('BAR');
    });

    it('image honors a rewritten alt via matches.text', function () {
      let out = mutateMd({}, 'makeMarkdown.image.onCapture', '<p><img src="pic.png" alt="foo"></p>',
        function (e) { e.matches.text = 'BAR'; });
      expect(out).toContain('![BAR]');
    });
  });

  // makeMarkdown output-precedence: the override that used to live on onStart now lives on
  // onCapture (a breaking change for RC listeners). onStart is pure lifecycle again.
  describe('makeMarkdown onCapture output override', function () {

    it('setting output on onCapture replaces the default rendering', function () {
      let out = new showdown.Converter()
        .listen('makeMarkdown.header.onCapture', function (e) { e.output = 'OVERRIDDEN'; return e; })
        .makeMarkdown('<h1>foo</h1>');
      expect(out).toContain('OVERRIDDEN');
      expect(out).not.toContain('# foo');
    });

    it('setting output on onStart NO LONGER overrides the rendering (moved to onCapture)', function () {
      let out = new showdown.Converter()
        .listen('makeMarkdown.header.onStart', function (e) { e.output = 'SHOULD NOT APPLY'; return e; })
        .makeMarkdown('<h1>foo</h1>');
      expect(out).toContain('# foo');
      expect(out).not.toContain('SHOULD NOT APPLY');
    });

    it('onStart can still rewrite the input by mutating the live node via matches._node', function () {
      let out = new showdown.Converter()
        .listen('makeMarkdown.header.onStart', function (e) { e.matches._node.textContent = 'MUTATED'; return e; })
        .makeMarkdown('<h1>foo</h1>');
      expect(out).toContain('# MUTATED');
    });
  });

  // The inline engine's CommonMark links/images dispatch the SAME event families as every other
  // flavor — makehtml.link.<variant>.* / makehtml.image.<variant>.* — so listener extensions
  // behave identically across flavors. There is a single event stream, fully covered by the
  // generic conformance/coverage suites above; these tests additionally pin the commonmark
  // flavor's links/images specifically.
  describe('inline engine link/image events (commonmark flavor)', function () {

    function cm (register) {
      let conv = new showdown.Converter(showdown.getFlavorOptions('commonmark'));
      register(conv);
      return conv;
    }

    it('an inline link fires onCapture with a contract-conformant payload', function () {
      let ev = null;
      cm(function (c) {
        c.listen('makehtml.link.inline.onCapture', function (e) { ev = e; return e; });
      }).makeHtml('[foo](https://x.com "t")');
      expect(ev).not.toBe(null);
      expect(ev.output).toBe(null);
      expect(ev.regexp).toBe(null);
      expect(ev.matches._wholeMatch).toBe('[foo](https://x.com "t")');
      expect(typeof ev.matches.text).toBe('string');
      expect(ev.matches._url).toBe('https://x.com');
      expect(ev.attributes.href).toBe('https://x.com');
      expect(ev.attributes.title).toBe('t');
    });

    it('a reference link fires makehtml.link.reference.onCapture', function () {
      let wm = null;
      cm(function (c) {
        c.listen('makehtml.link.reference.onCapture', function (e) { wm = e.matches._wholeMatch; return e; });
      }).makeHtml('[foo][1]\n\n[1]: https://r.com');
      expect(wm).toBe('[foo][1]');
    });

    it('an inline image fires makehtml.image.inline.onCapture with src/alt attributes', function () {
      let ev = null;
      cm(function (c) {
        c.listen('makehtml.image.inline.onCapture', function (e) { ev = e; return e; });
      }).makeHtml('![alt](pic.png "cap")');
      expect(ev).not.toBe(null);
      expect(ev.matches._wholeMatch).toBe('![alt](pic.png "cap")');
      expect(ev.attributes.src).toBe('pic.png');
      expect(ev.attributes.alt).toBe('alt');
      expect(ev.attributes.title).toBe('cap');
    });

    it('a reference image fires makehtml.image.reference.onCapture', function () {
      let wm = null;
      cm(function (c) {
        c.listen('makehtml.image.reference.onCapture', function (e) { wm = e.matches._wholeMatch; return e; });
      }).makeHtml('![alt][1]\n\n[1]: https://r.com/i.png');
      expect(wm).toBe('![alt][1]');
    });

    it('onHash fires for links and images', function () {
      let linkHash = false, imageHash = false;
      cm(function (c) {
        c.listen('makehtml.link.inline.onHash', function (e) { linkHash = true; return e; });
        c.listen('makehtml.image.inline.onHash', function (e) { imageHash = true; return e; });
      }).makeHtml('[foo](https://x.com) and ![alt](pic.png)');
      expect(linkHash).toBe(true);
      expect(imageHash).toBe(true);
    });

    it('a link honors a rewritten matches.text', function () {
      let out = cm(function (c) {
        c.listen('makehtml.link.inline.onCapture', function (e) { e.matches.text = 'BAR'; return e; });
      }).makeHtml('[foo](https://x.com)');
      expect(out).toMatch(/<a href="https:\/\/x\.com">BAR<\/a>/);
    });

    it('an image honors a rewritten alt via matches.text', function () {
      let out = cm(function (c) {
        c.listen('makehtml.image.inline.onCapture', function (e) { e.matches.text = 'NEWALT'; return e; });
      }).makeHtml('![orig](pic.png)');
      expect(out).toContain('alt="NEWALT"');
      expect(out).not.toContain('alt="orig"');
    });

    it('a listener can add an anchor attribute (honored via _populateAttributes)', function () {
      let out = cm(function (c) {
        c.listen('makehtml.link.inline.onCapture', function (e) { e.attributes.rel = 'nofollow'; return e; });
      }).makeHtml('[foo](https://x.com)');
      expect(out).toContain('rel="nofollow"');
    });

    it('setting output on onCapture overrides the rendered link', function () {
      let out = cm(function (c) {
        c.listen('makehtml.link.inline.onCapture', function (e) { e.output = '<OVERRIDE>'; return e; });
      }).makeHtml('[foo](https://x.com)');
      expect(out).toContain('<OVERRIDE>');
      expect(out).not.toContain('<a href');
    });

    it('setting output on onCapture overrides the rendered image', function () {
      let out = cm(function (c) {
        c.listen('makehtml.image.inline.onCapture', function (e) { e.output = '<IMGOVERRIDE>'; return e; });
      }).makeHtml('![alt](pic.png)');
      expect(out).toContain('<IMGOVERRIDE>');
      expect(out).not.toContain('<img');
    });
  });
});
