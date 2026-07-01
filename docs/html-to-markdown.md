# HTML to Markdown

Besides the usual Markdown → HTML direction, a `Converter` can also run **in reverse** —
turning an HTML string back into Markdown — via `makeMarkdown()`:

```js
var converter = new showdown.Converter(),
    md        = converter.makeMarkdown('<h1>Hello</h1><p>Some <strong>bold</strong> text.</p>');

// # Hello
//
// Some **bold** text.
```

Unlike `makeHtml()`, the reverse converter parses the input into a **DOM** (using the browser's
DOM in the browser, and `jsdom` in Node) and walks the node tree one construct at a time. Each
node is dispatched to a dedicated sub-parser. (These sub-parsers also emit
[events](event-system.md#makemarkdown-html-to-markdown-events) you can hook from a listener
extension.)

!!! note
    `makeMarkdown()` is a best-effort converter, not a full HTML parser. It targets the HTML that
    Markdown itself produces (so content round-trips) plus the most common hand-written markup.
    Anything it does not recognize is preserved as raw HTML rather than dropped (see
    [Unknown tags](#unknown-tags-and-wrappers)).

## Supported elements

### Block-level

| HTML            | Markdown                                                                        |
|-----------------|---------------------------------------------------------------------------------|
| `<h1>`…`<h6>`   | `#` … `######` headings                                                         |
| `<p>`           | paragraph                                                                       |
| `<blockquote>`  | `>` blockquote                                                                  |
| `<hr>`          | `---` thematic break                                                            |
| `<ul>` / `<ol>` | bullet / numbered list (honors the `start` attribute)                           |
| `<li>`          | list item (nested lists and multi-paragraph items are indented)                 |
| `<pre><code>`   | fenced code block (language taken from `data-language` or a `language-*` class) |
| `<pre>`         | raw `<pre>` passthrough                                                         |
| `<table>`       | pipe table — see [Tables](#tables)                                              |
| `<section class="footnotes">` | footnote definitions `[^id]: …` (back-references stripped, with the `footnotes` option) |

### Inline

| HTML                         | Markdown                                                                                 |
|------------------------------|------------------------------------------------------------------------------------------|
| `<code>`                     | `` `code` `` (back-tick fence widened when the content itself contains back-ticks)       |
| `<em>` / `<i>`               | `*emphasis*`                                                                             |
| `<strong>` / `<b>`           | `**strong**`                                                                             |
| `<del>` / `<s>` / `<strike>` | `~~strikethrough~~`                                                                      |
| `<u>`                        | `__underline__` &nbsp;<sup>[1](#fn-underline)</sup>                                      |
| `<a href>`                   | `[text](<href> "title")`, or a bare `<href>` autolink when the link text equals the href |
| `<img>`                      | `![alt](<src> "title")` (also supports the `=WxH` size syntax)                           |
| `<br>`                       | hard line break                                                                          |
| `<input type="checkbox">`    | `[ ]` / `[x]` task-list marker (a checkbox inside a list item, with the `tasklists` option), see note below |
| `<sup class="footnote-ref">` | `[^id]` footnote reference (with the `footnotes` option)                                  |

<sup id="fn-underline">1</sup> `<u>` is emitted as `__…__`, which is showdown's underline syntax.
This only round-trips back to `<u>` through a converter that has the
[`underline`](options.md#available-options) option enabled; otherwise `__…__` is standard-Markdown
**strong**.

> **Task-list detection requires a list-item context, not a class.** With the `tasklists` option
> on, reverse conversion turns an `<input type="checkbox">` into a `[ ]`/`[x]` marker **only when it
> sits inside an `<li>`** (directly, or wrapped in a `<p>` as loose list items are). This matches
> Markdown semantics — `[ ]`/`[x]` is a task only when it leads a list item — so a naked checkbox
> (top level, or inside a `<p>`/`<div>`) is left as raw HTML rather than degrading into literal
> bracket text. Detection does **not** depend on the `task-list-item` class (which `makeHtml` only
> emits under `moreStyling`), so checkboxes in hand-written or unstyled list HTML are recognised
> too. A `checked` attribute (with any value) renders `[x]`; its absence renders `[ ]`.

## Tables

`<thead>`, `<tbody>`, `<tfoot>` and bare `<tr>` rows are all collected, and `<th>`/`<td>` may be
mixed in any order. Column alignment is detected from either an inline `style="text-align:…"`
or the (deprecated) `align="left|center|right"` attribute. `<caption>` and `<colgroup>` are
currently ignored, and — since Markdown tables are single-header — only the first heading row is
treated as the header.

## Feature options (matching makeHtml)

`makeMarkdown` honours the same options as `makeHtml`, so the two directions stay symmetric: a
non-standard construct that `makeHtml` wouldn't parse is **not** emitted as Markdown in reverse —
instead the source element is kept as **raw HTML**. These options also respond to the converter's
[flavor](flavors.md): for example `commonmark` disables all of them except fenced code, and
`vanilla` (the default) only keeps fenced code on.

| Construct | Option | Enabled output | Disabled output (raw HTML) |
|-----------|--------|----------------|----------------------------|
| Strikethrough (`<del>`/`<s>`/`<strike>`) | `strikethrough` | `~~text~~` | `<del>…</del>` |
| Underline (`<u>`) | `underline` | `__text__` | `<u>…</u>` |
| Tables (`<table>`) | `tables` | pipe table | `<table>…</table>` (verbatim) |
| Fenced code (`<pre><code>`) | `ghCodeBlocks` | ```` ```lang ```` | `<pre><code>…</code></pre>` |
| Task lists (`<input type="checkbox">`) | `tasklists` | `[ ]` / `[x]` | `<input …>` |
| Image dimensions | `parseImgDimensions` | `![alt](<src> =WxH)` | `<img …>` (only if it has width+height) |
| Emoji (unicode char, or `<img>` for the "special" emoji) | `emoji` | `:code:` | unicode char / `<img>` kept as-is <sup>[2](#fn-emoji)</sup> |
| Ellipsis (`…` in text) | `ellipsis` | `...` | `…` kept verbatim |
| Footnotes (`<sup class="footnote-ref">` / `<section class="footnotes">`) | `footnotes` | `[^id]` + `[^id]: …` | `<sup>…</sup>` / `<section>…</section>` |

For an inline fallback the wrapper tag is kept but its children are still converted (e.g.
`<del>**b**</del>` → `<del>**b**</del>`). In the `vanilla` (default) flavor `ghCodeBlocks` and
`ellipsis` default **on** while the rest default **off**, so by default only the disabled
constructs fall back.

<sup id="fn-emoji">2</sup> The emoji reverse is symmetric but **opt-in**: with `emoji` enabled,
*any* matching unicode emoji already present in the source HTML is rewritten to its `:code:`,
not only ones that showdown itself generated.

## Unknown tags and wrappers

Tags without a dedicated sub-parser are handled by a fallback:

* **Wrapper elements with children** (e.g. `<div>`, `<span>`, `<section>`, `<figure>`,
  `<details>`, `<hgroup>`) keep their opening/closing tag as raw HTML, but their **children are
  still converted to Markdown**. So `<div><p>**hi**</p></div>` becomes `<div>**hi**</div>`,
  not a verbatim HTML dump.
* **Embedded / replaced-content elements** — `script`, `style`, `canvas`, `audio`, `video`,
  `iframe`, `object`, `svg`, `math`, `noscript`, `template`, `picture` — are passed through
  **verbatim** (their contents are not flowing Markdown text, so recursing into them would
  corrupt them, e.g. by unescaping entities).
* **Void / empty unknown elements** are passed through verbatim.

HTML comments (`<!-- … -->`) are preserved.

## Round-trip caveats

* `<u>` → `__…__` round-trips only with the `underline` option enabled (see the note above).
* Autolinks: `<a href="u">u</a>` is emitted as `<u>` only when the visible text is identical to
  the `href` and there is no `title`; otherwise the full `[text](<href>)` form is used.
* Emoji: with `emoji` enabled, unicode emoji and recognized emoji `<img>` tags are turned back
  into `:code:`. Because the lookup is by character/`src`, a literal emoji the author typed by
  hand is also converted — this keeps the two directions symmetric but means the option rewrites
  more than just showdown-generated emoji.
* Footnotes (with the `footnotes` option) recover the `[^id]` label from the `#fn-…` href, so the
  numbering and definition order are canonicalised to first-reference order (the markdown round-trips
  to the same HTML, but not necessarily byte-for-byte to the original source). Information that the
  forward direction discards — an unreferenced definition, or the original label casing — cannot be
  recovered.
* Tables, captions, and any HTML feature with no Markdown equivalent are lossy by nature.
