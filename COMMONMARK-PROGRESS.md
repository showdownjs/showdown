# CommonMark compliance — progress & handoff

Working notes for the incremental CommonMark-compliance effort on branch
`922-commonmark-compliance`. **Delete this file before opening the final PR.**

## Where things stand

Source of truth: `npx grunt test-commonmark`. **638 passing / 9 failing** (started at 413/234).
`npx grunt test` (lint + unit + functional) is green and must stay green at every step.

Everything is gated: each CommonMark-divergent feature is a per-feature boolean option (default
`false`) added to the `commonmark` flavor preset (`src/showdown.js`). The default converter is
untouched (the only intentional *default*-behavior change is the Unicode case-fold of reference
labels, see `caseFold` below). Zero CommonMark regressions have been introduced at any step —
verified per change with the snapshot diff described under "How to work" below.

### Flags now in the `commonmark` flavor (`src/showdown.js`)
`noHeaderId`, `requireSpaceBeforeHeadingText`, `decodeEntities`, `commonmarkEmphasis`,
`commonmarkAutolinks`, `commonmarkLinks`, `commonmarkRawHTML`, `commonmarkHTMLBlocks`,
`commonmarkBlockquotes`, `commonmarkLists`, `commonmarkInline`, `commonmarkTabs`.

### Completed work (each a separate, gated, tested commit)
| Phase | Feature / flag | CM cases |
|---|---|---|
| — | Entities (`decodeEntities`) | +9 |
| — | Emphasis/strong delimiter-run (`commonmarkEmphasis`) | +56 |
| — | Autolinks (`commonmarkAutolinks`) | +8 |
| 3b | Links + images + reference definitions (`commonmarkLinks`) | +41 |
| 4a | Inline raw HTML (`commonmarkRawHTML`) | +15 |
| 4b | HTML blocks (`commonmarkHTMLBlocks`) | +26 |
| 5a | Container block quotes (`commonmarkBlockquotes`) | +7 |
| 5b | Lists + list items (`commonmarkLists`) | +25 |
| 5b+ | setext/thematic-break vs list-item interference | +3 |
| 5b+ | lazy continuation through block-quote+list nesting | +2 |
| 6 | Unified inline parser (`commonmarkInline`) | +22 |
| 7 | Tab expansion (`commonmarkTabs`) | +4 |
| 7+ | Per-list loose/tight respects container nesting (`itemLoose`) | +2 |
| 7+ | Backslash escapes in normalized URLs (`cmNormalizeURL`) | +2 |
| 7+ | Info-string class convention + backslash (#24/#34, harness adjust) | +2 |
| 7+ | Unicode case-fold for reference labels (`caseFold`, default behavior) | +1 |

## HARD RULES (do not break)

1. **Divergence policy.** Where Showdown has no defined behavior → adopt CommonMark as default.
   Where CommonMark **conflicts** with Showdown's default → gate behind a per-feature boolean
   option (default `false`) added to the `commonmark` flavor. When unsure whether something changes
   default output → **gate it** (then it can never regress the default suite).
2. **Never modify existing tests — add only.** New coverage = new `test/unit/showdown.<flag>.js`
   files (assert default-off unchanged AND on-behavior correct). The *only* exception is the
   CommonMark harness adjustment file (`test/functional/makehtml/extra.testsuite.commonmark.js`),
   which legitimately rewrites a few expected outputs for Showdown's class-naming convention — and
   only with explicit maintainer direction.
3. **`grunt test` must stay green** at every step. By rule 1 it stays green by construction; track
   CommonMark progress with `grunt test-commonmark`.
4. **Attribution / stealth (see `CLAUDE.md`).** Nothing that leaves this machine — commit messages,
   code, comments, docs, filenames — may reveal AI/assistant involvement. No co-author trailers, no
   "prompt"/"Claude"/"Anthropic"/"AI" markers. Do not commit AI scratch artifacts (e.g. a stray
   `.cmpass.json`, agent transcripts). Write as the maintainer.

## The established gating pattern (follow it exactly)

For each CommonMark-divergent feature `X`:
- Add `X: {defaultValue:false, describe:'…', type:'boolean'}` in `src/options.js`.
- Add `X: true` to `flavor.commonmark` in `src/showdown.js`.
- In the subparser: `if (options.X) { …commonmark path… } else { …existing default… }`. For large
  rewrites, put the new code in its own file/subparser and have the existing one delegate when the
  flag is on (e.g. `cmList.js`, `cmInline.js`).
- The harness builds its converter from the flavor, so new flags are picked up automatically — do
  not hand-edit harness assertions.
- Develop high-blast-radius changes *behind the flag, not yet in the flavor*; only add to the
  flavor once a whole-suite diff shows **zero regressions** (this is how Phase 6 was landed).

## Key infrastructure already in place

**Subparsers** (`src/subParsers/makehtml/`): `cmInline.js` (unified inline parser), `cmList.js`
(`parseCmList` container list parser), `blockquote.js` (`parseCmBlockquotes`), `hashHTMLBlocks.js`
(`parseCmHTMLBlocks`, 7 HTML-block types; takes a `sourceMode` arg from `converter.js`),
`stripLinkDefinitions.js` (`parseCmLinkDefinitions`), `link.js`/`image.js` (legacy per-construct CM
scanners, used when `commonmarkLinks` is on but `commonmarkInline` is off).

**Helpers** (`src/helpers.js`): `cmEncodeURI`, `cmDecodeEntities`, `cmNormalizeURL`,
`cmEscapeTitle`, `cmNormalizeLabel`, `cmScanDestination`, `cmScanTitle`, `caseFold`
(`toLowerCase().toUpperCase()` — Unicode label folding), `expandCmTabs` (4-column tab-stop
expansion of the block-structure prefix). Regex sources: `showdown.helper.regexes.cmHTMLTagSource`
/ `cmOpenTagSource` / `cmCloseTagSource`.

**Pipeline order** (`src/converter.js`): `metadata → hashPreCodeTags → githubCodeBlock →
expandCmTabs (gated) → hashHTMLBlocks(sourceMode) → hashCodeTags → stripLinkDefinitions →
blockGamut → paragraphs → decodeEntities → unhashHTMLSpans → unescapeSpecialChars`. `blockGamut`
order: setext → atx → horizontalRule → list → codeBlock → table → blockquote → hashHTMLBlocks
(generated-markup pass). `spanGamut` routes inline through `cmInline` when `commonmarkInline` is on.

## How to work (verification — read this, it has real gotchas)

1. **`grunt test-commonmark` is the source of truth.** It runs the generated
   `cases/commonmark.testsuite.json` through `extra.testsuite.commonmark.js`, which *excludes* a few
   cases and rewrites a few expected outputs (Showdown's `lang language-lang` class convention). A
   raw `commonmark-spec` `cm.tests` probe will **over/under-count** vs the official harness.
2. **Tabs gotcha:** the `commonmark-spec` npm package renders tabs as `→` (U+2192) in
   `cm.tests[].markdown`. A `cm.tests`-based probe therefore tests *arrows, not tabs* — tab cases
   must be checked via `grunt test-commonmark` (real tabs) or hand-written `\t` strings.
3. **`grunt test` / `grunt test-commonmark` clean `.build/` on exit.** Rebuild with
   `npx grunt concat:test` before any `node -e 'require("./.build/showdown.js")'` probe.
4. **Snapshot/FIXED-REGRESSED diff** (used throughout, asserts zero regressions across the *whole*
   suite, not just the section you touched). Either save a baseline and diff, or compare a flag-on
   vs flag-off converter:
   ```
   node -e 'const s=require("./.build/showdown.js"),cm=require("commonmark-spec");
   const n=x=>x.replace(/\s+/g," ").trim();
   const on=new s.Converter(s.getFlavorOptions("commonmark"));
   const o=s.getFlavorOptions("commonmark");o.<FLAG>=false;const off=new s.Converter(o);
   let fix=[],reg=[];for(const t of cm.tests){const id=t.example||t.number;
   const a=n(off.makeHtml(t.markdown))===n(t.html),b=n(on.makeHtml(t.markdown))===n(t.html);
   if(b&&!a)fix.push(id);if(!b&&a)reg.push(id);}
   console.log("FIXED",fix,"REGRESSED",reg);'
   ```
   List official failures by section:
   `npx grunt test-commonmark 2>&1 | grep -oE "[0-9]+\) [A-Za-z].*_[0-9]+" | sed -E 's/^[0-9]+\) //'`
5. **Commit cadence:** one feature per commit, `feat(commonmark): …`/`fix(commonmark): …`, only
   after the snapshot diff is regression-free AND `grunt test` is green. `rm -f .cmpass.json` before
   committing. ReDoS-check any new scanner on long inputs (`'['.repeat(80000)`, etc.).

## NEXT: the remaining 9 failures

`#161, #174, #218, #236, #278, #318, #321, #324` (group A) and `#31` (group B).

### Group A — container-first parsing (8 cases): the dominant remaining lever
`#161, #174, #218, #236, #278, #318, #321, #324`. **One shared root cause:** the converter-level
*leaf-block* parsers (`githubCodeBlock`, `hashHTMLBlocks` source-mode, `stripLinkDefinitions`) run
**before** the *container* parsers (`cmList`, `blockquote`, which live in `blockGamut`). So a
construct nested inside a container is parsed at the top level without the container's indentation
context:
- #318/#321/#324/#278 — a list item's *indented* fence: its closing ` ``` ` (at line start,
  indented to the item) is mistaken for a new *opening* fence and swallows following lines
  (trace: `githubCodeBlock.onEnd` hashes `   ```…` into a stray `¨G` block). Confirmed root cause.
- #161 — a fence right after `<div></div>`: parsed instead of staying part of the HTML block.
- #174 — `<div>` inside a block quote: not recognized as an HTML block within the quote
  (`hashHTMLBlocks` source-mode only fires at the top level, not on recursed container content).
- #236 — indented code in a block quote: markerless `bar` wrongly joined instead of being a
  separate code block.
- #218 — `> [foo]: /url`: `stripLinkDefinitions` only collects *top-level* defs.

**Fix = container-first parsing** (run lists/block quotes before the leaf-block parsers). The
obstacle: those leaf parsers run before `stripLinkDefinitions`, and reordering risks breaking link
references document-wide — high blast radius, so it must be gated and diffed at every step. A
sketch that keeps the default path intact:
- Restrict the converter-level `githubCodeBlock` (in CM mode) to fences at indent 0 only; handle
  indented fences inside `blockGamut` **after** the container parsers have claimed item/quote
  content (so `cmList`/`blockquote` `renderItem`/`renderBlockquote` — which already call
  `githubCodeBlock` on the stripped content — own the item's fence). Verify top-level indented
  fences (e.g. spec #131/#133, currently passing via harness normalization) don't regress.
- Thread `sourceMode` (or run `parseCmHTMLBlocks`) through the container recursion for #174.
- Collect reference definitions from inside containers for #218.
This is the biggest single remaining win and the right candidate for the next dedicated session.

### Group B — entity inside a raw HTML block (#31): not cleanly separable from #34
`<a href="&ouml;&ouml;.html">` is a raw HTML block whose content must stay verbatim, but
`decodeEntities` (running after `paragraphs` unhashes the block) decodes it to `öö`. **Tried and
reverted:** skipping entities inside `cmHTMLTagSource` matches in `decodeEntities` fixes #31 but
**regresses #34** — the fenced-code class `<code class="f&ouml;…">` is *generated* HTML whose
info-string entity *should* decode, and after unhashing it is byte-identical to a raw `<a>` tag.
The two trade. A clean fix must distinguish raw-HTML-block `¨K` entries (from `parseCmHTMLBlocks`)
from generated `¨G`/blockquote/list/hr `¨K` blocks and defer **only** the raw-HTML ones past
`decodeEntities` — which means giving them a distinct marker and teaching `paragraphs`' graf loop
+ a late unhash step about it. Bounded but invasive for one case; do it only alongside group A or
when touching `paragraphs` anyway.

## Out of scope / known non-wins
- **#24/#34 (info-string class):** Showdown emits `lang language-lang`; the harness rewrites the
  expected for the explicit `Fenced code blocks` cases (#142/143/144) and now #24/#34 too. The
  doubling itself is intentional Showdown behavior — don't "fix" it (would trade #142/143/144).
- The raw `cm.tests` probe shows extra Fenced-code-blocks "failures" (#126/#127/#130/#131/#133) that
  are **passing** in the official harness (whitespace/class normalization). Not real failures.

---

## Ready-to-paste prompt for the next session

> Continue the CommonMark-compliance work on branch `922-commonmark-compliance`. Read
> `COMMONMARK-PROGRESS.md` first — follow its HARD RULES (gate per-feature, off by default, added to
> the `commonmark` flavor; add-only tests; `grunt test` stays green; stealth/attribution rule) and
> the verification workflow exactly (`grunt test-commonmark` is the source of truth; the snapshot
> FIXED/REGRESSED diff must show zero regressions; rebuild `.build` with `grunt concat:test` before
> node probes; tabs render as `→` in the `cm.tests` probe). Take on **Group A: container-first
> parsing** (#161/#174/#218/#236/#278/#318/#321/#324) — the converter-level leaf-block parsers run
> before the container parsers, so a list item's indented fence is mis-read as a top-level fence.
> Implement it gated and incrementally per the sketch in the doc, diffing every step. Commit in
> small, verified increments.
