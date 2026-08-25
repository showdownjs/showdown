/**
 * Listener (event) behavior of the inline constructs: ellipsis, emoji, codeSpan, entity and
 * backslash. Pins the event-precedence contract, which is the same for every construct:
 *
 *  1. a listener that sets `event.output` wins outright and its output flows raw;
 *  2. a listener that edits `event.matches.text` has the edit RENDERED BY THE CONSTRUCT'S
 *     NORMAL RULES (emoji re-looks-up the shortcode, codeSpan re-encodes and wraps, ellipsis
 *     re-substitutes, entity re-decodes, backslash re-classifies; a multi-char edit
 *     has no derivation, so the edit replaces the output);
 *  3. an untouched event commits the construct's default;
 *  4. a declined trigger emits no events at all.
 *
 * These tests describe the live inline world: the engine (src/subParsers/makehtml/inlineEngine.js)
 * and its constructs (src/subParsers/makehtml/inline/). Every case here runs against the real
 * conversion pipeline — there are no expected failures.
 *
 * Event-surface notes worth keeping in view while reading:
 *  - every construct here is a SCAN construct, so it emits capture/hash only; the surrounding
 *    onStart/onEnd lifecycle belongs to `makehtml.inlineEngine`;
 *  - `<uri>`/`<email>`/`<www...>` and the simplifiedAutoLink naked URLs share ONE variant,
 *    `makehtml.link.autolink.*` (the old `angleBrackets` variant is retired);
 *  - @-mentions fire `makehtml.link.ghMention.*` (they no longer route through `link.reference`);
 *  - the hard break is the SINGULAR `makehtml.hardLineBreak.*` family (the plural whole-text
 *    `makehtml.hardLineBreaks` pass is gone);
 *  - `rawHtml`, `entity` and `backslash` each own a variant-less capture family of their own.
 */
describe('inline construct listener behavior', function () {
  'use strict';

  // spy that records whether the named events fired, plus the last capture payload
  function spyOn (converter, family) {
    let spy = {captured: false, hashed: false, matches: null, wholeMatch: null, hashInput: null};
    converter.listen(family + '.onCapture', function (event) {
      spy.captured = true;
      spy.matches = event.matches;
      spy.wholeMatch = event.wholeMatch;
      return event;
    });
    converter.listen(family + '.onHash', function (event) {
      spy.hashed = true;
      spy.hashInput = event.input;
      return event;
    });
    return spy;
  }

  describe('ellipsis', function () {

    it('substitutes ... by default', function () {
      let converter = new showdown.Converter({ellipsis: true});
      expect(converter.makeHtml('a...b')).toBe('<p>a…b</p>');
    });

    it('fires onCapture with the source dots and onHash with the substitution', function () {
      let converter = new showdown.Converter({ellipsis: true}),
          spy = spyOn(converter, 'makehtml.ellipsis');
      converter.makeHtml('a...b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('...');
      expect(spy.matches.text).toBe('...');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('…');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({ellipsis: true})
        .listen('makehtml.ellipsis.onCapture', function (event) {
          event.output = '<span>…!</span>';
          return event;
        });
      expect(converter.makeHtml('a...b')).toBe('<p>a<span>…!</span>b</p>');
    });

    it('an edited matches.text is re-substituted', function () {
      let converter = new showdown.Converter({ellipsis: true})
        .listen('makehtml.ellipsis.onCapture', function (event) {
          event.matches.text = '....';
          return event;
        });
      // the substitution re-runs on the edited text: the first three dots collapse, the fourth survives
      expect(converter.makeHtml('a...b')).toBe('<p>a….b</p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter({ellipsis: true})
        .listen('makehtml.ellipsis.onHash', function (event) {
          event.output = 'DOTS';
          return event;
        });
      expect(converter.makeHtml('a...b')).toBe('<p>aDOTSb</p>');
    });

    it('two dots decline and emit nothing', function () {
      let converter = new showdown.Converter({ellipsis: true}),
          spy = spyOn(converter, 'makehtml.ellipsis');
      expect(converter.makeHtml('a..b')).toBe('<p>a..b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });
  });

  describe('emoji', function () {

    it('substitutes a known shortcode by default', function () {
      let converter = new showdown.Converter({emoji: true});
      expect(converter.makeHtml('a :smile: b')).toBe('<p>a 😄 b</p>');
    });

    it('fires onCapture with the shortcode (without colons) as text', function () {
      let converter = new showdown.Converter({emoji: true}),
          spy = spyOn(converter, 'makehtml.emoji');
      converter.makeHtml('a :smile: b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe(':smile:');
      expect(spy.matches.text).toBe('smile');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('😄');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({emoji: true})
        .listen('makehtml.emoji.onCapture', function (event) {
          event.output = '<b>GRIN</b>';
          return event;
        });
      expect(converter.makeHtml('a :smile: b')).toBe('<p>a <b>GRIN</b> b</p>');
    });

    it('an edited matches.text redirects the shortcode (the lookup re-runs)', function () {
      let converter = new showdown.Converter({emoji: true})
        .listen('makehtml.emoji.onCapture', function (event) {
          event.matches.text = 'heart';
          return event;
        });
      expect(converter.makeHtml('a :smile: b')).toBe('<p>a ❤️ b</p>');
    });

    it('an image-based emoji renders its <img> tag', function () {
      let converter = new showdown.Converter({emoji: true}),
          html = converter.makeHtml('a :octocat: b');
      expect(html).toContain('<img');
      expect(html).toContain('octocat');
    });

    it('an unknown shortcode declines and emits nothing', function () {
      let converter = new showdown.Converter({emoji: true}),
          spy = spyOn(converter, 'makehtml.emoji');
      expect(converter.makeHtml('a :notanemoji: b')).toBe('<p>a :notanemoji: b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter({emoji: true})
        .listen('makehtml.emoji.onHash', function (event) {
          event.output = 'GLYPH';
          return event;
        });
      expect(converter.makeHtml('a :smile: b')).toBe('<p>a GLYPH b</p>');
    });
  });

  describe('codeSpan', function () {

    it('builds an encoded <code> span by default', function () {
      let converter = new showdown.Converter();
      expect(converter.makeHtml('a `foo` b')).toBe('<p>a <code>foo</code> b</p>');
    });

    it('fires onCapture with the trimmed content as text', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.codeSpan');
      converter.makeHtml('a `foo` b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('`foo`');
      expect(spy.matches.text).toBe('foo');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('<code>foo</code>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.codeSpan.onCapture', function (event) {
          event.output = '<kbd>foo</kbd>';
          return event;
        });
      expect(converter.makeHtml('a `foo` b')).toBe('<p>a <kbd>foo</kbd> b</p>');
    });

    it('an edited matches.text is re-encoded and re-wrapped', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.codeSpan.onCapture', function (event) {
          event.matches.text = 'ba<r';
          return event;
        });
      expect(converter.makeHtml('a `foo` b')).toBe('<p>a <code>ba&lt;r</code> b</p>');
    });

    it('a backtick run without a closer declines and emits nothing', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.codeSpan');
      expect(converter.makeHtml('a `b')).toBe('<p>a `b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.codeSpan.onHash', function (event) {
          event.output = '<samp>X</samp>';
          return event;
        });
      expect(converter.makeHtml('a `foo` b')).toBe('<p>a <samp>X</samp> b</p>');
    });
  });

  describe('entity', function () {

    it('keeps a valid reference verbatim in the Showdown flavors', function () {
      let converter = new showdown.Converter();
      expect(converter.makeHtml('a &copy; b')).toBe('<p>a &copy; b</p>');
    });

    it('decodes a valid reference under decodeEntities', function () {
      let converter = new showdown.Converter({decodeEntities: true});
      expect(converter.makeHtml('a &copy; b')).toBe('<p>a © b</p>');
    });

    it('a decoded HTML-special character stays escaped', function () {
      let converter = new showdown.Converter({decodeEntities: true});
      expect(converter.makeHtml('a &#60; b')).toBe('<p>a &lt; b</p>');
    });

    it('fires onCapture with the whole reference as text', function () {
      let converter = new showdown.Converter({decodeEntities: true}),
          spy = spyOn(converter, 'makehtml.entity');
      converter.makeHtml('a &copy; b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('&copy;');
      expect(spy.matches.text).toBe('&copy;');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('©');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({decodeEntities: true})
        .listen('makehtml.entity.onCapture', function (event) {
          event.output = '(c)';
          return event;
        });
      expect(converter.makeHtml('a &copy; b')).toBe('<p>a (c) b</p>');
    });

    it('an edited matches.text is re-decoded on the decoding path', function () {
      let converter = new showdown.Converter({decodeEntities: true})
        .listen('makehtml.entity.onCapture', function (event) {
          event.matches.text = '&reg;';
          return event;
        });
      expect(converter.makeHtml('a &copy; b')).toBe('<p>a ® b</p>');
    });

    it('an edited matches.text stays verbatim on the verbatim path', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.entity.onCapture', function (event) {
          event.matches.text = '&reg;';
          return event;
        });
      expect(converter.makeHtml('a &copy; b')).toBe('<p>a &reg; b</p>');
    });

    it('an unknown named reference declines and emits nothing', function () {
      let converter = new showdown.Converter({decodeEntities: true}),
          spy = spyOn(converter, 'makehtml.entity');
      converter.makeHtml('a &notarealentity; b');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    it('a bare ampersand declines and emits nothing', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.entity');
      converter.makeHtml('a & b');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    // Contract: underscore-prefixed matches keys are read-only CONTEXT. The dispatch path defines
    // them non-writable, so a strict-mode listener that assigns to one throws a TypeError instead
    // of silently editing the payload (a listener wanting to change the rendering edits `text`).
    it('matches._wholeMatch is read-only (a strict-mode assignment throws)', function () {
      let converter = new showdown.Converter({decodeEntities: true})
        .listen('makehtml.entity.onCapture', function (event) {
          event.matches._wholeMatch = 'HACK';
          return event;
        });
      expect(function () { converter.makeHtml('a &copy; b'); }).toThrow(TypeError);
    });
  });

  describe('backslash', function () {

    // `\`+newline is NOT a backslash arm: it is the backslash SPELLING of a hard line break,
    // owned by inline/hardLineBreak.js (maintainer ruling) — the backslash construct declines it
    // and fires nothing. Its listener contract lives in the hardLineBreak describe below.
    it('declines backslash+newline and emits nothing (hardLineBreak owns that spelling)', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.backslash');
      expect(converter.makeHtml('a\\\nb')).toBe('<p>a<br />\nb</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    describe('escaped-dollar arm', function () {

      it('renders a literal $ by default', function () {
        let converter = new showdown.Converter();
        expect(converter.makeHtml('a\\$b')).toBe('<p>a$b</p>');
      });

      it('presents the user-facing source, never the internal sentinel', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.backslash');
        converter.makeHtml('a\\$b');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('\\$');
        expect(spy.matches.text).toBe('$');
      });

      it('an edited matches.text is re-classified (protected literal)', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.backslash.onCapture', function (event) {
            event.matches.text = '%';
            return event;
          });
        expect(converter.makeHtml('a\\$b')).toBe('<p>a%b</p>');
      });
    });

    describe('escaped-punctuation arm', function () {

      it('renders the protected literal character by default', function () {
        let converter = new showdown.Converter();
        expect(converter.makeHtml('a\\*b')).toBe('<p>a*b</p>');
      });

      it('fires onCapture with the escaped character as text', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.backslash');
        converter.makeHtml('a\\*b');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('\\*');
        expect(spy.matches.text).toBe('*');
      });

      it('an edited HTML-special character stays literal and is entity-escaped', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.backslash.onCapture', function (event) {
            event.matches.text = '<';
            return event;
          });
        expect(converter.makeHtml('a\\*b')).toBe('<p>a&lt;b</p>');
      });

      it('an edited ordinary character goes through the placeholder path', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.backslash.onCapture', function (event) {
            event.matches.text = 'q';
            return event;
          });
        expect(converter.makeHtml('a\\*b')).toBe('<p>aqb</p>');
      });

      it('a multi-char edit passes through as-is (no single character to classify)', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.backslash.onCapture', function (event) {
            event.matches.text = 'abc';
            return event;
          });
        expect(converter.makeHtml('a\\*b')).toBe('<p>aabcb</p>');
      });
    });

    it('a non-escapable character declines and emits nothing', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.backslash');
      expect(converter.makeHtml('a\\qb')).toBe('<p>a\\qb</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });
  });

  // hardLineBreak owns the `\n` character: the two-space spelling, the backslash spelling and —
  // under `simpleLineBreaks` — every remaining line ending. It emits the SINGULAR
  // `makehtml.hardLineBreak.*` family (a three-segment, variant-less name, so no family umbrella
  // applies) and has no lifecycle of its own: the inline engine owns onStart/onEnd. A break has no
  // inner content, so its capture payload carries ONLY the read-only `_wholeMatch` — there is no
  // `text` key to rewrite — while `attributes` and an `output` override behave as everywhere else.
  // One line ending yields ONE break, so the explicit spellings never compound with the
  // simpleLineBreaks arm (specs/showdown.md § simpleLineBreaks).
  describe('hardLineBreak', function () {

    describe('listener contract', function () {

      it('fires onCapture with only the read-only _wholeMatch (there is no text key)', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.hardLineBreak');
        converter.makeHtml('foo  \nbar');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('  \n');
        expect(Object.prototype.hasOwnProperty.call(spy.matches, 'text')).toBe(false);
        expect(spy.hashed).toBe(true);
        expect(spy.hashInput).toBe('<br />');
      });

      it('_wholeMatch carries the whole trailing space run', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.hardLineBreak');
        converter.makeHtml('foo   \nbar');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('   \n');
      });

      it('_wholeMatch on the backslash arm is the backslash plus the newline', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.hardLineBreak');
        converter.makeHtml('foo\\\nbar');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('\\\n');
      });

      it('_wholeMatch on the simpleLineBreaks arm is the consumed line ending', function () {
        let converter = new showdown.Converter({simpleLineBreaks: true}),
            spy = spyOn(converter, 'makehtml.hardLineBreak');
        converter.makeHtml('a\nb');
        expect(spy.captured).toBe(true);
        expect(spy.matches._wholeMatch).toBe('\n');
      });

      it('the capture carries no regexp metadata (the break is recognized from the scan)', function () {
        let seen = 'unset',
            converter = new showdown.Converter()
              .listen('makehtml.hardLineBreak.onCapture', function (event) {
                seen = event.regexp;
                return event;
              });
        converter.makeHtml('foo  \nbar');
        expect(seen).toBe(null);
      });

      it('listener-edited attributes are rendered onto the <br> tag', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.hardLineBreak.onCapture', function (event) {
            event.attributes.class = 'x';
            return event;
          });
        expect(converter.makeHtml('foo  \nbar')).toBe('<p>foo<br class="x" />\nbar</p>');
      });

      it('listener output takes precedence and flows raw', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.hardLineBreak.onCapture', function (event) {
            event.output = '<b>BR</b>';
            return event;
          });
        expect(converter.makeHtml('foo  \nbar')).toBe('<p>foo<b>BR</b>\nbar</p>');
      });

      it('an onHash rewrite commits', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.hardLineBreak.onHash', function (event) {
            event.output = 'BREAK';
            return event;
          });
        expect(converter.makeHtml('foo  \nbar')).toBe('<p>fooBREAK\nbar</p>');
      });

      it('a soft newline builds nothing and emits nothing', function () {
        let converter = new showdown.Converter(),
            spy = spyOn(converter, 'makehtml.hardLineBreak');
        expect(converter.makeHtml('foo\nbar')).toBe('<p>foo\nbar</p>');
        expect(spy.captured).toBe(false);
        expect(spy.hashed).toBe(false);
      });

      it('fires exactly one capture per built break', function () {
        let count = 0,
            converter = new showdown.Converter()
              .listen('makehtml.hardLineBreak.onCapture', function (event) {
                count++;
                return event;
              });
        converter.makeHtml('a  \nb  \nc');
        expect(count).toBe(2);
      });

      // Contract: underscore-prefixed matches keys are read-only CONTEXT. The dispatch path
      // defines them non-writable, so a strict-mode listener that assigns to one throws a
      // TypeError instead of silently editing the payload. A break carries no `text` key at all,
      // so `_wholeMatch` is the whole (read-only) payload — a listener that wants to change the
      // rendering sets `attributes` or overrides `output`.
      it('matches._wholeMatch is read-only (a strict-mode assignment throws)', function () {
        let converter = new showdown.Converter()
          .listen('makehtml.hardLineBreak.onCapture', function (event) {
            event.matches._wholeMatch = 'HACK';
            return event;
          });
        expect(function () { converter.makeHtml('foo  \nbar'); }).toThrow(TypeError);
      });
    });
  });

  describe('underline', function () {

    it('claims a double-underscore region as <u> by default', function () {
      let converter = new showdown.Converter({underline: true});
      expect(converter.makeHtml('a __foo__ b')).toBe('<p>a <u>foo</u> b</p>');
    });

    it('claims a triple-underscore region as <u> by default', function () {
      let converter = new showdown.Converter({underline: true});
      expect(converter.makeHtml('a ___foo___ b')).toBe('<p>a <u>foo</u> b</p>');
    });

    it('fires onCapture with the raw inner slice as text', function () {
      let converter = new showdown.Converter({underline: true}),
          spy = spyOn(converter, 'makehtml.underline');
      converter.makeHtml('a __foo__ b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('__foo__');
      expect(spy.matches.text).toBe('foo');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('<u>foo</u>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({underline: true})
        .listen('makehtml.underline.onCapture', function (event) {
          event.output = '<ins>foo</ins>';
          return event;
        });
      expect(converter.makeHtml('a __foo__ b')).toBe('<p>a <ins>foo</ins> b</p>');
    });

    it('an edited matches.text is re-rendered by the nested sub-scan', function () {
      let converter = new showdown.Converter({underline: true})
        .listen('makehtml.underline.onCapture', function (event) {
          event.matches.text = '*bar*';
          return event;
        });
      expect(converter.makeHtml('a __foo__ b')).toBe('<p>a <u><em>bar</em></u> b</p>');
    });

    it('listener-edited attributes are rendered onto the <u> tag', function () {
      let converter = new showdown.Converter({underline: true})
        .listen('makehtml.underline.onCapture', function (event) {
          event.attributes.class = 'mark';
          return event;
        });
      expect(converter.makeHtml('a __foo__ b')).toBe('<p>a <u class="mark">foo</u> b</p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter({underline: true})
        .listen('makehtml.underline.onHash', function (event) {
          event.output = '<u>U</u>';
          return event;
        });
      expect(converter.makeHtml('a __foo__ b')).toBe('<p>a <u>U</u> b</p>');
    });

    it('an unclaimed underscore run is consumed as literal text and emits nothing', function () {
      let converter = new showdown.Converter({underline: true}),
          spy = spyOn(converter, 'makehtml.underline');
      expect(converter.makeHtml('a _foo_ b')).toBe('<p>a _foo_ b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });
  });

  describe('strikethrough', function () {

    it('pairs a double-tilde run into <del> by default', function () {
      let converter = new showdown.Converter({strikethrough: true});
      expect(converter.makeHtml('a ~~foo~~ b')).toBe('<p>a <del>foo</del> b</p>');
    });

    it('fires onCapture with the rendered inner as text', function () {
      let converter = new showdown.Converter({strikethrough: true}),
          spy = spyOn(converter, 'makehtml.strikethrough');
      converter.makeHtml('a ~~foo~~ b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('~~foo~~');
      expect(spy.matches.text).toBe('foo');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toBe('<del>foo</del>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({strikethrough: true})
        .listen('makehtml.strikethrough.onCapture', function (event) {
          event.output = '<s>foo</s>';
          return event;
        });
      expect(converter.makeHtml('a ~~foo~~ b')).toBe('<p>a <s>foo</s> b</p>');
    });

    it('an edited matches.text is re-wrapped by the construct', function () {
      let converter = new showdown.Converter({strikethrough: true})
        .listen('makehtml.strikethrough.onCapture', function (event) {
          event.matches.text = 'bar';
          return event;
        });
      expect(converter.makeHtml('a ~~foo~~ b')).toBe('<p>a <del>bar</del> b</p>');
    });

    it('listener-edited attributes are rendered onto the <del> tag', function () {
      let converter = new showdown.Converter({strikethrough: true})
        .listen('makehtml.strikethrough.onCapture', function (event) {
          event.attributes.class = 'gone';
          return event;
        });
      expect(converter.makeHtml('a ~~foo~~ b')).toBe('<p>a <del class="gone">foo</del> b</p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter({strikethrough: true})
        .listen('makehtml.strikethrough.onHash', function (event) {
          event.output = 'STRUCK';
          return event;
        });
      expect(converter.makeHtml('a ~~foo~~ b')).toBe('<p>a STRUCK b</p>');
    });

    it('strikes inside a resolving emphasis span and still fires its events', function () {
      let converter = new showdown.Converter({strikethrough: true}),
          spy = spyOn(converter, 'makehtml.strikethrough');
      expect(converter.makeHtml('**~~x~~**')).toBe('<p><strong><del>x</del></strong></p>');
      expect(spy.captured).toBe(true);
    });

    it('an unpaired tilde run renders literally and emits nothing', function () {
      let converter = new showdown.Converter({strikethrough: true}),
          spy = spyOn(converter, 'makehtml.strikethrough');
      expect(converter.makeHtml('a ~~foo b')).toBe('<p>a ~~foo b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });

    it('a run of three or more tildes is neither opener nor closer and emits nothing', function () {
      let converter = new showdown.Converter({strikethrough: true}),
          spy = spyOn(converter, 'makehtml.strikethrough');
      expect(converter.makeHtml('a ~~~foo~~~ b')).toBe('<p>a ~~~foo~~~ b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });
  });

  // ghMentions owns the `ghMention` VARIANT of the link family: listeners target mentions
  // precisely via `makehtml.link.ghMention.*`, and the family umbrella also fires
  // `makehtml.link.*` for them, so all-links listeners catch mentions too.
  describe('ghMentions', function () {

    it('links a mention by default', function () {
      let converter = new showdown.Converter({ghMentions: true});
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <a href="https://github.com/tivie">@tivie</a> b</p>');
    });

    it('honors the ghMentionsLink template', function () {
      let converter = new showdown.Converter({ghMentions: true, ghMentionsLink: 'https://twitter.com/{u}'});
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <a href="https://twitter.com/tivie">@tivie</a> b</p>');
    });

    it('fires makehtml.link.ghMention.onCapture with the mention as text', function () {
      let converter = new showdown.Converter({ghMentions: true}),
          spy = spyOn(converter, 'makehtml.link.ghMention');
      converter.makeHtml('a @tivie b');
      expect(spy.captured).toBe(true);
      // _wholeMatch mirrors the historic pass's group 0: the whitespace boundary char + mention
      expect(spy.matches._wholeMatch).toBe(' @tivie');
      expect(spy.matches.text).toBe('@tivie');
      expect(spy.hashed).toBe(true);
      expect(spy.hashInput).toContain('>@tivie</a>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter({ghMentions: true})
        .listen('makehtml.link.ghMention.onCapture', function (event) {
          event.output = '<b>MENTION</b>';
          return event;
        });
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <b>MENTION</b> b</p>');
    });

    it('an edited matches.text becomes the anchor body', function () {
      let converter = new showdown.Converter({ghMentions: true})
        .listen('makehtml.link.ghMention.onCapture', function (event) {
          event.matches.text = 'Tivie!';
          return event;
        });
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <a href="https://github.com/tivie">Tivie!</a> b</p>');
    });

    it('listener-edited attributes are rendered onto the anchor', function () {
      let converter = new showdown.Converter({ghMentions: true})
        .listen('makehtml.link.ghMention.onCapture', function (event) {
          event.attributes.class = 'mention';
          return event;
        });
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <a href="https://github.com/tivie" class="mention">@tivie</a> b</p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter({ghMentions: true})
        .listen('makehtml.link.ghMention.onHash', function (event) {
          event.output = 'AT';
          return event;
        });
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a AT b</p>');
    });

    it('a mid-word @ declines and emits nothing', function () {
      let converter = new showdown.Converter({ghMentions: true}),
          spy = spyOn(converter, 'makehtml.link.ghMention');
      expect(converter.makeHtml('mail a@user now')).toBe('<p>mail a@user now</p>');
      expect(spy.captured).toBe(false);
    });

    it('an escaped mention stays literal and emits nothing', function () {
      let converter = new showdown.Converter({ghMentions: true}),
          spy = spyOn(converter, 'makehtml.link.ghMention');
      expect(converter.makeHtml('a \\@tivie b')).toBe('<p>a @tivie b</p>');
      expect(spy.captured).toBe(false);
    });

    it('a mention inside a resolving link label stays literal (no mention events)', function () {
      let converter = new showdown.Converter({ghMentions: true}),
          spy = spyOn(converter, 'makehtml.link.ghMention');
      expect(converter.makeHtml('[ @tivie](http://x.com)')).toBe('<p><a href="http://x.com"> @tivie</a></p>');
      expect(spy.captured).toBe(false);
    });

    it('a non-string ghMentionsLink throws at initialization', function () {
      expect(function () {
        new showdown.Converter({ghMentions: true, ghMentionsLink: 123}).makeHtml('a @tivie b');
      }).toThrow();
    });

    it('setOption re-validates ghMentionsLink and rolls back on failure', function () {
      let converter = new showdown.Converter({ghMentions: true});
      expect(function () { converter.setOption('ghMentionsLink', 123); }).toThrow();
      expect(converter.getOption('ghMentionsLink')).toBe('https://github.com/{u}');
      expect(converter.makeHtml('a @tivie b')).toBe('<p>a <a href="https://github.com/tivie">@tivie</a> b</p>');
    });
  });

  // rawHtml owns inline raw HTML (CommonMark spec §6.6) plus the Showdown-only whole-`<a>` swallow.
  // Every recognized piece — whichever arm matched it — fires the SAME variant-less
  // `makehtml.rawHtml.*` family through one shared build function; the wholeAnchor swallow fires it
  // exactly once for the entire `<a ...>...</a>`, not once per tag. `matches.text` IS the html (there
  // is no separate content to extract), so a listener-edited `matches.text` commits VERBATIM on hash
  // — there is no rendering step to re-run the edit through.
  describe('rawHtml', function () {

    it('fires onCapture once for a mid-paragraph raw open tag', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.rawHtml');
      converter.makeHtml('a <span class="x">b c');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('<span class="x">');
      expect(spy.matches.text).toBe('<span class="x">');
      expect(spy.hashed).toBe(true);
    });

    it('fires a separate capture for an open tag and its close tag', function () {
      let count = 0,
          converter = new showdown.Converter()
            .listen('makehtml.rawHtml.onCapture', function (event) {
              count++;
              return event;
            });
      converter.makeHtml('a <b>x</b> c');
      expect(count).toBe(2);
    });

    it('fires onCapture for a mid-paragraph HTML comment', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.rawHtml');
      converter.makeHtml('a <!-- note --> b');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('<!-- note -->');
    });

    it('an edited matches.text commits verbatim (no rendering step to re-run)', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.rawHtml.onCapture', function (event) {
          event.matches.text = '<span data-y="1">';
          return event;
        });
      expect(converter.makeHtml('a <span class="x">b c')).toBe('<p>a <span data-y="1">b c</p>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.rawHtml.onCapture', function (event) {
          event.output = '<mark>';
          return event;
        });
      expect(converter.makeHtml('a <span class="x">b c')).toBe('<p>a <mark>b c</p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.rawHtml.onHash', function (event) {
          event.output = 'HTML';
          return event;
        });
      expect(converter.makeHtml('a <!-- note --> b')).toBe('<p>a HTML b</p>');
    });

    it('the Showdown-only wholeAnchor swallow fires the family exactly once for the whole <a>', function () {
      let count = 0, wm = null,
          converter = new showdown.Converter()
            .listen('makehtml.rawHtml.onCapture', function (event) {
              count++;
              wm = event.matches._wholeMatch;
              return event;
            });
      converter.makeHtml('see <a href="/x">inner</a> end');
      expect(count).toBe(1);
      expect(wm).toBe('<a href="/x">inner</a>');
    });

    it('a bare "<" with no recognizable construct emits nothing', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.rawHtml');
      expect(converter.makeHtml('a < b')).toBe('<p>a &lt; b</p>');
      expect(spy.captured).toBe(false);
      expect(spy.hashed).toBe(false);
    });
  });

  // The `autolink` variant of the link family covers both the angle-bracket spelling
  // (`<https://...>`, CommonMark spec §6.5) and the naked-URL spelling (simplifiedAutoLink) — an
  // angle-delimited and a naked autolink are the same kind of link to a listener, so they share one
  // variant name. A listener that must tell them apart can inspect `matches._wholeMatch`, which
  // keeps the angle brackets for that spelling.
  describe('link.autolink variant', function () {

    it('the angle spelling fires onCapture under the new autolink variant name', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.link.autolink');
      converter.makeHtml('<https://foo.com>');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('<https://foo.com>');
      expect(spy.matches._url).toBe('https://foo.com');
      expect(spy.hashed).toBe(true);
    });

    it('listener output on the autolink variant takes precedence for the angle spelling', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.autolink.onCapture', function (event) {
          event.output = '<b>LINK</b>';
          return event;
        });
      expect(converter.makeHtml('<https://foo.com>')).toBe('<p><b>LINK</b></p>');
    });

    it('an onHash rewrite on the autolink variant commits for the angle spelling', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.autolink.onHash', function (event) {
          event.output = 'HASHED';
          return event;
        });
      expect(converter.makeHtml('<https://foo.com>')).toBe('<p>HASHED</p>');
    });

    it('the naked spelling already fires onCapture under the same variant name', function () {
      let converter = new showdown.Converter({simplifiedAutoLink: true}),
          spy = spyOn(converter, 'makehtml.link.autolink');
      converter.makeHtml('visit www.foo.com now');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('www.foo.com');
      expect(spy.matches._url).toBe('http://www.foo.com');
      expect(spy.matches.text).toBe('www.foo.com');
      expect(spy.hashed).toBe(true);
    });

    it('the naked spelling carries exactly the new build\'s payload keys', function () {
      let converter = new showdown.Converter({simplifiedAutoLink: true}),
          spy = spyOn(converter, 'makehtml.link.autolink');
      converter.makeHtml('visit www.foo.com now');
      expect(Object.keys(spy.matches).sort()).toEqual(['_url', '_wholeMatch', 'text']);
    });

    it('a bare "www" word with no dotted domain declines and emits nothing', function () {
      let converter = new showdown.Converter({simplifiedAutoLink: true}),
          spy = spyOn(converter, 'makehtml.link.autolink');
      expect(converter.makeHtml('a www word')).toBe('<p>a www word</p>');
      expect(spy.captured).toBe(false);
    });
  });

  // link.js and image.js resolve a shared `[`/`![` ... `]` bracket stack: `inline` for
  // `[text](dest "title")` / `![alt](src "title")`, `reference` for every reference spelling. These
  // are already ported to their final event contract — the live inline scan's bracket resolution
  // dispatches the exact same families with the exact same matches/attributes shape as the
  // registry-engine constructs, so every case below already passes.
  describe('link and image variants (registry world)', function () {

    it('link.inline fires onCapture with a contract-conformant payload', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.link.inline');
      converter.makeHtml('[click](/url "T")');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('[click](/url "T")');
      expect(spy.matches._url).toBe('/url');
      expect(spy.matches._title).toBe('T');
      expect(spy.matches.text).toBe('click');
      expect(spy.hashed).toBe(true);
    });

    it('a reference link fires makehtml.link.reference.onCapture', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.link.reference');
      converter.makeHtml('[foo][r]\n\n[r]: /dest');
      expect(spy.captured).toBe(true);
      expect(spy.matches._wholeMatch).toBe('[foo][r]');
    });

    it('a listener-added attribute is rendered onto the anchor', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.inline.onCapture', function (event) {
          event.attributes.class = 'x';
          return event;
        });
      expect(converter.makeHtml('[a](http://x.com)')).toBe('<p><a href="http://x.com" class="x">a</a></p>');
    });

    it('an edited matches.text is rendered as the anchor body', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.inline.onCapture', function (event) {
          event.matches.text = 'BAR';
          return event;
        });
      expect(converter.makeHtml('[a](http://x.com)')).toBe('<p><a href="http://x.com">BAR</a></p>');
    });

    it('listener output takes precedence and flows raw', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.inline.onCapture', function (event) {
          event.output = '<b>L</b>';
          return event;
        });
      expect(converter.makeHtml('[a](http://x.com)')).toBe('<p><b>L</b></p>');
    });

    it('an onHash rewrite commits', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.inline.onHash', function (event) {
          event.output = 'HASHED';
          return event;
        });
      expect(converter.makeHtml('[a](http://x.com)')).toBe('<p>HASHED</p>');
    });

    it('image.inline fires onCapture with a contract-conformant payload', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.image.inline');
      converter.makeHtml('![alt text](/img.png "T")');
      expect(spy.captured).toBe(true);
      expect(spy.matches._url).toBe('/img.png');
      expect(spy.matches._title).toBe('T');
      expect(Object.prototype.hasOwnProperty.call(spy.matches, '_width')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(spy.matches, '_height')).toBe(true);
      expect(spy.matches.text).toBe('alt text');
    });

    it('an edited matches.text overrides the rendered alt attribute', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.image.inline.onCapture', function (event) {
          event.matches.text = 'new alt';
          return event;
        });
      expect(converter.makeHtml('![alt](/img.png)')).toBe('<p><img src="/img.png" alt="new alt" /></p>');
    });

    it('listener output on the image variant takes precedence and flows raw', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.image.inline.onCapture', function (event) {
          event.output = '<x/>';
          return event;
        });
      expect(converter.makeHtml('![alt](/img.png)')).toBe('<p><x/></p>');
    });

    it('a reference image fires makehtml.image.reference.onCapture', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.image.reference');
      converter.makeHtml('![x][r]\n\n[r]: /i.png');
      expect(spy.captured).toBe(true);
    });

    it('fires exactly one capture per link occurrence', function () {
      let count = 0,
          converter = new showdown.Converter()
            .listen('makehtml.link.inline.onCapture', function (event) {
              count++;
              return event;
            });
      converter.makeHtml('[a](http://x.com) and [b](http://y.com)');
      expect(count).toBe(2);
    });
  });

  // The family umbrella: a variant event `<side>.<family>.<variant>.<phase>` is re-dispatched
  // under the family-level `<side>.<family>.<phase>` name with the exact same content — so a
  // listener on the family name catches every variant, while a variant name targets one syntax.
  // Variant listeners run first; family listeners see their edits; the final state wins.
  describe('family umbrella events', function () {

    it('makehtml.link.onCapture catches an inline link', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.link');
      converter.makeHtml('[a](http://x.com)');
      expect(spy.captured).toBe(true);
      expect(spy.matches.text).toBe('a');
      expect(spy.hashed).toBe(true);
    });

    it('the same family listener catches a naked autolink', function () {
      let converter = new showdown.Converter({simplifiedAutoLink: true}),
          spy = spyOn(converter, 'makehtml.link');
      converter.makeHtml('visit http://x.com now');
      expect(spy.captured).toBe(true);
    });

    it('makehtml.image.onCapture catches an inline image', function () {
      let converter = new showdown.Converter(),
          spy = spyOn(converter, 'makehtml.image');
      converter.makeHtml('![alt](img.png)');
      expect(spy.captured).toBe(true);
      expect(spy.matches.text).toBe('alt');
    });

    it('variant listeners run first and the family listener sees their edits', function () {
      let familySaw = null,
          converter = new showdown.Converter()
            .listen('makehtml.link.inline.onCapture', function (event) {
              event.matches.text = 'VAR';
              return event;
            })
            .listen('makehtml.link.onCapture', function (event) {
              familySaw = event.matches.text;
              event.matches.text = 'FAM';
              return event;
            });
      expect(converter.makeHtml('[a](http://x.com)')).toBe('<p><a href="http://x.com">FAM</a></p>');
      expect(familySaw).toBe('VAR');
    });

    it('a family listener can override the output', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.onCapture', function (event) {
          event.output = '<b>LINK</b>';
          return event;
        });
      expect(converter.makeHtml('x [a](http://x.com) y')).toBe('<p>x <b>LINK</b> y</p>');
    });

    it('makehtml.link.onHash fires for a variant onHash', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.link.onHash', function (event) {
          event.output = 'HASHED';
          return event;
        });
      expect(converter.makeHtml('x [a](http://x.com) y')).toBe('<p>x HASHED y</p>');
    });

    it('a variant-less construct event fires exactly once (no umbrella of itself)', function () {
      let count = 0,
          converter = new showdown.Converter()
            .listen('makehtml.codeSpan.onCapture', function (event) {
              count++;
              return event;
            });
      converter.makeHtml('a `foo` b');
      expect(count).toBe(1);
    });
  });
});
