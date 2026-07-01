# Original

**`original`** makes Showdown behave like [John Gruber's original Markdown spec][md-spec] — the 2004
`Markdown.pl` reference implementation. It is the **smallest** flavor: just the
[common syntax](syntax-overview.md#the-common-syntax), with none of the later "extra" syntax and none
of Showdown's default niceties.

## Enable this flavor

=== "Globally"

    ```js
    showdown.setFlavor('original');
    ```

=== "On a converter"

    ```js
    converter.setFlavor('original');
    ```

=== "Constructor"

    ```js
    const converter = new showdown.Converter(showdown.getFlavorOptions('original'));
    ```

## What's different

Compared with the default [`vanilla`](markdown-syntax.md) flavor, `original` turns **off** the
extras that `vanilla` enables by default, keeping the output faithful to the original spec:

| Behavior | `original` | `vanilla` (default) |
|---|:---:|:---:|
| Fenced code blocks ([`ghCodeBlocks`](options.md#ghcodeblocks)) | off | on |
| Strikethrough ([`strikethrough`](options.md#strikethrough)) | off | on |
| Generated header ids ([`noHeaderId`](options.md#noheaderid)) | off (no ids) | on (ids generated) |

Everything else is the shared [common syntax](syntax-overview.md#the-common-syntax): paragraphs,
headings, blockquotes, emphasis, indented code blocks, lists, links, images and escaping. The opt-in
extras documented on the [Showdown](markdown-syntax.md#what-showdown-adds) page (tables, emoji, task
lists, mentions, footnotes, …) are all off, as in the original spec.

## Learn more

* **[Markdown Syntax overview](syntax-overview.md)** — the common syntax shared by every flavor.
* **[Showdown](markdown-syntax.md)** — the default `vanilla` flavor and its extras.
* **[Flavors](flavors.md)** — the exact option values each flavor sets.

[md-spec]: https://daringfireball.net/projects/markdown/
