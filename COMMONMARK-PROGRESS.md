# CommonMark compliance — progress & handoff

Working notes for the incremental CommonMark-compliance effort on branch
`922-commonmark-compliance`. Delete this file before opening the final PR.

## Where things stand

Optional suite: `npx grunt test-commonmark`. **486 passing / 161 failing** (started at 413/234).

Done this far (each a separate, gated, tested commit):
| Commit | Phase | CM cases |
|---|---|---|
| `37de87e` | Entities (`decodeEntities`) | +9 |
| `c25d9ed` | Emphasis/strong delimiter-run (`commonmarkEmphasis`) | +56 |
| `d0d5662` | Autolinks (`commonmarkAutolinks`) | +8 |

Remaining failures by section: Links 37, HTML blocks 27, List items 23, Lists 16,
Link reference definitions 13, Raw HTML 10, Images 9, Block quotes 8, Autolinks 6,
Entity-in-URL 4, Code spans 3, Backslash escapes 3, Tabs 2.

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

Reusable helper already in place: `cmEncodeURI` in `src/subParsers/makehtml/link.js`
(mdurl-style percent-encoding) — use it for all URL normalization in Phase 3b.

## NEXT: Phase 3b — Links + Images + Reference definitions (~59 cases)

This is the largest/riskiest phase (link parsing is the most-used feature — high blast radius).
Gate behind a flag such as `commonmarkLinks` in the `commonmark` flavor. Files:
`src/subParsers/makehtml/link.js`, `image.js`, `stripLinkDefinitions.js`.

Sub-pieces (roughly in dependency order):
1. **URL normalization** — extend the autolink `cmEncodeURI` into the link/image/ref paths:
   percent-encode destinations AND **decode entities inside URLs** (`&ouml;`→`ö`→`%C3%B6`),
   which also closes the 4 deferred Entity-in-URL cases (refs #31–34).
2. **Inline link/image destination parsing** — balanced parens `foo(and(bar))`, `<…>`
   destinations (no spaces/unescaped `<>`), titles in `"…"`/`'…'`/`(…)`, backslash escapes in
   destination/title. See failing Links #488–#506, #495/#496 (paren balance), #501/#502 (escapes).
3. **Reference definitions** (`stripLinkDefinitions.js`) — multiline defs, `<my url>` destinations,
   first-definition-wins for duplicates (#204), backslash escapes in id/url/title (#194, #202),
   `[foo]: <>` empty destination (#200). Note ref-def parsing currently happens block-level.
4. **Image alt-text flattening** — `![foo *bar*]` must yield `alt="foo bar"` (strip inline
   markup to plain text). Images #572–#588.
5. **Precedence** — links/images interact with the new `commonmarkEmphasis`; test together.

Sanity-check current failures any time with:
```
node -e 'const s=require("./.build/showdown.js"),cm=require("commonmark-spec");
const c=new s.Converter(s.getFlavorOptions("commonmark"));const n=x=>x.replace(/\s+/g," ").trim();
for(const t of cm.tests){if(t.section!=="Links")continue;const g=c.makeHtml(t.markdown);
if(n(g)!==n(t.html))console.log("#"+(t.example||t.number)+" "+JSON.stringify(t.markdown)+"\n  EXP "+JSON.stringify(t.html)+"\n  GOT "+JSON.stringify(g));}'
```
(run `npx grunt concat:test` first to refresh `.build/showdown.js`).

## Then: Phase 4 (HTML) and Phase 5 (block containers)

- **Phase 4 — HTML (~37):** Raw HTML inline (the 6 remaining Autolink escaping cases #607–#609
  depend on stricter invalid-`<…>` recognition here) + the 7 CommonMark HTML block types.
  Files: `hashHTMLSpans.js`, `hashHTMLBlocks.js`, `encodeAmpsAndAngles.js`.
- **Phase 5 — block containers (~49):** Lists + List items + Block quotes + Tabs. The hardest:
  container-block parsing, lazy continuation, 4-column tab expansion. Likely needs structural
  rework of `list.js`/`blockquote.js`. Do last; highest regression risk.

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
