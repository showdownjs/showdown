# Showdown

**`vanilla`** is Showdown's default flavor — the syntax you get out of the box when you don't set a
flavor or any options. It is what the docs mean by "Showdown's own syntax".

Showdown began as John Fraser's direct port of John Gruber's original Markdown parser, and in
vanilla mode it still follows the [original spec][md-spec] closely, resolving the spec's ambiguities
per the [author's guidance][md-newsletter]. On top of the [common syntax](syntax-overview.md#the-common-syntax)
that every flavor shares, `vanilla` enables a couple of extras **by default** and lets you opt into
many more via [options](options.md).

## Enable this flavor

Vanilla is already the default, so you rarely need to set it. Use `setFlavor` to reset a converter
back to it:

=== "Globally"

    ```js
    showdown.setFlavor('vanilla');
    ```

=== "On a converter"

    ```js
    converter.setFlavor('vanilla');
    ```

=== "Constructor"

    ```js
    // vanilla is the default, so no options are needed
    const converter = new showdown.Converter();
    ```

## What Showdown adds

On top of the [common syntax](syntax-overview.md#the-common-syntax), the vanilla flavor supports the
constructs below. A few are **on by default** (fenced code blocks, strikethrough, email obfuscation,
generated header ids); the rest are **opt-in** — enable them with the linked [option](options.md).

### Fenced code blocks

With [**`ghCodeBlocks`**][ghCodeBlocks] (on by default) you can fence a block with triple backticks
instead of indenting it:

    ```
    x = 0
    x = 2 + 2
    what is x
    ```

### Strikethrough

With [**`strikethrough`**][strikethrough] (on by default) two tildes around text produce a
strikethrough, same as GFM:

```md
a ~~strikethrough~~ element
```

a <s>strikethrough</s> element

### Emoji

With [**`emoji`**][emoji] enabled, Showdown supports GitHub's emoji (a complete list is
[here][emoji list]):

```md
this is a :smile: smile emoji
```

### Task lists

With [**`tasklists`**][tasklists] enabled, GFM-style task list items are supported:

```md
 - [x] checked list item
 - [ ] unchecked list item
```

 - [x] checked list item
 - [ ] unchecked list item

### Tables

Tables aren't part of core Markdown but are enabled via [**`tables`**][tables]. Colons set column
alignment, outer pipes are optional, and you can use Markdown inside cells:

```md
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| **col 3 is**  | right-aligned | $1600 |
| col 2 is      | *centered*    |   $12 |
| zebra stripes | ~~are neat~~  |    $1 |
```

### Mentions

With [**`ghMentions`**][mentions] every `@username` becomes a link to that GitHub profile:

```md
hey @tivie, check this out
```

Customize the generated link with [**`ghMentionsLink`**][ghMentionsLink]. For example, setting it to
`http://mysite.com/{u}/profile`:

```html
<p>hey <a href="http://mysite.com/tivie/profile">@tivie</a>, check this out</p>
```

### Footnotes

With [**`footnotes`**][footnotes] enabled (it is on in the [`gfm`](gfm.md) flavor), Showdown supports
[GFM footnotes](https://github.github.com/gfm/). A footnote has a **reference** `[^id]` in the text
and a **definition** `[^id]: …` (usually at the bottom of the document):

```md
Here is a footnote reference.[^1] And another.[^note]

[^1]: The first footnote.
[^note]: The second footnote, with *inline* markdown.
```

References are numbered automatically in **order of first reference** (not definition order), and the
definitions are collected into a footnotes section at the end of the document. A few rules:

* **Multi-paragraph / block definitions** — continuation content indented four spaces can hold
  several paragraphs, block quotes or code blocks.
* **A footnote can be referenced multiple times** — each reference gets its own back-reference link.
* **Labels can be words or numbers** but **may not contain whitespace** (`[^a b]` is left literal);
  matching is case-insensitive.
* **A reference with no matching definition is left literal** (`[^missing]` stays as text), and an
  **unreferenced definition is dropped**.
* **A reference inside a code span, or escaped, is left literal** — `` `[^1]` `` and `\[^1]` are not
  turned into footnotes.

### Image dimensions

With [**`parseImgDimensions`**][parseImgDimensions] you can set image dimensions inline or in
reference style:

```md
![Alt text](url/to/image =250x250 "Optional title")
```

```md
![Alt text][id]

[id]: url/to/image =250x250
```

### Base64 encoded images

Showdown supports Base64 encoded images in both inline and reference style. Since v1.7.4, long
base64 strings may be wrapped with newlines added after the `,`:

```md
![Alt text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAY
SURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=)
```

!!! warning ""
    With reference-style base64 sources, a **double newline is required** after the base64 string to
    separate it from the following text block (adjacent references are fine):

    ```md
    ![Alt text][id]
    ![Alt text][id2]

    [id]:
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
    jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
    [id2]:
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
    jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D


    this text needs to be separated from the references by 2 newlines
    ```

### Header ids

Showdown generates a bookmark id on every heading by default:

```md
# My cool header with ID
```

```html
<h1 id="my-cool-header-with-id">My cool header with ID</h1>
```

The generated ids are **github-compatible** by default. This can be modified with options:

* [**`noHeaderId`**][noHeaderId] disables automatic id generation;
* [**`rawHeaderId`**][rawHeaderId] uses minimal sanitization (only spaces, `'`, `"`, `>` and `<`
  become dashes);
* [**`prefixHeaderId`**][prefixHeaderId] adds a prefix to the generated ids;
* [**`headerLevelStart`**][headerLevelStart] sets the starting level (e.g. `3` makes `# header` an
  `<h3>`).

You can also require a space after the `#` with [**`requireSpaceBeforeHeadingText`**][requireSpaceBeforeHeadingText].

### Line breaks

Force **every** newline in a paragraph to become a `<br>` (as GitHub does) with
[**`simpleLineBreaks`**][simpleLineBreaks].

### Automatic links and email obfuscation

Email addresses in `<>` are lightly entity-encoded to obscure them from harvesters; disable this
with [**`encodeEmails`**][encodeEmails]`: false`. With [**`simplifiedAutoLink`**][simplifiedAutoLink]
Showdown turns bare URLs (and emails) into links without needing `<>`:

```md
link to http://www.google.com/

this is my email somedude@mail.com
```

### Markdown inside HTML

By default Markdown is **not** parsed inside HTML blocks. Enable it for a specific tag with the
`markdown`, `markdown="1"`, or `data-markdown="1"` attribute:

```md
some markdown **here**
<div markdown="1">this is *not* **parsed**</div>
```

```html
<p>some markdown <strong>here</strong></p>
<div markdown="1"><p>this is <em>not</em> <strong>parsed</strong></p></div>
```

### Escaping HTML tags

With [**`backslashEscapesHTMLTags`**][backslashEscapesHTMLTags] you can backslash-escape HTML tags to
render them literally:

```md
\<div>a literal div\</div>
```

### List behavior

Showdown's list rules differ from CommonMark/GFM in two notable ways.

**Loose vs tight** — if any item is separated from another by a blank line, Showdown wraps **all**
items in `<p>` tags. So this input:

```md
* Bird

* Magic
* Johnson
```

results in:

```html
<ul>
<li><p>Bird</p></li>
<li><p>Magic</p></li>
<li><p>Johnson</p></li>
</ul>
```

**Four-space sublists** — nested lists must be indented **four** spaces (consistent with the original
spec, unlike GFM/CommonMark). Each extra level needs four more spaces (or one more tab):

```md
1.  Item 1
    1. A corollary to the above item.
    2. Yet another point to consider.
2.  Item 2
    * A corollary that does not need to be ordered.
```

Relax the four-space requirement with
[**`disableForced4SpacesIndentedSublists`**][disableForced4SpacesIndentedSublists].

## Known differences

In most cases Showdown's output is identical to Perl Markdown v1.0.2b7. The known deviations:

* **The `markdown="1"` attribute is supported since v1.4.0**; older versions ignore it (Markdown does
  not work inside such a `<div>`).
* **Square brackets in link text nest only two levels deep** — `[[fine]](...)` works,
  `[[[broken]]](...)` does not. Escape them with backslashes if you need more.
* **A list is single-paragraph** with only one line break between items, and becomes
  **multi-paragraph if any two items are separated by a blank line** (see
  [List behavior](#list-behavior) above). This ruleset follows John Gruber's comments in the
  [Markdown discussion list][md-newsletter].

## Learn more

* **[Markdown Syntax overview](syntax-overview.md)** — the common syntax shared by every flavor.
* **[Original](original.md)** — the stricter spec `vanilla` is based on.
* **[CommonMark](commonmark.md)** and **[GFM](gfm.md)** — the spec-based flavors.
* **[Options](options.md)** — every option referenced above, in full.

[md-spec]: https://daringfireball.net/projects/markdown/
[md-newsletter]: https://pairlist6.pair.net/mailman/listinfo/markdown-discuss
[emoji list]: https://github.com/showdownjs/showdown/wiki/emojis
[ghCodeBlocks]: options.md#ghcodeblocks
[strikethrough]: options.md#strikethrough
[emoji]: options.md#emoji
[tasklists]: options.md#tasklists
[tables]: options.md#tables
[mentions]: options.md#ghmentions
[ghMentionsLink]: options.md#ghmentionslink
[footnotes]: options.md#footnotes
[parseImgDimensions]: options.md#parseimgdimensions
[noHeaderId]: options.md#noheaderid
[rawHeaderId]: options.md#rawheaderid
[prefixHeaderId]: options.md#prefixheaderid
[headerLevelStart]: options.md#headerlevelstart
[requireSpaceBeforeHeadingText]: options.md#requirespacebeforeheadingtext
[simpleLineBreaks]: options.md#simplelinebreaks
[encodeEmails]: options.md#encodeemails
[simplifiedAutoLink]: options.md#simplifiedautolink
[backslashEscapesHTMLTags]: options.md#backslashescapeshtmltags
[disableForced4SpacesIndentedSublists]: options.md#disableforced4spacesindentedsublists
