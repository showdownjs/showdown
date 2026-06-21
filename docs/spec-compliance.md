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

CommonMark compliance is controlled by a single option, [`cmSpec`](available-options.md#cmspec)
(`boolean`, default `false`, introduced in `3.0.0`), plus the companion
[`decodeEntities`](available-options.md#decodeentities) option. The `commonmark` flavor turns
both on (along with `noHeaderId` and `requireSpaceBeforeHeadingText`). Prefer the flavor unless
you have a specific reason to set the options yourself.

`cmSpec` switches both block-level and inline parsing from Showdown's legacy matching to the
CommonMark spec. What it covers:

| Area | What it does |
|---|---|
| Emphasis | Parse emphasis / strong emphasis with the CommonMark delimiter-run (flanking) algorithm. |
| Autolinks | Recognize CommonMark autolinks `<scheme:uri>` and `<email>` without entity-encoding. |
| Links & images | Parse links, images and link reference definitions per the spec (balanced-paren and `<...>` destinations, backslash escapes, in-URL entity decoding, alt-text flattening). |
| Inline raw HTML | Recognize inline raw HTML with the strict CommonMark grammar; malformed tags are escaped instead of passed through. |
| HTML blocks | Recognize HTML blocks using the 7 CommonMark block types instead of Showdown's balanced-tag matching. |
| Block quotes | Parse block quotes as CommonMark container blocks (empty `>`, splitting at blank lines, lazy continuation). |
| Lists | Parse lists with a CommonMark container-block parser (marker/delimiter splitting, ordered start, loose/tight, indentation-based nesting). |
| Unified inline | Parse all inline content with a single unified CommonMark parser (one delimiter stack). |
| Tabs | Expand tabs to 4-column tab stops in block-structure indentation (content tabs are preserved). |
| Containers | Parse leaf blocks (fenced code, HTML blocks, link reference definitions, indented code) in the context of their containing block quote / list item. |

The separate [`decodeEntities`](available-options.md#decodeentities) option resolves HTML5 named
and numeric character references (`&copy;`, `&#35;`, `&#xcab;`) to their characters. It is kept
independent of `cmSpec` because it is also useful on its own.

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
