---
title: Showdown Flavored Markdown Spec
author: ShowdownJS
version: '0.1'
date: '2026-07-07'
...

# Introduction

## What is Showdown Flavored Markdown?

Showdown Flavored Markdown, or SFM, is the dialect of Markdown that the
[ShowdownJS](https://github.com/showdownjs/showdown) converter implements
out of the box — the behavior of `new showdown.Converter()` with no
options set, also known as the **`vanilla` flavor**.

SFM is [Original Markdown](original.md) at heart: its block and span
grammar descends from John Gruber's Markdown 1.0.1.  On top of that base
it enables a small set of widely-expected extras **by default** — fenced
code blocks, strikethrough, generated heading ids, ellipsis substitution
and email address obfuscation — and offers a larger set of **optional
features** (tables, task lists, footnotes, emoji, underline, simplified
autolinks, metadata and more), each controlled by a converter option.

This document specifies all of it.  Sections without a marker describe
default behavior.  A section or rule marked **(option: `name`)** describes
behavior that only applies when the named option is enabled (or, where
stated, disabled); everything else in the document remains in effect
unless the option's section says otherwise.

Two converter options are intentionally *out of scope*:

  - `cmSpec: true` re-bases Showdown's block and inline parsing on the
    [CommonMark](CommonMark.md) and [GFM](gfm.md) specifications, which
    then serve as the normative reference (this is what the `commonmark`
    and `gfm` flavors do).  This document describes the default parser only.
  - Extensions (`showdown.extension(...)`) and the event system, which
    can change anything, are described in the project documentation, not
    here.

## Why is a spec needed?

Showdown has existed since 2007 and its dialect has so far been defined
only by its implementation and its test suite.  That makes three things
hard:

 1. **Compatibility.**  Authors moving documents between Showdown and
    other converters need to know where Showdown agrees with Original
    Markdown, where it agrees with GFM, and where it does neither.
 2. **Regression control.**  Showdown's behavior is enforced by
    thousands of fixture tests, but fixtures answer "what does it do?",
    not "what should it do?".  A spec records intent, so accidental
    behavior can be told apart from contract.
 3. **Reimplementation.**  The `vanilla` flavor's exact rules — the
    heading id algorithm, the 4-space sublist requirement, the escapable
    character set — were previously discoverable only by reading source.

This document is the normative reference for the `vanilla` flavor (and,
for each option, the behavior of that option on top of `vanilla`).
Where this spec and the implementation disagree, that is a bug in one of
them; known intentional oddities are recorded in the text.

## About this document

This document specifies Showdown Flavored Markdown through prose rules
and examples with side-by-side Markdown and HTML.  The examples are
intended to double as conformance tests.  An example is written as:

    ```````````````````````````````` example
    Markdown source
    .
    Expected HTML output
    ````````````````````````````````

Examples are identified by their position in the document: extraction
tools should number them sequentially in document order.

**Options annotations.**  An example that requires non-default converter
options declares them in its fence info string, after the word
`example`:

    ```````````````````````````````` example options:tables
    ```````````````````````````````` example options:headerLevelStart=3
    ```````````````````````````````` example options:tables,tasklists
    ```````````````````````````````` example options:ghCodeBlocks=false
    ```````````````````````````````` example options:headerIds.prefix=user-content

The grammar: `options:` is followed by a comma-separated list of
entries; a bare key sets that option to `true`; `key=value` sets it to
the given value (`true`, `false`, a number, or a string); a dotted key
such as `headerIds.prefix` sets a property of an object-valued option.
An example with no annotation runs with pure default options.

The following conventions are used:

  - The `→` character stands for a tab character (U+0009) in both the
    source and the output.  A literal `→` does not occur in any example.
  - Trailing spaces that are significant to an example (hard line
    breaks) are called out in the surrounding prose, since they are
    invisible.
  - The HTML output shown is a canonical rendering.  *Insignificant*
    whitespace differences — leading and trailing whitespace on each
    output line, and blank lines at the very start or end of the
    output — are **not** normative.  A conforming implementation may
    produce output that differs from an example only in insignificant
    whitespace.  Blank lines *between* output lines are significant
    (they matter inside `<pre>` blocks).
  - Heading `id` attributes **are** part of the expected output: id
    generation is on by default (see [Heading ids](#heading-ids)).
  - Email address obfuscation (see [Automatic links](#automatic-links))
    is deterministic in Showdown — the encoding is seeded by the address
    itself — so examples show the exact encoded output.

The words *MUST*, *MUST NOT*, *SHOULD*, *SHOULD NOT* and *MAY* are used
as in RFC 2119.

# Preliminaries

## Characters and lines

Any sequence of characters is a valid Showdown Flavored Markdown
document.

A **character** is a Unicode code point.  This spec does not specify an
encoding; it thinks of lines as composed of characters rather than
bytes.

A **line** is a sequence of zero or more characters other than line feed
(U+000A) or carriage return (U+000D), followed by a line ending or by
the end of the document.

A **line ending** is a line feed (U+000A), a carriage return (U+000D)
not followed by a line feed, or a carriage return followed by a line
feed.  Implementations SHOULD normalize all line endings to a single
line feed before processing, and MUST treat the three forms identically.

A **blank line** is a line containing no characters, or containing only
spaces (U+0020) or tabs (U+0009).

A **whitespace character** is a space (U+0020) or tab (U+0009).  Line
endings separate lines and are not part of them.

## Tabs

Tabs in the source are not expanded to spaces globally.  Wherever this
spec requires an indentation of four spaces (code blocks, continuation
paragraphs of list items, nested list markers), one tab MAY be used in
place of four spaces, and wherever it requires eight spaces, two tabs
MAY be used.  When one level of indentation is stripped (for example
from the lines of a code block), an implementation MUST treat one
leading tab as equivalent to four leading spaces.

```````````````````````````````` example
→foo
.
<pre><code>foo
</code></pre>
````````````````````````````````

```````````````````````````````` example
    foo
→bar
.
<pre><code>foo
bar
</code></pre>
````````````````````````````````

## Backslash escapes

A backslash before any of the following characters produces the literal
character instead of its Markdown meaning:

```
\   backslash
`   backtick
*   asterisk
_   underscore
{}  curly braces
[]  square brackets
()  parentheses
#   hash mark
+   plus sign
-   minus sign (hyphen)
.   dot
!   exclamation mark
~   tilde
|   pipe
:   colon
;   semicolon
=   equals sign
?   question mark
@   at sign
%   percent sign
,   comma
/   slash
^   caret
'   apostrophe
"   double quote
<>  angle brackets
&   ampersand
$   dollar sign
```

This set is a superset of Original Markdown's (which stops at `!` plus
`>`): Showdown additionally makes `~`, `|`, `:`, `;`, `=`, `?`, `@`,
`%`, `,`, `/`, `^`, `'`, `"`, `<`, `>`, `&` and `$` escapable, so that
its own extra constructs ([strikethrough](#strikethrough),
[tables](#tables-option-tables), [emoji](#emoji-option-emoji),
[@mentions](#github-mentions-option-ghmentions)) can be suppressed
character by character.

```````````````````````````````` example
\*literal asterisks\*
.
<p>*literal asterisks*</p>
````````````````````````````````

Escaping `<`, `>`, `"` and `&` produces the corresponding HTML character
reference in the output:

```````````````````````````````` example
\< \> \" \&
.
<p>&lt; &gt; &quot; &amp;</p>
````````````````````````````````

A backslash before a character outside the set is a literal backslash:

```````````````````````````````` example
\a \w
.
<p>\a \w</p>
````````````````````````````````

Backslash escapes do not work in [code spans](#code-spans) or [code
blocks](#indented-code-blocks), where all characters are literal:

```````````````````````````````` example
`\*foo\*`
.
<p><code>\*foo\*</code></p>
````````````````````````````````

```````````````````````````````` example
    \*foo\*
.
<pre><code>\*foo\*
</code></pre>
````````````````````````````````

Backslash-escaped characters are treated as regular characters: they do
not open or close any construct.

```````````````````````````````` example
1986\. What a great season.
.
<p>1986. What a great season.</p>
````````````````````````````````

A backslash at the very end of a line produces a [hard line
break](#hard-line-breaks).

# Blocks and spans

A document is a sequence of **blocks** — structural elements like
paragraphs, headings, blockquotes, lists and code blocks.  Some blocks
(like blockquotes and list items) contain other blocks; others (like
headings and paragraphs) contain **span** elements — text, links,
emphasis, code spans and inline HTML.

## Precedence

Block structure is determined before span structure.  Indicators of
block structure always take precedence over indicators of span
structure:

```````````````````````````````` example
- `one
- two`
.
<ul>
<li>`one</li>
<li>two`</li>
</ul>
````````````````````````````````

Within block parsing, the constructs of this spec are recognized in the
following order of precedence, which resolves inputs that could be read
two ways:

 1. [Metadata](#metadata-option-metadata) (option)
 2. [Fenced code blocks](#fenced-code-blocks) and
    [HTML blocks](#html-blocks)
 3. [Footnote definitions](#footnotes-option-footnotes) (option) and
    [link reference definitions](#link-reference-definitions)
 4. [Headings](#atx-headings) (setext, then ATX)
 5. [Horizontal rules](#horizontal-rules)
 6. [Lists](#lists)
 7. [Indented code blocks](#indented-code-blocks)
 8. [Tables](#tables-option-tables) (option)
 9. [Blockquotes](#blockquotes)
10. [Paragraphs](#paragraphs)

For example, `---` under a line of text is a [setext
heading](#setext-headings), not a [horizontal rule](#horizontal-rules),
because headings are recognized first; and `* * *` is a horizontal
rule, not a list item, because horizontal rules are recognized before
lists.

Span constructs are recognized in this order within a block's text:
[code spans](#code-spans), [backslash escapes](#backslash-escapes),
[images](#images), [links](#links),
[emoji](#emoji-option-emoji) (option),
[underline](#underline-option-underline) (option),
[emphasis and strong emphasis](#emphasis-and-strong-emphasis),
[strikethrough](#strikethrough), [ellipsis](#ellipsis), and finally
[hard line breaks](#hard-line-breaks).  An earlier construct's content
is not re-parsed for later constructs.

## Container blocks and leaf blocks

Blocks divide into two types: **container blocks** ([blockquotes](#blockquotes)
and [list items](#list-items)), which can contain other blocks, and
**leaf blocks** (all others), which cannot.


# Leaf blocks

This section describes the blocks that cannot contain other blocks.

## Horizontal rules

A line consisting of three or more matching `-`, `_`, or `*` characters,
each optionally separated from the next by spaces or tabs, forms a
**horizontal rule**:

```````````````````````````````` example
* * *

***

*****

- - -

---------

___

_ _ _
.
<hr />
<hr />
<hr />
<hr />
<hr />
<hr />
<hr />
````````````````````````````````

Fewer than three characters do not produce a rule:

```````````````````````````````` example
**
.
<p>**</p>
````````````````````````````````

All characters of the rule must be the same:

```````````````````````````````` example
*-*
.
<p><em>-</em></p>
````````````````````````````````

No characters other than the rule character, spaces and tabs may occur
in the line:

```````````````````````````````` example
---a---
.
<p>---a---</p>
````````````````````````````````

A horizontal rule may be indented by up to three spaces; four spaces of
indentation makes it a code block:

```````````````````````````````` example
   ***
.
<hr />
````````````````````````````````

```````````````````````````````` example
    ***
.
<pre><code>***
</code></pre>
````````````````````````````````

Because [setext headings](#setext-headings) are recognized before
horizontal rules, a line of dashes directly below a line of text is a
heading, not a rule:

```````````````````````````````` example
Foo
---
bar
.
<h2 id="foo">Foo</h2>
<p>bar</p>
````````````````````````````````

Because horizontal rules are recognized before [lists](#lists), `* * *`
is a rule even where a list item could otherwise start:

```````````````````````````````` example
* Foo
* * *
* Bar
.
<ul>
<li>Foo</li>
</ul>
<hr />
<ul>
<li>Bar</li>
</ul>
````````````````````````````````

## ATX headings

An **ATX heading** consists of one to six `#` characters at the start of
a line (optionally indented up to three spaces), followed by the heading
text.  The number of `#` characters gives the heading level.  Every
heading also receives a generated `id` attribute — see [Heading
ids](#heading-ids).

```````````````````````````````` example
# This is an H1

## This is an H2

###### This is an H6
.
<h1 id="this-is-an-h1">This is an H1</h1>
<h2 id="this-is-an-h2">This is an H2</h2>
<h6 id="this-is-an-h6">This is an H6</h6>
````````````````````````````````

The whitespace between the `#` characters and the heading text is
optional.  This follows Original Markdown and differs from CommonMark
and GFM, which require it.

```````````````````````````````` example
#Foo

#5 bolt
.
<h1 id="foo">Foo</h1>
<h1 id="5-bolt">5 bolt</h1>
````````````````````````````````

The heading may be indented by up to three spaces; four spaces of
indentation makes it a code block:

```````````````````````````````` example
   # foo
.
<h1 id="foo">foo</h1>
````````````````````````````````

```````````````````````````````` example
    # foo
.
<pre><code># foo
</code></pre>
````````````````````````````````

More than six `#` characters is a level-six heading whose text begins
with the extra hashes, as in Original Markdown.  (The id follows the
usual [algorithm](#heading-ids): the space becomes a dash and the `#`
is stripped, hence the leading dash.)

```````````````````````````````` example
####### foo
.
<h6 id="-foo"># foo</h6>
````````````````````````````````

An escaped `#` does not start a heading:

```````````````````````````````` example
\## foo
.
<p>## foo</p>
````````````````````````````````

ATX headings may be "closed" with any number of trailing `#` characters,
which need not match the number of opening hashes.  The closing sequence
is purely cosmetic and is removed, along with any whitespace before it.
No space is required before it:

```````````````````````````````` example
# foo #

## foo ######

# foo#
.
<h1 id="foo">foo</h1>
<h2 id="foo-1">foo</h2>
<h1 id="foo-2">foo</h1>
````````````````````````````````

Only a *trailing* run of hashes is a closing sequence; hashes followed
by other text belong to the heading:

```````````````````````````````` example
### foo ### b
.
<h3 id="foo--b">foo ### b</h3>
````````````````````````````````

The heading text is parsed as spans:

```````````````````````````````` example
# Foo *bar*
.
<h1 id="foo-bar">Foo <em>bar</em></h1>
````````````````````````````````

An ATX heading does not need to be preceded or followed by a blank line;
it can interrupt a paragraph:

```````````````````````````````` example
foo
# bar
baz
.
<p>foo</p>
<h1 id="bar">bar</h1>
<p>baz</p>
````````````````````````````````

## Setext headings

A **setext heading** is a line of text "underlined" by a line consisting
of `=` characters (level one) or `-` characters (level two).  Any number
of underline characters — one or more — works, and the underline may be
indented by up to three spaces:

```````````````````````````````` example
This is an H1
=============

This is an H2
-------------
.
<h1 id="this-is-an-h1">This is an H1</h1>
<h2 id="this-is-an-h2">This is an H2</h2>
````````````````````````````````

```````````````````````````````` example
Foo
=

Bar
-
.
<h1 id="foo">Foo</h1>
<h2 id="bar">Bar</h2>
````````````````````````````````

A line that mixes other characters or internal spaces into the underline
is paragraph text:

```````````````````````````````` example
Foo
= =
.
<p>Foo
= =</p>
````````````````````````````````

When the underline follows a multi-line paragraph, the **entire
paragraph** becomes the heading text, line breaks included.  (This
follows CommonMark, but differs from Original Markdown, where only the
last line is used.)  In the generated `id`, a line break becomes a dash,
exactly like a space:

```````````````````````````````` example
foo
bar
===
.
<h1 id="foo-bar">foo
bar</h1>
````````````````````````````````

The heading text is parsed as spans:

```````````````````````````````` example
Foo *bar*
=========
.
<h1 id="foo-bar">Foo <em>bar</em></h1>
````````````````````````````````

## Heading ids

By default (`headerIds: {}`), every ATX and setext heading receives an
`id` attribute containing a GitHub-compatible **slug** of the heading
text, computed from the *raw* Markdown text of the heading as follows:

 1. If a `prefix` is configured (see
    [below](#customizing-ids-option-headerids)), prepend it verbatim.
 2. Replace every space and every line ending with a dash (`-`).
 3. Remove all occurrences of these characters:

    ```
    & + $ , / : ; = ? @ " # { } | ^ ¨ ¿ ？ ： ~ [ ] ` 、 ゠ ＝ … ‥
    『 』 〝 〟 「 」 \ * ( ) ｛ ｝ （ ） ［ ］ 【 】 % . 。 ， ¡ ! ！ ' < >
    ```

 4. Lowercase the result.

Letters — including accented and non-Latin letters — digits, dashes and
underscores survive; most ASCII and CJK punctuation is stripped:

```````````````````````````````` example
# Foo Bar! And *baz* 100% (ok)?
.
<h1 id="foo-bar-and-baz-100-ok">Foo Bar! And <em>baz</em> 100% (ok)?</h1>
````````````````````````````````

```````````````````````````````` example
# Olá é çedilha
.
<h1 id="olá-é-çedilha">Olá é çedilha</h1>
````````````````````````````````

Because the slug is computed from the raw text, emphasis *delimiters*
are affected by step 3: `*` is in the stripped set, but `_` is not:

```````````````````````````````` example
# _foo_ and **bar**
.
<h1 id="_foo_-and-bar"><em>foo</em> and <strong>bar</strong></h1>
````````````````````````````````

Ampersands (whether written raw or as an entity) are stripped:

```````````````````````````````` example
# AT&T
.
<h1 id="att">AT&amp;T</h1>
````````````````````````````````

Ids are unique within the document: a repeated slug gets a numeric
suffix `-1`, `-2`, and so on, in document order:

```````````````````````````````` example
# Foo

# Foo

# Foo
.
<h1 id="foo">Foo</h1>
<h1 id="foo-1">Foo</h1>
<h1 id="foo-2">Foo</h1>
````````````````````````````````

### Customizing ids (option: `headerIds`)

Setting `headerIds: false` disables id generation entirely:

```````````````````````````````` example options:headerIds=false
# Foo
.
<h1>Foo</h1>
````````````````````````````````

`headerIds.prefix` prepends a string to every id.  The prefix is
prepended *verbatim* (then sanitized along with the text); no separator
is inserted automatically.  This is deliberate — an automatic separator
would be impossible to opt out of, whereas adding one is trivial — so
include a trailing separator in the prefix if you want one:

```````````````````````````````` example options:headerIds.prefix=user-content-
# Foo
.
<h1 id="user-content-foo">Foo</h1>
````````````````````````````````

`headerIds.raw: true` replaces the default sanitization with a minimal
one: only spaces, `'`, `"`, `>` and `<` become dashes, nothing is
stripped, and the case is preserved.  Raw ids can be malformed; use with
care:

```````````````````````````````` example options:headerIds.raw=true
# Foo "Bar" <baz>
.
<h1 id="foo--bar---baz-">Foo &quot;Bar&quot; <baz></h1>
````````````````````````````````

### headerLevelStart (option: `headerLevelStart`)

`headerLevelStart` offsets every heading's level: an ATX heading with
*n* hashes produces level `headerLevelStart − 1 + n`, a setext `=`
heading produces level `headerLevelStart`, and a setext `-` heading one
level below it.  No upper clamping is applied — with
`headerLevelStart: 3`, six hashes produce the non-standard element
`<h8>`.  This is intentional: the option is a plain offset, and
clamping would silently merge distinct heading levels.

```````````````````````````````` example options:headerLevelStart=3
# Foo

## Bar
.
<h3 id="foo">Foo</h3>
<h4 id="bar">Bar</h4>
````````````````````````````````

## Indented code blocks

An **indented code block** is one or more lines, each indented by at
least four spaces or one tab, preceded by a blank line (or the start of
the document).  Its contents are interpreted literally: no span parsing
occurs, and `&`, `<`, `>` and `"` are converted to HTML entities (the
quote encoding is a Showdown extra; Original Markdown leaves `"`
untouched in code).  A code
block is rendered wrapped in `<pre>` and `<code>` tags, with a line
ending before the closing `</code>`:

```````````````````````````````` example
This is a normal paragraph:

    This is a code block.
.
<p>This is a normal paragraph:</p>
<pre><code>This is a code block.
</code></pre>
````````````````````````````````

One level of indentation — four spaces or one tab — is removed from each
line of the code block; further indentation is preserved:

```````````````````````````````` example
Here is an example of AppleScript:

    tell application "Foo"
        beep
    end tell
.
<p>Here is an example of AppleScript:</p>
<pre><code>tell application &quot;Foo&quot;
    beep
end tell
</code></pre>
````````````````````````````````

Ampersands, angle brackets and double quotes are converted to entities,
and Markdown syntax is not processed:

```````````````````````````````` example
    <div class="footer">
        &copy; 2004 Foo Corporation
    </div>
.
<pre><code>&lt;div class=&quot;footer&quot;&gt;
    &amp;copy; 2004 Foo Corporation
&lt;/div&gt;
</code></pre>
````````````````````````````````

A code block continues until a line that is not indented; blank lines do
not end it, and are preserved when further indented lines follow:

```````````````````````````````` example
    chunk one

    chunk two
.
<pre><code>chunk one

chunk two
</code></pre>
````````````````````````````````

An indented line that is not preceded by a blank line does **not** start
a code block; it is a continuation of the paragraph:

```````````````````````````````` example
Foo
    bar
.
<p>Foo
    bar</p>
````````````````````````````````

Trailing blank lines are not part of the code block:

```````````````````````````````` example
    foo


bar
.
<pre><code>foo
</code></pre>
<p>bar</p>
````````````````````````````````

## Fenced code blocks

A **fenced code block** — a GFM-style construct, enabled by default via
the `ghCodeBlocks` option — begins with a **code fence**: a run of three
or more backticks (`` ` ``) or tildes (`~`) at the start of a line,
indented at most three spaces.  It ends at a closing fence of the same
character (also indented at most three spaces), or at the end of the
document if no closing fence is found.  The lines between the fences are
the block's literal content: no span parsing occurs and `&`, `<`, `>`
and `"` are entity-encoded, exactly as in [indented code
blocks](#indented-code-blocks) — but no indentation is required or
stripped.

```````````````````````````````` example
```
foo
```
.
<pre><code>foo
</code></pre>
````````````````````````````````

```````````````````````````````` example
~~~
foo
~~~
.
<pre><code>foo
</code></pre>
````````````````````````````````

Markdown inside the fence is not processed:

```````````````````````````````` example
```
# not a heading
*not em*
```
.
<pre><code># not a heading
*not em*
</code></pre>
````````````````````````````````

The rest of the opening fence line is the **info string**.  Its first
word is taken as the language and emitted as two classes on the `<code>`
tag, `<lang>` and `language-<lang>`; any further words are ignored:

```````````````````````````````` example
```js
var x = 1;
```
.
<pre><code class="js language-js">var x = 1;
</code></pre>
````````````````````````````````

```````````````````````````````` example
~~~ css
body {}
~~~
.
<pre><code class="css language-css">body {}
</code></pre>
````````````````````````````````

Longer fences work, which allows a fence character run inside the
block:

```````````````````````````````` example
````
code with ``` inside
````
.
<pre><code>code with ``` inside
</code></pre>
````````````````````````````````

### omitExtraWLInCodeBlocks (option: `omitExtraWLInCodeBlocks`)

By default, the content of a code block (indented or fenced) ends with
a line ending before `</code></pre>`.  With
`omitExtraWLInCodeBlocks: true` that trailing line ending is omitted:

```````````````````````````````` example options:omitExtraWLInCodeBlocks
```
foo
```
.
<pre><code>foo</code></pre>
````````````````````````````````

### Disabling fences (option: `ghCodeBlocks`)

With `ghCodeBlocks: false` (as in the `original` flavor), fence lines
have no block-level meaning; backtick runs are parsed as [code
spans](#code-spans):

```````````````````````````````` example options:ghCodeBlocks=false
```
foo
```
.
<p><code> foo </code></p>
````````````````````````````````
## Tables (option: `tables`)

With `tables: true`, Showdown parses GFM-style **pipe tables**.  A table
consists of:

  - a **header row**: cells separated by pipes (`|`), with optional
    leading and trailing pipes;
  - a **delimiter row**: cells of dashes (`-`), each optionally
    prefixed and/or suffixed with a colon (`:`) to set alignment;
  - zero or more **body rows**.

```````````````````````````````` example options:tables
| h1 | h2 |
|----|----|
| a  | b  |
.
<table>
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
<tr>
<td>a</td>
<td>b</td>
</tr>
</tbody>
</table>
````````````````````````````````

Leading and trailing pipes are optional (but a single-column table needs
them to be recognized):

```````````````````````````````` example options:tables
h1 | h2
---|---
a | b
.
<table>
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
<tr>
<td>a</td>
<td>b</td>
</tr>
</tbody>
</table>
````````````````````````````````

A colon on the left of a delimiter cell left-aligns the column, on the
right right-aligns it, and on both sides centers it.  The alignment is
emitted as an inline `text-align` style on every cell of the column:

```````````````````````````````` example options:tables
| l | c | r |
|:--|:-:|--:|
| a | b | c |
.
<table>
<thead>
<tr>
<th style="text-align:left;">l</th>
<th style="text-align:center;">c</th>
<th style="text-align:right;">r</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left;">a</td>
<td style="text-align:center;">b</td>
<td style="text-align:right;">c</td>
</tr>
</tbody>
</table>
````````````````````````````````

Cell content is parsed as spans:

```````````````````````````````` example options:tables
| *em* | `code` |
|------|--------|
| **b** | [l](/u) |
.
<table>
<thead>
<tr>
<th><em>em</em></th>
<th><code>code</code></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>b</strong></td>
<td><a href="/u">l</a></td>
</tr>
</tbody>
</table>
````````````````````````````````

A pipe that should be cell *content* is escaped with a backslash:

```````````````````````````````` example options:tables
| a\| b | c |
|----|---|
| d | e |
.
<table>
<thead>
<tr>
<th>a| b</th>
<th>c</th>
</tr>
</thead>
<tbody>
<tr>
<td>d</td>
<td>e</td>
</tr>
</tbody>
</table>
````````````````````````````````

A table with no body rows emits an empty `<tbody>`:

```````````````````````````````` example options:tables
| h1 | h2 |
|----|----|
.
<table>
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
</tbody>
</table>
````````````````````````````````

Without the option, the same lines are ordinary paragraph text:

```````````````````````````````` example
| h1 | h2 |
|----|----|
| a | b |
.
<p>| h1 | h2 |
|----|----|
| a | b |</p>
````````````````````````````````

### tablesHeaderId (option: `tablesHeaderId`)

With `tablesHeaderId: true` (in addition to `tables`), each `<th>` gets
an `id` derived from its text (lowercased, spaces to underscores), and
each `<td>` a matching `<header>_col` class:

```````````````````````````````` example options:tables,tablesHeaderId
| h1 |
|----|
| a |
.
<table>
<thead>
<tr>
<th id="h1">h1</th>
</tr>
</thead>
<tbody>
<tr>
<td class="h1_col">a</td>
</tr>
</tbody>
</table>
````````````````````````````````

## HTML blocks

Markdown is not a replacement for HTML: for any markup not covered by
Markdown's syntax, HTML itself is used.  An **HTML block** is a
block-level HTML element written directly in the document.  It is passed
through to the output verbatim, and its content is **not** processed as
Markdown — unless its opening tag carries the [`markdown`
attribute](#the-markdown-attribute).

The **block-level elements** are: `blockquote`, `del`, `div`, `dl`,
`fieldset`, `form`, `h1`–`h6`, `iframe`, `ins`, `math`, `noscript`,
`ol`, `p`, `pre`, `script`, `table`, `ul`, plus `hr` and HTML comments.
(Implementations MAY recognize additional block-level elements
introduced by later HTML versions.)

An HTML block begins with the opening tag of a block-level element (or
an HTML comment) at the very start of a line.  It ends with the
corresponding closing tag at the start of a line (or, for comments and
void elements such as `<hr />`, with the end of the construct).

```````````````````````````````` example
This is a regular paragraph.

<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>

This is another regular paragraph.
.
<p>This is a regular paragraph.</p>
<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>
<p>This is another regular paragraph.</p>
````````````````````````````````

Markdown syntax is not processed inside an HTML block, and no extra
`<p>` tags are added around it:

```````````````````````````````` example
<div>
*this is not emphasis*
</div>
.
<div>
*this is not emphasis*
</div>
````````````````````````````````

### The markdown attribute

If the opening tag of an HTML block contains a `markdown` attribute,
the block's *content* is parsed as Markdown after all (as in PHP
Markdown Extra).  The wrapping tags are passed through as usual, and
the attribute itself is kept in the output:

```````````````````````````````` example
<div markdown="1">
*this is emphasis*

# a heading
</div>
.
<div markdown="1"><p><em>this is emphasis</em></p>
<h1 id="a-heading">a heading</h1></div>
````````````````````````````````

The attribute's value is irrelevant — `markdown`, `markdown="1"` and
`markdown="span"` all behave the same way.

Caution: the trigger is a simple word search on the opening tag, so a
tag whose attributes merely *contain* the word `markdown` — for example
`class="markdown-body"` or `data-markdown` — enables Markdown
processing as well:

```````````````````````````````` example
<div class="markdown-body">
*em*
</div>
.
<div class="markdown-body"><p><em>em</em></p></div>
````````````````````````````````

A block-level tag at the start of a line interrupts a paragraph; a
preceding blank line is not required:

```````````````````````````````` example
Foo
<div>
bar
</div>
.
<p>Foo</p>
<div>
bar
</div>
````````````````````````````````

HTML comments at the block level are passed through verbatim:

```````````````````````````````` example
Foo

<!-- this is a
comment -->

Bar
.
<p>Foo</p>
<!-- this is a
comment -->
<p>Bar</p>
````````````````````````````````

A comment is terminated by `-->` **or** by `--!>` (the HTML "comment end
bang" sequence).  This is a deliberate security deviation from CommonMark,
which recognizes only `-->`: browsers close a comment at `--!>` too, so
recognizing only `-->` would let content an author believes is commented
out reach the browser as live HTML.  Showdown applies this rule in **every
flavor**, including `commonmark` and `gfm`:

```````````````````````````````` example
<!-- commented --!><span>shown</span>
.
<!-- commented --!>
<p><span>shown</span></p>
````````````````````````````````

Note that span-level HTML tags are **not** HTML blocks; they flow with
paragraph content and Markdown *is* processed around and inside them
(see [Inline HTML](#inline-html)).

## Link reference definitions

A **link reference definition** names a link destination (and optionally
a title) so that it can be used by [reference-style links](#links) and
[images](#images) elsewhere in the document.  It consists of:

  - a link identifier in square brackets, optionally indented by up to
    three spaces;
  - followed by a colon;
  - optionally followed by spaces or tabs (the destination MAY instead be
    placed on the next line);
  - followed by the destination URL, optionally surrounded by angle
    brackets;
  - optionally followed (separated by whitespace) by a title in double
    quotes, single quotes, or parentheses.  The title MAY be placed on
    the next line, indented by any amount of whitespace.

A link reference definition is metadata: it produces no output itself.

Identifiers are matched case-insensitively, with runs of internal
whitespace collapsed to a single space.  When the same identifier is
defined more than once, the **first** definition wins.  A definition
cannot interrupt a paragraph — it is only recognized at the start of a
block.

```````````````````````````````` example
[foo]: http://example.com/  "Optional Title Here"

[foo][]
.
<p><a href="http://example.com/" title="Optional Title Here">foo</a></p>
````````````````````````````````

The three title styles are equivalent:

```````````````````````````````` example
[a]: http://example.com/  "Title"
[b]: http://example.com/  'Title'
[c]: http://example.com/  (Title)

[foo][a], [foo][b], [foo][c]
.
<p><a href="http://example.com/" title="Title">foo</a>, <a href="http://example.com/" title="Title">foo</a>, <a href="http://example.com/" title="Title">foo</a></p>
````````````````````````````````

The URL may be surrounded by angle brackets, and the title may be on the
following line:

```````````````````````````````` example
[id]: <http://example.com/>  "Optional Title Here"

[id][]
.
<p><a href="http://example.com/" title="Optional Title Here">id</a></p>
````````````````````````````````

```````````````````````````````` example
[id]: http://example.com/longish/path/to/resource
    "Optional Title Here"

[id][]
.
<p><a href="http://example.com/longish/path/to/resource" title="Optional Title Here">id</a></p>
````````````````````````````````

Link identifiers are **not** case sensitive, and may consist of letters,
numbers, spaces and punctuation:

```````````````````````````````` example
[link text][A]

[a]: http://example.com/
.
<p><a href="http://example.com/">link text</a></p>
````````````````````````````````

A definition may appear anywhere in the document — before or after its
use.  A definition that is never used still produces no output:

```````````````````````````````` example
[unused]: http://example.com/
.
````````````````````````````````

A destination that is a base64 `data:` URL may wrap across several lines
(long base64 payloads are frequently hard-wrapped by editors and mail
clients); the line breaks and surrounding whitespace are stripped when
the definition is resolved:

```````````````````````````````` example
![logo][]

[logo]:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg
AAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
.
<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="logo" /></p>
````````````````````````````````

## Paragraphs

A **paragraph** is one or more consecutive lines of text, separated from
other blocks by one or more blank lines.  Its content is parsed as spans
and wrapped in `<p>` tags:

```````````````````````````````` example
aaa

bbb
.
<p>aaa</p>
<p>bbb</p>
````````````````````````````````

Markdown supports "hard-wrapped" text: line endings inside a paragraph
are preserved as soft breaks and do **not** produce `<br />` tags (see
[Hard line breaks](#hard-line-breaks) for how to force one, and
[simpleLineBreaks](#simplelinebreaks-option-simplelinebreaks) for the
GFM-comment-style alternative):

```````````````````````````````` example
aaa
bbb
ccc
.
<p>aaa
bbb
ccc</p>
````````````````````````````````

Normal paragraphs should not be indented with spaces or tabs.  A first
line indented by one to three spaces is still a paragraph (the
indentation is removed); four spaces or a tab produce an [indented code
block](#indented-code-blocks):

```````````````````````````````` example
   aaa
.
<p>aaa</p>
````````````````````````````````

## Blank lines

Blank lines — including lines containing only spaces or tabs — separate
blocks.  More than one blank line between blocks has the same effect as
one, and blank lines at the start or end of the document are ignored:

```````````````````````````````` example


aaa



bbb


.
<p>aaa</p>
<p>bbb</p>
````````````````````````````````

## Metadata (option: `metadata`)

With `metadata: true`, a document MAY begin with a **metadata block**:
a front-matter section delimited either by `---` lines or by `«««` and
`»»»` lines.  The opening delimiter may be followed by a format tag
(e.g. `--- yaml`).  The block must be the very first thing in the
document.

The metadata block produces no HTML output.  Its `key: value` pairs are
parsed and exposed on the converter via `converter.getMetadata()`, and
consumed by
[completeHTMLDocument](#completehtmldocument-option-completehtmldocument);
the raw text is available via `getMetadata(true)`.

```````````````````````````````` example options:metadata
---
title: My Document
author: Me
---

# Hi
.
<h1 id="hi">Hi</h1>
````````````````````````````````

```````````````````````````````` example options:metadata
«««
key: value
»»»

text
.
<p>text</p>
````````````````````````````````

Without the option, `---` lines are ordinary Markdown — typically a
[setext heading](#setext-headings) underline or a [horizontal
rule](#horizontal-rules):

```````````````````````````````` example
---
title: My Document
---

text
.
<hr />
<h2 id="title-my-document">title: My Document</h2>
<p>text</p>
````````````````````````````````


# Container blocks

Container blocks contain other blocks as their content.

## Blockquotes

A **blockquote** is marked with the email-style `>` character.  A line
beginning with `>` (optionally indented up to three spaces) opens a
blockquote; the `>` marker and one optional following space are stripped
from each line, and the remaining content is parsed as blocks:

```````````````````````````````` example
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
.
<blockquote>
<p>This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit.</p>
<p>Donec sit amet nisl. Aliquam semper ipsum sit amet velit.</p>
</blockquote>
````````````````````````````````

The space after `>` is optional:

```````````````````````````````` example
>foo
.
<blockquote>
<p>foo</p>
</blockquote>
````````````````````````````````

Blockquotes are "lazy": if a paragraph is hard-wrapped, only the first
line needs the `>` marker.  And quoted paragraphs separated by blank
lines belong to the *same* blockquote (but see
[splitAdjacentBlockquotes](#splitadjacentblockquotes-option-splitadjacentblockquotes)):

```````````````````````````````` example
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
.
<blockquote>
<p>This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit.</p>
<p>Donec sit amet nisl. Aliquam semper ipsum sit amet velit.</p>
</blockquote>
````````````````````````````````

A blockquote ends only at a non-blank line that is not part of it:

```````````````````````````````` example
> quoted

not quoted
.
<blockquote>
<p>quoted</p>
</blockquote>
<p>not quoted</p>
````````````````````````````````

Blockquotes can be nested by adding additional levels of `>`:

```````````````````````````````` example
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
.
<blockquote>
<p>This is the first level of quoting.</p>
<blockquote>
<p>This is nested blockquote.</p>
</blockquote>
<p>Back to the first level.</p>
</blockquote>
````````````````````````````````

A blockquote can contain any other Markdown element, including headings,
lists and code blocks:

```````````````````````````````` example
> ## This is a heading.
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");
.
<blockquote>
<h2 id="this-is-a-heading">This is a heading.</h2>
<ol>
<li>This is the first list item.</li>
<li>This is the second list item.</li>
</ol>
<p>Here's some example code:</p>
<pre><code>return shell_exec(&quot;echo $input | $markdown_script&quot;);
</code></pre>
</blockquote>
````````````````````````````````

A blockquote does not need a preceding blank line; it can interrupt a
paragraph:

```````````````````````````````` example
foo
> bar
.
<p>foo</p>
<blockquote>
<p>bar</p>
</blockquote>
````````````````````````````````

### splitAdjacentBlockquotes (option: `splitAdjacentBlockquotes`)

With `splitAdjacentBlockquotes: true`, `>` blocks separated by a blank
line become *separate* blockquotes instead of one:

```````````````````````````````` example options:splitAdjacentBlockquotes
> one

> two
.
<blockquote>
<p>one</p>
</blockquote>
<blockquote>
<p>two</p>
</blockquote>
````````````````````````````````

## List items

A **list marker** is either a **bullet marker** — a `*`, `+` or `-`
character — or an **ordered marker** — a sequence of digits followed by
a period.  A **list item** begins with a list marker, optionally
indented by up to three spaces, followed by one or more spaces or a tab,
followed by the item's content:

```````````````````````````````` example
*   Red
*   Green
*   Blue
.
<ul>
<li>Red</li>
<li>Green</li>
<li>Blue</li>
</ul>
````````````````````````````````

A marker not followed by whitespace does not start a list item:

```````````````````````````````` example
*foo*
.
<p><em>foo</em></p>
````````````````````````````````

The marker may be indented up to three spaces:

```````````````````````````````` example
   * foo
.
<ul>
<li>foo</li>
</ul>
````````````````````````````````

Item content may be laid out with a hanging indent aligned with the
text, or "lazily", with continuation lines not indented at all:

```````````````````````````````` example
*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
Aliquam hendrerit mi posuere lectus.
*   Donec sit amet nisl.
.
<ul>
<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
Aliquam hendrerit mi posuere lectus.</li>
<li>Donec sit amet nisl.</li>
</ul>
````````````````````````````````

To put a second paragraph (or any other additional block) in a list
item, it must be separated by a blank line and indented by four spaces
or one tab.  As with the first paragraph, only the first line of a
continuation paragraph needs the indentation:

```````````````````````````````` example
1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
.
<ol>
<li><p>This is a list item with two paragraphs. Lorem ipsum dolor
sit amet, consectetuer adipiscing elit.</p>
<p>Vestibulum enim wisi, viverra nec, fringilla in, laoreet
vitae, risus.</p></li>
<li><p>Suspendisse id sem consectetuer libero luctus adipiscing.</p></li>
</ol>
````````````````````````````````

To put a blockquote in a list item, the `>` delimiters must be indented
(four spaces or one tab); to put a code block in a list item, it must be
indented **twice** — eight spaces or two tabs:

```````````````````````````````` example
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
.
<ul>
<li><p>A list item with a blockquote:</p>
<blockquote>
<p>This is a blockquote
inside a list item.</p>
</blockquote></li>
</ul>
````````````````````````````````

```````````````````````````````` example
*   A list item with a code block:

        <code goes here>
.
<ul>
<li><p>A list item with a code block:</p>
<pre><code>&lt;code goes here&gt;
</code></pre></li>
</ul>
````````````````````````````````

### Nested lists

A nested list is created by indenting its markers by **four spaces or
one tab** relative to the markers of the enclosing list.  Unlike
Original Markdown (where any extra indentation nests), Showdown
deliberately requires the full four spaces — a design decision to avoid
accidental nesting; see
[disableForced4SpacesIndentedSublists](#disableforced4spacesindentedsublists-option-disableforced4spacesindentedsublists)
to revert to the loose behavior.

```````````````````````````````` example
*   Item
    *   Nested item
    *   Another nested item
*   Second top-level item
.
<ul>
<li>Item<ul>
<li>Nested item</li>
<li>Another nested item</li></ul></li>
<li>Second top-level item</li>
</ul>
````````````````````````````````

Markers indented by less than four extra spaces do **not** nest; they
continue the enclosing list:

```````````````````````````````` example
* foo
  * bar
.
<ul>
<li>foo</li>
<li>bar</li>
</ul>
````````````````````````````````

### disableForced4SpacesIndentedSublists (option: `disableForced4SpacesIndentedSublists`)

With `disableForced4SpacesIndentedSublists: true`, any extra marker
indentation nests, as in Original Markdown (and it's buggy behavior):

```````````````````````````````` example options:disableForced4SpacesIndentedSublists
* foo
  * bar
.
<ul>
<li>foo<ul>
<li>bar</li></ul></li>
</ul>
````````````````````````````````

## Lists

A **list** is a sequence of one or more consecutive list items with
markers of the same type.  A list is **ordered** (`<ol>`) if its items
have ordered markers, and **unordered** (`<ul>`) if they have bullet
markers.

A list must be preceded by a blank line (or start the document) — a
list marker *can* interrupt a paragraph in Showdown, unlike in Original
Markdown:

```````````````````````````````` example
Foo
* bar
.
<p>Foo</p>
<ul>
<li>bar</li>
</ul>
````````````````````````````````

The bullet characters `*`, `+` and `-` are interchangeable; changing
bullets does not start a new list:

```````````````````````````````` example
* Red
+ Green
- Blue
.
<ul>
<li>Red</li>
<li>Green</li>
<li>Blue</li>
</ul>
````````````````````````````````

Changing marker *type*, however, ends the list and starts a new one of
the other type (unlike Original Markdown, where the first item decides
the type of the whole list):

```````````````````````````````` example
1. one
* two
.
<ol>
<li>one</li>
</ol>
<ul>
<li>two</li>
</ul>
````````````````````````````````

### Ordered list start numbers

If the first ordered marker is not `1.`, its number is emitted as the
list's `start` attribute.  The numbers of the *other* markers are
ignored:

```````````````````````````````` example
1.  Bird
1.  McHale
.
<ol>
<li>Bird</li>
<li>McHale</li>
</ol>
````````````````````````````````

```````````````````````````````` example
3. Bird
1. McHale
8. Parish
.
<ol start="3">
<li>Bird</li>
<li>McHale</li>
<li>Parish</li>
</ol>
````````````````````````````````

### Loose and tight lists

A list is **loose** if any two of the blocks it directly contains — two
adjacent items, or two blocks inside one item — are separated by a blank
line.  Otherwise it is **tight**.  In a tight list, item content is
*not* wrapped in `<p>` tags; in a loose list, the paragraphs of every
item are:

```````````````````````````````` example
*   Bird
*   Magic
.
<ul>
<li>Bird</li>
<li>Magic</li>
</ul>
````````````````````````````````

```````````````````````````````` example
*   Bird

*   Magic
.
<ul>
<li><p>Bird</p></li>
<li><p>Magic</p></li>
</ul>
````````````````````````````````

An item containing two blocks makes the list loose even if no blank
line separates the items themselves:

```````````````````````````````` example
* a

  continuation of a

* b
* c
.
<ul>
<li><p>a</p>
<p>continuation of a</p></li>
<li><p>b</p></li>
<li><p>c</p></li>
</ul>
````````````````````````````````

Looseness applies to a list as a whole; a nested list may be tight
inside a loose list, or vice versa:

```````````````````````````````` example
*   First

    *   Nested A
    *   Nested B

*   Second
.
<ul>
<li><p>First</p>
<ul>
<li>Nested A</li>
<li>Nested B</li></ul></li>
<li><p>Second</p></li>
</ul>
````````````````````````````````

### Ending a list

Blank lines between items make a list loose but never end it.  A list
ends at a non-blank line that is neither a new list item nor indented
item content:

```````````````````````````````` example
* item one

* item two

not an item
.
<ul>
<li><p>item one</p></li>
<li><p>item two</p></li>
</ul>
<p>not an item</p>
````````````````````````````````

### Accidental lists

A paragraph beginning with a number-period-space sequence is read as an
ordered list — and since Showdown honors [start
numbers](#ordered-list-start-numbers), it will even carry the number:

```````````````````````````````` example
1986. What a great season.
.
<ol start="1986">
<li>What a great season.</li>
</ol>
````````````````````````````````

To prevent this, backslash-escape the period:

```````````````````````````````` example
1986\. What a great season.
.
<p>1986. What a great season.</p>
````````````````````````````````

## Task list items (option: `tasklists`)

With `tasklists: true`, a list item whose content begins with `[ ]` or
`[x]` followed by whitespace is a **task list item**: the bracket pair
becomes a disabled checkbox `<input>`, checked for `[x]`:

```````````````````````````````` example options:tasklists
- [ ] open
- [x] done
.
<ul>
<li><input disabled type="checkbox"> open</li>
<li><input checked disabled type="checkbox"> done</li>
</ul>
````````````````````````````````

Without the option, the brackets are plain text:

```````````````````````````````` example
- [ ] open
- [x] done
.
<ul>
<li>[ ] open</li>
<li>[x] done</li>
</ul>
````````````````````````````````

With `moreStyling: true` in addition, the items get `task-list-item`
classes (plus `task-list-item-complete` when checked) and alignment
styles:

```````````````````````````````` example options:tasklists,moreStyling
- [ ] open
- [x] done
.
<ul>
<li class="task-list-item" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"> open</li>
<li class="task-list-item task-list-item-complete" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;" checked> done</li>
</ul>
````````````````````````````````

## Footnotes (option: `footnotes`)

With `footnotes: true`, Showdown supports footnotes.  A **footnote
reference** is `[^label]` in span text; a **footnote definition** is a
block of the form `[^label]: content`.  References become numbered
superscript links; definitions are collected, in *reference* order, into
a `<section class="footnotes">` appended to the document, each item
carrying a backreference link:

```````````````````````````````` example options:footnotes
text[^1] more

[^1]: the note
.
<p>text<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup> more</p>
<section class="footnotes" data-footnotes>
<ol>
<li id="fn-1">
<p>the note <a href="#fnref-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
</li>
</ol>
</section>
````````````````````````````````

Footnotes are numbered by the order of their *references*, not their
definitions, and labels are arbitrary (not just numbers):

```````````````````````````````` example options:footnotes
B[^b] then A[^a]

[^a]: note a
[^b]: note b
.
<p>B<sup class="footnote-ref"><a href="#fn-b" id="fnref-b" data-footnote-ref>1</a></sup> then A<sup class="footnote-ref"><a href="#fn-a" id="fnref-a" data-footnote-ref>2</a></sup></p>
<section class="footnotes" data-footnotes>
<ol>
<li id="fn-b">
<p>note b <a href="#fnref-b" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
</li>
<li id="fn-a">
<p>note a <a href="#fnref-a" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="2" aria-label="Back to reference 2">↩</a></p>
</li>
</ol>
</section>
````````````````````````````````

A reference without a matching definition stays literal, and a
definition that is never referenced is dropped:

```````````````````````````````` example options:footnotes
text[^nope] here
.
<p>text[^nope] here</p>
````````````````````````````````

```````````````````````````````` example options:footnotes
text

[^unused]: never referenced
.
<p>text</p>
````````````````````````````````

Without the option, references and definitions are plain Markdown text:

```````````````````````````````` example
text[^1] more

[^1]: the note
.
<p>text[^1] more</p>
<p>[^1]: the note</p>
````````````````````````````````
# Spans

Span elements occur within the content of paragraphs, headings, list
items, table cells and blockquotes.  They are parsed in the order of
precedence given in [Precedence](#precedence); an earlier construct's
content is not re-parsed for later constructs.

## Code spans

A **code span** begins with a run of one or more backticks and ends with
a run of backticks *of the same length*.  Its content is the text
between the runs, with leading and trailing whitespace stripped.  The
content is treated literally: no span parsing, no backslash escapes, and
`&`, `<`, `>` and `"` are converted to HTML entities.

```````````````````````````````` example
Use the `printf()` function.
.
<p>Use the <code>printf()</code> function.</p>
````````````````````````````````

To include a literal backtick, use multiple backticks as delimiters:

```````````````````````````````` example
``There is a literal backtick (`) here.``
.
<p><code>There is a literal backtick (`) here.</code></p>
````````````````````````````````

Because leading and trailing whitespace is stripped, a code span can
begin or end with a backtick:

```````````````````````````````` example
A single backtick in a code span: `` ` ``
.
<p>A single backtick in a code span: <code>`</code></p>
````````````````````````````````

Ampersands and angle brackets are encoded automatically, which makes it
easy to mention HTML tags and entities:

```````````````````````````````` example
Please don't use any `<blink>` tags.

`&#8212;` is the decimal-encoded equivalent of `&mdash;`.
.
<p>Please don't use any <code>&lt;blink&gt;</code> tags.</p>
<p><code>&amp;#8212;</code> is the decimal-encoded equivalent of <code>&amp;mdash;</code>.</p>
````````````````````````````````

A backtick run with no matching closer is literal text:

```````````````````````````````` example
`foo
.
<p>`foo</p>
````````````````````````````````

## Emphasis and strong emphasis

Text wrapped in single `*` or `_` delimiters is **emphasis** (`<em>`);
text wrapped in double delimiters is **strong emphasis** (`<strong>`);
text wrapped in triple delimiters is both:

```````````````````````````````` example
*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

***triple asterisks***

___triple underscores___
.
<p><em>single asterisks</em></p>
<p><em>single underscores</em></p>
<p><strong>double asterisks</strong></p>
<p><strong>double underscores</strong></p>
<p><em><strong>triple asterisks</strong></em></p>
<p><em><strong>triple underscores</strong></em></p>
````````````````````````````````

(But see [Underline](#underline-option-underline), which repurposes
`__` and `___` when enabled.)

An emphasis span cannot begin or end with whitespace: delimiters
surrounded by spaces are literal.  An unmatched delimiter is literal
text:

```````````````````````````````` example
un * frigging * believable
.
<p>un * frigging * believable</p>
````````````````````````````````

```````````````````````````````` example
*foo
.
<p>*foo</p>
````````````````````````````````

Emphasis can be used in the middle of a word, with either delimiter
(unlike CommonMark, where intraword `_` is not emphasis; see
[literalMidWordUnderscores](#literalmidwordunderscores-option-literalmidwordunderscores)):

```````````````````````````````` example
un*frigging*believable

un_frigging_believable
.
<p>un<em>frigging</em>believable</p>
<p>un<em>frigging</em>believable</p>
````````````````````````````````

Emphasis and strong emphasis may span multiple words and may nest
either way — strong inside emphasis and emphasis inside strong:

```````````````````````````````` example
*foo **bar** baz*
.
<p><em>foo <strong>bar</strong> baz</em></p>
````````````````````````````````

```````````````````````````````` example
**foo *bar* baz**
.
<p><strong>foo <em>bar</em> baz</strong></p>
````````````````````````````````

Use backslash escapes to produce literal delimiters around a word:

```````````````````````````````` example
\*this text is surrounded by literal asterisks\*
.
<p>*this text is surrounded by literal asterisks*</p>
````````````````````````````````

### literalMidWordUnderscores (option: `literalMidWordUnderscores`)

With `literalMidWordUnderscores: true`, underscores in the middle of a
word are literal — `foo_bar_baz` keeps its underscores — while
underscore emphasis around whole words still works.  Asterisks are
unaffected:

```````````````````````````````` example options:literalMidWordUnderscores
foo_bar_baz and _em_
.
<p>foo_bar_baz and <em>em</em></p>
````````````````````````````````

## Strikethrough

Strikethrough is enabled by default (`strikethrough: true`).  Text
wrapped in a run of one or two tildes is struck through (`<del>`); the
opening and closing runs must have the same length, and the character
adjacent to each run (inside) must not be whitespace or a tilde:

```````````````````````````````` example
a ~~foo~~ b

a ~foo~ b
.
<p>a <del>foo</del> b</p>
<p>a <del>foo</del> b</p>
````````````````````````````````

```````````````````````````````` example
~~strike **this** out~~
.
<p><del>strike <strong>this</strong> out</del></p>
````````````````````````````````

Runs of three or more tildes, mismatched runs, and whitespace-padded
content are literal:

```````````````````````````````` example
a ~~~foo~~~ b

a ~~foo~ b

~~ foo ~~
.
<p>a ~~~foo~~~ b</p>
<p>a ~~foo~ b</p>
<p>~~ foo ~~</p>
````````````````````````````````

Tildes can be backslash-escaped:

```````````````````````````````` example
\~\~foo\~\~ and ~~bar~~
.
<p>~~foo~~ and <del>bar</del></p>
````````````````````````````````

With `strikethrough: false` (as in the `original` and `commonmark`
flavors), tildes are plain text:

```````````````````````````````` example options:strikethrough=false
~~foo~~
.
<p>~~foo~~</p>
````````````````````````````````

## Underline (option: `underline`)

With `underline: true`, double or triple underscores produce `<u>`
instead of `<strong>`/`<strong><em>` — and remaining underscores no
longer produce emphasis at all (asterisks are unaffected):

```````````````````````````````` example options:underline
__foo__ and ___bar___
.
<p><u>foo</u> and <u>bar</u></p>
````````````````````````````````

```````````````````````````````` example options:underline
__foo__ and *bar* and _baz_
.
<p><u>foo</u> and <em>bar</em> and _baz_</p>
````````````````````````````````

It honors `literalMidWordUnderscores`:

```````````````````````````````` example options:underline,literalMidWordUnderscores
foo__bar__baz and __em__
.
<p>foo__bar__baz and <u>em</u></p>
````````````````````````````````

## Links

Showdown supports three styles of links: **inline**, **reference** and
**shortcut**.  In all styles, the link text is delimited by square
brackets.

### Inline links

An **inline link** is the link text in square brackets, followed
immediately by the destination in parentheses: an URL, optionally
followed by whitespace and a title in single or double quotes:

```````````````````````````````` example
This is [an example](http://example.com/ "Title") inline link.

[This link](http://example.net/) has no title attribute.
.
<p>This is <a href="http://example.com/" title="Title">an example</a> inline link.</p>
<p><a href="http://example.net/">This link</a> has no title attribute.</p>
````````````````````````````````

Local resources can be referenced with relative paths:

```````````````````````````````` example
See my [About](/about/) page for details.
.
<p>See my <a href="/about/">About</a> page for details.</p>
````````````````````````````````

The URL may be wrapped in angle brackets:

```````````````````````````````` example
[link](<http://example.com/>)
.
<p><a href="http://example.com/">link</a></p>
````````````````````````````````

### Reference links

A **reference link** is the link text in square brackets, followed by a
second pair of square brackets containing the identifier of a [link
reference definition](#link-reference-definitions).  A single space is
allowed between the two bracket pairs.  Identifiers match definitions
case-insensitively:

```````````````````````````````` example
This is [an example][id] reference-style link.

[id]: http://example.com/  "Optional Title Here"
.
<p>This is <a href="http://example.com/" title="Optional Title Here">an example</a> reference-style link.</p>
````````````````````````````````

```````````````````````````````` example
This is [an example] [id] reference-style link.

[id]: http://example.com/
.
<p>This is <a href="http://example.com/">an example</a> reference-style link.</p>
````````````````````````````````

The **implicit link name** shortcut uses an empty second pair of
brackets; the link text itself is used as the identifier:

```````````````````````````````` example
Visit [Daring Fireball][] for more information.

[Daring Fireball]: http://daringfireball.net/
.
<p>Visit <a href="http://daringfireball.net/">Daring Fireball</a> for more information.</p>
````````````````````````````````

A reference to an identifier with no matching definition is not a link;
the text is left as-is:

```````````````````````````````` example
[foo][undefined]
.
<p>[foo][undefined]</p>
````````````````````````````````

### Shortcut links

A bare bracketed string with a matching definition is a link — the
single-bracket **shortcut reference** style, which Original Markdown
1.0.1 does not support:

```````````````````````````````` example
[foo]

[foo]: http://example.com/
.
<p><a href="http://example.com/">foo</a></p>
````````````````````````````````

### Link text

The link text of any style is parsed as spans, and may contain balanced
pairs of square brackets:

```````````````````````````````` example
[*emphasized* link](/url)

[link [with brackets]](/url)
.
<p><a href="/url"><em>emphasized</em> link</a></p>
<p><a href="/url">link [with brackets]</a></p>
````````````````````````````````

## Images

Image syntax mirrors link syntax, prefixed with an exclamation mark.
The bracketed text becomes the `alt` attribute; the optional title
becomes the `title` attribute:

```````````````````````````````` example
![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")
.
<p><img src="/path/to/img.jpg" alt="Alt text" /></p>
<p><img src="/path/to/img.jpg" alt="Alt text" title="Optional title" /></p>
````````````````````````````````

Reference style works the same way as for links:

```````````````````````````````` example
![Alt text][id]

[id]: url/to/image  "Optional title attribute"
.
<p><img src="url/to/image" alt="Alt text" title="Optional title attribute" /></p>
````````````````````````````````

An URL containing spaces can be written in angle brackets, and `data:`
URIs are supported:

```````````````````````````````` example
![foo](</url/with spaces.png>)
.
<p><img src="/url/with%20spaces.png" alt="foo" /></p>
````````````````````````````````

### Image dimensions (option: `parseImgDimensions`)

With `parseImgDimensions: true`, a `=WIDTHxHEIGHT` field after the URL
sets the `width` and `height` attributes.  Each dimension is a number
with an optional unit (up to four letters or `%`), or `*` for `auto`:

```````````````````````````````` example options:parseImgDimensions
![a](/img.png =100x80)

![b](/img.png =100x*)

![c](/img.png =100%x50)
.
<p><img src="/img.png" alt="a" width="100" height="80" /></p>
<p><img src="/img.png" alt="b" width="100" height="auto" /></p>
<p><img src="/img.png" alt="c" width="100%" height="50" /></p>
````````````````````````````````

The dimensions field is part of the image grammar even when the option
is off: it is consumed and silently dropped, not rendered as text:

```````````````````````````````` example
![a](/img.png =100x80)
.
<p><img src="/img.png" alt="a" /></p>
````````````````````````````````

## Automatic links

An URL in angle brackets becomes a link whose text is the URL itself.
Angle-bracket autolinks are always recognized for `http`, `https` and
`ftp` URLs:

```````````````````````````````` example
<http://example.com/>

<ftp://example.com/file>
.
<p><a href="http://example.com/">http://example.com/</a></p>
<p><a href="ftp://example.com/file">ftp://example.com/file</a></p>
````````````````````````````````

An angle-bracket autolink starting with `www.` is linked with an
`http://` scheme prepended to the `href` (`https://` with the
[httpsAutoLinks](#httpsautolinks-option-httpsautolinks) option):

```````````````````````````````` example
<www.example.com>
.
<p><a href="http://www.example.com">www.example.com</a></p>
````````````````````````````````

Ampersands in the URL are entity-encoded in both the attribute and the
text, per [automatic escaping](#automatic-escaping):

```````````````````````````````` example
<http://example.com/?a=1&b=2>
.
<p><a href="http://example.com/?a=1&amp;b=2">http://example.com/?a=1&amp;b=2</a></p>
````````````````````````````````

### Email addresses

An email address in angle brackets becomes a `mailto:` link.  To foil
address-harvesting spambots, the address (and the `mailto:` prefix) is
obfuscated with character references by default (`encodeEmails: true`).
Every character is replaced by its decimal character reference, so the
output is fixed and reproducible:

```````````````````````````````` example
<address@example.com>
.
<p><a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;">&#97;&#100;&#100;&#114;&#101;&#115;&#115;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;</a></p>
````````````````````````````````

With `encodeEmails: false`, the address appears in clear text:

```````````````````````````````` example options:encodeEmails=false
<address@example.com>
.
<p><a href="mailto:address@example.com">address@example.com</a></p>
````````````````````````````````

### Naked URLs (option: `simplifiedAutoLink`)

By default, an URL or email address *without* angle brackets is plain
text:

```````````````````````````````` example
visit http://example.com/ now
.
<p>visit http://example.com/ now</p>
````````````````````````````````

With `simplifiedAutoLink: true`, naked URLs, `www.` addresses and email
addresses are linked, GFM style:

```````````````````````````````` example options:simplifiedAutoLink
visit http://example.com/ now

visit www.example.com now
.
<p>visit <a href="http://example.com/">http://example.com/</a> now</p>
<p>visit <a href="http://www.example.com">www.example.com</a> now</p>
````````````````````````````````

```````````````````````````````` example options:simplifiedAutoLink
mail foo@example.com now
.
<p>mail <a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#102;&#111;&#111;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;">&#102;&#111;&#111;&#64;&#101;&#120;&#97;&#109;&#112;&#108;&#101;&#46;&#99;&#111;&#109;</a> now</p>
````````````````````````````````

Trailing punctuation and wrapping parentheses are excluded from the
link:

```````````````````````````````` example options:simplifiedAutoLink
see http://example.com/foo. done

(see www.example.com/foo)
.
<p>see <a href="http://example.com/foo">http://example.com/foo</a>. done</p>
<p>(see <a href="http://www.example.com/foo">www.example.com/foo</a>)</p>
````````````````````````````````

### httpsAutoLinks (option: `httpsAutoLinks`)

With `httpsAutoLinks: true`, autolinked `www.` addresses (angle-bracket
or naked) get an `https://` scheme instead of `http://`:

```````````````````````````````` example options:httpsAutoLinks
<www.example.com>
.
<p><a href="https://www.example.com">www.example.com</a></p>
````````````````````````````````

### GitHub mentions (option: `ghMentions`)

With `ghMentions: true`, a GitHub-style `@username` mention (at the
start of a line or after whitespace) links to the user's GitHub page.
A backslash escapes it:

```````````````````````````````` example options:ghMentions
ping @tivie ok
.
<p>ping <a href="https://github.com/tivie">@tivie</a> ok</p>
````````````````````````````````

```````````````````````````````` example options:ghMentions
ping \@tivie ok
.
<p>ping @tivie ok</p>
````````````````````````````````

The generated URL is a template set by the `ghMentionsLink` option
(default `https://github.com/{u}`), with `{u}` replaced by the
username:

```````````````````````````````` example options:ghMentions,ghMentionsLink=https://twitter.com/{u}
ping @tivie
.
<p>ping <a href="https://twitter.com/tivie">@tivie</a></p>
````````````````````````````````

## Emoji (option: `emoji`)

With `emoji: true`, a `:shortcode:` between colons is replaced with the
corresponding emoji character (GitHub's shortcode set; see the project
documentation for the full list).  Unknown codes are left untouched:

```````````````````````````````` example options:emoji
this is a :smile: emoji

:notanemoji:
.
<p>this is a 😄 emoji</p>
<p>:notanemoji:</p>
````````````````````````````````

A few GitHub-specific codes (like `:octocat:`) render as an `<img>` tag
instead of a character.  Without the option, shortcodes are plain text:

```````````````````````````````` example
a :smile: b
.
<p>a :smile: b</p>
````````````````````````````````

## Ellipsis

Enabled by default (`ellipsis: true`): a run of exactly three dots is
replaced with the horizontal ellipsis character (`…`, U+2026):

```````````````````````````````` example
Wait... what...
.
<p>Wait… what…</p>
````````````````````````````````

Spaced dots are not an ellipsis:

```````````````````````````````` example
a . . . b
.
<p>a . . . b</p>
````````````````````````````````

With `ellipsis: false`, the dots are preserved:

```````````````````````````````` example options:ellipsis=false
Wait...
.
<p>Wait...</p>
````````````````````````````````

## Inline HTML

Span-level HTML tags — for example `<span>`, `<cite>`, `<del>`, `<a>`,
`<img>` — can be used anywhere in paragraphs, headings and list items,
and are passed through verbatim.  Unlike in [HTML blocks](#html-blocks),
Markdown syntax **is** processed around and inside span-level tags:

```````````````````````````````` example
<span>*foo*</span>

a <b>*bold em*</b> c
.
<p><span><em>foo</em></span></p>
<p>a <b><em>bold em</em></b> c</p>
````````````````````````````````

Markdown characters inside tag attributes are protected; they do not
open spans:

```````````````````````````````` example
<a href="http://example.com/_a_b_">link</a>
.
<p><a href="http://example.com/_a_b_">link</a></p>
````````````````````````````````

### backslashEscapesHTMLTags (option: `backslashEscapesHTMLTags`)

With `backslashEscapesHTMLTags: true`, a backslash before an HTML tag's
angle bracket escapes the tag: it is rendered as text instead of markup:

```````````````````````````````` example options:backslashEscapesHTMLTags
\<div>foo\</div>
.
<p>&lt;div&gt;foo&lt;/div&gt;</p>
````````````````````````````````

## Automatic escaping

In HTML, `<` and `&` are special.  Markdown lets you write them
naturally and escapes them for you when they are not markup.

An ampersand that is not part of an HTML entity is converted to
`&amp;`; an ampersand that is part of an entity is left alone (Showdown
never decodes character references by default — but see
[decodeEntities](#decodeentities-option-decodeentities)):

```````````````````````````````` example
AT&T sells &quot;phones&quot; &mdash; for &#36;5.
.
<p>AT&amp;T sells &quot;phones&quot; &mdash; for &#36;5.</p>
````````````````````````````````

Whether an ampersand "looks like" an entity is decided by its name, not
just by the trailing semicolon: `&_;` is not a valid reference name, so
its ampersand is escaped, while `&copy;` is:

```````````````````````````````` example
&_; and &copy;
.
<p>&amp;_; and &copy;</p>
````````````````````````````````

Angle brackets that do not delimit an HTML tag (or an [automatic
link](#automatic-links)) are converted to `&lt;` and `&gt;`, and bare
double quotes to `&quot;`:

```````````````````````````````` example
4 < 5 and 6 > 3
.
<p>4 &lt; 5 and 6 &gt; 3</p>
````````````````````````````````

```````````````````````````````` example
He said "hi" loudly
.
<p>He said &quot;hi&quot; loudly</p>
````````````````````````````````

Inside [code spans](#code-spans) and [code
blocks](#indented-code-blocks), `&`, `<`, `>` and `"` are *always*
encoded.

## Hard line breaks

A line ending preceded by two or more spaces produces a hard line break
(`<br />`).  So does a backslash immediately before the line ending.
(The first example's first line ends with two spaces.)

```````````````````````````````` example
Roses are red,  
violets are blue.
.
<p>Roses are red,<br />
violets are blue.</p>
````````````````````````````````

```````````````````````````````` example
Roses are red,\
violets are blue.
.
<p>Roses are red,<br />
violets are blue.</p>
````````````````````````````````

Any other line ending inside a paragraph is a soft break, preserved as a
line ending in the output:

```````````````````````````````` example
aaa
bbb
.
<p>aaa
bbb</p>
````````````````````````````````

### simpleLineBreaks (option: `simpleLineBreaks`)

With `simpleLineBreaks: true`, *every* line ending inside a paragraph
produces a `<br />`, as in GFM comments — no trailing spaces needed:

```````````````````````````````` example options:simpleLineBreaks
aaa
bbb
.
<p>aaa<br />
bbb</p>
````````````````````````````````

The explicit hard line break spellings — trailing spaces or a trailing
backslash — produce a single `<br />` under this option too, exactly like
a plain line ending; they do not double up:

```````````````````````````````` example options:simpleLineBreaks
aaa  
bbb
.
<p>aaa<br />
bbb</p>
````````````````````````````````

Line endings that separate list items (or other block structure) are
not affected:

```````````````````````````````` example options:simpleLineBreaks
- a
- b

para
here
.
<ul>
<li>a</li>
<li>b</li>
</ul>
<p>para<br />
here</p>
````````````````````````````````

## Textual content

Any text that is not part of another construct is passed through
unchanged, apart from [automatic escaping](#automatic-escaping):

```````````````````````````````` example
hello $.;'there
.
<p>hello $.;'there</p>
````````````````````````````````
# Document and output options

The options in this chapter do not define Markdown syntax; they
transform the converter's input or output as a whole.

## decodeEntities (option: `decodeEntities`)

With `decodeEntities: true` (the CommonMark behavior, enabled in the
`commonmark` and `gfm` flavors), HTML5 named and numeric character
references in the source are resolved to the characters they represent,
then re-escaped as needed for HTML safety:

```````````````````````````````` example options:decodeEntities
AT&amp;T &mdash; &#36;5 &lt;tag&gt;
.
<p>AT&amp;T — $5 &lt;tag&gt;</p>
````````````````````````````````

By default entities pass through verbatim (see [Automatic
escaping](#automatic-escaping)).

## disallowRawHTML (option: `disallowRawHTML`)

With `disallowRawHTML: true` — the GFM *tagfilter* extension, enabled in
the `gfm` flavor — the opening `<` of these tags is escaped to `&lt;` in
the output, case-insensitively, in both block and span position:
`title`, `textarea`, `style`, `xmp`, `iframe`, `noembed`, `noframes`,
`script`, `plaintext`.  All other raw HTML is untouched:

```````````````````````````````` example options:disallowRawHTML
<script>alert(1)</script>

<em>fine</em>
.
&lt;script>alert(1)&lt;/script>
<p><em>fine</em></p>
````````````````````````````````

```````````````````````````````` example options:disallowRawHTML
a <iframe src="x"></iframe> b
.
<p>a &lt;iframe src="x">&lt;/iframe> b</p>
````````````````````````````````

## safeMode (option: `safeMode`)

With `safeMode: true`, Showdown applies defense-in-depth hardening for
untrusted input: dangerous URL schemes (`javascript:`, `vbscript:`, and
`data:` except `data:image` for image sources) are neutralized in
generated links and images, raw HTML tags beyond the
[disallowRawHTML](#disallowrawhtml-option-disallowrawhtml) set are
escaped or stripped of inline event handlers, and `on*=` attributes are
removed:

```````````````````````````````` example options:safeMode
[click](javascript:alert(1))
.
<p><a href="">click</a></p>
````````````````````````````````

```````````````````````````````` example options:safeMode
![x](data:image/png;base64,AAAA) ![y](data:text/html;base64,AAAA)
.
<p><img src="data:image/png;base64,AAAA" alt="x" /> <img src="" alt="y" /></p>
````````````````````````````````

```````````````````````````````` example options:safeMode
<img src=x onerror=alert(1)>
.
<p><img src=x></p>
````````````````````````````````

`safeMode` is **not** a full HTML sanitizer.  For fully untrusted input,
the output MUST still be passed through a dedicated sanitizer (e.g.
DOMPurify), ideally alongside a Content-Security-Policy.

## completeHTMLDocument (option: `completeHTMLDocument`)

With `completeHTMLDocument: true`, the output is wrapped in a complete
HTML document — doctype, `<html>`, `<head>` with a `utf-8` charset, and
`<body>`:

```````````````````````````````` example options:completeHTMLDocument
# Hi

para
.
<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8">
</head>
<body>
<h1 id="hi">Hi</h1>
<p>para</p>
</body>
</html>
````````````````````````````````

Combined with [metadata](#metadata-option-metadata), the keys `title`,
`charset`, `lang` and `doctype` populate the document head (and `lang`
the `<html>` tag); other keys become `<meta>` tags:

```````````````````````````````` example options:completeHTMLDocument,metadata
---
title: T
lang: en
---

para
.
<!DOCTYPE HTML>
<html lang="en">
<head>
<title>T</title>
<meta charset="utf-8">
<meta name="lang" content="en">
</head>
<body>
<p>para</p>
</body>
</html>
````````````````````````````````

## relativePathBaseUrl (option: `relativePathBaseUrl`)

`relativePathBaseUrl: '<base>'` prepends a base URL to relative link and
image paths; absolute URLs are left alone:

```````````````````````````````` example options:relativePathBaseUrl=https://example.com/
[a](/foo) ![b](img/x.png) [c](http://absolute.com/)
.
<p><a href="https://example.com/foo">a</a> <img src="https://example.com/img/x.png" alt="b" /> <a href="http://absolute.com/">c</a></p>
````````````````````````````````

## moreStyling (option: `moreStyling`)

`moreStyling: true` adds convenience CSS classes and inline styles to
some generated HTML.  It currently affects [task list
items](#task-list-items-option-tasklists), which get `task-list-item`
(and `task-list-item-complete`) classes; see that section for an
example.

## smartIndentationFix (option: `smartIndentationFix`)

`smartIndentationFix: true` is an *input* fix for Markdown embedded in
indented JavaScript template strings: the leading indentation common to
all lines is stripped before parsing, so it is not misread as code
blocks:

```````````````````````````````` example options:smartIndentationFix
    # heading
    para
    here
.
<h1 id="heading">heading</h1>
<p>para
here</p>
````````````````````````````````

# Appendix A: Differences from Original Markdown

This informative appendix summarizes how Showdown Flavored Markdown, at
default settings, differs from [Original Markdown](original.md).

**Additional constructs, on by default:**

  - **Fenced code blocks** (``` ``` ``` or `~~~`), with an info string
    that sets a language class.
  - **Strikethrough** with `~x~` or `~~x~~`.
  - **Heading ids**: every heading gets a GitHub-compatible `id`
    attribute, deduplicated with `-1`/`-2` suffixes.
  - **Ellipsis**: `...` becomes `…`.
  - **Backslash hard line breaks**: a backslash at the end of a line
    forces `<br />` (in addition to the two-space rule).
  - **Shortcut reference links**: bare `[foo]` with a matching
    definition is a link.
  - **`<www.…>` and naked-scheme autolink extras**: angle-bracket
    `www.` autolinks get a scheme prepended.
  - **Image dimensions grammar**: `=WxH` after an image URL is consumed
    (and rendered only with `parseImgDimensions`).
  - **The `markdown` attribute** on an HTML block's opening tag makes
    its content be parsed as Markdown (PHP Markdown Extra style;
    Original always passes HTML block content through verbatim).

**Different resolutions of shared syntax:**

  - **Backslash escapes** cover a much larger character set (adding
    `~ | : ; = ? @ % , / ^ ' " < > & $`).
  - **ATX headings** may be indented up to three spaces (Original
    requires column 0).
  - **Setext headings**: the underline may be indented, and an
    underline after a multi-line paragraph turns the *whole* paragraph
    into the heading (Original uses only the last line).
  - **Nested lists require four spaces** (or a tab) of marker
    indentation; smaller indents continue the enclosing list
    (`disableForced4SpacesIndentedSublists` restores the loose rule).
  - **Ordered lists** honor the first item's number as a `start`
    attribute (Original always numbers from 1).
  - **Changing marker type** (`1.` → `*`) splits the list in two
    (Original keeps one list typed by its first marker).
  - **A list can interrupt a paragraph** (Original requires a blank
    line).
  - **Automatic escaping**: bare `>` and bare double quotes in text
    are encoded (`&gt;` / `&quot;`; Original leaves them unchanged),
    and double quotes inside code spans and code blocks are encoded as
    `&quot;` as well.
  - **Email obfuscation** is deterministic (seeded by the address)
    rather than randomized.

# Appendix B: Option index

Every converter option, with its default value.  Options marked *out of
scope* are not specified by this document.

| Option | Default | Specified in |
|---|---|---|
| `backslashEscapesHTMLTags` | `false` | [Inline HTML](#backslashescapeshtmltags-option-backslashescapeshtmltags) |
| `cmSpec` | `false` | *out of scope* — see [CommonMark](CommonMark.md) / [GFM](gfm.md) |
| `completeHTMLDocument` | `false` | [Document and output options](#completehtmldocument-option-completehtmldocument) |
| `decodeEntities` | `false` | [Document and output options](#decodeentities-option-decodeentities) |
| `disableForced4SpacesIndentedSublists` | `false` | [List items](#disableforced4spacesindentedsublists-option-disableforced4spacesindentedsublists) |
| `disallowRawHTML` | `false` | [Document and output options](#disallowrawhtml-option-disallowrawhtml) |
| `ellipsis` | `true` | [Ellipsis](#ellipsis) |
| `emoji` | `false` | [Emoji](#emoji-option-emoji) |
| `encodeEmails` | `true` | [Automatic links](#email-addresses) |
| `footnotes` | `false` | [Footnotes](#footnotes-option-footnotes) |
| `ghCodeBlocks` | `true` | [Fenced code blocks](#fenced-code-blocks) |
| `ghMentions` | `false` | [Automatic links](#github-mentions-option-ghmentions) |
| `ghMentionsLink` | `'https://github.com/{u}'` | [Automatic links](#github-mentions-option-ghmentions) |
| `headerIds` | `{}` | [Heading ids](#heading-ids) |
| `headerLevelStart` | `1` | [Headings](#headerlevelstart-option-headerlevelstart) |
| `httpsAutoLinks` | `false` | [Automatic links](#httpsautolinks-option-httpsautolinks) |
| `literalMidWordUnderscores` | `false` | [Emphasis](#literalmidwordunderscores-option-literalmidwordunderscores) |
| `metadata` | `false` | [Metadata](#metadata-option-metadata) |
| `moreStyling` | `false` | [Document and output options](#morestyling-option-morestyling) |
| `omitExtraWLInCodeBlocks` | `false` | [Fenced code blocks](#omitextrawlincodeblocks-option-omitextrawlincodeblocks) |
| `parseImgDimensions` | `false` | [Images](#image-dimensions-option-parseimgdimensions) |
| `relativePathBaseUrl` | `''` | [Document and output options](#relativepathbaseurl-option-relativepathbaseurl) |
| `safeMode` | `false` | [Document and output options](#safemode-option-safemode) |
| `simpleLineBreaks` | `false` | [Hard line breaks](#simplelinebreaks-option-simplelinebreaks) |
| `simplifiedAutoLink` | `false` | [Automatic links](#naked-urls-option-simplifiedautolink) |
| `smartIndentationFix` | `false` | [Document and output options](#smartindentationfix-option-smartindentationfix) |
| `splitAdjacentBlockquotes` | `false` | [Blockquotes](#splitadjacentblockquotes-option-splitadjacentblockquotes) |
| `strikethrough` | `true` | [Strikethrough](#strikethrough) |
| `tables` | `false` | [Tables](#tables-option-tables) |
| `tablesHeaderId` | `false` | [Tables](#tablesheaderid-option-tablesheaderid) |
| `tasklists` | `false` | [Task list items](#task-list-items-option-tasklists) |
| `underline` | `false` | [Underline](#underline-option-underline) |

# Appendix C: Flavors

A **flavor** is a preset bundle of option overrides applied on top of
the defaults (`showdown.setFlavor(name)`).  This document specifies the
`vanilla` flavor; the others are:

| Flavor | Overrides |
|---|---|
| `vanilla` | none (the defaults; this spec) |
| `original` | `headerIds: false`, `ghCodeBlocks: false`, `strikethrough: false` — see the [Original Markdown spec](original.md) |
| `commonmark` | `cmSpec: true`, `decodeEntities: true`, `headerIds: false`, `strikethrough: false`, `encodeEmails: false` — see the [CommonMark spec](CommonMark.md) |
| `gfm` | everything in `commonmark`, plus `strikethrough: true`, `tables: true`, `tasklists: true`, `footnotes: true`, `ghMentions: true`, `simplifiedAutoLink: true`, `emoji: true`, `ghCodeBlocks: true`, `omitExtraWLInCodeBlocks: true`, `disallowRawHTML: true` — see the [GFM spec](gfm.md) |
| `github` | alias of `gfm` (backwards compatibility) |

# About this specification

This specification describes the default dialect of the
[ShowdownJS](https://github.com/showdownjs/showdown) converter, as
implemented by its legacy (pre-`cmSpec`) parsers.  It is maintained as
part of the ShowdownJS project, where it serves as the normative
reference for the `vanilla` flavor.

This document follows the structure and conventions of the [CommonMark
specification](https://spec.commonmark.org/) by John MacFarlane
(licensed under Creative Commons BY-SA 4.0) and of this project's
[Original Markdown spec](original.md), from which several baseline
examples are adapted.
