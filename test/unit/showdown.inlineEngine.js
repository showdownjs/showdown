/**
 * Unit tests for the inline engine (src/subParsers/makehtml/inlineEngine.js).
 *
 * The engine is construct-agnostic: everything it does is driven by the `makehtml.inline.*`
 * definition objects present in the live subparser registry. These tests therefore register
 * throwaway constructs, run the pass directly, and unregister them again.
 *
 * The REAL constructs are registered too (they are the live inline path), so a test that wants to
 * observe pure engine mechanics picks trigger characters and sample text no real construct claims:
 * the owned trigger set is ``\n \\ ` . : * _ & @ ! [ ] < ~ h H w W f F``, and a `&` or `<` that
 * does not begin a real entity reference or a real tag is declined by its owner and falls through
 * to ordinary literal text. Where a throwaway construct shares a trigger with a real one, it is the
 * `priority` that decides the order — the real construct declines and the throwaway consumes.
 */

describe('showdown.inlineEngine', function () {
  'use strict';

  const NS = 'makehtml.inline.';

  // the live registry object; registering is `showdown.subParser(name, def)`, unregistering is
  // deleting the key (there is no public API for it, and the engine reads the registry every pass)
  let registry = showdown.getSubParserList(),
      registered = [];

  function register (name, def) {
    registered.push(name);
    showdown.subParser(name, def);
  }

  function unregister (name) {
    delete registry[name];
  }

  /**
   * Run the inline engine pass over `text`.
   * @param {string} text
   * @param {{}} [opts] converter options
   * @param {showdown.Converter} [converter] a pre-built converter (to attach listeners to)
   * @returns {string}
   */
  function engine (text, opts, converter) {
    converter = converter || new showdown.Converter(opts || {});
    let globals = {converter: converter, gHtmlSpans: []};
    return showdown.subParser('makehtml.inlineEngine')(text, converter.getOptions(), globals);
  }

  beforeEach(function () {
    registered = [];
  });

  afterEach(function () {
    for (let i = 0; i < registered.length; ++i) {
      unregister(registered[i]);
    }
    registered = [];
  });

  describe('the bare pass', function () {

    // `q`/`r`/`s` own no trigger; the bare `&` is declined by the entity construct (it begins no
    // reference) and the `< ` by the raw-HTML/autolink constructs (it begins no tag), so both fall
    // through to literal text and are escaped at render — the engine's own behavior, unaided.
    it('passes text through, escaping only HTML entities, when no construct claims it', function () {
      expect(engine('q & r < s')).toBe('q &amp; r &lt; s');
    });

    it('handles the empty string', function () {
      expect(engine('')).toBe('');
    });

    it('ignores plain FUNCTION entries registered under the makehtml.inline.* namespace', function () {
      register(NS + 'testfn', function (text) { return text; });
      expect(engine('q & r < s')).toBe('q &amp; r &lt; s');
    });
  });

  describe('dispatch', function () {

    it('hands a trigger char to its construct, which consumes and moves the cursor', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('<b>X</b>');
          return scan.pos + 2; // consumes `@` plus the char after it
        }
      });
      // the engine tail's hashHTMLSpans step (see the EPILOGUE in inlineEngine.js) hash-protects
      // any well-formed `<tag>…</tag>` pair reaching the end of the pass, including this
      // throwaway construct's raw, unhashed output — a real construct self-hashes via
      // `scan.hashSpan` and would never reach the tail carrying a raw pair like this
      expect(engine('a@zb')).toBe('a¨C0Cb');
    });

    it('renders the trigger char as literal text when the construct declines', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function () { return null; }
      });
      expect(engine('a@b')).toBe('a@b');
    });

    it('buckets a construct under every char of its `triggers` string', function () {
      register(NS + 'testfoo', {
        triggers: '@%',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('[' + scan.str.charAt(scan.pos) + ']');
          return scan.pos + 1;
        }
      });
      expect(engine('a@b%c')).toBe('a[@]b[%]c');
    });

    it('offers a shared trigger char to the lower priority first, and stops when it consumes', function () {
      let calls = [];
      register(NS + 'testhigh', {
        triggers: '@',
        priority: 20,
        handler: function (scan) {
          calls.push('high');
          scan.appendRaw('HIGH');
          return scan.pos + 1;
        }
      });
      register(NS + 'testlow', {
        triggers: '@',
        priority: 5,
        handler: function (scan) {
          calls.push('low');
          scan.appendRaw('LOW');
          return scan.pos + 1;
        }
      });
      expect(engine('@')).toBe('LOW');
      expect(calls).toEqual(['low']);
    });

    it('falls through to the next construct on the same trigger when the first declines', function () {
      register(NS + 'testlow', {
        triggers: '@',
        priority: 5,
        handler: function () { return null; }
      });
      register(NS + 'testhigh', {
        triggers: '@',
        priority: 20,
        handler: function (scan) {
          scan.appendRaw('HIGH');
          return scan.pos + 1;
        }
      });
      expect(engine('@')).toBe('HIGH');
    });

    it('breaks a priority tie by construct name, not by registration order', function () {
      let calls = [];
      // registered in reverse alphabetical order on purpose
      register(NS + 'testbbb', {
        triggers: '@',
        priority: 10,
        handler: function () { calls.push('bbb'); return null; }
      });
      register(NS + 'testaaa', {
        triggers: '@',
        priority: 10,
        handler: function () { calls.push('aaa'); return null; }
      });
      expect(engine('@')).toBe('@');
      expect(calls).toEqual(['aaa', 'bbb']);
    });

    it('takes a deleted construct out of the table on the next pass', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('<b>X</b>');
          return scan.pos + 1;
        }
      });
      // hash-protected by the engine tail's hashHTMLSpans step (see the equivalent note above)
      expect(engine('@')).toBe('¨C0C');
      unregister(NS + 'testfoo');
      expect(engine('@')).toBe('@');
    });

    it('throws when a construct consumes without advancing the cursor', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) { return scan.pos; }
      });
      expect(function () { engine('@'); }).toThrow(/without advancing the cursor/);
    });
  });

  describe('the `enabled` gate', function () {

    function gated (enabled) {
      return {
        triggers: '@',
        priority: 10,
        enabled: enabled,
        handler: function (scan) {
          scan.appendRaw('ON');
          return scan.pos + 1;
        }
      };
    }

    it('treats a missing `enabled` as true', function () {
      let def = gated(undefined);
      delete def.enabled;
      register(NS + 'testfoo', def);
      expect(engine('@')).toBe('ON');
    });

    it('keeps an `enabled: false` construct out of the table', function () {
      register(NS + 'testfoo', gated(false));
      expect(engine('@')).toBe('@');
    });

    it('resolves a function `enabled` against the conversion options', function () {
      register(NS + 'testfoo', gated(function (options) { return !!options.emoji; }));
      expect(engine('@', {emoji: true})).toBe('ON');
      expect(engine('@', {emoji: false})).toBe('@');
    });
  });

  describe('definition validation', function () {

    it('throws when `priority` is missing or not a number', function () {
      register(NS + 'testfoo', {triggers: '@', handler: function () { return null; }});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*priority/);
    });

    it('throws when a `handler` is declared without a `triggers` string', function () {
      register(NS + 'testfoo', {priority: 10, handler: function () { return null; }});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*triggers/);
    });

    it('throws when the definition declares neither a `handler` nor a `resolver`', function () {
      register(NS + 'testfoo', {triggers: '@', priority: 10});
      expect(function () { engine('a'); }).toThrow(/testfoo/);
    });

    it('throws when `enabled` is neither a boolean nor a function', function () {
      register(NS + 'testfoo', {triggers: '@', priority: 10, enabled: 'yes', handler: function () { return null; }});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*enabled/);
    });

    it('throws when `handler` is not a function', function () {
      register(NS + 'testfoo', {triggers: '@', priority: 10, handler: 'nope'});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*handler/);
    });

    it('throws when `resolver` is not a function', function () {
      register(NS + 'testfoo', {priority: 10, resolver: 'nope'});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*resolver/);
    });

    it('validates a construct even when its option gate would disable it', function () {
      register(NS + 'testfoo', {triggers: '@', enabled: false, handler: function () { return null; }});
      expect(function () { engine('a'); }).toThrow(/testfoo/);
    });
  });

  describe('the resolver phase', function () {

    it('runs a trigger-less resolver over the node list after the cursor loop', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendText('mark');
          return scan.pos + 1;
        }
      });
      register(NS + 'testres', {
        priority: 10,
        resolver: function (scan) {
          // the handler's node must already be here — proof that this runs after the scan
          for (let n = scan.list.head; n !== null; n = n.next) {
            n.literal = n.literal.toUpperCase();
          }
        }
      });
      expect(engine('a@b')).toBe('AMARKB');
    });

    it('runs the resolvers in priority order', function () {
      // registered high-priority-first on purpose
      register(NS + 'testsecond', {
        priority: 20,
        resolver: function (scan) { scan.list.appendRaw('B'); }
      });
      register(NS + 'testfirst', {
        priority: 5,
        resolver: function (scan) { scan.list.appendRaw('A'); }
      });
      expect(engine('x')).toBe('xAB');
    });

    it('skips the resolver of a disabled construct', function () {
      register(NS + 'testres', {
        priority: 10,
        enabled: false,
        resolver: function (scan) { scan.list.appendRaw('A'); }
      });
      expect(engine('x')).toBe('x');
    });
  });

  describe('the scan state', function () {

    it('exposes the input string, the cursor and a per-pass memo object', function () {
      let seen = [];
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          seen.push({str: scan.str, pos: scan.pos, count: (scan.memos.count = (scan.memos.count || 0) + 1)});
          return scan.pos + 1;
        }
      });
      engine('a@b@');
      expect(seen).toEqual([
        {str: 'a@b@', pos: 1, count: 1},
        {str: 'a@b@', pos: 3, count: 2}
      ]);
    });

    it('escapes text nodes and emits raw nodes verbatim', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendText('<t>');
          scan.appendRaw('<r>');
          return scan.pos + 1;
        }
      });
      // at the RENDER step `<r>` is still emitted verbatim (unescaped), which is what this test
      // exercises; but `<r>` has no matching `</r>` close tag, so the engine tail's hashHTMLSpans
      // step (which only hash-protects a well-formed `<tag>…</tag>` pair) leaves it as literal
      // text, and the tail's closing encode pass then escapes it like any other bare `<`/`>` left
      // over in raw content
      expect(engine('@')).toBe('&lt;t&gt;&lt;r&gt;');
    });

    it('renderNodes concatenates the rendered output of a node range', function () {
      let rendered = null;
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          rendered = scan.renderNodes(scan.list.head, null);
          return scan.pos + 1;
        }
      });
      engine('a&b@');
      expect(rendered).toBe('a&amp;b');
    });

    it('subParse runs a fresh nested scan over a slice, using the same dispatch table', function () {
      register(NS + 'testbang', {
        triggers: '!',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('<em>!</em>');
          return scan.pos + 1;
        }
      });
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('[' + scan.subParse('< x!') + ']');
          return scan.pos + 1;
        }
      });
      // The slice's `< ` begins no tag, so the real raw-HTML/autolink constructs decline it and the
      // nested scan escapes it as ordinary text — the same dispatch table, applied to the slice.
      // `subParse` itself never runs the tail (core-only, see the EPILOGUE section of
      // inlineEngine.js), so the nested scan's raw `<em>!</em>` output reaches the OUTER pass
      // unhashed — but the outer, top-level pass's own tail then runs over the FINAL concatenated
      // text, which includes this nested output, and its span-hashing step hash-protects the
      // well-formed pair it finds there just like any other raw HTML reaching that point
      expect(engine('@')).toBe('[&lt; x¨C0C]');
    });

    it('hashSpan stores a finished span in globals and returns its placeholder', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw(scan.hashSpan('<b>x</b>'));
          return scan.pos + 1;
        }
      });
      let converter = new showdown.Converter(),
          globals = {converter: converter, gHtmlSpans: []},
          out = showdown.subParser('makehtml.inlineEngine')('@', converter.getOptions(), globals);
      expect(out).toBe('¨C0C');
      expect(globals.gHtmlSpans).toEqual(['<b>x</b>']);
    });
  });

  describe('lifecycle events', function () {

    it('fires makehtml.inlineEngine.onStart and onEnd around the pass', function () {
      let fired = [];
      let converter = new showdown.Converter()
        .listen('makehtml.inlineEngine.onStart', function (e) { fired.push('onStart'); return e; })
        .listen('makehtml.inlineEngine.onEnd', function (e) { fired.push('onEnd'); return e; });
      engine('foo', null, converter);
      expect(fired).toEqual(['onStart', 'onEnd']);
    });

    it('an onStart listener can rewrite the text the scan sees', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.inlineEngine.onStart', function (e) { e.output = 'bar'; return e; });
      expect(engine('foo', null, converter)).toBe('bar');
    });

    it('an onEnd listener can post-process the rendered output', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.inlineEngine.onEnd', function (e) { e.output = e.output + '!'; return e; });
      expect(engine('foo', null, converter)).toBe('foo!');
    });
  });

  describe('the serialized-text tail (EPILOGUE)', function () {

    it('runs a registered `serialized` entry after the render and before onEnd', function () {
      let seenAtOnEnd;
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendText('mark');
          return scan.pos + 1;
        },
        serialized: function (text) {
          return text.replace('mark', 'SER');
        }
      });
      let converter = new showdown.Converter()
        .listen('makehtml.inlineEngine.onEnd', function (e) { seenAtOnEnd = e.output; return e; });
      let out = engine('a@b', null, converter);
      // the onEnd listener must already see the serialized pass's output, proving it ran first
      expect(seenAtOnEnd).toBe('aSERb');
      expect(out).toBe('aSERb');
    });

    it('runs multiple `serialized` entries in priority order', function () {
      register(NS + 'testsecond', {
        priority: 20,
        resolver: function () {}, // trigger-less, participates only via `serialized` below
        serialized: function (text) { return text + 'B'; }
      });
      register(NS + 'testfirst', {
        priority: 5,
        resolver: function () {},
        serialized: function (text) { return text + 'A'; }
      });
      expect(engine('x')).toBe('xAB');
    });

    it('collects the `serialized` entry of an enabled construct even when its handler never consumes', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        enabled: true,
        handler: function () { return null; },
        serialized: function (text) { return text.toUpperCase(); }
      });
      expect(engine('abc@def')).toBe('ABC@DEF');
    });

    it('excludes the `serialized` entry of a disabled construct from the epilogue', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        enabled: false,
        handler: function () { return null; },
        serialized: function (text) { return text.toUpperCase(); }
      });
      expect(engine('abc@def')).toBe('abc@def');
    });

    it('throws when `serialized` is declared but is not a function', function () {
      register(NS + 'testfoo', {priority: 10, resolver: function () {}, serialized: 'nope'});
      expect(function () { engine('a'); }).toThrow(/testfoo(.|\n)*serialized/);
    });

    it('does not run the serialized passes for a nested subParse scan', function () {
      let calls = 0;
      register(NS + 'testbang', {
        triggers: '!',
        priority: 10,
        handler: function (scan) {
          scan.appendText('inner');
          return scan.pos + 1;
        }
      });
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw(scan.subParse('!'));
          return scan.pos + 1;
        },
        serialized: function (text) {
          calls++;
          return text;
        }
      });
      engine('@');
      // the nested subParse call re-enters parseInline directly and fires no epilogue of its own;
      // only the outer, top-level pass runs the serialized entry — exactly once
      expect(calls).toBe(1);
    });

    it('encodes a bare & but leaves a real entity reference intact', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('a & b &copy; c');
          return scan.pos + 1;
        }
      });
      expect(engine('@')).toBe('a &amp; b &copy; c');
    });

    it('escapes an invalid-looking reference under the P-narrow ampersand guard, but lets a bare # through', function () {
      register(NS + 'testfoo', {
        triggers: '@',
        priority: 10,
        handler: function (scan) {
          scan.appendRaw('&_; and &#;');
          return scan.pos + 1;
        }
      });
      // `_` is outside the P-narrow reference-body class [a-zA-Z#0-9], so `&_;` escapes; `#` is
      // inside it, so the lone `&#;` (an empty numeric reference) passes through unescaped
      expect(engine('@')).toBe('&amp;_; and &#;');
    });

    it('hash-protects raw HTML an onEnd listener appends, so the encode pass does not escape it', function () {
      let converter = new showdown.Converter()
        .listen('makehtml.inlineEngine.onEnd', function (e) { e.output = e.output + '<b>x</b>'; return e; });
      let globals = {converter: converter, gHtmlSpans: []},
          out = showdown.subParser('makehtml.inlineEngine')('foo', converter.getOptions(), globals);
      expect(out).toBe('foo¨C0C');
      expect(globals.gHtmlSpans).toEqual(['<b>x</b>']);
    });
  });
});
