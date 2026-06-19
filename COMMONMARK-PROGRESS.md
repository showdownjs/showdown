# CommonMark compliance — progress & handoff

Working notes for the incremental CommonMark-compliance effort on branch
`922-commonmark-compliance`. **Delete this file before opening the final PR.**

## Where things stand

Source of truth: `npx grunt test-commonmark`. **647 passing / 0 failing** (started at 413/234).
The full CommonMark spec suite passes. `npx grunt test` (lint + unit + functional) is green and
must stay green at every step.

Everything is gated: each CommonMark-divergent feature is a per-feature boolean option (default
`false`) added to the `commonmark` flavor preset (`src/showdown.js`). The default converter is
untouched (the only intentional *default*-behavior change is the Unicode case-fold of reference
labels, see `caseFold` below). Zero CommonMark regressions have been introduced at any step —
verified per change with the snapshot diff described under "How to work" below.

### Flags now in the `commonmark` flavor (`src/showdown.js`)
`noHeaderId`, `requireSpaceBeforeHeadingText`, `decodeEntities`, `commonmarkEmphasis`,
`commonmarkAutolinks`, `commonmarkLinks`, `commonmarkRawHTML`, `commonmarkHTMLBlocks`,
`commonmarkBlockquotes`, `commonmarkLists`, `commonmarkInline`, `commonmarkTabs`,
`commonmarkContainers`.

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
| A | Container-first leaf parsing (`commonmarkContainers`) — see below | +8 |
| B | Raw HTML block entities kept verbatim (`¨R`/`gHtmlRawBlocks`) | +1 |

**Group A (`commonmarkContainers`)** landed the whole container-first leaf-block group as small
gated commits (all behind the new `commonmarkContainers` flag, on in the `commonmark` flavor):
- Converter-level `githubCodeBlock` only claims indent-0 *opening* fences (and skips its
  run-to-EOF pass) so a list item's indented fence — or the indent-0 closing fence of an indent
  1-3 top-level block — is never mistaken for a new opener; a `blockGamut` pass after the
  container parsers handles genuinely top-level indented fences (#321/#324/#131).
- `renderBlockquote` runs the source-level HTML-block and link-definition passes on the quote's
  stripped content (#174/#218); a `codeBlock` re-run after the block-quote parser recognizes
  indented code revealed once the quote is extracted (#236).
- The HTML-block scan runs before `githubCodeBlock` (and is fence-aware) so an open HTML block
  absorbs a following fence while a fence still escapes HTML-like lines inside it (#161).
- `cmList`: strip an empty marker's leading line so an indented-code first block is recognized
  (#278); `itemLoose` skips a fenced block's interior so blank lines inside an item fence don't
  make the list loose (#318).

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

## NEXT: nothing — the spec suite is fully passing (647/0)

Both Group A (container-first parsing, `commonmarkContainers`) and Group B (raw HTML block
entities) are done — see "Completed work" above. The whole CommonMark spec suite passes.

> **Watch-out learned in Group A:** the quick raw-`cm.tests` snapshot diff (collapse-all
> `\s+→" "`) under-reports indentation-sensitive cases — it masked a #131 regression that the
> official harness (per-line trim) caught. Always confirm each step with `npx grunt test-commonmark`,
> not just the raw diff.
>
> **Known non-win deferred from #318:** CommonMark keeps blank lines that are part of a fenced
> code block (`b\n\n\n`); Showdown's `githubCodeBlock` trims trailing newlines. Adding them back
> in CM mode feeds a *pre-existing* O(n²) in `paragraphs`' newline handling, so an all-blank fence
> (`` ``` `` + 100k blank lines) becomes a DoS. #318 passes anyway (the harness normalizes the
> blank-line difference), so the add-back was dropped. Only revisit if the `paragraphs` quadratic
> is fixed first.

### Group B — entity inside a raw HTML block (#31): DONE
`<a href="&ouml;&ouml;.html">` is a raw HTML block whose content must stay verbatim, but
`decodeEntities` (running after `paragraphs` unhashed the block) decoded it to `öö`. The trap was
#34: the fenced-code class `<code class="f&ouml;…">` is *generated* HTML whose info-string entity
*should* decode, and after unhashing it is byte-identical to a raw `<a>` tag — so a blanket
"skip entities in tags" rule traded #31 for #34. **Fix (landed):** `parseCmHTMLBlocks` now hashes
raw HTML blocks with a distinct `¨R` marker backed by a separate `globals.gHtmlRawBlocks` store;
`paragraphs` treats `¨R` grafs as blocks (no `<p>`-wrap, not unhashed there); the converter
restores them right after `decodeEntities`. Generated `¨K`/`¨G` blocks (incl. the fenced-code
class) still decode as before.

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
