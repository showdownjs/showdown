# GitHub Flavored Markdown (GFM)

**`gfm`** targets the [GitHub Flavored Markdown spec][gfm] — the dialect you write in issues, pull
requests and `README` files on GitHub. GFM is defined as **CommonMark plus a set of extensions**, so
this flavor builds on the [`commonmark`](commonmark.md) base and layers the GFM extensions (tables,
task lists, strikethrough, autolink literals, `@`-mentions, emoji, [footnotes](options.md#footnotes),
…) on top. Footnotes are also reversible via `makeMarkdown` (see
[HTML to Markdown](html-to-markdown.md#feature-options-matching-makehtml)).

## Enable this flavor

=== "Globally"

    ```js
    showdown.setFlavor('gfm');
    ```

=== "On a converter"

    ```js
    converter.setFlavor('gfm');
    ```

=== "Constructor"

    ```js
    const converter = new showdown.Converter(showdown.getFlavorOptions('gfm'));
    ```

!!! note "`github` alias"
    `github` is kept as a backwards-compatible alias for `gfm`, so `setFlavor('github')` returns the
    exact same options. New code should prefer `gfm`.

## What GFM adds on top of CommonMark

* **Tables** — pipe tables with per-column alignment.
* **Task lists** — `- [ ]` / `- [x]` checkboxes.
* **Strikethrough** — `~~text~~`.
* **Autolink literals** — bare URLs become links without `<>`.
* **`@`-mentions** and **emoji** (`:smile:`).
* **[Footnotes](options.md#footnotes)** — `[^id]` references and definitions (also reversible via
  [`makeMarkdown`](html-to-markdown.md#feature-options-matching-makehtml)).

## Known differences

Because the flavor uses the CommonMark base, **every
[CommonMark known difference](commonmark.md#known-differences) also applies to `gfm`** — empty ATX
headings, the dual fenced-code language classes, and the malformed thematic-break examples included.
The items below are the additional, intentional deviations specific to the GFM table extension.

### Table column alignment

GFM renders per-column alignment with the HTML `align` attribute. Showdown uses an inline
`style="text-align:…"` instead: the `align` attribute is obsolete in HTML5, so the CSS form is the
modern equivalent.

=== "input"

    ```md
    | abc | defghi |
    | :-: | -----------: |
    | bar | baz |
    ```

=== "Showdown output"

    ```html
    <th style="text-align:center;">abc</th>
    <th style="text-align:right;">defghi</th>
    ```

=== "GFM output"

    ```html
    <th align="center">abc</th>
    <th align="right">defghi</th>
    ```

### Empty table body

For a table with a header and delimiter row but no body rows, Showdown always emits an empty
`<tbody></tbody>`; GFM omits the `<tbody>` entirely. The empty element is invisible and most browsers
inject one anyway, so Showdown keeps its table output shape consistent regardless of whether the
table has body rows.

=== "input"

    ```md
    | abc | def |
    | --- | --- |
    ```

=== "Showdown output"

    ```html
    <table>
    <thead><tr><th>abc</th><th>def</th></tr></thead>
    <tbody></tbody>
    </table>
    ```

=== "GFM output"

    ```html
    <table>
    <thead><tr><th>abc</th><th>def</th></tr></thead>
    </table>
    ```

## Learn more

* **[CommonMark](commonmark.md)** — the base this flavor extends.
* **[Flavors](flavors.md)** — the full option table for every flavor.
* **[Showdown](markdown-syntax.md)** — the default flavor and its syntax.

[gfm]: https://github.github.com/gfm/
