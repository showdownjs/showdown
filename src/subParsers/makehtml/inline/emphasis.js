/**
 * @file      makehtml/inline/emphasis.js
 * @summary   Emphasis and strong emphasis (`*`/`_` runs), CommonMark spec §6.2.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * One file owns both em and strong: a single delimiter-run algorithm decides em vs strong at
 * pairing time, so there is one recognizer for the delimiter runs and one builder for the wrapped
 * span.
 *
 * Emits capture/hash per resolved span — a `<em>` dispatches the `makehtml.emphasis.*` family, a
 * `<strong>` the `makehtml.strong.*` family (`.onCapture` / `.onHash`), honoring a listener's
 * output / matches.text / attributes; the onStart/onEnd lifecycle belongs to the inline engine.
 * Listener-free conversions are byte-identical.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). It shares `_` with underline, which takes
 * FIRST REFUSAL on every `_` run while its option is on (lower priority number); `*` has no other
 * owner. Deleting this file removes emphasis and strong emphasis and nothing else — every `*`/`_`
 * run becomes ordinary literal text (`_` still subject to underline's first refusal).
 *
 * The aux `makehtml.inline.emphasis.build` registration is RETIRED by this file: the wrapped-span
 * builder is construct-internal here (`inlineEmphasisBuild` below), reached only from this file's
 * own pairing algorithm, so there is nothing left for an external `buildWrapped` hook to call.
 *
 * ---- this file owns the §6.2 delimiter machinery ------------------------------------------
 *
 * The delimiter stack, the flanking computation and the `process_emphasis` pairing algorithm are
 * EMPHASIS's, not the engine's: the engine owns only the generic node list (append / splice /
 * truncate / render — see InlineNodeList in inlineEngine.js), which knows nothing about
 * delimiters. Everything delimiter-specific lives below as file-local `inlineEmphasis*`
 * functions operating on the engine's scan state:
 *
 *   - the delimiter NODES are ordinary nodes on the engine's list
 *     (`scan.list.appendNode({type: 'delim', …})`), chained to each other through
 *     `delimPrev`/`delimNext`. The engine's renderNode HTML-escapes any non-raw literal, so a
 *     delimiter run that never pairs renders as its literal `*`/`_` characters;
 *   - the STACK POINTER (top of stack) lives on `scan.memos.delimiters` — construct-owned
 *     per-scan state, so it is automatically fresh in every nested `scan.subParse` scan, exactly
 *     the semantics the retired per-scan stack instance had. Undefined/null means "empty stack".
 *
 * That state is deliberately shared, not private: strikethrough drops the delimiters of the nodes
 * a `<del>` swallows, link/image resolution remembers the stack top when it pushes a bracket and
 * prunes back to it when the bracket resolves, and ghMentions reads the pending delimiter run for
 * its boundary rule — so those constructs read `scan.memos.delimiters` and call
 * `inlineEmphasisRemoveDelimiter` / `inlineEmphasisPruneDelimiters` here (guarded, so deleting this
 * file leaves them working with no delimiter fencing rather than throwing).
 */

/* jshint esnext: false, esversion: 9 */

// ---- flanking character classifiers (file-local; the emphasis construct is their sole consumer) ----
// `cmAsciiPunct` is NOT redeclared here: the authoritative copy lives in helpers/commonmark.js
// (kept there for showdown.helper.isAsciiPunct) and, because the sources concatenate into one
// shared scope, is read directly at call time by inlineEmphasisIsPunct below.

/**
 * CommonMark "punctuation": ASCII punctuation plus the Unicode P (punctuation) and
 * S (symbol) general categories.
 * @param {string|undefined} ch
 * @returns {boolean}
 */
function inlineEmphasisIsPunct (ch) {
  return ch !== undefined && (cmAsciiPunct.test(ch) || /[\p{P}\p{S}]/u.test(ch));
}

/**
 * CommonMark "whitespace" for the flanking rules: undefined (string edge), any JS
 * `\s` whitespace, or any Unicode Z (separator) character.
 * @param {string|undefined} ch
 * @returns {boolean}
 */
function inlineEmphasisIsWhitespace (ch) {
  return ch === undefined || /\s/.test(ch) || /\p{Z}/u.test(ch);
}

// A backslash-escaped punctuation char can reach the flanking classifier as the `¨E<code>E`
// placeholder; the classifier must treat a side that abuts one as a word character (see
// inlineEmphasisPushDelim's `placeholderAsWord`). Sticky so the after-side test can anchor at the
// scan cursor without slicing the string.
const inlineEmphasisEscapePlaceholderRegex = /¨E\d+E/y;

// ---- the delimiter stack -------------------------------------------------------------------

/**
 * Tokenize a run of `*`/`_` delimiters (`scan.str.slice(start, i)`), compute its flanking
 * (canOpen/canClose) and push it onto both the engine's node list and this construct's delimiter
 * stack (`scan.memos.delimiters`).
 * When `resolveSentinels` is set, `$`/`¨` hidden behind the `¨D`/`¨T` sentinels are
 * resolved before the flanking lookaround reads the adjacent characters (the scan runs
 * after the converter's sentinel swap).
 * @param {{}} scan the engine scan state
 * @param {number} start index of the first delimiter char
 * @param {number} i index just past the last delimiter char
 * @param {string} ch the delimiter character (`*` or `_`)
 * @param {boolean} [resolveSentinels]
 * @param {boolean} [starRuleForUnderscore] when set, an `_` run uses the looser `*`
 *   open/close flanking rule (Showdown intraword emphasis) instead of the CommonMark `_`
 *   rule. The scan passes this for the Showdown flavors; the cmSpec paths never do.
 * @param {boolean} [placeholderAsWord] when set, a side whose adjacent text is a
 *   backslash-escape placeholder (`¨E<code>E`) is classified as a word character rather than
 *   whitespace/punctuation, so emphasis opens/closes against an escaped delimiter the way the
 *   legacy regex path did (e.g. `word_\_x\__` -> `word<em>_x_</em>`). The scan passes this for
 *   the Showdown flavors; the cmSpec paths leave it unset.
 * @returns {{}} the appended delimiter node
 */
function inlineEmphasisPushDelim (scan, start, i, ch, resolveSentinels, starRuleForUnderscore, placeholderAsWord) {
  'use strict';

  let str = scan.str,
      len = str.length,
      run = str.slice(start, i),
      before = (start === 0) ? undefined : str.charAt(start - 1),
      after = (i >= len) ? undefined : str.charAt(i);
  if (resolveSentinels) {
    // `$` and `¨` are swapped for the two-char placeholders `¨D`/`¨T` before inline
    // parsing (see converter.js) and only restored at the end. Resolve them here so
    // flanking sees the real adjacent character rather than the placeholder's
    // trailing/leading letter (e.g. the `D` of `¨D` would otherwise read as a letter).
    if ((before === 'D' || before === 'T') && str.charAt(start - 2) === '¨') {
      before = (before === 'D') ? '$' : '¨';
    }
    if (after === '¨' && (str.charAt(i + 1) === 'D' || str.charAt(i + 1) === 'T')) {
      after = (str.charAt(i + 1) === 'D') ? '$' : '¨';
    }
  }
  if (placeholderAsWord) {
    // A backslash-escaped punctuation char (`\_`, `\*`, ...) is a literal that the legacy regex
    // emphasis treated as an ordinary word character (it ran after the `\X` -> `¨E<code>E`
    // escape swap and saw the placeholder's letters/digits). The scan still holds the raw `\X`
    // at this point, so the leading `\` (before the after-side char) or the escaped char itself
    // (on the before-side) would classify the touching side as punctuation and suppress
    // flanking. Treat a side that abuts such an escape — or, defensively, an already-substituted
    // `¨E<code>E` placeholder — as a word char before the whitespace/punctuation tests read it.
    inlineEmphasisEscapePlaceholderRegex.lastIndex = i;
    if ((after === '\\' && showdown.helper.isAsciiPunct(str.charAt(i + 1))) || inlineEmphasisEscapePlaceholderRegex.test(str)) {
      after = 'a';
    }
    if ((showdown.helper.isAsciiPunct(before) && str.charAt(start - 2) === '\\') ||
        (start > 0 && /¨E\d+E$/.test(str.slice(Math.max(0, start - 12), start)))) {
      before = 'a';
    }
  }
  let beforeWs = inlineEmphasisIsWhitespace(before),
      afterWs = inlineEmphasisIsWhitespace(after),
      beforePt = inlineEmphasisIsPunct(before),
      afterPt = inlineEmphasisIsPunct(after),
      leftFlanking = !afterWs && (!afterPt || beforeWs || beforePt),
      rightFlanking = !beforeWs && (!beforePt || afterWs || afterPt),
      canOpen, canClose;
  if (ch === '_' && !starRuleForUnderscore) {
    canOpen = leftFlanking && (!rightFlanking || beforePt);
    canClose = rightFlanking && (!leftFlanking || afterPt);
  } else {
    // `*` always uses this rule; `_` uses it too when starRuleForUnderscore is set (the
    // Showdown intraword-emphasis flavor gate).
    canOpen = leftFlanking;
    canClose = rightFlanking;
  }
  let node = scan.list.appendNode({type: 'delim', cc: ch, literal: run, numdelims: run.length, origdelims: run.length, canOpen: canOpen, canClose: canClose}),
      top = scan.memos.delimiters || null;
  node.delimPrev = top;
  node.delimNext = null;
  if (top) { top.delimNext = node; }
  scan.memos.delimiters = node;
  return node;
}

/**
 * Unlink a delimiter node from the delimiter stack (the node stays in the engine's text list).
 * @param {{}} scan
 * @param {{}} d
 */
function inlineEmphasisRemoveDelimiter (scan, d) {
  'use strict';

  if (d.delimPrev) { d.delimPrev.delimNext = d.delimNext; }
  if (d.delimNext) { d.delimNext.delimPrev = d.delimPrev; } else { scan.memos.delimiters = d.delimPrev; }
}

/**
 * Drop every delimiter at or above `bottom` from the stack (after a bracket span
 * has consumed the nodes they pointed at).
 *
 * No caller inside this file: it exists for the BRACKET constructs — inline/link.js and
 * inline/image.js remember the stack top when they push a `[` / `![` and prune back to it once the
 * bracket resolves. Kept here because the stack it walks is this construct's. (The concat model
 * puts every source file in one shared scope, so those cross-file calls resolve at call time; the
 * linter, which sees one file at a time, reports it as unused.)
 * @param {{}} scan
 * @param {{}|null} bottom
 */
function inlineEmphasisPruneDelimiters (scan, bottom) {
  'use strict';

  let d = scan.memos.delimiters || null;
  while (d !== null && d !== bottom) {
    let p = d.delimPrev;
    inlineEmphasisRemoveDelimiter(scan, d);
    d = p;
  }
}

// ---- the wrapped span ----------------------------------------------------------------------

/**
 * Render and hash one resolved `<em>`/`<strong>` span. Invoked by inlineEmphasisProcess at
 * pairing time, once per matched opener/closer pair. `tagOpen`/`tagClose` are the tags the
 * delimiter algorithm chose; `opener`/`closer` are the delimiter nodes bounding the enclosed
 * content (`opener.next` .. `closer`).
 *
 * The inner nodes are HTML-escaped via scan.renderNodes, the GFM-inline-links pass +
 * strikethrough run on them (because the wrapped span is hashed below, the span-gamut extras
 * never see it), and the caller splices the result back as a RAW node.
 * @param {{}} scan
 * @param {{}} options
 * @param {{}} globals
 * @param {string} tagOpen
 * @param {string} tagClose
 * @param {{}} opener
 * @param {{}} closer
 * @returns {string} the hashed span placeholder
 */
function inlineEmphasisBuild (scan, options, globals, tagOpen, tagClose, opener, closer) {
  'use strict';

  // Strikethrough pairing (place c): resolve tilde-run nodes inside this emphasis span into `<del>`,
  // on the span's inner node range, BEFORE the nodes are rendered below. This builder runs at
  // emphasis-pairing time (after the inner emphasis is already resolved), which is exactly when the
  // retired whole-text pass used to strike the rendered inner — so `**~~x~~**` still strikes through.
  // applyGfm is true (an emphasis span finalizes its inner like the top level: the GFM overlay is
  // applied; the `<del>` is hashed, so it is a no-op inside it). Emoji is scan-native, already
  // substituted inline, so the pairing pass no longer takes an applyEmoji arg.
  if (options.strikethrough) {
    showdown.subParser('makehtml.inline.strikethrough.pair')(scan, options, globals, opener.next, closer, true);
  }
  let inner = scan.renderNodes(opener.next, closer);
  // The GFM overlay (naked URL / mail linkify) applied to this span's inner content, so naked URLs
  // inside emphasis are linked too. The engine's scan state exposes no `applyGfmInlineLinks`
  // service (it is a pipeline concern of the inline pass, not of the scan), so the construct calls
  // the linkify subparser directly — pending the epilogue design, which will decide where the
  // post-scan overlay lives.
  inner = showdown.subParser('makehtml.inline.nakedUrl.linkify')(inner, options, globals);
  // Emoji, strikethrough (place c, above), ellipsis and hard line breaks are all scan-native — the
  // `:name:`/`~~`/`...`/`\n` inside the span are already resolved by the scan (emoji substituted
  // inline, breaks dispatched as the scan built the inner nodes), so none are re-applied here.
  // Event parity (D3): fire the separate makehtml.emphasis.* / makehtml.strong.* families
  // (`<em>` -> emphasis, `<strong>` -> strong), honoring a listener's output / matches.text /
  // attributes. Byte-identical for listener-free conversions.
  let isStrong = (tagOpen === '<strong>'),
      tagName = isStrong ? 'strong' : 'em',
      evtName = isStrong ? 'makehtml.strong' : 'makehtml.emphasis',
      marker = opener.cc.repeat(isStrong ? 2 : 1),
      wholeMatch = marker + inner + marker,
      attributes = {},
      capture = showdown.Event.dispatchCapture(evtName + '.onCapture', inner, {
        regexp: null,
        matches: {_wholeMatch: wholeMatch, text: inner},
        attributes: attributes
      }, options, globals);
  let otp;
  if (capture.output && capture.output !== '') {
    otp = capture.output;
  } else {
    attributes = capture.attributes;
    otp = '<' + tagName + showdown.helper._populateAttributes(attributes) + '>' + capture.matches.text + '</' + tagName + '>';
  }
  let hash = showdown.Event.dispatchHash(evtName + '.onHash', otp, options, globals);
  return scan.hashSpan(hash.output);
}

// ---- the pairing algorithm ------------------------------------------------------------------

/**
 * The CommonMark `process_emphasis` reference algorithm (spec §6.2). Walks this construct's
 * delimiter stack from `stackBottom` (exclusive; `null` = the whole stack), pairing openers with
 * closers, building the wrapped span through inlineEmphasisBuild and splicing it back into the
 * engine's node list as a RAW node (the built span is final, hashed HTML).
 * @param {{}} scan
 * @param {{}} options
 * @param {{}} globals
 * @param {{}|null} stackBottom
 */
function inlineEmphasisProcess (scan, options, globals, stackBottom) {
  'use strict';

  let list = scan.list,
      openersBottom = {
        '_': [stackBottom, stackBottom, stackBottom],
        '*': [stackBottom, stackBottom, stackBottom]
      };

  // Start from the bottom-most delimiter ABOVE stackBottom — the reference algorithm's prologue,
  // verbatim. The walk must be allowed to run off the bottom of the stack and leave `closer` null:
  // that null is the answer whenever there is nothing above stackBottom (the common case for a
  // bracket construct whose label contained no delimiters at all, where stackBottom IS the current
  // top). Stopping the walk one node early instead — at the bottom-most delimiter, `delimPrev ===
  // null` — and compensating afterwards is NOT equivalent: it only recovers the case where the walk
  // happens to land exactly on stackBottom, and in every other case it hands the loop below the
  // WHOLE stack, so a bracket's fencing call pairs and consumes delimiters that lie outside its
  // label. That left already-consumed delimiters (`numdelims === 0`) linked on the stack, and the
  // next pass then decremented them past zero forever — an unbounded loop, since only an exact
  // `numdelims === 0` retires a delimiter.
  let closer = scan.memos.delimiters || null;
  while (closer !== null && closer.delimPrev !== stackBottom) {
    closer = closer.delimPrev;
  }

  while (closer !== null) {
    if (!closer.canClose) { closer = closer.delimNext; continue; }
    let opener = closer.delimPrev,
        openerFound = false,
        oddMatch;
    while (opener !== null && opener !== stackBottom && opener !== openersBottom[closer.cc][closer.origdelims % 3]) {
      oddMatch = (closer.canOpen || opener.canClose) &&
                 (closer.origdelims % 3 !== 0) &&
                 ((opener.origdelims + closer.origdelims) % 3 === 0);
      if (opener.cc === closer.cc && opener.canOpen && !oddMatch) { openerFound = true; break; }
      opener = opener.delimPrev;
    }
    let oldCloser = closer;

    if (openerFound) {
      let use = (opener.numdelims >= 2 && closer.numdelims >= 2) ? 2 : 1,
          tagOpen = (use === 2) ? '<strong>' : '<em>',
          tagClose = (use === 2) ? '</strong>' : '</em>';

      // trim consumed delimiters from the opener (end) and closer (start) literals
      opener.literal = opener.literal.slice(0, opener.literal.length - use);
      opener.numdelims -= use;
      closer.literal = closer.literal.slice(use);
      closer.numdelims -= use;

      let wrapped = inlineEmphasisBuild(scan, options, globals, tagOpen, tagClose, opener, closer);

      // remove inner nodes and their delimiters from the lists
      let n2 = opener.next;
      while (n2 !== null && n2 !== closer) {
        let nx = n2.next;
        if (n2.type === 'delim') { inlineEmphasisRemoveDelimiter(scan, n2); }
        n2 = nx;
      }
      // splice in a single text node holding the wrapped result. It is always RAW: the built span
      // is final, hashed HTML and must not be escaped again at render time.
      let wrapNode = {type: 'text', literal: wrapped, raw: true};
      list.insertAfter(opener, wrapNode);
      wrapNode.next = closer;
      closer.prev = wrapNode;

      if (opener.numdelims === 0) { opener.literal = ''; inlineEmphasisRemoveDelimiter(scan, opener); }
      if (closer.numdelims === 0) {
        closer.literal = '';
        let tmp = closer.delimNext;
        inlineEmphasisRemoveDelimiter(scan, closer);
        closer = tmp;
      }
    } else {
      openersBottom[oldCloser.cc][oldCloser.origdelims % 3] = oldCloser.delimPrev;
      if (!oldCloser.canOpen) { inlineEmphasisRemoveDelimiter(scan, oldCloser); }
      closer = oldCloser.delimNext;
    }
  }
}

showdown.subParser('makehtml.inline.emphasis', {

  // Owns `*` outright and shares `_` with underline, which registers the same trigger at a LOWER
  // priority number and therefore takes first refusal on every `_` run while its option is on
  // (it either claims the region as `<u>` or consumes the run as inert literal text, so `_` only
  // reaches this construct when underline is off).
  triggers: '*_',
  priority: 20,

  // Always on: emphasis/strong is core Markdown syntax in every flavor. The flavor differences are
  // FLAGS on the delimiter push below (the `_` flanking rule and the escape-placeholder
  // classification), not a participation gate.
  enabled: true,

  // Always consumes, never declines: the whole `*` or `_` run at the cursor is pushed onto the
  // delimiter stack and the cursor returns past it. Nothing is decided here — the resolver below
  // pairs (or discards) the run once the scan has seen the rest of the string.
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        len = str.length,
        start = scan.pos,
        ch = str.charAt(start),
        i = start;
    while (i < len && str.charAt(i) === ch) { ++i; }
    // resolveSentinels = true: this path runs after the converter's `$`/`¨` -> `¨D`/`¨T`
    // swap, so flanking must see the real adjacent character (the push undoes the swap
    // for the lookaround only).
    // Gate 4 (intraword underscore). Under the Showdown flavors (unless
    // literalMidWordUnderscores), `_` uses the looser `*` open/close flanking rule so
    // `un_frigging_believable` emphasizes; cmSpec keeps the CommonMark `_` flanking rule.
    // placeholderAsWord (Showdown flavors only): a delimiter touching a `¨E<code>E` escape
    // placeholder flanks as if against a word char, so `word_\_x\__` -> `word<em>_x_</em>`
    // (legacy regex emphasis saw the placeholder as ordinary word characters).
    inlineEmphasisPushDelim(scan, start, i, ch, true, !options.cmSpec && !options.literalMidWordUnderscores, !options.cmSpec);
    return i;
  },

  // The post-scan pairing phase. The engine runs it at the end of EVERY scan — nested sub-scans
  // included — which is what the retired hardwired `processEmphasis(null)` call at scan end did.
  // `null` as the stack bottom means "the whole stack": the resolver always owns every delimiter
  // the scan pushed. The `from`/`to` node range the engine passes is not used — this construct
  // walks its own delimiter chain, not the node list.
  // eslint-disable-next-line no-unused-vars -- `from`/`to` unused but kept for the resolver calling convention
  resolver: function (scan, options, globals, from, to) {
    'use strict';

    inlineEmphasisProcess(scan, options, globals, null);
  }
});
