/**
 * @file      makehtml/inline/strikethrough.js
 * @summary   Converts GFM `~`/`~~` strikethrough runs into `<del>`, gated by `strikethrough`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Emits capture/hash per resolved run (`makehtml.strikethrough.onCapture` / `.onHash`); the
 * onStart/onEnd lifecycle belongs to the inline engine.
 *
 * This is an inline construct (see inlineEngine.js for the contract): the definition object below
 * owns the `~` trigger — its handler consumes a tilde run into a delimiter-like node, and its
 * `resolver` pairs the SURVIVING runs into `<del>` after emphasis resolution (the engine runs
 * resolvers in priority order, and this construct's priority is deliberately above emphasis's).
 * The file also registers the aux entry `makehtml.inline.strikethrough.pair` — the same pairing
 * pass, invoked by OTHER constructs on a scoped node range: emphasis's build runs it on a
 * resolving span's inner (so `**~~x~~**` still strikes) and link's close-bracket resolution runs
 * it on a resolving label's range (so a label strikes for every flavor). The engine ignores
 * function entries in the `makehtml.inline.*` namespace, so the aux registration is dispatch-inert.
 *
 * Pairing runs AFTER emphasis resolution so emphasis wins a crossed `~`/`*` boundary exactly as
 * the retired serialized pass did (the tildes swallowed inside a resolved emphasis span are no
 * longer on the list). Because the scan resolves runs before link/image bracket resolution,
 * strikethrough applies inside resolving link/image labels for every flavor (the former cmSpec
 * literal-label behavior was a pipeline artifact of running after link hashing, not a rule).
 *
 * Deleting this file removes strikethrough and nothing else — every `~` run renders as literal
 * tildes (and the emphasis/link callers of the aux entry must drop their calls; the engine itself
 * needs no change).
 */

/* jshint esnext: false, esversion: 9 */

// whitespace tester for the inner-flank rule (stateless; no lastIndex to carry between calls)
const inlineStrikethroughWhitespaceRegex = /\s/;

showdown.subParser('makehtml.inline.strikethrough', {

  // Sole owner of `~` for dispatch — but the priority NUMBER is load-bearing for the RESOLVER
  // phase: it must exceed emphasis's (20) so the pairing below runs after emphasis resolution,
  // reproducing the retired serialized pass's ordering.
  triggers: '~',
  priority: 30,

  // Option-gated: when `strikethrough` is off the construct never enters the dispatch table, so
  // `~` is not a trigger character at all and flows into plain-text runs at full speed. Not
  // `!cmSpec`-gated — the substitution is flavor-independent (off by default under cmSpec, but
  // when enabled it pairs the same way, which is what lets label-range pairing apply everywhere).
  enabled: function (options) {
    return !!options.strikethrough;
  },

  // Consumes the whole tilde run at scan.pos and appends it as a DELIMITER-LIKE node
  // (`tilde: true`, `tlen`) on the engine's node list, returning the new cursor. It never
  // declines: like the `*`/`_` emphasis handler, a tilde run is always consumed, to be paired
  // (or left literal) later by the resolver. The node renders as its literal tildes when it
  // stays unpaired.
  // eslint-disable-next-line no-unused-vars -- `options`/`globals` unused but kept for the makehtml.inline.* (scan, options, globals) convention
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        len = str.length,
        start = scan.pos,
        i = start;
    while (i < len && str.charAt(i) === '~') { ++i; }
    scan.list.appendNode({type: 'text', literal: str.slice(start, i), tilde: true, tlen: i - start});
    return i;
  },

  // The post-scan pairing phase (place a): resolve the surviving top-level tilde runs into
  // `<del>` over the node range the engine hands in — after emphasis, because this construct's
  // priority (30) sorts it behind emphasis's resolver (20). applyGfm is true here: a top-level
  // `<del>` is finalized like an emphasis span (the GFM overlay had already run on the
  // serialized text before the retired strikethrough pass wrapped it).
  resolver: function (scan, options, globals, from, to) {
    'use strict';

    showdown.subParser('makehtml.inline.strikethrough.pair')(scan, options, globals, from, to, true);
  }
});

// The pairing pass (aux entry, signature (scan, options, globals, fromNode, toNode, applyGfm)).
// NOT dispatched by the engine — it is invoked at the three places the retired serialized pass's
// effects were visible: (a) the resolver above, on the whole list; (b) inside a resolving emphasis
// span, on its inner node range (inline/emphasis.js's build); and (c) in link's close-bracket
// resolution, scoped to the resolving label's node range.
//
// It reproduces the historical whole-text strikethrough regex on the surviving tilde-run nodes in
// [fromNode, toNode): walk them left to right; an opener is a run of length 1 or 2 whose following
// content starts non-space-non-tilde; its closer is the NEAREST later surviving run of the SAME
// length whose preceding content ends non-space-non-tilde (lazy leftmost, like the /g regex —
// after a pair, scanning continues past the closer). The `(^|[^~])` / `\2(?!~)` guards are inherent
// (a tilde node consumes the whole run, so runs are never adjacent). Runs of 3+ tildes are neither
// opener nor closer (length never matches 1/2) and render literal. Adjacency reads the neighbor
// NODES' edge char (a hashed placeholder reads as `¨`/alnum, i.e. non-space-non-tilde, matching how
// the regex saw placeholder chars; see the raw-literal note on `flank` below). On a pair the inner
// nodes are rendered, the same capture/hash event flow the old pass used runs, and the consumed
// range is spliced to one raw node holding scan.hashSpan of the `<del>`. When `applyGfm` is set,
// buildDel also links `@mentions` in the resolved inner via the `makehtml.inline.ghMentions.linkify`
// helper (see ghMentions.js) — a `<del>` is resolved from `tilde` nodes, so the scan's mention
// boundary never fired inside it, and this restores `~~@user~~` -> `<del><a>@user</a></del>`.
showdown.subParser('makehtml.inline.strikethrough.pair', function (scan, options, globals, fromNode, toNode, applyGfm) {
  'use strict';

  // the regex's `[^\s~]` inner-flank test. The neighbor NODES are never tilde runs (a tilde run
  // node consumes the whole run, so runs are never adjacent) and text nodes never contain `~` (the
  // scan breaks its plain-text runs at `~`), so a raw-literal edge char decides flanking exactly as
  // the escaped serialized form the regex saw would (HTML-escaping neither adds nor removes edge
  // whitespace, and preserves non-space-ness), without paying for a render per lookup.
  function flank (ch) { return ch !== '' && ch !== '~' && !inlineStrikethroughWhitespaceRegex.test(ch); }
  function edgeChar (n, atEnd) {
    let l = n.literal;
    return (l && l.length) ? l.charAt(atEnd ? l.length - 1 : 0) : '';
  }

  // Single forward pass over the range: collect the tilde-run nodes and, for each, the flanking
  // chars of its surviving neighbors — `before` (last non-empty edge char to its left, for the
  // closer test) and `after` (first non-empty edge char to its right, for the opener test). These
  // read the ORIGINAL adjacent content; a later del splice only rewires boundary pointers, never a
  // content node's literal, so the precomputed chars stay valid through pairing (which lets the
  // resolution stay linear instead of re-deriving adjacency per candidate).
  let nodes = [];
  for (let n = fromNode; n !== null && n !== toNode; n = n.next) { nodes.push(n); }
  let tnodes = [];
  let prevChar = '';
  for (let p = 0; p < nodes.length; p++) {
    let n = nodes[p];
    if (n.tilde) { tnodes.push({node: n, tlen: n.tlen, before: prevChar, after: ''}); }
    let e = edgeChar(n, true);
    if (e !== '') { prevChar = e; }
  }
  let k = tnodes.length;
  if (k < 2) { return; }
  // fill `after` with a backward sweep over the same nodes
  let nextChar = '', ti = k - 1;
  for (let p = nodes.length - 1; p >= 0 && ti >= 0; p--) {
    let n = nodes[p];
    if (n === tnodes[ti].node) { tnodes[ti].after = nextChar; ti--; }
    let e = edgeChar(n, false);
    if (e !== '') { nextChar = e; }
  }

  // Nearest same-length valid closer at or after each index, per run length (1 and 2). A valid
  // closer is a length-1/2 run whose preceding content ends non-space-non-tilde.
  let nc1 = new Array(k + 1), nc2 = new Array(k + 1);
  nc1[k] = -1; nc2[k] = -1;
  for (let p = k - 1; p >= 0; p--) {
    let t = tnodes[p], closes = flank(t.before);
    nc1[p] = (closes && t.tlen === 1) ? p : nc1[p + 1];
    nc2[p] = (closes && t.tlen === 2) ? p : nc2[p + 1];
  }

  // Lazy leftmost pairing: for each valid opener take the nearest same-length valid closer after it,
  // then continue past the closer (mirroring the /g regex). Runs of 3+ are neither opener nor closer.
  let i = 0;
  while (i < k) {
    let op = tnodes[i];
    if ((op.tlen === 1 || op.tlen === 2) && flank(op.after)) {
      let j = (op.tlen === 1) ? nc1[i + 1] : nc2[i + 1];
      if (j !== -1) { buildDel(op.node, tnodes[j].node); i = j + 1; continue; }
    }
    i++;
  }

  function buildDel (opener, closer) {
    let inner = scan.renderNodes(opener.next, closer);
    // Mirror where the serialized pass ran relative to the GFM overlay: it had already run on the
    // text by the time the strikethrough pass wrapped it. Since this <del> is hashed below (hidden
    // from that later pass), re-apply it on the inner here — gated to the caller's context (a <del>
    // inside a link must not linkify). ghMentions is scan-native, but a `<del>` is resolved from
    // `tilde` nodes at pairing time, so the scan's `delim`-keyed boundary never linked mentions inside
    // it (unlike emphasis/underline, which link their inner during the scan); link them here on the
    // resolved inner via the ghMentions inner-content helper, so `~~@user~~` -> `<del><a>@user</a></del>`
    // exactly as before. Order matches the historic overlay (ghMentions then naked URL/mail). The
    // naked URL/mail overlay is called by registered name — the engine's scan state exposes no
    // overlay service (a pipeline concern, pending the epilogue design). Emoji is scan-native:
    // `:name:` inside the tilde run was substituted inline before this pairing pass rendered the
    // inner nodes, so it needs no re-apply here. Hard line breaks are scan-native too: the `\n`
    // nodes between the tildes were dispatched to the hardLineBreak construct while the main scan
    // built them, so the inner arrives here already broken.
    if (applyGfm) {
      inner = showdown.subParser('makehtml.inline.ghMentions.linkify')(inner, options, globals);
      inner = showdown.subParser('makehtml.inline.nakedUrl.linkify')(inner, options, globals);
    }

    let marker = '~'.repeat(opener.tlen),
        wholeMatch = marker + inner + marker,
        otp;
    let capture = showdown.Event.dispatchCapture('makehtml.strikethrough.onCapture', inner, {
      regexp: null,
      matches: {_wholeMatch: wholeMatch, text: inner},
      attributes: {}
    }, options, globals);
    if (capture.output && capture.output !== '') {
      otp = capture.output;
    } else {
      otp = '<del' + showdown.helper._populateAttributes(capture.attributes) + '>' +
            capture.matches.text +
            '</del>';
    }
    let hash = showdown.Event.dispatchHash('makehtml.strikethrough.onHash', otp, options, globals);
    let hashed = scan.hashSpan(hash.output);

    // splice [opener .. closer] -> one raw node holding the hashed <del>. Inner delimiters are
    // dropped from EMPHASIS's stack via its chain op (mirroring processEmphasis's inner cleanup):
    // `delim` nodes exist only when the emphasis construct is registered, so this cross-construct
    // reference is evaluated only when emphasis is present — deleting emphasis.js cannot break it.
    for (let n = opener.next; n !== null && n !== closer; n = n.next) {
      if (n.type === 'delim') { inlineEmphasisRemoveDelimiter(scan, n); }
    }
    let wrapNode = {type: 'text', literal: hashed, raw: true, prev: opener.prev, next: closer.next};
    if (opener.prev) { opener.prev.next = wrapNode; } else { scan.list.head = wrapNode; }
    if (closer.next) { closer.next.prev = wrapNode; } else { scan.list.tail = wrapNode; }
  }
});
