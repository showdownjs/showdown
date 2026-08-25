## Introduction

The **event system** is the foundation of Showdown's main extension mode: [`listener` extensions](create-extension.md#listener-extensions). As Showdown parses a document, its sub-parsers emit events, and a listener can subscribe to any of them to inspect or modify the conversion in flight. It supersedes the legacy [`lang`/`output` extensions](extensions.md#extension-modes), which are now deprecated and reimplemented as listeners on top of it.

In short, the event system lifecycle looks as follows:

1. A sub-parser emits an event.

    !!! note ""
        Each sub-parser can emit a batch of events (see the list below)

2. Extension A (which is a _Listener Extension_) registers and listens to a specific event.

    !!! note ""
        An extension can only register for a specific event

3. Extension A receives an event object and modifies it.

    !!! note ""
        Certain properties of the event object can be changed, which will change the behavior or output of the sub-parser

4. Extension A returns the event object to the converter.

5. The converter passes the received event object to the next extension in the chain.


## Sub-parser taxonomy: constructs vs. mechanisms

Not every function in the conversion pipeline emits events. The registry distinguishes two
kinds of pass:

* **Constructs** — a pass that recognizes a piece of Markdown syntax and produces output
  (headings, lists, links, emphasis, code, tables, footnotes, …). Constructs are registered
  sub-parsers and emit the full event set: `onStart`/`onEnd` always, plus `onCapture`/`onHash`
  per match (for constructs that match discrete pieces). These are the events listener
  extensions hook.
* **Mechanisms** — internal plumbing that has no syntax of its own: the character-level
  encoders (`encodeCode`, `encodeAmpsAndAngles`, `encodeBackslashEscapes`), the hash/unhash
  helpers (`hashBlock`, `hashHTMLBlocks`, `_hashHTMLSpan`, `hashCodeTags`, `hashPreCodeTags`,
  `unhashHTMLSpans`, `unescapePlaceholders`) and the heading-id generator. These are plain
  functions and emit **no events** — some live on the `showdown.helper.*` surface (`encodeCode`,
  `hashBlock`, `hashHTMLBlocks`, `_hashHTMLSpan`, `unhashHTMLSpans`, …), while others are
  file-local to the pass that owns them (`encodeAmpsAndAngles` and the span hasher in
  `inlineEngine.js`, `encodeBackslashEscapes` in `inline/image.js`,
  `hashCodeTags`/`hashPreCodeTags` in `converter.js`).
  (`showdown.helper.hashHTMLBlocks` only protects the markup the block parsers *generate* from a
  spurious `<p>` wrap — recognizing raw HTML blocks in the Markdown *source* is the job of the
  `makehtml.htmlBlock` construct, which does emit events.)

Two further passes emit no events even though they are registered sub-parsers:

* the block **dispatcher** `blockGamut` — it only routes text through the constructs above and
  matches nothing itself (the document-level events below cover whole-text hooks). Its inline
  counterpart is `inlineEngine`, which is NOT event-less: it owns the inline-pass lifecycle
  (`makehtml.inlineEngine` onStart/onEnd) — see the family list below;
* **`decodeEntities`** — its output is bare characters, so per-entity events would be noise.

The one deliberate exception to "mechanisms have no events": **`heading.id`** is a helper, but
it still emits a single `makehtml.heading.id.onCapture` event so extensions can implement
custom slug generation (see below).

### The `makehtml.inline.*` namespace

The inline constructs — links, images, emphasis/strong, code spans, autolinks, raw HTML, character
references, backslash escapes, hard breaks, and the Showdown extras (emoji, ellipsis, underline,
strikethrough, `@mentions`, naked URLs) — are recognized together in a single positional pass, the
`makehtml.inlineEngine` scan. Each construct lives in its own file under
`src/subParsers/makehtml/inline/` and is
registered under the `makehtml.inline.*` namespace (`makehtml.inline.link`, `makehtml.inline.image`,
`makehtml.inline.emphasis`, `makehtml.inline.codeSpan`, `makehtml.inline.autolink`,
`makehtml.inline.rawHtml`, `makehtml.inline.entity`, `makehtml.inline.backslash`,
`makehtml.inline.hardLineBreak`, `makehtml.inline.emoji`, `makehtml.inline.ellipsis`,
`makehtml.inline.underline`, `makehtml.inline.strikethrough`, `makehtml.inline.ghMentions`,
`makehtml.inline.nakedUrl`, …). These are
**construct** sub-parsers, but their **calling convention differs from every other sub-parser**:
instead of `(text, options, globals)` they are called `(scan, options, globals)`, where `scan` is
the engine's scan state — the source string, the char cursor, the output node list and the append /
hash / render helpers. A handler either **consumes** (appends its output to the node list and returns
the new cursor index) or **declines** (returns `null`, and the scanner falls through to the next
candidate or to literal text). A text→text pass cannot express the cross-construct precedence
CommonMark requires (a link cannot contain a link; code spans / autolinks / raw HTML bind before
link brackets; emphasis interleaves with brackets), which is why the scan state is threaded through
rather than a plain string.

A few auxiliary entries in the namespace are not scan handlers: `makehtml.inline.emphasis.build`
renders one paired-delimiter span from inside the delimiter algorithm; `makehtml.inline.link` also
owns the `.wholeAnchor` variant (the Showdown whole-`<a>` swallow); and
`makehtml.inline.strikethrough.pair` resolves the surviving tilde-run nodes into `<del>` after
emphasis. **`@mentions` is now a scan construct** — the `makehtml.inline.ghMentions` `@` handler links
`@username` during the scan (it links inside resolved emphasis/underline wrappers but declines while a
`[`/`![` bracket is open, so a mention never nests inside a link/image label); its companion
`makehtml.inline.ghMentions.linkify` is an **internal** text-convention helper used only to link
mentions inside a strikethrough `<del>`'s already-rendered inner content, which is resolved at pairing
time from `tilde` nodes the scan boundary rule cannot key on.

The one remaining **text-convention post-scan pass** is `makehtml.inline.nakedUrl.linkify`: GFM
naked-URL/mail linking is **by design** layered on top of the scan, over the *serialized* inline output
(and over emphasis inner content), because a naked URL's extent is defined over the rendered text —
trailing-punctuation trimming and the entity/`<`-split rules operate on serialized characters, not scan
tokens. The scan's `makehtml.inline.nakedUrl` recognizer still consumes the URL body atomically (so
`_`/`*` inside it never become emphasis delimiters), and this `.linkify` aux-entry builds the anchor
from that intact run. These aux entries are documented in their owning files.

These constructs emit the capture/hash families listed in the table below — `makehtml.link.*`,
`makehtml.image.*`, `makehtml.emphasis.*`, `makehtml.strong.*`, `makehtml.codeSpan.*`,
`makehtml.rawHtml.*`, `makehtml.entity.*`, `makehtml.backslash.*`, `makehtml.hardLineBreak.*`,
`makehtml.emoji.*`, `makehtml.ellipsis.*`, `makehtml.underline.*`, `makehtml.strikethrough.*` —
identically for every flavor: there is one inline code path, so listener extensions behave the same
whichever flavor is configured.

## Event Object

### Properties

#### matches

**matches** is an object that holds the content captured by the sub-parser. The main captured
content is always exposed under the **`text`** property (for every construct that has inner
content); construct-specific extras use descriptive names (`url`, `title`, `format`, `level`, …).
Properties whose names start with `_` (underscore) are read-only context — mutating them has no
effect. A few constructs with no inner content (e.g. `horizontalRule`, `stripLinkDefinitions`)
omit `text` entirely.

!!! example "blockquote `onCapture` event"

    ```js
    {
      _wholeMatch: "> some awesome quote",
      text: "some awesome quote"
    }
    ```

## Event types

Events are emitted when a sub-parser runs (or is about to be run).
The `makehtml` (Markdown to HTML) sub-parsers emit up to four events, in this strict order: [`onStart`](#onstart) -> [`onCapture`](#oncapture) -> [`onHash`](#onhash) -> [`onEnd`](#onend).

The `makeMarkdown` (HTML to Markdown) sub-parsers emit a subset of these — see [makeMarkdown events](#makemarkdown-html-to-markdown-events) below.

### onStart

**`<converter>.<subparser>.onStart`**: **always runs** except if the sub-parser is disabled.

Emitted when the sub-parser has started, but no capturing or modifications to the text were done.

**Always runs** except if the sub-parser is disabled via options.

!!! hint "When to use `onStart` event"
    Use this event when you want to change the input passed to the sub-parser. 

!!! warning ""
    Please note that the input is the **full text** that was passed to the converter.
    
**Properties**
         
| property     | type     | access  | description                                                    |
|--------------|----------|---------|----------------------------------------------------------------|
| `input`      | `string` | `read`  | Full text that was passed to the subparser                     |
| `output`     | `string` | `write` | Full text with modification that will be passed along the chain |
| `regexp`     | `null`   |         |                                                                |
| `matches`    | `null`   |         |                                                                |
| `attributes` | `null`   |         |                                                                |

### onCapture

**`<converter>.<subparser>.onCapture`**: *might not be run*.
 
Emitted when a regex match is found and capture was successful.
Further normalization and modification of the regex captured groups might be performed.

Might not be run if no regex match found.

!!! hint "When to use `onCapture` event"
    Use this event if you want to:

    * modify the sub-parser behavior, text;
    * modify the HTML output of the sub-parser.

**Properties**

| property     | type     | access       | description                                                       |
|--------------|----------|--------------|-------------------------------------------------------------------|
| `input`      | `string` | `readonly`   | The captured text                                                 |
| `output`     | `string` | `write`      | `null` or well-formed HTML (see the Important Note below)         |
| `regexp`     | `RegExp` | `readonly`   | Regular Expression to capture groups                              |
| `matches`    | `object` | `read/write` | Match groups. Changes to this object are reflected in the output. |
| `attributes` | `object` | `read/write` | Attributes to add to the HTML output                              |

!!! warning "IMPORTANT NOTE"
    Extensions listening to the `onCapture` event **should avoid** changing the output property.
    Instead, they should modify the values of the matches and attribute objects.
    
    The reason is that the **output property takes precedence over the matches objects** and
    **prevents showdown from calling other sub-parsers** inside the captured fragment.

    The above means the following:

    1. If something is passed as the output property, any changes to the matches and attributes objects will be ignored.
    1. Any changes made by other extensions to the matches or attributes objects will be ignored.
    1. Showdown will not call other sub-parsers, such as encode code or span gamut in the text fragment, which may lead to unexpected results.

    **Example**

    !!! example ""

        ```js hl_lines="4"
        // Showdown extension 1 that is listening to makehtml.blockquote.onCapture
        function extension_1 (showdownEvent) {
          // Let's imagine you're a bad person who writes to output
          showdownEvent.output = '<blockquote>foo</blockquote>'; // must be a well-formed HTML
          showdownEvent.matches.text = 'some nice quote'; 
        }

        // Showdown extension 2 that is also listening to makehtml.blockquote.onCapture
        function extension_2 (showdownEvent) {
          // I make blockquotes bold
          let quote = showdownEvent.matches.text;
          showdownEvent.matches.text = '<strong>' + quote + '</strong>'; 
        }
        ```

        In the example above, the result will always be `<blockquote>foo</blockquote>`, regardless of the order of extension loading and call.

!!! danger "Infinite loop"
    Do not pass the input as output to the `onCapture` event, or you might trigger an infinite loop.

!!! example "Open external links in a new tab"
    The link sub-parsers expose the anchor's `attributes` on their `onCapture` event, so a
    listener can add `target`/`rel` to the generated `<a>`. This replaces the removed
    `openLinksInNewWindow` option — and, unlike the old option, you control exactly which links
    are affected.

    The link constructs emit one event per link variant (`inline`, `reference`, `autolink`,
    `ghMention`), so register a listener for each variant you want to cover. These events fire in
    **every flavor** — there is one inline engine, and it emits the same families for every link
    and image it builds:

    ```js
    const converter = new showdown.Converter();

    ['inline', 'reference', 'autolink', 'ghMention'].forEach(function (type) {
      converter.listen('makehtml.link.' + type + '.onCapture', function (evt) {
        // leave in-page hash links (#section) opening in the same tab
        if (!/^#/.test(evt.attributes.href)) {
          evt.attributes.target = '_blank';
          evt.attributes.rel = 'noopener noreferrer';
        }
        return evt;
      });
    });

    converter.makeHtml('[showdown](https://github.com/showdownjs/showdown)');
    // <p><a href="https://github.com/showdownjs/showdown" target="_blank"
    //       rel="noopener noreferrer">showdown</a></p>
    ```

!!! example "Customizing GFM task-list checkboxes"
    GFM task-list items (`- [ ] todo` / `- [x] done`, enabled with the `tasklists` option) have
    their checkbox rendered by a dedicated sub-parser that both list parsers — the default one
    and the `commonmark`-flavor one — delegate to. Because of that, a single listener covers
    task lists in **every flavor**.

    It runs on the item's **raw source line**, before any inline/block parsing, and emits two
    events under the `makehtml.list.taskListItem` namespace:

    * **`makehtml.list.taskListItem.checkbox.onCapture`** — fired on a matched task line. The
      `attributes` object holds the `<input>` checkbox attributes, so a listener can re-style or
      tag the checkbox; the `matches` object exposes the whole line. As with every `onCapture`
      event, prefer mutating `matches`/`attributes` over writing `output` (see the note above).
    * **`makehtml.list.taskListItem.checkbox.onHash`** — fired with the rendered line
      (`<input ...> todo`) just before it is handed back to the list parser.

    **`onCapture` properties**

    | property     | type     | access       | description                                                              |
    |--------------|----------|--------------|--------------------------------------------------------------------------|
    | `input`      | `string` | `readonly`   | The full task source line, e.g. `[ ] buy milk`                           |
    | `output`     | `string` | `write`      | `null`, or well-formed HTML for the whole line (takes precedence)        |
    | `regexp`     | `RegExp` | `readonly`   | The marker-matching regular expression                                   |
    | `matches`    | `object` | `read/write` | See below                                                                |
    | `attributes` | `object` | `read/write` | Attributes of the `<input>` checkbox (`type`, `disabled`, `checked`, …)  |

    The `matches` object:

    ```js
    {
      _wholeMatch: "[ ] buy milk",   // the matched source line
      _taskListButton: "[ ]",         // the literal marker (read-only)
      _taskListButtonChecked: " ",    // the marker char: " ", "x" or "X" (read-only)
      text: " buy milk"               // everything after the marker (write to relabel)
    }
    ```

    ```js
    const converter = new showdown.Converter({ tasklists: true });

    // Give every checkbox a class and tag completed items.
    converter.listen('makehtml.list.taskListItem.checkbox.onCapture', function (evt) {
      evt.attributes.classes = ['task-checkbox'];
      if (evt.attributes.checked) {
        evt.attributes.classes.push('is-done');
      }
      return evt;
    });

    converter.makeHtml('- [x] ship it');
    // <ul>
    // <li><input checked disabled type="checkbox" class="task-checkbox is-done"> ship it</li>
    // </ul>
    ```

    !!! note "The `makehtml.list.taskListItem` namespace"
        These checkbox events are nested under the broader **`makehtml.list`** event family.
        A single list sub-parser handles every flavor (the container scanner, with the flavor
        differences derived as option gates), so every event below fires in **every flavor**:

        * **`makehtml.list.{onStart,onCapture,onHash,onEnd}`** — the whole list block.
        * **`makehtml.list.listItem.{onCapture,onHash}`** — each non-task `<li>`.
        * **`makehtml.list.taskListItem.{onCapture,onHash}`** — each task `<li>` (the surrounding
          item, carrying the full item — which for a loose item may span several blocks). This is
          the event to use to read or rewrite a task **item** (checkbox **and** label).
        * **`makehtml.list.taskListItem.checkbox.{onCapture,onHash}`** — just the checkbox/label
          line (above), via the shared sub-parser.

        The list/item `onCapture` events expose `matches.text` (the raw markdown) and
        `attributes`, but their `regexp` property is `null` — the container scanner is line-based,
        not a single regex match, so there is no live regular expression to hand out.

### onHash

**`<converter>.<subparser>.onHash`**: *always runs*.
 
Raised before the output is hashed.

**Always runs** (except if the sub-parser is disabled via options), even if no hashing is performed. 

!!! hint "When to use `onHash` event"
    Use this event when you want to change the sub-parser's raw output before it is hashed.

**Properties**
        
| property     | type     | access  | description                                  |
|--------------|----------|---------|----------------------------------------------|
| `input`      | `string` | `read`  | The captured text                            |
| `output`     | `string` | `write` | The text that will be passed along the chain |
| `regexp`     | `null`   |         |                                              |
| `matches`    | `null`   |         |                                              |
| `attributes` | `null`   |         |                                              |

### onEnd
 
**`<converter>.<subparser>.onEnd`**: **always runs**;
 
Emitted when the sub-parser has finished its work and is about to exit.

**Always runs** (except if the sub-parser is disabled via options).

!!! hint "When to use `onEnd` event"
    Use this event when you want to run code or perform changes to the text after the subparser has run and its output was hashed.

!!! warning ""
    Please note that the input is the **full text** and might contain hashed elements.

**Properties**
    
| property  | type     | access  | description                                                 |
|-----------|----------|---------|-------------------------------------------------------------|
| `input`   | `string` | `read`  | Full text with the subparser modifications (contains hashes) |
| `output`  | `string` | `write` | The text that will be passed to other subparsers            |
| `regexp`  | `null`   |         |                                                             |
| `matches` | `null`   |         |                                                             |

## Construct capture events reference

There are two phase-set classes. A **pass construct** (a whole-text sub-parser pass) emits
`onStart`/`onEnd` around the pass plus `onCapture`/`onHash` per match. A **scan construct** (one the
inline engine resolves) emits `onCapture`/`onHash` per occurrence ONLY — the surrounding lifecycle is
the single `makehtml.inlineEngine` onStart/onEnd. The `matches.text` key carries the main captured
content for constructs that have inner content; a handful with no inner content
(`horizontalRule`, `hardLineBreak`, `stripLinkDefinitions`, `footnotes.reference`) omit `text` and
expose only read-only `_`-context plus `attributes`/output-override.

### Complete event-family list (makehtml)

| Family | Lifecycle (`onStart`/`onEnd`) | Capture (`onCapture`/`onHash`) |
|---|---|---|
| `makehtml.blockquote` | ✓ | ✓ |
| `makehtml.codeBlock` | ✓ | ✓ |
| `makehtml.codeSpan` | ✓ (the whole-text PASS form, invoked directly by `table`) | ✓ (also per scan-resolved code span) |
| `makehtml.disallowedHtmlTags` | ✓ | ✓ (per neutralized tag) |
| `makehtml.backslash` | — | ✓ (scan construct — one capture per consumed ``-escape) |
| `makehtml.ellipsis` | — | ✓ (scan construct — one capture per `...`→`…` substitution) |
| `makehtml.emoji` | — | ✓ (scan construct — one capture per substituted `:shortcode:`) |
| `makehtml.entity` | — | ✓ (scan construct — one capture per character reference) |
| `makehtml.emphasis` | — | ✓ (scan construct — one capture per `<em>` span, for **every** flavor) |
| `makehtml.strong` | — | ✓ (scan construct — one capture per `<strong>` span, for **every** flavor) |
| `makehtml.footnotes` | ✓ | at `.definition` / `.reference` |
| `makehtml.githubCodeBlock` | ✓ | ✓ |
| `makehtml.hardLineBreak` | — | ✓ (scan construct — one capture per break, no `text`) |
| `makehtml.heading.atx` / `makehtml.heading.setext` | ✓ (each its own lifecycle) | ✓ per variant; plus the capture-only `makehtml.heading.id` hook |
| `makehtml.horizontalRule` | ✓ | ✓ (no `text`) |
| `makehtml.htmlBlock` | ✓ | ✓ (per raw HTML block) |
| `makehtml.image` | — | at `.inline` / `.reference` |
| `makehtml.link` | — | at `.inline` / `.reference` / `.autolink` / `.ghMention` — the inline engine emits `.inline` / `.reference` for `[..](..)` and reference links, `.autolink` for BOTH autolink spellings (`<uri>`/`<email>`/`<www…>` and the `simplifiedAutoLink` naked URLs/mails), and `.ghMention` for `@username` mentions |
| `makehtml.list` | ✓ | ✓; plus `.listItem`, `.taskListItem`, `.taskListItem.checkbox` (checkbox also has its own lifecycle) |
| `makehtml.metadata` | ✓ | ✓ |
| `makehtml.paragraphs` | ✓ | ✓ (per paragraph, `regexp` is `null`) |
| `makehtml.rawHtml` | — | ✓ (scan construct — one capture per recognized piece of raw HTML) |
| `makehtml.strikethrough` | — | ✓ (scan construct — one capture per `<del>` span) |
| `makehtml.stripLinkDefinitions` | ✓ | ✓ (per definition, no `text`) |
| `makehtml.table` | ✓ | ✓; plus `.header` / `.cell` capture |
| `makehtml.underline` | — | ✓ (scan construct — one capture per `<u>` span) |
| `makehtml.completeHTMLDocument` | ✓ | — (document wrapper, lifecycle only) |
| `makehtml.inlineEngine` | ✓ | — (the **inline engine**: the sole inline path for every flavor, lifecycle only. Every scan construct listed above fires its own capture/hash family from inside this pass, so `onStart` / `onEnd` bracket the whole inline pass — including the post-scan `serialized` passes, which run BEFORE `onEnd`) |
| *(document level)* `makehtml.onStart` / `.onPreParse` / `.onEnd` | — | — (see [below](#makehtml-document-level-events)) |

`decodeEntities`, the block dispatcher `blockGamut` and every `showdown.helper.*` mechanism emit
**no events** — see the [taxonomy](#sub-parser-taxonomy-constructs-vs-mechanisms). (`inlineEngine` is
the exception among the dispatchers: it owns the inline-pass lifecycle.)

> **Retired (U-6):** the combined `makehtml.emphasisAndStrong` family — including its `.emphasis`,
> `.strong` and combined `.emphasisAndStrong` captures — no longer fires. Since the inline layer was
> unified onto one inline engine for every flavor, emphasis is resolved on one delimiter-stack pass that
> emits the **separate** `makehtml.emphasis.*` and `makehtml.strong.*` families. `***foo***` is
> `<em><strong>foo</strong></em>`, so it fires a `strong` capture (inner) then an `emphasis` capture
> (outer) — there is no combined single event. Listeners on `makehtml.emphasisAndStrong.*` must move
> to `makehtml.emphasis.*` / `makehtml.strong.*`.
>
> **Renamed:** the inline-pass lifecycle family is `makehtml.inlineEngine.*`. Listeners on the
> former `makehtml.cmInline.*` or `makehtml.spanGamut.*` names must move to
> `makehtml.inlineEngine.onStart` / `.onEnd`.
>
> **Retired (the flip):** the whole-text `makehtml.hardLineBreaks` PASS family (plural — lifecycle
> and capture alike) and the `makehtml.link.angleBrackets` variant. Hard breaks are now the scan
> construct `makehtml.hardLineBreak` (SINGULAR, capture/hash only), and the angle-bracket autolink
> spelling fires the shared `makehtml.link.autolink` variant alongside the naked one. `@mentions`
> moved off the `makehtml.link.reference` routing onto their own `makehtml.link.ghMention` variant.
> New families in the same increment: `makehtml.rawHtml.*`, `makehtml.entity.*` and
> `makehtml.backslash.*`, each a variant-less capture/hash family of its scan construct.
>
> **Retired (U-6f):** the **per-construct `onStart` / `onEnd` lifecycle events of the four
> scan-native Showdown extras** — `makehtml.emoji`, `makehtml.ellipsis`, `makehtml.underline` and
> `makehtml.strikethrough` — no longer fire. Those constructs were whole-text passes with their own
> lifecycle; they are now recognized inside the single-pass inline scan, and per the event-contract
> amendment the inline-pass lifecycle belongs to the engine alone (`makehtml.inlineEngine.onStart` /
> `.onEnd`). Each extra still emits its **`onCapture` / `onHash`** family once per occurrence (per
> substituted emoji / ellipsis, per `<u>` / `<del>` span), so a listener that only hooked capture/hash
> is unaffected; a listener that hooked `makehtml.{emoji,ellipsis,underline,strikethrough}.onStart` /
> `.onEnd` must move to the `makehtml.inlineEngine` lifecycle. (`@mentions` became the scan-native
> `makehtml.inline.ghMentions` construct in the same increment; GFM naked-URL/mail linking remains a
> by-design post-scan pass — see the [`makehtml.inline.*` namespace](#the-makehtmlinline-namespace)
> above.)

Notable per-construct events:

* **`makehtml.paragraphs.onCapture` / `.onHash`** — one event per paragraph. `matches.text` is
  the paragraph's Markdown (mutable and honored); `attributes` are applied to the generated
  `<p>`. `regexp` is `null` (paragraphs are found by a blank-line split, not a regex).
* **`makehtml.hardLineBreak.onCapture` / `.onHash`** — one event per hard break. No `text`
  key; `attributes` are applied to the emitted `<br>`, and a listener may override `output`.
* **`makehtml.disallowedHtmlTags.onCapture` / `.onHash`** — one event per neutralized tag
  (only runs under the `disallowRawHTML`/`safeMode` options). `matches.text` is the matched tag
  opening (`<script`, `</iframe`, …); a listener can **whitelist** a tag by setting `output` to
  the original tag so it is left unescaped.
* **`makehtml.footnotes.definition.onCapture` / `.onHash`** — one event per collected footnote
  definition (`[^id]: body`). `matches.text` is the footnote body (mutable and honored — it is
  later rendered via a nested conversion); `_label`/`_rawLabel` are read-only context.
* **`makehtml.footnotes.reference.onCapture` / `.onHash`** — one event per footnote reference
  (`[^id]`). No `text` key (the reference renders as a generated `<sup>`); `_label`,
  `_rawLabel` and `_number` are read-only context and a listener may override `output`.
* **`makehtml.htmlBlock.onCapture` / `.onHash`** — one event per raw HTML block recognized in
  the Markdown source (both recognition strategies: CommonMark's seven typed blocks under
  `cmSpec`, the balanced-tag model plus the standalone HR/comment/processor-instruction cases
  otherwise). `matches.text` is the raw block source (mutable and honored, except for
  `markdown="1"` blocks whose stored content is already-converted HTML); a listener may set
  `output` to replace or suppress the block. `regexp` is `null` (recognition is scanner-based).
* **`makehtml.stripLinkDefinitions.onCapture` / `.onHash`** — one event per link reference
  definition. No `text` key (a definition is stored, never rendered inline); `matches` carries
  the mutable-and-honored `linkId`, `url`, `title`, `width` and `height` descriptive fields
  (`width`/`height` are the optional `=WxH` image dimensions, `null` when absent). `regexp` is
  `null` for every flavor (the definition scanner is not regex-driven).
* **`makehtml.blockquote.onCapture`** — `regexp` is `null` for every flavor (block quotes are
  parsed by a line scanner, not a regex).
* **`makehtml.heading.id.onCapture`** — capture-only (a helper, no lifecycle/hash). Fired with
  the generated heading id under `matches.text` (mutable and honored), so a listener can supply
  a custom slug; `_headingText` is read-only context. Deduplication of duplicate ids runs after
  the hook, so a custom slug is still made unique within the document.

    ```js
    // Custom-slugify: replace showdown's id generation
    converter.listen('makehtml.heading.id.onCapture', function (evt) {
      evt.matches.text = evt.matches._headingText.trim().toLowerCase().replace(/\s+/g, '_');
      return evt;
    });
    ```

The GFM task-list checkbox sub-parser (`makehtml.list.taskListItem.checkbox`) is a registered
sub-parser, so it now also emits the lifecycle `onStart`/`onEnd` events in addition to its
`onCapture`/`onHash` (documented under [onCapture](#oncapture) above).

## makeHtml document-level events

Besides the per-sub-parser events above, `makeHtml()` emits three **document-level** events that wrap the whole conversion. They are the place to transform the entire document before or after parsing, and are what `lang`/`output` extensions are built on:

* **`makehtml.onStart`** — emitted once with the **raw** Markdown, *before* any escaping or line-ending normalization. Listeners here see the literal source (real `$`, `¨`, `\r\n`, …) and can rewrite it wholesale.
* **`makehtml.onPreParse`** — emitted once *after* escaping/normalization and immediately *before* the sub-parsers run. This is where [`lang` extensions](create-extension.md#type) run (as listeners). The input at this stage contains Showdown's internal placeholders — e.g. an escaped `$` appears as `¨D` and an escaped `¨` as `¨T` — so prefer `onStart` if you need the untouched source.
* **`makehtml.onEnd`** — emitted once with the **final HTML**, after every sub-parser and the optional complete-document wrapping. This is where [`output` extensions](create-extension.md#type) run (as listeners); use it to post-process the generated HTML.

### Properties

| property     | type     | access  | description                                                                                  |
|--------------|----------|---------|----------------------------------------------------------------------------------------------|
| `input`      | `string` | `read`  | `onStart`: raw Markdown. `onPreParse`: escaped/normalized Markdown. `onEnd`: the final HTML.  |
| `output`     | `string` | `write` | The text that will be passed along (return a string from the listener, or set this and return the event). |
| `regexp`     | `null`   |         |                                                                                              |
| `matches`    | `null`   |         |                                                                                              |
| `attributes` | `null`   |         |                                                                                              |

!!! example ""

    ```js
    // Add a class to every paragraph in the final HTML
    converter.listen('makehtml.onEnd', function (evt) {
      return evt.input.replace(/<p>/g, '<p class="md">');
    });
    ```

## makeMarkdown (HTML to Markdown) events

The reverse converter — `<converter>.makeMarkdown()`, which turns HTML back into Markdown — also emits namespaced events. Its sub-parsers operate on **DOM nodes** (one construct at a time) rather than running regular expressions over text, but each construct still runs the same three-phase lifecycle as a makehtml construct, minus the hash phase (nothing is hashed on this side): [`onStart`](#onstart) → [`onCapture`](#oncapture) → [`onEnd`](#onend). **There is no `onHash` phase.**

Event names follow the same `<converter>.<subparser>.<event>` convention, with `makeMarkdown` as the converter prefix:

* **`makeMarkdown.<subparser>.onStart`** — pure lifecycle. Emitted before the node is rendered.
* **`makeMarkdown.<subparser>.onCapture`** — emitted after the sub-parser has extracted its pieces / rendered its child content but **before** the Markdown string is assembled. This is where the mutable `matches` values and the output-override live (see below).
* **`makeMarkdown.<subparser>.onEnd`** — emitted with the generated Markdown for the node.

The full lifecycle (all three phases) is emitted by each construct sub-parser: `blockquote`, `break`, `codeBlock`, `codeSpan`, `emphasis`, `footnotes`, `header`, `hr`, `image`, `input`, `links`, `list`, `listItem`, `paragraph`, `pre`, `strikethrough`, `strong`, `table`, `tableCell`, `txt`, `underline`.

The recursive `node` dispatcher (the analogue of makehtml's block and inline engines) is a **documented exception**: it has no syntax of its own, but because every node passes through it, it is the one place to observe (or override) content that has no dedicated sub-parser — HTML comments and unknown/raw elements. It therefore keeps the same three-phase treatment — **`makeMarkdown.node.onStart`** / **`makeMarkdown.node.onCapture`** / **`makeMarkdown.node.onEnd`** — where the capture's output-override replaces the default node dispatch. Like `break`/`hr`/`input`, it carries no `text` key (it renders no inner content of its own).

In addition, two **document-level** events wrap the whole conversion (unchanged):

* **`makeMarkdown.onStart`** — emitted once with the raw HTML source, before it is parsed into a DOM. Listeners can rewrite the source.
* **`makeMarkdown.onEnd`** — emitted once with the final generated Markdown. Listeners can post-process it.

### Properties

Unlike the makehtml events, a makeMarkdown event operates on a single DOM node, **not** the full document text. Every lifecycle and capture event exposes the source node (read-only) under **`matches._node`**, and captures are always node-based, so **`regexp` and `attributes` are always `null`** (Markdown output has no HTML attributes).

**`onStart` / `onEnd`**

| property     | type     | access  | description                                                                                             |
|--------------|----------|---------|---------------------------------------------------------------------------------------------------------|
| `input`      | `string` | `read`  | `onStart`: the serialized HTML (or text value) of the node being processed. `onEnd`: the generated Markdown. |
| `output`     | `string` | `write` | `onEnd`: the Markdown string that will be passed along. (On `onStart` this is pure lifecycle — see the note below.) |
| `matches`    | `object` | `read`  | Holds `{ _node }` — the source DOM node currently being converted (read-only).                          |
| `regexp`     | `null`   |         |                                                                                                         |
| `attributes` | `null`   |         |                                                                                                         |

**`onCapture`**

| property     | type     | access       | description                                                                                       |
|--------------|----------|--------------|---------------------------------------------------------------------------------------------------|
| `input`      | `string` | `readonly`   | The node's serialized HTML (or text value).                                                       |
| `output`     | `string` | `write`      | `null`, or the Markdown to use for this node (takes precedence — see the [onCapture note](#oncapture)). |
| `regexp`     | `null`   |              | Always `null` (node-based, no regex capture).                                                      |
| `matches`    | `object` | `read/write` | `_wholeMatch` (the node's outer HTML) and `_node` are read-only context; the main content is the mutable, **honored** `text` key, plus construct-specific extras (`url`, `title`, `level`, `language`, `checked`, …). |
| `attributes` | `null`   |              | Always `null` (Markdown output has no HTML attributes).                                            |

The `matches.text` key carries the main captured content for every construct that has inner content; the ones that render no inner content (`break`, `hr`, `input`, and the `node` dispatcher) omit it. Mutating `matches.text` (or a descriptive extra) is honored: the sub-parser reassembles its Markdown from the mutated values after the capture. For example, `makeMarkdown.header.onCapture` exposes `text` (the heading's inner Markdown) and `level`; `makeMarkdown.links.onCapture` exposes `text`, `url` and `title`.

!!! hint "Changing the input on `onStart`"
    `onStart` is now **pure lifecycle** — setting its `output` no longer overrides anything. To rewrite the *input* to a sub-parser, mutate the live DOM node reachable through `matches._node`; the sub-parser reads the (mutated) node when it renders.

    ```js
    // Uppercase every heading's text before it is converted
    converter.listen('makeMarkdown.header.onStart', function (evt) {
      evt.matches._node.textContent = evt.matches._node.textContent.toUpperCase();
      return evt;
    });
    ```

!!! warning "The output override moved from `onStart` to `onCapture`"
    In earlier release candidates, setting `output` on a makeMarkdown **`onStart`** event replaced the node's rendering. That override now lives on **`onCapture`** (mirroring the makehtml `onCapture` precedence). Update any listener that relied on the old `onStart` behavior.

    !!! example ""

        ```js
        // Render every <a> as bare text instead of a Markdown link
        converter.listen('makeMarkdown.links.onCapture', function (evt) {
          evt.output = evt.matches._node.textContent;
          return evt;
        });
        ```

## Special Events

!!! warning "Removed"
    The `.before.{subparserName}` and `.after.{subparserName}` special events were **deprecated in 2.0** and have been **removed in 3.0**. Use the per-sub-parser [`onStart`](#onstart) and [`onEnd`](#onend) events instead.
