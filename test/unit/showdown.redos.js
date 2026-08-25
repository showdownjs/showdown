/**
 * ReDoS / algorithmic-complexity regression suite.
 *
 * Each case feeds a large, adversarial input through makeHtml and asserts it finishes well
 * within a wall-clock budget. All of these parsers are linear (or near-linear) after the
 * hardening in src/subParsers/makehtml/*; if a change reintroduces catastrophic backtracking
 * (or an O(n^2) loop), the input below blows past BUDGET_MS — and the hard per-test timeout —
 * instead of completing in tens of milliseconds.
 *
 * The margin is deliberately wide (linear finishes in well under ~500ms even on a slow box,
 * a reintroduced quadratic takes many seconds at this input size) so the threshold is not flaky.
 */
describe('ReDoS resistance', function () {
  'use strict';

  // ~120 KB of pathological input. Linear parsers handle this in well under BUDGET_MS;
  // a quadratic regression would take several seconds (and trip the hard timeout).
  var N = 60000;
  var BUDGET_MS = 4000;
  var HARD_TIMEOUT_MS = 30000;

  var cases = [
    // --- inline link / image destinations (nested-lazy paren scan) ---
    {name: 'inline link destination — unbalanced (', input: '[a](' + 'a('.repeat(N)},
    {name: 'inline link destination — unbalanced ( + )', input: '[a](' + 'a('.repeat(N) + ')'},
    {name: 'inline image destination — unbalanced (', input: '![a](' + 'a('.repeat(N)},
    {name: 'inline image destination — unbalanced ( + )', input: '![a](' + 'a('.repeat(N) + ')'},
    {name: 'link destination with many open parens', input: '[a](http://x/' + '('.repeat(N)},
    // Each `]` retries the bare-destination walk at the following `(`; with no cap on unmatched
    // depth, a tail of unbroken `(` (here, the next repetition's own opener) walks to
    // end-of-string before failing, so a run of `[](` pairs cost one full-tail walk per pair -
    // O(n^2) overall. The 32-unmatched-paren cap (see cmScanDestination) bounds each walk to a
    // constant, keeping this linear.
    {name: 'many [](  pairs, each destination walk unbounded without the paren-depth cap', input: '[]('.repeat(8000)},
    {name: 'balanced nested links', input: '[x]('.repeat(N) + 'u' + ')'.repeat(N)},
    {name: 'balanced nested images', input: '![x]('.repeat(N) + 'u' + ')'.repeat(N)},

    // --- reference labels / bracket runs ---
    {name: 'open square brackets', input: '['.repeat(N)},
    {name: 'open image brackets', input: '!['.repeat(N)},
    {name: 'close-bracket run', input: ']'.repeat(N)},

    // --- ATX headings (lazy text vs trailing closing-hash run) ---
    {name: 'atx: many # then text', input: '#'.repeat(N) + ' h'},
    {name: 'atx: text then many closing #', input: '# h ' + '#'.repeat(N)},
    {name: 'atx: only #', input: '#'.repeat(N)},

    // --- raw HTML span hashing (tag / closing-tag scan) ---
    {name: 'raw HTML: many < ', input: '<'.repeat(N)},
    {name: 'raw HTML: open tag, many attrs, no close', input: '<a ' + 'b=c '.repeat(N) + '>'},
    {name: 'raw HTML: open tag, many attrs, stray close', input: '<a ' + 'b=c '.repeat(N) + '></z>'},
    {name: 'raw HTML: many open tags, no close', input: '<a>'.repeat(N)},
    {name: 'raw HTML: many open tags + stray mismatched close', input: '<a>'.repeat(N) + '</z>'},
    {name: 'raw HTML: many close tags', input: '</a>'.repeat(N)},

    // --- raw HTML BLOCK scanner (htmlBlock legacy balanced-tag scan) ---
    // Many block-level openers with no matching closer: replaceRecursiveRegExp/rgxFindMatchPos
    // restarted its scan once per unbalanced opener, so this was O(n^2) (~12s at 80k). The
    // absent-close-tag guard in htmlBlock.js short-circuits when no closer follows, keeping it
    // linear. `<div>` and `<p>` are two block tags on the scan list.
    {name: 'raw HTML block: many unclosed <div>', input: '<div>\n'.repeat(N)},
    {name: 'raw HTML block: many unclosed <p>', input: '<p>\n'.repeat(N)},

    // --- emphasis / unhash spans (O(n) spans) ---
    {name: 'underscores a_ (many em spans)', input: 'a_'.repeat(N)},
    {name: 'asterisks', input: '*'.repeat(N)},
    {name: 'strong **', input: '**'.repeat(N)},
    {name: 'strikethrough ~~', input: '~~'.repeat(N)},

    // --- entities / autolinks / misc block starts ---
    {name: 'ampersands', input: '&'.repeat(N)},
    {name: 'numeric entity starts &#', input: '&#'.repeat(N)},
    {name: 'backticks', input: '`'.repeat(N)},
    {name: 'blockquote markers', input: '> '.repeat(N)},
    {name: 'list markers', input: '- '.repeat(N)},
    {name: 'setext underline', input: 'h\n' + '='.repeat(N)},
    {name: 'thematic-break asterisks', input: '*'.repeat(N) + '\n'},

    // --- option-gated parsers ---
    {name: 'footnote ref starts [^', input: '[^'.repeat(N), options: {footnotes: true}},
    {name: 'footnote ref starts [^ + space ]', input: '[^'.repeat(N) + ' ]', options: {footnotes: true}},
    {name: 'table: pipe-heavy row, no delimiter', input: '|a'.repeat(N), options: {tables: true}},
    {name: 'table: pipe-heavy row + fake delimiter', input: '|a'.repeat(N) + '\n|--|--|\n', options: {tables: true}},
    {name: 'gh mentions @', input: '@' + 'a'.repeat(N), options: {ghMentions: true}},
    {name: 'simplified autolink www', input: 'www.' + 'a.'.repeat(N), options: {simplifiedAutoLink: true}},
    {name: 'emoji colons', input: ':'.repeat(N), options: {emoji: true}},

    // --- unified inline engine (the spanGamut inline scan runs for every flavor) scan paths ---
    // Anchor opens with no matching </a>: the whole-anchor swallow was quadratic (~1.2s)
    // before the lastIndexOf guard; it must stay near-linear now.
    {name: 'anchor opens, no </a> (whole-anchor swallow)', input: '<a '.repeat(26666)},
    {name: 'well-formed anchor opens, no closer', input: '<a href="x">'.repeat(6666) + 'y'},
    // Simplified-autolink URL scanning: many short naked URLs, and one enormous URL.
    {name: 'many naked URLs', input: 'http://x.com/a '.repeat(5000), options: {simplifiedAutoLink: true}},
    {name: 'one huge naked URL', input: 'http://example.com/' + 'a'.repeat(80000), options: {simplifiedAutoLink: true}},
    // Escaped-delimiter runs exercise the escaped-flanking path in the inline engine.
    {name: 'escaped-delimiter runs \\_', input: '\\_'.repeat(40000)},

    // Scan-native strikethrough pairing (the `~` runs become delimiter-like nodes paired after
    // emphasis). The adversarial shape is many valid OPENERS with no valid closer (`~~x ` — every
    // candidate closer has a space before it): the historical whole-text regex resolved this in
    // O(n^2), so the node pairing precomputes each run's flanking chars once and stays O(n). The
    // immediate-pair shape (`~~a~~ `) and one giant run are covered for completeness.
    {name: 'strikethrough: unpairable openers ~~x ', input: '~~x '.repeat(N), options: {strikethrough: true}},
    {name: 'strikethrough: immediate pairs ~~a~~ ', input: '~~a~~ '.repeat(N), options: {strikethrough: true}},
    {name: 'strikethrough: one giant tilde run', input: '~'.repeat(120000), options: {strikethrough: true}},

    // Scan-native underline (option): the claim set is computed once per (sub)scan by replaying the
    // `___`/`__` sweep regexes, each with `[\s\S]*?` lazy content and (normal mode) a `/\S$/` reject.
    // The adversarial shapes are many unpaired openers (`__x ` — every candidate closer has a space
    // before it, forcing the lazy scan to the string end and rejecting), many immediate pairs
    // (`__a__ `) and one giant underscore run; all must stay linear.
    {name: 'underline: unpairable openers __x ', input: '__x '.repeat(N), options: {underline: true}},
    {name: 'underline: immediate pairs __a__ ', input: '__a__ '.repeat(N), options: {underline: true}},
    {name: 'underline: one giant underscore run', input: '_'.repeat(120000), options: {underline: true}},

    // --- shapes that used to backtrack quadratically ---
    // (B1) Table cells route through the codeSpan pass (table.js). The legacy whole-text
    // pattern there (`(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)`) backtracked quadratically on a
    // long unbroken backtick run fed straight from a cell (~1s at 2k chars, ~8s at 4k).
    {name: 'table cell with a giant backtick run', input: '| a | ' + '`'.repeat(4000) + ' |\n| --- | --- |\n| b | c |', options: {tables: true}},
    // (B2) The htmlBlock standalone-comment scan used to lack the absent-close-tag guard its
    // balanced-tag sibling has: each `<!--` opener with no `-->`/`--!>` ahead restarted the
    // recursive scan, O(n^2) in the opener count (~2s at 4k openers, ~8s at 8k).
    {name: 'many unclosed HTML comment openers', input: '<!-- x\n'.repeat(8000)},
    // (B3) The processing-instruction regex `\n\n( {0,3}<([?%])[^\r]*?\2>...)` lazy-scanned to
    // end-of-input for every `\n\n<?` opener with no closer, O(n^2) in the opener count
    // (~2.3s at 8k openers, ~10s at 16k).
    {name: 'many unclosed processing-instruction openers', input: '\n\n<?x'.repeat(16000)},
    // (B4) The nakedUrl body regex pairs adjacent greedy classes behind a lazy
    // backreferenced marker prefix; kept as a guard — measured near-linear today
    // (~20ms at 80k) but the shape is one edit away from backtracking.
    {name: 'marker-prefixed giant naked-URL token', input: '~_'.repeat(1000) + 'www.' + 'a'.repeat(80000), options: {simplifiedAutoLink: true}},
    // (B5) trimUrlPunctuation used to recompute full-string paren counts once per trimmed
    // trailing bracket, O(n^2) on a long `)))...` tail (~1.5s at 40k parens, ~6.4s at 80k).
    {name: 'naked URL with a giant trailing paren run', input: 'www.example.com/a' + ')'.repeat(80000), options: {simplifiedAutoLink: true}},
    // (B5 guards) Bounded-by-design shapes pinned so future edits cannot unbind them:
    // the safeMode disallowed-tags regex interior is ambiguous but unreachable-unterminated
    // (upstream escapes bare `<`), and the table scan's lazy terminator always finds the
    // end-of-input sentinel.
    {name: 'safeMode: long tag stuffed with quote pairs', input: '<a ' + '"x" '.repeat(10000) + '>', options: {safeMode: true}},
    {name: 'safeMode: unterminated tag stuffed with quote pairs', input: '<a ' + '"x" '.repeat(10000), options: {safeMode: true}},
    {name: 'table: many header+delimiter openers, no body', input: '|a|\n|-|\n'.repeat(6000), options: {tables: true}},

    // --- unbalanced openers WITH a closer present ---
    // The recursive delimiter matcher used to drop one unmatched opener and rescan the
    // remainder, so a run of openers cost one full scan each. An absent-closer check does not
    // cover these: appending a single closer keeps every opener unmatched (the depth counter
    // never returns to zero) while making any "is there a closer" guard pass, which is why the
    // matcher pairs delimiters by depth arithmetic instead. The `<div>` shape below was ~11s.
    {name: 'unclosed <div> run + one trailing </div>', input: '<div>\n'.repeat(20000) + '</div>\n'},
    {name: 'unclosed comment run + one trailing -->', input: '<!-- x\n'.repeat(8000) + '-->\n'},
    // A processor instruction only closes when its `?>` is followed by a blank line, so a
    // trailing `?>x` leaves every opener unclosed while defeating a plain presence check.
    {name: 'unclosed PI run + one malformed ?>', input: '\n\n<?x'.repeat(16000) + '?>x'},

    // --- INLINE raw-HTML productions (comment / declaration / CDATA / processing instruction) ---
    // The inline scanner attempts the CommonMark raw-HTML grammar at every `<`. These four
    // productions only end at a required terminator and their content matches newlines, so an
    // opener with none ahead used to scan to end-of-input before failing — one full scan per
    // opener, i.e. O(n^2) (`<!DOCTYPE` cost ~15s at 16k openers). Every shape below must stay
    // OFF the start of a line: a line-initial opener is taken by the HTML-block scanner instead,
    // which would leave the inline path untested. Trailing terminators likewise have to sit in
    // the same paragraph to be in the same scan.
    {name: 'inline declaration openers, no terminator', input: 'z <!DOCTYPE x '.repeat(16000)},
    {name: 'inline declaration openers + trailing >', input: 'z <!DOCTYPE x '.repeat(16000) + '>'},
    {name: 'inline CDATA openers, no terminator', input: 'z <![CDATA[x '.repeat(16000)},
    {name: 'inline CDATA openers + trailing ]]>', input: 'z <![CDATA[x '.repeat(16000) + ']]>'},
    {name: 'inline PI openers, no terminator', input: 'z <?x '.repeat(16000)},
    {name: 'inline comment openers, no terminator', input: 'z <!-- x '.repeat(16000)},
    // Terminator present but never usable: the comment production consumes dashes in threes, so
    // it steps over a `-->` whose leading dash run has the wrong length (the parity is
    // CommonMark's actual language — `<!--a--->` is genuinely not a comment). A
    // terminator-presence guard passes here, which is why the scan memoizes failed cursors.
    {name: 'inline comments, dash-parity <!--a--->', input: 'z <!--a---> '.repeat(16000)},
    {name: 'inline comments, pure dash run <!------>', input: 'z <!------> '.repeat(16000)},
    {name: 'inline comments, --!> parity twin <!---!>', input: 'z <!---!> '.repeat(16000)},
    // Terminator before every opener rather than after: pins that the guard asks "is one ahead
    // of the cursor", not merely "does the document contain one".
    {name: 'inline comments, terminator only before the openers', input: '--> ' + 'z <!-- x '.repeat(16000)},
    // Terminator overlapping its own opener (`<?>` contains `?>` at offset 1), and the
    // case-sensitive CDATA prefix falling through to the unguarded path.
    {name: 'inline PI, terminator overlaps opener', input: 'z <?> '.repeat(16000)},
    {name: 'inline comment, terminator overlaps opener', input: 'z <!--!> '.repeat(16000)},
    {name: 'inline lowercase cdata (not the CDATA production)', input: 'z <![cdata[x '.repeat(16000)},
    // All four guarded productions plus the whole-anchor memo interleaved in one scan.
    {name: 'inline: all raw-HTML productions interleaved', input: 'z <!-- <?x <![CDATA[ <!D '.repeat(8000)},
    {name: 'inline: anchors interleaved with comments', input: 'z <a href="x"><!-- y '.repeat(8000)}
  ];

  cases.forEach(function (tc) {
    it('should not blow up on: ' + tc.name, function () {
      var converter = new showdown.Converter(tc.options || {}),
          start = Date.now();
      converter.makeHtml(tc.input);
      var elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(BUDGET_MS);
    }, HARD_TIMEOUT_MS);
  });

  // The paren-depth cap in cmScanDestination bounds UNMATCHED depth, not the total parenthesis
  // count: a destination with several balanced, sequentially-closed pairs never carries more
  // than a couple of levels of unmatched depth at once, so it must still resolve to a link.
  it('should still parse a destination with several balanced parens', function () {
    var converter = new showdown.Converter(),
        html = converter.makeHtml('[x](/url(a(b)c)d)');
    expect(html).toBe('<p><a href="/url(a(b)c)d">x</a></p>');
  });

  // The emphasis pairing pass (spec §6.2 process_emphasis) is run a second time by every
  // resolving bracket, fenced to the delimiters opened inside the label. The fencing is the walk
  // that positions the first closer ABOVE stackBottom, and it MUST be allowed to run off the
  // bottom of the stack and yield null when there is nothing above it — the ordinary case for a
  // label with no delimiters of its own, where stackBottom is the current stack top. A walk that
  // stops one node early instead hands that fenced call the WHOLE stack, so it pairs and consumes
  // delimiters from outside the label and leaves already-consumed ones (numdelims === 0) linked;
  // the next pass then decrements them past zero forever, because only an exact zero retires a
  // delimiter. That was an unbounded loop — memory exhaustion, not merely slow — on this
  // 21-character input, under the DEFAULT converter.
  it('should terminate when a bracket fences emphasis over an already-consumed stack', function () {
    var converter = new showdown.Converter(),
        start = Date.now();
    expect(converter.makeHtml('**d\n*\n\\__\\h*d**\n*[]()'))
      .toBe('<p><strong>d\n*\n__\\h*d</strong>\n*<a href=""></a></p>');
    expect(Date.now() - start).toBeLessThan(BUDGET_MS);
  }, HARD_TIMEOUT_MS);

  // Same pathological inputs must also be safe with safeMode on (its extra passes run over
  // the near-final output and must not reintroduce quadratic scanning).
  it('should not blow up under safeMode', function () {
    var converter = new showdown.Converter({safeMode: true, tables: true, footnotes: true}),
        start = Date.now();
    converter.makeHtml('[a](' + 'a('.repeat(N) + ')');
    converter.makeHtml('<a ' + 'b=c '.repeat(N) + '>');
    converter.makeHtml('#'.repeat(N) + ' h');
    var elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(BUDGET_MS);
  }, HARD_TIMEOUT_MS);
});
