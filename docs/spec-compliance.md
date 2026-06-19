# Spec Compliance

## CommonMark

Showdown ships a **`commonmark` flavor** that makes the converter follow the
[CommonMark spec](https://spec.commonmark.org/). With this flavor enabled, Showdown passes
**647 of the 652** examples in the CommonMark spec test suite. The handful of remaining
examples are intentional deviations, documented under [Known differences](#known-differences).

### Enabling CommonMark

The recommended way is to set the `commonmark` flavor, which turns on all of the CommonMark
options at once:

=== "Globally"

    ```js
    showdown.setFlavor('commonmark');
    ```

=== "On a converter"

    ```js
    const converter = new showdown.Converter();
    converter.setFlavor('commonmark');
    ```

=== "Constructor"

    ```js
    const converter = new showdown.Converter(showdown.getFlavorOptions('commonmark'));
    ```

### CommonMark options

CommonMark compliance is built from a set of individually-gated options. They are all
`boolean`, all default to `false`, and were all introduced in `3.0.0`. The `commonmark` flavor
enables every one of them.

You *can* enable them individually if you only want part of the CommonMark behavior, but they
are designed to work together — enabling only some may produce inconsistent results. Prefer the
flavor unless you have a specific reason not to.

| Option | What it does |
|---|---|
| [`decodeEntities`](available-options.md#decodeentities) | Resolve HTML5 named and numeric character references (`&copy;`, `&#35;`, `&#xcab;`) to their characters. |
| [`commonmarkEmphasis`](available-options.md#commonmarkemphasis) | Parse emphasis / strong emphasis with the CommonMark delimiter-run (flanking) algorithm. |
| [`commonmarkAutolinks`](available-options.md#commonmarkautolinks) | Recognize CommonMark autolinks `<scheme:uri>` and `<email>` without entity-encoding. |
| [`commonmarkLinks`](available-options.md#commonmarklinks) | Parse links, images and link reference definitions per the spec (balanced-paren and `<...>` destinations, backslash escapes, in-URL entity decoding, alt-text flattening). |
| [`commonmarkRawHTML`](available-options.md#commonmarkrawhtml) | Recognize inline raw HTML with the strict CommonMark grammar; malformed tags are escaped instead of passed through. |
| [`commonmarkHTMLBlocks`](available-options.md#commonmarkhtmlblocks) | Recognize HTML blocks using the 7 CommonMark block types instead of Showdown's balanced-tag matching. |
| [`commonmarkBlockquotes`](available-options.md#commonmarkblockquotes) | Parse block quotes as CommonMark container blocks (empty `>`, splitting at blank lines, lazy continuation). |
| [`commonmarkLists`](available-options.md#commonmarklists) | Parse lists with a CommonMark container-block parser (marker/delimiter splitting, ordered start, loose/tight, indentation-based nesting). |
| [`commonmarkInline`](available-options.md#commonmarkinline) | Parse all inline content with a single unified CommonMark parser (one delimiter stack). |
| [`commonmarkTabs`](available-options.md#commonmarktabs) | Expand tabs to 4-column tab stops in block-structure indentation (content tabs are preserved). |
| [`commonmarkContainers`](available-options.md#commonmarkcontainers) | Parse leaf blocks (fenced code, HTML blocks, link reference definitions, indented code) in the context of their containing block quote / list item. |

### Known differences

The `commonmark` flavor diverges from the spec in a few intentional, documented ways.

#### Empty ATX headings

Showdown doesn't support empty headings (spec example 79).

=== "input"

    ```md
    #
    ```

=== "Showdown output"

    ```html
    <p>#</p>
    ```

=== "CommonMark output"

    ```html
    <h1></h1>
    ```

#### Fenced-code language classes

For a fenced code block with an info string, CommonMark emits a single `language-<lang>` class.
Showdown emits both the bare language name and the `language-`-prefixed class.

=== "input"

    ````md
    ``` ruby
    foo
    ```
    ````

=== "Showdown output"

    ```html
    <pre><code class="ruby language-ruby">foo
    </code></pre>
    ```

=== "CommonMark output"

    ```html
    <pre><code class="language-ruby">foo
    </code></pre>
    ```

#### Other intentional deviations

A few spec examples are intentionally not followed because they are self-contradictory,
malformed, or describe behavior that GitHub Flavored Markdown also rejects:

 - Setext heading lazy continuation (spec example 93 — the spec text and the example disagree)
 - Thematic breaks examples 43 and 61 (malformed input / `<hr>` inside a list)
 - Fenced code block example 146 (not supported by GitHub either)
