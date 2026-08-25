/**
 * @file      makehtml/inlineEngine.js
 * @summary   The inline engine: construct-agnostic infrastructure for the single-pass inline scan.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * The sole inline path for every flavor, and the registry-driven successor to the hardwired
 * span-gamut dispatch it replaced. The engine owns only the machinery every inline construct shares — the character cursor loop, the dispatch table, the
 * output node list, the bracket-stack field and the scan services (the generic delimiter list
 * still belongs to emphasis) — and knows NOTHING about any specific construct: no construct name,
 * trigger character or precedence may appear in this file. Constructs live in
 * src/subParsers/makehtml/inline/ (one file per syntax: trigger, recognition, rendering, events
 * and option gates) and register through the ordinary `showdown.subParser()` call — with a
 * definition OBJECT instead of a function — under the `makehtml.inline.*` namespace, which is what
 * marks them as this engine's constructs:
 *
 *   showdown.subParser('makehtml.inline.<name>', {
 *     triggers:  {string}   the character(s) that hand control to this construct. Required for
 *                           scan constructs; a construct with no `triggers` participates only
 *                           through its `resolver`.
 *     priority:  {number}   explicit dispatch order on a shared trigger char (lower runs first).
 *                           Required — registration order is alphabetical file order under the
 *                           concat model and carries no meaning.
 *     enabled:   {boolean|function} whether the construct participates: `true`, or
 *                           (options) -> boolean for option-gated constructs. Part of every
 *                           definition — when omitted the engine normalizes it to `true`. The
 *                           engine sets it to true or false based on the conversion options at
 *                           table build (a disabled construct never enters the dispatch table);
 *                           handlers can still test options for their internal gates if needed.
 *     handler:   {function} (scan, options, globals) -> new cursor index, or null to decline.
 *     resolver:  {function} optional post-scan pairing phase (delimiter resolution), run in
 *                           priority order over the node list after the cursor loop ends.
 *     serialized:{function} optional (text, options, globals) -> text pass, run in priority order
 *                           over the top-level pass's SERIALIZED output — after the render, once —
 *                           for constructs whose extent is defined over the rendered string rather
 *                           than over scan tokens (the naked-URL/mention linkify passes are the
 *                           motivating case: their boundary rules read already-escaped `&lt;`/`&gt;`
 *                           and already-hashed real links, which only exist once the text is
 *                           serialized). Declared on the SAME definition object as the construct's
 *                           `handler`/`resolver`, so one `enabled` gate governs whether the
 *                           construct participates at all, scan and serialized alike. Only entries
 *                           from ENABLED constructs are collected. See the EPILOGUE section of the
 *                           registered pass below for the exact run order relative to the lifecycle
 *                           events and the closing character-level passes — and note that a
 *                           `scan.subParse` nested scan never runs the epilogue at all (core-only).
 *   });
 *
 * Deleting a construct file therefore removes exactly that syntax — its trigger characters lose
 * their owner and fall through to literal text — and nothing else changes.
 *
 * The scan state now also carries `scan.brackets`, the head of the open `[`/`![` bracket stack —
 * the engine only allocates the field (`null` at the start of every scan) and never reads or
 * writes it itself, so the bracket constructs (inline/link.js, inline/image.js) own the entry
 * shape entirely.
 *
 * Dispatch model: at the start of each pass the engine builds a trigger-indexed table by
 * enumerating `showdown.getSubParserList()` for `makehtml.inline.*` definition objects (entries
 * that are plain functions are ignored — they are aux entries or not yet migrated), filtering by
 * each construct's `enabled(options)` gate and sorting each trigger bucket by `priority` (ties
 * broken by name for determinism). Definitions are validated here, at table build — a malformed
 * registration fails loudly on first use, never silently misdispatches. The scan loop offers the
 * character at the cursor to each owner in priority order; a handler either consumes (returns
 * the new cursor index) or declines (returns null). Characters with no owner flow into plain
 * text runs whose break set derives from the same table (no hardcoded trigger string). After the
 * scan, the registered `resolver`s run in priority order to pair what the handlers only marked.
 */

/* jshint esnext: false, esversion: 9 */

// ---- InlineNodeList: the engine's output node list --------------------------------
//
// The doubly-linked list of inline nodes the scan writes into. Deliberately GENERIC — appending,
// splicing, truncating and rendering — with none of the emphasis delimiter machinery (the delimiter
// stack pointer, the flanking classifiers and the §6.2 pairing algorithm), which belongs to the
// emphasis construct (inline/emphasis.js) rather than to the engine. Nothing outside this file
// needs to name this constructor, since constructs reach a live instance through `scan.list`.
//
// A node is `{type: 'text', literal: string, raw: boolean, prev, next}`: raw nodes hold
// already-final HTML and render verbatim, text nodes are HTML-escaped at render time.

/**
 * A doubly-linked list of inline nodes. The scan builds one of these, feeds it text and raw
 * HTML, lets the registered resolvers rewrite it, then renders the surviving nodes.
 * @constructor
 */
function InlineNodeList () {
  this.head = null;
  this.tail = null;
}

InlineNodeList.prototype = {

  /**
   * Append an already-built node to the tail of the list.
   * @param {{}} node
   * @returns {{}} the appended node
   */
  appendNode: function (node) {
    node.prev = this.tail;
    node.next = null;
    node.raw = node.raw || false;
    if (this.tail) { this.tail.next = node; } else { this.head = node; }
    this.tail = node;
    return node;
  },

  /**
   * Append a text node.
   * @param {string} literal
   * @returns {{}}
   */
  appendText: function (literal) {
    return this.appendNode({type: 'text', literal: literal});
  },

  /**
   * Append already-final HTML that must not be escaped at render time.
   * @param {string} html
   * @returns {{}}
   */
  appendRaw: function (html) {
    return this.appendNode({type: 'text', literal: html, raw: true});
  },

  /**
   * Splice `newNode` into the list immediately after `node`.
   * @param {{}} node
   * @param {{}} newNode
   */
  insertAfter: function (node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) { node.next.prev = newNode; } else { this.tail = newNode; }
    node.next = newNode;
  },

  /**
   * Truncate the list, dropping `node` and everything after it.
   * @param {{}} node
   */
  removeFrom: function (node) {
    this.tail = node.prev;
    if (this.tail) { this.tail.next = null; } else { this.head = null; }
  },

  /**
   * Concatenate the rendered output of nodes `[from .. to)`.
   * @param {{}|null} from
   * @param {{}|null} to
   * @param {function({}):string} renderNode
   * @returns {string}
   */
  renderRange: function (from, to, renderNode) {
    let out = '';
    for (let n = from; n !== null && n !== to; n = n.next) { out += renderNode(n); }
    return out;
  },

  /**
   * Concatenate the rendered output of the whole list.
   * @param {function({}):string} renderNode
   * @returns {string}
   */
  renderList: function (renderNode) {
    return this.renderRange(this.head, null, renderNode);
  }
};

// ---- encodeAmpsAndAngles (file-local; the engine tail's sole caller) --------------
//
// The single copy of this pass, file-local to the engine tail (its only caller) rather than a
// shared helper. Historical note — it descends from the retired span-gamut parser's
// encodeAmpsAndAngles, with two RULED changes made when it moved here:
//
//   - the dead `<(?![a-z/?$!])` replace is DROPPED. In the original, that line ran immediately
//     before an unconditional `/</g` replace — every `<` the dropped line could possibly match is
//     also matched by that very next replace, so the dropped line never changed the result; it was
//     provably subsumed, not merely redundant in the fixtures.
//   - the ampersand guard adopts the P-NARROW policy `/&(?![a-zA-Z#0-9]+;)/g` in place of the
//     original's wider `/&(?!#?[xX]?(?:[\da-fA-F]+|\w+);)/g` (maintainer ruling: one definition of
//     "looks like a reference" across the codebase — the same class helpers/commonmark.js's
//     `cmGuardedAmpersand` (commonmark.js:26) already uses for URL/title normalization, and the
//     same class the entity decoder (commonmark.js's `decodeCharacterReferences`) accepts as a
//     candidate reference body). The old WIDE guard also treated a bare hex run or a bare `\w+` run
//     (which includes `_`) as "looks like a reference" even with nothing anchoring it beyond a
//     trailing `;`; the narrow class drops `_` from that set and requires the body to be
//     `[a-zA-Z#0-9]+` instead. Concretely: `&_;` and `&a_b;` now get their `&` escaped
//     (`&amp;_;` / `&amp;a_b;` — under the old guard `\w+` matched the `_`/`a_b` body and the `&`
//     was left alone), while `&#;` now PASSES THROUGH unescaped (the narrow class admits a bare `#`
//     as a one-character body, so `#;` alone satisfies the lookahead — under the old guard `#?`
//     required at least one hex digit or word char after it, which `&#;` has none of, so it used to
//     get escaped there).
const inlineEngineGuardedAmpersand = /&(?![a-zA-Z#0-9]+;)/g;

/**
 * Encode stray `&`, `<`, `>`, `"` to HTML entities, leaving real entity references intact (the
 * P-narrow policy above decides "real"). See the comment above for the two ruled changes this pass
 * carries relative to the retired span-gamut parser it descends from.
 * @param {string} text
 * @returns {string}
 */
function inlineEngineEncodeAmpsAndAngles (text) {
  'use strict';

  // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
  // http://bumppo.net/projects/amputator/
  text = text.replace(inlineEngineGuardedAmpersand, '&amp;');

  // Encode <
  text = text.replace(/</g, '&lt;');

  // Encode >
  text = text.replace(/>/g, '&gt;');

  // encode "
  text = text.replace(/"/g, '&quot;');

  return text;
}

// ---- hashHTMLSpans (file-local; the engine tail's sole caller) --------------------
//
// Formerly `showdown.helper.hashHTMLSpans`. It stayed a helper only while the retired span-gamut
// parser was a second caller; the engine tail below is now the ONLY caller, so per the project's
// helper rule (≥ 2 genuine call sites) it lives here, file-local to its sole caller.
// `showdown.helper._hashHTMLSpan` — the primitive that stores one span in `globals.gHtmlSpans` and
// returns its `¨C<n>C` placeholder — stays a helper: it has many callers (every construct that
// builds a span, `scan.hashSpan` included).
//
// Only WHOLE `<tag …>…</tag>` spans are hashed here, and only for the listener contract (see the
// EPILOGUE comment in the registered pass): raw HTML from the SOURCE is recognized and hashed
// in-scan by the makehtml.inline.rawHtml construct for every flavor, and every construct
// hash-protects its own output, so nothing but listener-appended raw HTML reaches this pass
// unhashed. A bare `<`/`>` in the source (e.g. `4 < 5 and 6 > 3`) is escaped by
// inlineEngineEncodeAmpsAndAngles above rather than swallowed here.
//
// The scan is a forward cursor with an absent-close-tag cache rather than a
// `<([^<>]+?)>[\s\S]*?<\/\1>` regex: that regex re-scans to EOF for a matching `</tag>` at EVERY
// `<` when none follows, which is O(n^2) on inputs like `'<a>'.repeat(n)`. The cursor scans each
// character once and, the first time a given `</name>` is found to be absent ahead, never searches
// for it again. Two passes preserve the historic ordering/semantics: first tags whose ENTIRE `<…>`
// content is the closing name (no attributes), then tags whose first token is the closing name
// (with attributes).

/**
 * Hash `<open>…</close>` spans in a single linear pass.
 * @param {string} str
 * @param {'full'|'name'} mode `full`: the close tag name is the whole `<…>` content (tags without
 *   attributes); `name`: the content must contain whitespace and the close tag name is its first
 *   token (tags with attributes).
 * @param {{}} globals
 * @returns {string}
 */
function inlineEngineHashPairedTags (str, mode, globals) {
  'use strict';

  let out = '',
      i = 0,
      len = str.length,
      absent = Object.create(null);
  while (i < len) {
    if (str.charAt(i) !== '<') { out += str.charAt(i); i++; continue; }
    let gt = str.indexOf('>', i + 1);
    // a real open tag has a `>` and no `<` between `<` and `>`
    if (gt === -1) { out += str.charAt(i); i++; continue; }
    let inner = str.slice(i + 1, gt);
    if (inner.indexOf('<') !== -1) { out += str.charAt(i); i++; continue; }
    let closeName;
    if (mode === 'full') {
      if (inner.length === 0) { out += str.charAt(i); i++; continue; }
      closeName = inner;
    } else {
      let sp = inner.search(/\s/);
      if (sp <= 0) { out += str.charAt(i); i++; continue; }
      closeName = inner.slice(0, sp);
    }
    let closeStr = '</' + closeName + '>';
    if (absent[closeStr]) { out += str.charAt(i); i++; continue; }
    let ci = str.indexOf(closeStr, gt + 1);
    if (ci === -1) { absent[closeStr] = true; out += str.charAt(i); i++; continue; }
    out += showdown.helper._hashHTMLSpan(str.slice(i, ci + closeStr.length), globals);
    i = ci + closeStr.length;
  }
  return out;
}

/**
 * Replace whole inline raw-HTML spans with `¨C<n>C` placeholders (stored in `globals.gHtmlSpans`),
 * so the closing encoder below leaves their `<`/`>` alone. See the comment above for the two-pass
 * ordering and the linear-scan rationale.
 * @param {string} text
 * @param {{}} globals
 * @returns {string}
 */
function inlineEngineHashHTMLSpans (text, globals) {
  'use strict';

  text = inlineEngineHashPairedTags(text, 'full', globals);
  text = inlineEngineHashPairedTags(text, 'name', globals);
  return text;
}

// ---- the dispatch table -----------------------------------------------------------
//
// Built once per pass (never per character) from the live registry, so registering, gating or
// deleting a construct takes effect on the next conversion with no engine change. Validation
// lives here: a malformed definition is a programming error in a construct file and must fail
// loudly the first time the engine runs, naming the offender.

/**
 * Enumerate the `makehtml.inline.*` construct definitions and compile them into the pass's
 * dispatch table: a trigger-char-indexed map of handler buckets (each sorted by ascending
 * priority, ties broken by construct name) plus the resolver list and the `serialized` list, both
 * in the same order.
 *
 * Entries registered as plain FUNCTIONS under this namespace are ignored silently: they are AUX
 * entries a construct exposes for its siblings to call directly (`makehtml.inline.<name>.<aux>`,
 * e.g. the two linkify passes and strikethrough's `pair`), not constructs the engine dispatches.
 * @param {{}} options
 * @returns {{triggers: {}, resolvers: Array, serialized: Array}}
 */
function buildInlineDispatchTable (options) {
  'use strict';

  const ns = 'makehtml.inline.';
  let registry = showdown.getSubParserList(),
      triggers = {},
      resolvers = [],
      serializedPasses = [];

  for (let name in registry) {
    if (!Object.prototype.hasOwnProperty.call(registry, name) || name.indexOf(ns) !== 0) { continue; }

    let def = registry[name];
    if (typeof def === 'function') { continue; }
    if (def === null || typeof def !== 'object') {
      throw Error('Inline construct "' + name + '" must be registered as a definition object or a function');
    }

    // ---- shape validation (a bad definition never reaches the scan) ----
    if (typeof def.priority !== 'number') {
      throw Error('Inline construct "' + name + '" must declare a numeric `priority`');
    }
    if (!def.handler && !def.resolver) {
      throw Error('Inline construct "' + name + '" must declare a `handler`, a `resolver`, or both');
    }
    if (def.handler && typeof def.handler !== 'function') {
      throw Error('Inline construct "' + name + '" declares a `handler` that is not a function');
    }
    if (def.resolver && typeof def.resolver !== 'function') {
      throw Error('Inline construct "' + name + '" declares a `resolver` that is not a function');
    }
    if (def.handler && (typeof def.triggers !== 'string' || def.triggers.length === 0)) {
      throw Error('Inline construct "' + name + '" declares a `handler` but no `triggers` string');
    }
    if (typeof def.enabled !== 'undefined' && typeof def.enabled !== 'boolean' && typeof def.enabled !== 'function') {
      throw Error('Inline construct "' + name + '" declares an `enabled` that is neither a boolean nor a function');
    }
    if (typeof def.serialized !== 'undefined' && typeof def.serialized !== 'function') {
      throw Error('Inline construct "' + name + '" declares a `serialized` that is not a function');
    }

    // ---- the option gate: missing => true, boolean => itself, function => (options) -> boolean ----
    let enabled = (typeof def.enabled === 'undefined') ? true :
      (typeof def.enabled === 'function') ? !!def.enabled(options) : def.enabled;
    if (!enabled) { continue; }

    let entry = {name: name, priority: def.priority, handler: def.handler, resolver: def.resolver, serialized: def.serialized};

    // A construct with `triggers: '*_'` owns both characters; it goes in both buckets.
    if (entry.handler) {
      for (let i = 0; i < def.triggers.length; ++i) {
        let ch = def.triggers.charAt(i),
            bucket = triggers[ch] || (triggers[ch] = []);
        // a repeated character in the `triggers` string must not double-dispatch the construct
        if (bucket.indexOf(entry) === -1) { bucket.push(entry); }
      }
    }
    if (entry.resolver) { resolvers.push(entry); }
    if (entry.serialized) { serializedPasses.push(entry); }
  }

  // Lower priority dispatches first; the name breaks ties so the order never depends on the
  // registry's insertion order (which is alphabetical file order and carries no meaning).
  function byPriorityThenName (a, b) {
    return (a.priority - b.priority) || (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
  }
  for (let ch in triggers) {
    if (Object.prototype.hasOwnProperty.call(triggers, ch)) { triggers[ch].sort(byPriorityThenName); }
  }
  resolvers.sort(byPriorityThenName);
  serializedPasses.sort(byPriorityThenName);

  return {triggers: triggers, resolvers: resolvers, serialized: serializedPasses};
}

// The inline engine pass. Callers invoke it like any other subparser
// (`showdown.subParser('makehtml.inlineEngine')(text, options, globals)`); it owns the
// inline-pass lifecycle events.
showdown.subParser('makehtml.inlineEngine', function (text, options, globals) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.inlineEngine.onStart', text, options, globals);
  text = startEvent.output;

  // Built once for the whole pass — the cursor loop only ever indexes it. Nested sub-scans reuse
  // it too: the options cannot change mid-pass, so the compiled table cannot either.
  const table = buildInlineDispatchTable(options);

  text = parseInline(text);

  // ---- EPILOGUE: the ruled serialized-text tail ---------------------------------
  //
  // Lives HERE, in the registered pass body, not inside `parseInline`: a nested `scan.subParse`
  // scan re-enters `parseInline` directly (see the scan state's `subParse` field below) and is
  // therefore CORE-ONLY — no serialized passes, no lifecycle events, no closing encode. A subParse
  // slice is a syntactic region of the outer text (an emphasis run's inner content, a link label),
  // not a document: the constructs below are defined over the top-level SERIALIZED output (the
  // naked-URL/mention linkify passes read already-escaped `&lt;`/`&gt;` and already-hashed real
  // links, which exist only once the whole pass has rendered), and running them again on every
  // nested slice would both waste work and double-apply substitutions the outer tail already
  // covers once. Exactly this order:
  for (let s = 0; s < table.serialized.length; ++s) {
    text = table.serialized[s].serialized(text, options, globals);
  }

  // onEnd fires AFTER the serialized passes, not before, so a listener sees their output — and
  // BEFORE the two closing passes below, so a listener can still append raw HTML and have it
  // protected rather than encoded.
  let endEvent = showdown.Event.dispatchEnd('makehtml.inlineEngine.onEnd', text, options, globals);
  text = endEvent.output;

  // The span-hashing pass exists at this point ONLY for the LISTENER CONTRACT, not for any
  // construct's own output: every span a `makehtml.inline.*` construct builds is already
  // hash-protected in-scan (via `scan.hashSpan`), and every `serialized` pass above is expected to
  // hash-protect its own output the same way. The one feeder this call actually guards against is a
  // listener on `makehtml.inlineEngine.onEnd` (dispatched just above) appending RAW HTML — a plain
  // `<b>x</b>` string, never hashed — which must be protected here, before the encoder below
  // escapes its `<`/`>`. File-local since the flip retired spanGamut, its only other caller.
  text = inlineEngineHashHTMLSpans(text, globals);

  // The closing character-level pass: encodes stray `&`/`<`/`>`/`"` left over from raw node
  // content (a construct's own output is escaped already; this only ever touches RAW nodes and
  // listener-appended text) — see inlineEngineEncodeAmpsAndAngles above for its P-narrow ruling.
  text = inlineEngineEncodeAmpsAndAngles(text);

  return text;

  // ---- rendering ---------------------------------------------------------------

  // render one node: raw nodes emit verbatim, text nodes are HTML-escaped
  function renderNode (n) {
    return n.raw ? n.literal : showdown.helper.escapeHTMLEntities(n.literal);
  }

  // hash a finished HTML span to a ¨C<n>C placeholder, so later passes leave it alone
  function hashSpan (html) {
    return showdown.helper._hashHTMLSpan(html, globals);
  }

  // ---- the scan ----------------------------------------------------------------

  /**
   * Scan `str` once, left to right, dispatching each owned character to its construct(s), then
   * run the resolver phase and render the resulting node list.
   *
   * Called recursively through `scan.subParse` for constructs that resolve a syntactic region and
   * need its inner Markdown scanned in isolation: the nested scan gets its own node list, scan
   * state and memos (and fires no lifecycle events), and terminates because the slice is strictly
   * shorter than the region that produced it.
   * @param {string} str
   * @returns {string} the rendered HTML
   */
  function parseInline (str) {
    let list = new InlineNodeList();

    // The scan state handed to every construct — one string, one cursor, one output node list,
    // bundled so each construct can live in its own file. This is the calling convention of the
    // `makehtml.inline.*` namespace: (scan, options, globals) instead of (text, options, globals),
    // because a text->text pass cannot express cross-construct precedence. A construct either
    // consumes — appends its output and returns the new cursor index — or declines by returning
    // null, and the scan falls through to the next owner.
    let scan = {
      str: str,
      pos: 0,
      appendText: function (literal) { return list.appendText(literal); },
      appendRaw: function (html) { return list.appendRaw(html); },
      list: list,           // the output node list (constructs may inspect/adjust the tail)
      memos: {},            // per-scan scratch space shared by the constructs of this pass
      subParse: function (sliceStr) { return parseInline(sliceStr); },
      hashSpan: hashSpan,   // hash a finished HTML span to a ¨C<n>C placeholder
      renderNodes: function (from, to) { return list.renderRange(from, to, renderNode); },
      brackets: null         // head of the open [ / ![ bracket stack — the bracket constructs own the entry shape
    };

    const len = str.length;
    let i = 0;
    while (i < len) {
      let bucket = table.triggers[str.charAt(i)];

      if (bucket) {
        // Offer the character to its owners in priority order. The first that consumes wins;
        // when every one declines the trigger is ordinary literal text.
        scan.pos = i;
        let next = null;
        for (let k = 0; k < bucket.length; ++k) {
          let e = bucket[k].handler(scan, options, globals);
          if (e !== null && typeof e !== 'undefined') { next = e; break; }
        }
        if (next === null) {
          list.appendText(str.charAt(i));
          ++i;
          continue;
        }
        // A consuming handler must advance the cursor; otherwise the scan cannot terminate.
        if (!(next > i)) {
          throw Error('Inline construct consumed at index ' + i + ' without advancing the cursor');
        }
        i = next;
        continue;
      }

      // No owner: accumulate a plain-text run up to the next owned character. The break set is
      // the table's own key set — the engine never names a trigger character.
      let start = i;
      while (i < len && !table.triggers[str.charAt(i)]) { ++i; }
      list.appendText(str.slice(start, i));
    }

    // The post-scan resolver phase: every enabled construct that declares a `resolver` — including
    // the trigger-less ones, which participate only here — gets the finished node list in priority
    // order, to pair what the handlers could only mark.
    for (let r = 0; r < table.resolvers.length; ++r) {
      table.resolvers[r].resolver(scan, options, globals, list.head, null);
    }

    return list.renderList(renderNode);
  }
});
