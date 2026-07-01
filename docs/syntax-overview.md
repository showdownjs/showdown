# Markdown Syntax

Markdown is not a single, rigidly-defined language — over the years it has grown into a family of
closely-related **syntax flavors**. They agree on a common core (paragraphs, headings, emphasis,
lists, links, …) but differ in the details: how much whitespace a nested list needs, whether tables
or strikethrough exist, how ambiguous or malformed input is resolved, and so on.

Showdown understands **four** of these flavors. You pick one with a [flavor preset](flavors.md)
(`showdown.setFlavor(...)` or the equivalent options), and the converter adjusts its parsing and
output to match.

## Supported syntaxes

| Syntax | Flavor preset | What it is |
|--------|---------------|------------|
| **Original** | [`original`](original.md) | [John Gruber's original Markdown spec][md-spec] — the 2004 reference implementation (`Markdown.pl`). The smallest feature set, with none of the later "extra" syntax. |
| **Showdown** | [`vanilla`](markdown-syntax.md) | Showdown's own syntax and default behavior. It starts from Gruber's spec, resolves its ambiguities following the [author's guidance][md-newsletter], and adds opt-in extras (strikethrough, tables, task lists, emoji, …) that you enable via [options](options.md#available-options). Documented in detail on the [Showdown](markdown-syntax.md) page. |
| **CommonMark** | [`commonmark`](commonmark.md) | The [CommonMark spec][commonmark] — a strict, unambiguous specification of Markdown with a comprehensive test suite. Showdown passes the vast majority of the spec examples; see the [CommonMark page](commonmark.md). |
| **GitHub Flavored Markdown (GFM)** | [`gfm`](gfm.md) | [GitHub's dialect][gfm] — CommonMark plus GitHub's extensions (tables, task lists, strikethrough, autolink literals, `@`-mentions, footnotes, …). This is the syntax you write in issues, pull requests and `README` files on GitHub. |

!!! note "`showdown` = the `vanilla` flavor"
    Throughout the docs, "Showdown's own syntax" refers to the **`vanilla`** flavor — the base
    behavior you get out of the box when you don't set any flavor. `vanilla` is the historical
    preset name; `showdown` is just the everyday word for it.

## How the flavors differ

The differences are usually small but they matter in practice. A few representative examples:

* **Feature set** — tables, task lists and strikethrough exist in `gfm` but not in `original`;
  `vanilla` gates them behind [options](options.md#available-options).
* **List handling** — Showdown wraps loose list items in `<p>` differently from CommonMark/GFM, and
  requires four-space indentation for sublists by default (see
  [Showdown → List behavior](markdown-syntax.md#list-behavior)).
* **Strictness** — `commonmark` and `gfm` follow a formal spec and resolve ambiguous or malformed
  input deterministically, whereas `original`/`vanilla` inherit the looser behavior of the original
  parser.
* **Output details** — for the same input, flavors can emit slightly different HTML (for example
  GFM's table column alignment); the intentional deviations are catalogued on the
  [CommonMark](commonmark.md#known-differences) and [GFM](gfm.md#known-differences) pages.

## The common syntax

The constructs below make up the shared core that **every** flavor understands. Flavor-specific
behavior and opt-in extras are documented on each flavor's own page — start with
[Showdown](markdown-syntax.md) for the default flavor.

### Paragraphs

A paragraph is **one or more lines of consecutive text** followed by one or more blank lines.

```md
On July 2, an alien mothership entered Earth's orbit and deployed several dozen
saucer-shaped "destroyer" spacecraft, each 15 miles (24 km) wide.

On July 3, the Black Knights, a squadron of Marine Corps F/A-18 Hornets,
participated in an assault on a destroyer near the city of Los Angeles.
```

Because a paragraph is "one or more consecutive lines", **hard-wrapped** text is supported — these
produce the same output:

```md
A very long line of text
```

```md
A very
long line
of text
```

To add a soft line break (`<br>`) within a paragraph, end the line with **three spaces**.

### Headings

#### Atx style

Add one or more `#` symbols before the heading text; the number of `#` sets the level (this is
[atx style][atx]).

```md
# The 1st level heading (an <h1> tag)
## The 2nd level heading (an <h2> tag)
…
###### The 6th level heading (an <h6> tag)
```

You can wrap the heading in `#` — both leading and trailing `#` are removed. To keep a literal one,
add a space or escape it:

```md
## My Heading ##

# # My header # #

#\# My Header \# #
```

#### Setext style

[Setext style][setext] headings are also supported, though only two levels are available:

```md
This is an H1
=============

This is an H2
-------------
```

### Blockquotes

Indicate a blockquote with `>`.

```md
In the words of Abraham Lincoln:

> Pardon my french
```

Blockquotes can hold multiple paragraphs and other block elements:

```md
> A paragraph of text
>
> Another paragraph
>
> - A list
> - with items
```

### Bold and italic

```md
*This text will be italic*
**This text will be bold**
```

Both bold and italic accept either `*` or `_`, so you can combine them:

```md
**Everyone _must_ attend the meeting at 5 o'clock today.**
```

### Code

Use single backticks for inline code — everything inside appears as-is:

```md
Here's an idea: why don't we take `SuperiorProject` and turn it into `**Reasonable**Project`.
```

```html
<p>Here's an idea: why don't we take <code>SuperiorProject</code> and turn it into <code>**Reasonable**Project</code>.</p>
```

Create a code block by indenting it four spaces:

```md
    this is a piece
    of
    code
```

### Lists

Make an **unordered** list with `*`, `-`, or `+` (markers are interchangeable):

```md
* Item
+ Item
- Item
```

Make an **ordered** list by preceding items with a number:

```md
1. Item 1
2. Item 2
3. Item 3
```

!!! note ""
    The actual numbers have no effect on the output, so you can reuse the same one if you like.

List markers may be indented up to three spaces and must be followed by a space or tab. Items can
span multiple paragraphs and hold other block elements when their continuation lines are indented
(four spaces or one tab):

```md
1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
```

### Links

Wrap a URL or email in `<>` to turn it into a link whose text is the link itself:

```md
link to <http://www.google.com/>

this is my email <somedude@mail.com>
```

Create an **inline** link by wrapping the text in `[ ]` and the URL in `( )`:

```md
[Get Showdown!](https://github.com/showdownjs/showdown)
```

Or use the **reference** style (including implicit references):

```md
this is a [link to google][1]

[1]: www.google.com
```

```md
this is a link to [google][]

[google]: www.google.com
```

### Images

Image syntax mirrors links, with a leading `!`. Inline:

```md
![Alt text](url/to/image)

![Alt text](url/to/image "Optional title")
```

Reference style (implicit references work too):

```md
![Alt text][id]

[id]: url/to/image  "Optional title attribute"
```

### Inline HTML

In most cases HTML tags are left untouched in the output:

```md
some markdown **here**
<div>this is *not* **parsed**</div>
```

```html
<p>some markdown <strong>here</strong></p>
<div>this is *not* **parsed**</div>
```

The content of `<code>` and `<pre><code>` is always escaped.

### Escaping

Use a backslash (`\`) to produce a literal character instead of triggering Markdown syntax — for
example `\_literal underscores\_` renders the underscores literally. Backslash escapes are available
for:

```
\   backslash        {}  curly braces      #   hash mark
`   backtick         []  square brackets   +   plus sign
*   asterisk         ()  parentheses       -   minus sign (hyphen)
_   underscore       .   dot               !   exclamation mark
```

## Where to go next

* **[Showdown](markdown-syntax.md)** — the default (`vanilla`) flavor: its opt-in extras and the
  ways it deviates from the original spec.
* **[Original](original.md)**, **[CommonMark](commonmark.md)** and **[GFM](gfm.md)** — the other
  flavors and how each one differs.
* **[Flavors](flavors.md)** — how to activate a flavor and the full table of options each one sets.

[md-spec]: https://daringfireball.net/projects/markdown/
[md-newsletter]: https://pairlist6.pair.net/mailman/listinfo/markdown-discuss
[commonmark]: https://spec.commonmark.org/
[gfm]: https://github.github.com/gfm/
[atx]: http://www.aaronsw.com/2002/atx/intro
[setext]: https://en.wikipedia.org/wiki/Setext
