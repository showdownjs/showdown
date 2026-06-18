# CommonMark compliance — progress & handoff

Working notes for the incremental CommonMark-compliance effort on branch
`922-commonmark-compliance`. Delete this file before opening the final PR.

## Where things stand

Optional suite: `npx grunt test-commonmark`. **605 passing / 42 failing** (started at 413/234).

Done this far (each a separate, gated, tested commit):
| Commit | Phase | CM cases |
|---|---|---|
| `37de87e` | Entities (`decodeEntities`) | +9 |
| `c25d9ed` | Emphasis/strong delimiter-run (`commonmarkEmphasis`) | +56 |
| `d0d5662` | Autolinks (`commonmarkAutolinks`) | +8 |
| Phase 3b | Links + Images + Reference definitions (`commonmarkLinks`) | +41 |
| Phase 4a | Inline raw HTML (`commonmarkRawHTML`) | +15 |
| Phase 4b | HTML blocks (`commonmarkHTMLBlocks`) | +26 |
| Phase 5a | Container block quotes (`commonmarkBlockquotes`) | +7 |
| Phase 5b | Lists + list items (`commonmarkLists`) | +25 |
| Phase 5b+ | setext/thematic-break vs list-item interference | +3 |
| Phase 5b+ | lazy continuation through block-quote+list nesting | +2 |

Phase 3b shipped as 5 gated commits behind `commonmarkLinks` (added to the `commonmark`
flavor): shared URL helpers; URL normalization + in-URL entity decoding; a manual
inline-link scanner (balanced parens, `<…>`, titles, escapes, arbitrary bracket nesting);
a block-aware reference-definition parser (multiline, `<>`, first-wins, escapes); and
CommonMark images (alt-text flattening + a symmetric inline-image scanner). Unit coverage
in `test/unit/showdown.commonmarkLinks.js`.

Phase 4a (`commonmarkRawHTML`): strict CommonMark inline raw-HTML recognition
(`showdown.helper.regexes.cmHTMLTagSource`). Valid tags/comments/PIs/declarations/CDATA are
hashed early in `spanGamut` (after backslash escapes + link/image destinations, before
emphasis); malformed `<…>` falls through to `encodeAmpsAndAngles` to be escaped.
`escapeSpecialCharsWithinTagAttributes` and the single-tag `hashHTMLSpans` passes are skipped
in this mode. Unit coverage in `test/unit/showdown.commonmarkRawHTML.js`.

Phase 4b (`commonmarkHTMLBlocks`): the 7 CommonMark HTML block types via a line-based scanner
in `hashHTMLBlocks.js` (`parseCmHTMLBlocks`). It runs only on the original source — the
converter passes a new `sourceMode` arg; `blockGamut` re-invokes `hashHTMLBlocks` on generated
markup and there the existing balanced-tag hashing is kept so generated block tags aren't
over-consumed (e.g. `<ul>…</ul>` followed by `---`). Type 7 cannot interrupt a paragraph.
Unit coverage in `test/unit/showdown.commonmarkHTMLBlocks.js`. The remaining HTML-block
failures (#148, #174, #175, #191) are container-nested (HTML inside list items / block quotes /
indented) — they need the CommonMark container-block parser (Phase 5).

Remaining failures by section: List items ~36, Lists ~21, Links 18, Fenced code blocks 11,
Tabs 10, Block quotes 8, Code spans 8, HTML blocks 4 (container-nested), Backslash escapes 3,
Entity 3, Setext headings 2, Indented code 2, Link reference defs 2, others 1 each.
The remaining ~18 Links failures need the full delimiter-stack inline parser (link/image
precedence with emphasis, nested-link deactivation, reference-vs-inline shortest-match) —
the deliberately deferred hard core; the current scanner handles destinations/labels but
not the cross-construct precedence cases (#517/#518/#519/#531/#532/#568/#570, …).

## HARD RULES (do not break)

1. **Divergence policy.** Where Showdown's flavor has no defined behavior → adopt CommonMark as
   the default. Where CommonMark **conflicts** with Showdown's default → DO NOT change the
   default; gate the new behavior behind a per-feature boolean option (default `false`) and add
   it to the `commonmark` flavor preset. When unsure whether something changes default output →
   **gate it** (it can never regress the default suite then).
2. **Never modify existing tests — add only.** New coverage = new fixtures / new unit files.
   The only exception is fixing a CommonMark spec test case that is genuinely wrong.
3. **`grunt test` (lint + 392 unit + 397 functional) must stay green** at every step. Because of
   rule 1 it stays green by construction. Track progress with `grunt test-commonmark`.

## The established gating pattern (follow it exactly)

For each CommonMark-divergent feature `X`:
- Add option `X: {defaultValue:false, describe:'…', type:'boolean'}` in `src/options.js`.
- Add `X: true` to `flavor.commonmark` in `src/showdown.js`.
- In the relevant subparser: `if (options.X) { …commonmark path… } else { …existing default… }`.
- The CommonMark harness already builds its converter from the flavor
  (`extra.testsuite.commonmark.js` → `getFlavorOptions('commonmark')`), so new flavor flags are
  picked up automatically — **do not hand-edit the harness assertions.**
- Add an add-only unit test `test/unit/showdown.X.js` (see `showdown.commonmarkEmphasis.js` as a
  template): assert default-off behavior is unchanged AND on-behavior is correct.

Reusable helpers now in place (in `src/helpers.js`): `cmEncodeURI`, `cmDecodeEntities`,
`cmNormalizeURL`, `cmEscapeTitle`, `cmNormalizeLabel`, `cmScanDestination`, `cmScanTitle`
— the shared CommonMark URL/label/destination machinery used by `link.js`, `image.js` and
`stripLinkDefinitions.js`.

## DONE: Phase 3b — Links + Images + Reference definitions (`commonmarkLinks`, +41)

Shipped as 5 gated commits (see the table above). What is implemented:
1. URL normalization + in-URL entity decoding (`cmNormalizeURL`): `&ouml;`→`ö`→`%C3%B6`,
   percent-encoding, backslash-escape placeholder restoration. Closed Entity-in-URL #31–34.
2. Manual inline-link scanner in `link.js`: balanced parens, `<…>`, the three title delimiters,
   backslash escapes, innermost-bracket matching, arbitrary label nesting depth. Single-pass O(n).
3. Block-aware reference-definition parser in `stripLinkDefinitions.js`: multiline defs, `<…>` and
   empty `<>` destinations, multiline titles, first-definition-wins, escapes, label normalization;
   defs recognized only at block boundaries (start / blank line / ATX heading / thematic break) so
   they cannot interrupt a paragraph.
4. CommonMark images in `image.js`: alt-text flattening (`![foo *bar*]`→`alt="foo bar"`, nested
   image→its alt, nested link→its text) + a symmetric manual inline-image scanner.
5. Precedence with `commonmarkEmphasis` verified (covered in the unit tests).

### Deferred hard core (the remaining ~18 Links failures)
These need a **full delimiter-stack inline parser** (the CommonMark "process emphasis" + link
bracket algorithm) rather than the current per-construct scanners, because they hinge on
cross-construct precedence: a link cannot contain another link (outer brackets deactivate),
reference-vs-inline shortest-match, and emphasis spans interleaving with brackets. Examples:
#517, #518, #519, #523, #525, #531, #532, #535, #537, #555, #568, #570. Showdown's architecture
runs `image` and `link` as separate sequential subparsers, so a faithful fix likely means a
single unified inline scanner — a larger structural change, best done as its own phase.

Sanity-check current failures any time with (refresh `.build` first via `npx grunt concat:test`):
```
node -e 'const s=require("./.build/showdown.js"),cm=require("commonmark-spec");
const c=new s.Converter(s.getFlavorOptions("commonmark"));const n=x=>x.replace(/\s+/g," ").trim();
for(const t of cm.tests){if(t.section!=="Links")continue;const g=c.makeHtml(t.markdown);
if(n(g)!==n(t.html))console.log("#"+(t.example||t.number)+" "+JSON.stringify(t.markdown)+"\n  EXP "+JSON.stringify(t.html)+"\n  GOT "+JSON.stringify(g));}'
```

## DONE: Phase 5b — lists + list items (`commonmarkLists`, +25)

New line-based parser `src/subParsers/makehtml/cmList.js` (subparser `makehtml.cmList`),
invoked only via the gate in `makehtml.list` when `commonmarkLists` is on (the regex parser
stays the untouched default). Implements: bullet-marker / ordered-delimiter change splits a
list (#301/#302), ordered `start` + `)` delimiter, per-list loose/tight (`<p>`-wrap vs inline,
with the exact `<li>\n…\n</li>` serialization), paragraph-interruption rules (empty / non-1
ordered may not interrupt, #304), indentation-based nesting and same-line nesting (`- - foo`),
indented-code in items (trailing-newline so the recursive code parser fires), and empty-item
edge cases (#280/#315). Item content is rendered by recursing through `blockGamut` + a
tight/loose-aware paragraph wrap. Unit coverage in `test/unit/showdown.commonmarkLists.js`.

## NEXT: the remaining ~47

- **Lists, the hard tail (~6):** setext/thematic-break interference (#281/#282/#300) and
  block-quote+list lazy continuation (#292/#293) are now fixed. Remaining: loose-detection
  inside items containing fenced code / blank lines (#307/#318/#319/#321/#324) and similar
  multi-block item edge cases.
- **Container-nested HTML blocks (#148/#174/#175):** HTML inside a list item / block quote needs
  CommonMark HTML-block recognition on the *recursed* content; currently `hashHTMLBlocks`'
  `sourceMode` only fires at the converter level, so item/quote content uses the balanced-tag
  path. Thread source-mode (or run the CM HTML-block scanner) through the container recursion.
- **Tabs (~10):** 4-column tab-stop expansion (a pre-pass), interacts with list/code indent.
- **Fenced code blocks (~11), Code spans (~8):** info-string/closing-fence and backtick-run
  edge cases — independent of containers.
- **Links (~17):** the unified delimiter-stack inline parser (link/image/emphasis precedence,
  nested-link deactivation, reference-vs-inline shortest-match) — the deferred hard core.

The full roadmap with rationale lives in
`C:\Users\estev\.claude\plans\implement-the-following-missing-serialized-minsky.md`.

---

## Ready-to-paste prompt for the next session

> Continue the CommonMark-compliance work on branch `922-commonmark-compliance`. Read
> `COMMONMARK-PROGRESS.md` first — follow its HARD RULES and the established gating pattern
> exactly (per-feature boolean option, off by default, added to the `commonmark` flavor; never
> modify existing tests, add only; `grunt test` must stay green). Implement **Phase 3b: Links +
> Images + Reference definitions**, gated behind a `commonmarkLinks` flag, reusing `cmEncodeURI`
> in `link.js`. Work through the sub-pieces in order (URL normalization with in-URL entity
> decoding, inline destination/title parsing with balanced parens and `<…>`, reference
> definitions, image alt-text flattening), verifying each against `npx grunt test-commonmark` and
> keeping `npx grunt test` green. Add add-only unit tests. Commit in small, verified increments
> (no "Claude" attribution in messages).
