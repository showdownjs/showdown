## Introduction

Showdown was created by John Fraser as a direct port of the original parser written by Markdown's creator, John Gruber.

Although Showdown has evolved since its inception, in "vanilla mode", it tries to follow the [original markdown spec][md-spec] (henceforth referred as vanilla) as much as possible. There are, however, a few important differences, mainly due to inconsistencies in the original spec, which Showdown addressed following the author's advice as stated in the [markdown's "official" newsletter][md-newsletter].

Showdown also supports opt-in features, that is, an "extra" syntax that is not defined in the original spec. Users can enable these features via options (All the new syntax elements are disabled by default).

This document provides a quick reference of the supported syntax and the differences in output from the original markdown.pl implementation.

## Paragraphs

Paragraphs in Showdown are **one or more lines of consecutive text** followed by one or more blank lines.

```md
On July 2, an alien mothership entered Earth's orbit and deployed several dozen 
saucer-shaped "destroyer" spacecraft, each 15 miles (24 km) wide.
    
On July 3, the Black Knights, a squadron of Marine Corps F/A-18 Hornets, 
participated in an assault on a destroyer near the city of Los Angeles.
```

The implication of the "one or more consecutive lines of text" is that Showdown supports 
"hard-wrapped" text paragraphs. It means the following examples produce the same output:

```md
A very long line of text
```

```md
A very
long line
of text
```

If you **do** want to add soft line breaks (which translate to `<br>` in HTML) to a paragraph, 
you can do so by adding 3 space characters to the end of the line.

You can also force every line break in paragraphs to translate to `<br>` (as Github does) by
enabling the option [**`simpleLineBreaks`**][simpleLineBreaks].

[simpleLineBreaks]: available-options.md#simplelinebreaks

## Headings

### Atx Style

You can create a heading by adding one or more `#` symbols before your heading text. The number of `#` determines the level of the heading. This is similar to [**atx style**][atx].

```md
# The 1st level heading (an <h1> tag)
## The 2nd level heading (an <h2> tag)
…
###### The 6th level heading (an <h6> tag)
```

The space between `#` and the heading text is not required but you can make it mandatory by enabling the option [**`requireSpaceBeforeHeadingText`**][requireSpaceBeforeHeadingText].

[requireSpaceBeforeHeadingText]: available-options.md#requirespacebeforeheadingtext

You can wrap the headings in `#`. Both leading and trailing `#` will be removed.

```md
## My Heading ##
```

If, for some reason, you need to keep a leading or trailing `#`, you can either add a space or escape it:

```md
# # My header # #

#\# My Header \# #
```

### Setext style

You can also use [**setext style**][setext] headings, although only two levels are available.

```md
This is an H1
=============
    
This is an H2
-------------
```

!!! warning ""
    There is an awkward effect when a paragraph is followed by a list. This effect appears on some circumstances, in live preview editors.

    ![awkward effect][]

    You can prevent this by enabling the option [**`smoothPreview`**][smoothlivepreview].

[smoothlivepreview]: available-options.md#smoothlivepreview

### Header IDs

Showdown automatically generates bookmark anchors in titles by adding an id property to a heading.

```md
# My cool header with ID
```

```html
<h1 id="mycoolheaderwithid">My cool header with ID</h1>
```

This behavior can be modified with options:

 - [**`noHeaderId`**][noHeaderId] disables automatic id generation; 
 - [**`ghCompatibleHeaderId`**][ghCompatibleHeaderId] generates header ids compatible with github style (spaces are replaced with dashes and a bunch of non alphanumeric chars are removed)
 - [**`prefixHeaderId`**][prefixHeaderId] adds a prefix to the generated header ids (either automatic or custom).
 - [**`headerLevelStart`**][headerLevelStart] sets the header starting level. For instance, setting this to 3 means that `# header` will be converted to `<h3>`.

Read the [README.md][readme] for more info

[noHeaderId]: available-options.md#noheaderid
[ghCompatibleHeaderId]: available-options.md#ghcompatibleheaderid
[prefixHeaderId]: available-options.md#prefixheaderid
[headerLevelStart]: available-options.md#headerlevelstart

## Blockquotes

You can indicate blockquotes with a `>`.

```md
In the words of Abraham Lincoln:
    
> Pardon my french
```

Blockquotes can have multiple paragraphs and can have other block elements inside.

```md
> A paragraph of text
>
> Another paragraph
>
> - A list
> - with items
```

## Bold and Italic

You can make text bold or italic.

```md
*This text will be italic*
**This text will be bold**
```

Both bold and italic can use either a `*` or an `_` around the text for styling. This allows you to combine both bold and italic if needed.

```md
**Everyone _must_ attend the meeting at 5 o'clock today.**
```

## Strikethrough

With the option [**`strikethrough`**][] enabled, Showdown supports strikethrough elements.
The syntax is the same as GFM, that is, by adding two tilde (`~~`) characters around
a word or groups of words.

```md
a ~~strikethrough~~ element
```

a <s>strikethrough</s> element

[strikethrough]: available-options.md#strikethrough

## Emojis

Since version 1.8.0, Showdown supports Github's emojis. A complete list of available emojis can be found [here][emoji list].

```md
this is a :smile: smile emoji
```

this is a :smile: smile emoji

## Code formatting

### Inline formats

Use single backticks (`) to format text in a special monospace format. Everything within the backticks appear as-is, with no other special formatting.

```md
Here's an idea: why don't we take `SuperiorProject` and turn it into `**Reasonable**Project`.
```

```html
<p>Here's an idea: why don't we take <code>SuperiorProject</code> and turn it into <code>**Reasonable**Project</code>.</p>
```

### Multiple lines

To create blocks of code you should indent it by four spaces.

```md
    this is a piece
    of
    code
```

If the option [**`ghCodeBlocks`**][ghCodeBlocks] is activated (which is by default), you can use triple backticks <code>```</code> to format text as its own distinct block.

    Check out this neat program I wrote:

    ```
    x = 0
    x = 2 + 2
    what is x
    ```

[ghCodeBlocks]: available-options.md#ghcodeblocks

## Lists

Showdown supports unordered (bulleted) and ordered (numbered) lists.

### Unordered lists

You can make an unordered list by preceding list items with either `*`, `-`, or `+`. Markers are interchangeable too.

```md
* Item
+ Item
- Item
```

### Ordered lists

You can make an ordered list by preceding list items with a number.

```md
1. Item 1
2. Item 2
3. Item 3
```

!!! earning ""
    The actual numbers you use to mark the list have no effect on the HTML output that Showdown produces. So you can use the same number in all items if you wish to. For example:

    ```md
    1. Item 1
    1. Item 2
    1. Item 3

    2. Item 1
    2. Item 2
    2. Item 3
    ```

### TaskLists (GFM Style)

Showdown supports GFM-styled takslists if the [**`tasklists`**][tasklists] option is enabled.

```md
 - [x] checked list item
 - [ ] unchecked list item
``` 

 - [x] checked list item
 - [ ] unchecked list item


[tasklists]: available-options.md#tasklists

### List syntax

List markers typically start at the left margin, but may be indented by up to three spaces. 

```md
* valid list item
   * this is valid too
   * this is too  
```

List markers must be followed by one or more spaces or a tab.

To make lists look nicer, you can wrap items with hanging indents:

```md
*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
    viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
    Suspendisse id sem consectetuer libero luctus adipiscing.
```

But if you want to be lazy, you don't have to :grin:

If one list item is separated by a blank line, Showdown will wrap all the list items in `<p>` tags in the HTML output.
So this input:

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

This differs from other Markdown implementations such as GFM (GitHub) or CommonMark.  

### Nested blocks

List items may consist of multiple paragraphs. Each subsequent paragraph in a list item must be indented by either 4 spaces or one tab:

```md
1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
```

This is valid for other block elements such as blockquotes:

```md
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
```

or even other lists.

### Nested lists

You can create nested lists by indenting list items by **four** spaces.

```md
1.  Item 1
    1. A corollary to the above item.
    2. Yet another point to consider.
2.  Item 2
    * A corollary that does not need to be ordered.
    * This is indented four spaces
    * You might want to consider making a new list.
3.  Item 3
```

This behavior is consistent with the original spec but differs from other implementations such as GFM or CommonMark. Prior to version 1.5, you just needed to indent two spaces for it to be considered a sublist.

You can disable the **four spaces requirement** with option [**`disableForced4SpacesIndentedSublists`**][disableForced4SpacesIndentedSublists]

To nest a third (or more) sublist level, you need to indent 4 extra spaces (or 1 extra tab) for each level:

```md
1.  level 1
    1.  Level 2
        *   Level 3
    2.  level 2
        1.  Level 3
1.  Level 1
```
[disableForced4SpacesIndentedSublists]: available-options.md#disableforced4spacesindentedsublists

### Nested code blocks

You can nest fenced codeblocks the same way you nest other block elements, by indenting by four spaces or a tab:

```md
1.  Some code:

    ```js
    var foo = 'bar';
    console.log(foo);
    ```
```

To put an *indented style* code block within a list item, the code block needs to be indented twice — 8 spaces or two tabs:

```md
1.  Some code:

        var foo = 'bar';
        console.log(foo);
```

## Links

### Simple

If you wrap a valid URL or email in `<>` it will be turned into a link whose text is the link itself.

```md
link to <http://www.google.com/>

this is my email <somedude@mail.com>
```

In the case of email addresses, Showdown also performs a bit of randomized decimal and hex entity-encoding to help obscure your address from address-harvesting spambots.
You can disable this obfuscation by setting [**`encodeEmails`**][encodeEmails] option to `false`.

With the option [**`simplifiedAutoLink`**][simplifiedAutoLink] enabled, Showdown will automagically turn every valid URL it finds in the text body into links without the need to wrap them in `<>`.

```md
link to http://www.google.com/

this is my email somedude@mail.com
```

[encodeEmails]: available-options.md#encodeemails
[simplifiedAutoLink]: available-options.md#simplifiedautolink

### Inline

You can create an inline link by wrapping link text in brackets `[ ]`, and then wrapping the link in parentheses `( )`.

For example, a hyperlink to `github.com/showdownjs/showdown`, with a link text that says, `Get Showdown!` will look as follows:

```
[Get Showdown!](https://github.com/showdownjs/showdown)
```

### Reference Style

You can also use the reference style, like this:

```md
this is a [link to google][1]

[1]: www.google.com
```

Showdown also supports implicit link references:

```md
this is a link to [google][]

[google]: www.google.com
```

## Images

In Markdown, the syntax for images is similar to that of links, supporting both inline and reference styles as well. The only difference in syntax for images is the leading exclamation mark before brackets: `![]`.

### Inline

Inline image syntax looks like this:

```md
![Alt text](url/to/image)

![Alt text](url/to/image "Optional title")
```

That is:

* An exclamation mark: `!`
* followed by a set of square brackets `[ ]` containing the alt attribute text for the image
* followed by a set of parentheses `( )` containing the URL or path to the image and an optional title attribute enclosed in double or single quotes.


### Reference Style

Reference-style image syntax looks like this:

```md
![Alt text][id]
```

Where `id` is the name of a defined image reference. Image references are defined using syntax identical to link references:

```md
[id]: url/to/image  "Optional title attribute"
```

Implicit references are also supported:

```md
![showdown logo][]

[showdown logo]: http://showdownjs.github.io/demo/img/editor.logo.white.png
```

### Image dimensions

When the option [**`parseImgDimensions`**][parseImgDimensions] is activated, you can define the image dimensions, like this:

```md
![Alt text](url/to/image =250x250 "Optional title")
```

or in reference style:

```md
![Alt text][id]

[id]: url/to/image =250x250
```

[parseImgDimensions]: available-options.md#parseimgdimensions

### Base64 encoded images

Showdown supports Base64 encoded images, both reference and inline style.

**Since version 1.7.4**, Showdown supports wrapping of base64 strings, which are usually extremely long lines of text.
You can add newlines arbitrarily, as long as they are added after the `,` character.

inline style

```md
![Alt text](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAY
SURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=)
```

reference style

```md
![Alt text][id]

[id]:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=
```

!!! warning ""
    With reference-style base64 image sources, regardless of "wrapping", a double newline is **required** after the base64 string to separate them from a paragraph or other text block (but references can be adjacent):

    !!! example "Wrapped reference style"

        ```md
        ![Alt text][id]
        ![Alt text][id2]

        [id]:
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
        jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
        AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=
        [id2]:
        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7l
        jmRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7D
        AcdvqGQAAAAYSURBVBhXYwCC/2AAZYEoOAMs8Z+BgQEAXdcR7/Q1gssAAAAASUVORK5CYII=


        this text needs to be separated from the references by 2 newlines
        ```

## Tables

Tables aren't part of the core Markdown spec, but they are part of GFM. You can enable them in Showdown via the option [**`tables`**][tables].

* Colons can be used to align columns.
* The outer pipes (`|`) are optional, matching GFM spec. 
* You don't need to make the raw Markdown line up prettily.
* You can use other Markdown syntax inside them.

```md
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| **col 3 is**  | right-aligned | $1600 |
| col 2 is      | *centered*    |   $12 |
| zebra stripes | ~~are neat~~  |    $1 |
```

[tables]: available-options.md#tables

## Mentions

Showdown supports GitHub mentions by enabling the option [**`ghMentions`**][mentions]. This will turn every `@username` into a link to their github profile.

```md
hey @tivie, check this out
```

Since version 1.6.2, you can customize the generated link in mentions with the option [**`ghMentionsLink`**][ghMentionsLink].

For example, setting this option to `http://mysite.com/{u}/profile`:

```html
<p>hey <a href="http://mysite.com/tivie/profile">@tivie</a>, check this out</p>
```

[mentions]: available-options.md#ghmentions
[ghMentionsLink]: available-options.md#ghmentionslink

## Handle HTML in markdown documents

Showdown, in most cases, leaves HTML tags untouched in the output document:

```md
some markdown **here**
<div>this is *not* **parsed**</div>
```

```html
<p>some markdown <strong>here</strong></p>
<div>this is *not* **parsed**</div>
```

However, the content of `<code>` and `<pre><code>` tags is always escaped.

```md
some markdown **here** with <code>foo & bar <baz></baz></code>
```

```html
<p>some markdown <strong>here</strong> with <code>foo &amp; bar &lt;baz&gt;&lt;/baz&gt;</code></p>
``` 

If you want to enable markdown parsing inside a specific HTML tag, you can use the html attribute **`markdown`**, **`markdown="1"`**, or **`data-markdown="1"`**.

```md
some markdown **here**
<div markdown="1">this is *not* **parsed**</div>
```

```html
<p>some markdown <strong>here</strong></p>
<div markdown="1"><p>this is <em>not</em> <strong>parsed</strong></p></div>
```

## Escape entities

### Escape markdown entities

Showdown allows you to use backslash (`\`) to escape characters that have special meaning in markdown's syntax and generate literal characters instead. For example, if you want to surround a word with literal underscores (instead of an HTML `<em>` tag), you can use backslashes before the underscores, like this:

```md
\_literal underscores\_
```

Showdown provides backslash escapes for the following characters:

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
```

### Escape HTML tags

Since [version 1.7.2](https://github.com/showdownjs/showdown/tree/1.7.2), backslash escaping of HTML tags is supported when [**`backslashEscapesHTMLTags`**][backslashEscapesHTMLTags] option is enabled.

```md
\<div>a literal div\</div>
``` 

[backslashEscapesHTMLTags]: available-options.md#backslashescapeshtmltags

## Known differences and gotchas

In most cases, Showdown's output is identical to that of Perl Markdown v1.0.2b7. What follows is a list of all known deviations. Please file an issue if you find more.

* **Since version 1.4.0, Showdown supports the markdown="1" attribute**, but for older versions, this attribute is ignored. This means:

    ```md
    <div markdown="1">
          Markdown does *not* work in here.
    </div>
    ```

* You can only nest square brackets in link titles to a depth of two levels:

        [[fine]](http://www.github.com/)
        [[[broken]]](http://www.github.com/)

    If you need more, you can escape them with backslashes.

* A list is **single paragraph** if it has only **1 line break separating items** and it becomes **multi-paragraph if ANY of its items is separated by 2 line breaks**:

    ```md
    - foo

    - bar
    - baz
    ```

    becomes

    ```html
    <ul>
      <li><p>foo</p></li>
      <li><p>bar</p></li>
      <li><p>baz</p></li>
    </ul>
    ```

This new ruleset is based on the comments of Markdown's author John Gruber in the [Markdown discussion list][md-newsletter].

[md-spec]: http://daringfireball.net/projects/markdown/
[md-newsletter]: https://pairlist6.pair.net/mailman/listinfo/markdown-discuss
[atx]: http://www.aaronsw.com/2002/atx/intro
[setext]: https://en.wikipedia.org/wiki/Setext
[readme]: https://github.com/showdownjs/showdown/blob/master/README.md
[awkward effect]: http://i.imgur.com/YQ9iHTL.gif
[emoji list]: https://github.com/showdownjs/showdown/wiki/emojis