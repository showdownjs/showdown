# Options

You can change Showdown's default behavior via options. 

## Set option

### Globally

Setting an option globally affects all Showdown instances.

```js
showdown.setOption('optionKey', 'value');
```

### Locally

Setting an option locally affects the specified Converter object only. You can set local options via:

=== "Constructor"

    ```js
    var converter = new showdown.Converter({optionKey: 'value'});
    ```

=== "setOption() method"

    ```js
    var converter = new showdown.Converter();
    converter.setOption('optionKey', 'value');
    ```

### In the CLI

The [CLI tool](cli.md) sets options on the `makehtml` command with the `-c`/`--config` flag (or a
`--<option>` long flag):

```sh
# enable a boolean option
showdown makehtml -i foo.md -o bar.html -c strikethrough

# the same, using the long-flag form
showdown makehtml -i foo.md -o bar.html --strikethrough

# give a value, or disable an option that a flavor turns on
showdown makehtml -i foo.md -o bar.html -c headerLevelStart=2
showdown makehtml -i foo.md -o bar.html -p gfm -c tables=false
```

!!! note ""
    The CLI runs with the `vanilla` flavor by default — the **same defaults** as the Node and
    browser builds — so options like `ghCodeBlocks` are enabled out of the box. Pick a different
    flavor with `-p`, or turn a single option off with `-c <option>=false`. See the
    [CLI docs](cli.md) and [Extra options](cli.md#extra-options).

## Get option

Showdown provides both local and global methods to retrieve previously set options:

=== "getOption()"
    
    ```js
    // Global
    var myOption = showdown.getOption('optionKey');

    //Local
    var myOption = converter.getOption('optionKey');
    ```

=== "getOptions()"

    ```js
    // Global
    var showdownGlobalOptions = showdown.getOptions();

    //Local
    var thisConverterSpecificOptions = converter.getOptions();
    ```

### Get default options

You can get Showdown's default options with:

```js
var defaultOptions = showdown.getDefaultOptions();
```
## Available options

!!! note ""
    These default values apply to the CLI too: it runs with the `vanilla` flavor by default, i.e. the same defaults as the Node and browser builds. Override any of them with `-c <option>=true|false`, or pick a flavor with `-p`. See the [CLI docs](cli.md).

### backslashEscapesHTMLTags

Support escaping of HTML tags.

* type: `boolean`
* default value: `false`
* introduced in: `1.7.2`

=== "input"
    
    ```html
    \<div>foo\</div>
    ```

=== "output (value is `true`)"

    ```html
    <p>&lt;div&gt;foo&lt;/div&gt;</p>
    ```

### cmSpec

Enable [CommonMark](https://spec.commonmark.org/) spec compliance. With this single option on, both block-level constructs (lists, block quotes, HTML blocks, container nesting, tab expansion) and inline constructs (emphasis, links, images, autolinks, raw HTML) are parsed per the CommonMark spec instead of Showdown's legacy matching.

!!! hint ""
    This option (together with [`decodeEntities`](#decodeentities)) is what the `commonmark`
    flavor turns on. Rather than setting it directly, you will usually want
    `showdown.setFlavor('commonmark')`. See the [CommonMark page](commonmark.md) for the full picture,
    including [which other options still apply under `cmSpec`](commonmark.md#options-that-still-apply-under-cmspec)
    (most GFM extras do) and [which are ignored](commonmark.md#options-that-have-no-effect-under-cmspec).

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

### completeHTMLDocument

Output a complete HTML document, including `<html>`, `<head>`, and `<body>` tags instead of an HTML fragment.

* type: `boolean`
* default value: `false`
* introduced in: `1.8.5`

### decodeEntities

Resolve HTML5 named (`&copy;`), decimal (`&#35;`) and hexadecimal (`&#xcab;`) character references to their corresponding characters (CommonMark behavior). By default, Showdown preserves entities verbatim.

!!! hint ""
    This is one of the CommonMark compliance options. See the [CommonMark page](commonmark.md).

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

=== "input"

    ```
    AT&amp;T &copy; 2024
    ```

=== "output (value is `false`)"

    ```html
    <p>AT&amp;T &copy; 2024</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>AT&amp;T © 2024</p>
    ```

### disableForced4SpacesIndentedSublists

Disable the rule of 4 spaces to indent sub-lists. If enabled, this option effectively reverts to the old behavior where you can indent sub-lists with 2 or 3 spaces.

* type: `boolean`
* default value: `false`
* introduced in: `1.5.0`

=== "input"
    
    ```
    - one
      - two

    ...

    - one
        - two
    ```

=== "output (value is `false`)"

    ```html
    <ul>
    <li>one</li>
    <li>two</li>
    </ul>
    <p>...</p>
    <ul>
    <li>one
        <ul>
            <li>two</li>
        </ul>
    </li>
    </ul>
    ```

=== "output (value is `true`)"

    ```html
    <ul>
    <li>one
        <ul>
            <li>two</li>
        </ul>
    </li>
    </ul>
    <p>...</p>
    <ul>
    <li>one
        <ul>
            <li>two</li>
        </ul>
    </li>
    </ul>
    ```

### disallowRawHTML

Enable GFM's [disallowed raw HTML extension](https://github.github.com/gfm/#disallowed-raw-html-extension-) (the *tagfilter*). When turned on, a small blacklist of raw HTML tags — `title`, `textarea`, `style`, `xmp`, `iframe`, `noembed`, `noframes`, `script`, `plaintext` — is neutralized in the output by escaping the leading `<` to `&lt;`. All other tags pass through untouched.

These tags are singled out because they change how the surrounding markup is interpreted. Enabling this option mitigates a class of HTML/script injection when rendering untrusted Markdown, but it is **not** a full XSS filter (see [xss](xss.md)) — you should still sanitize the output.

This option is **off by default in every flavor, including `gfm`**, so it must be enabled explicitly.

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

=== "input"

    ```
    <strong>kept</strong> <script>alert(1)</script> <style>x</style>
    ```

=== "output (value is `false`)"

    ```html
    <p><strong>kept</strong> <script>alert(1)</script> <style>x</style></p>
    ```

=== "output (value is `true`)"

    ```html
    <p><strong>kept</strong> &lt;script>alert(1)&lt;/script> &lt;style>x&lt;/style></p>
    ```

### ellipsis

Replace three consecutive dots (`...`) with the ellipsis unicode character (`…`).

* type: `boolean`
* default value: `true`
* introduced in: `2.0.0`

=== "input"
    
    ```
    Lorem ipsum...
    ```

=== "output (value is `false`)"

    ```html
    <p>Lorem ipsum...</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>Lorem ipsum…</p>
    ```

!!! note "Reverse direction"

    When enabled, `makeMarkdown` also reverses this: `…` in text becomes `...`. See
    [HTML to Markdown](html-to-markdown.md#feature-options-matching-makehtml).

### emoji

Enable emoji support. For more info on available emojis, see https://github.com/showdownjs/showdown/wiki/Emojis (since v.1.8.0)

* type: `boolean`
* default value: `false`
* introduced in: `1.8.0`

=== "input"
    
    ```
    this is a :smile: emoji
    ```

=== "output (value is `false`)"

    ```html
    <p>this is a :smile: emoji</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>this is a 😄 emoji</p>
    ```

!!! hint "Full list of supported emojies"

    Check the [Showdown Wiki](https://github.com/showdownjs/showdown/wiki/Emojis#emoji-list) for a full list of supported emojies.    

!!! note "Reverse direction"

    When enabled, `makeMarkdown` also reverses this: unicode emoji and recognized emoji `<img>`
    tags become `:code:`. See
    [HTML to Markdown](html-to-markdown.md#feature-options-matching-makehtml).

### encodeEmails

Enable automatic obfuscation of email addresses. During this process, email addresses are encoded via Character Entities, transforming ASCII email addresses into their equivalent decimal entities.

* type: `boolean`
* default value: `true`
* introduced in: `1.6.1`

=== "input"
    
    ```
    <myself@example.com>
    ```

=== "output (value is `false`)"

    ```html
    <a href="mailto:myself@example.com">myself@example.com</a>
    ```

=== "output (value is `true`)"

    ```html
    <a href="&#109;&#97;&#105;&#108;t&#x6f;&#x3a;&#109;&#x79;s&#x65;&#x6c;&#102;&#64;&#x65;xa&#109;&#112;&#108;&#101;&#x2e;c&#x6f;&#109;">&#x6d;&#121;s&#101;&#108;f&#x40;&#x65;&#120;a&#x6d;&#x70;&#108;&#x65;&#x2e;&#99;&#x6f;&#109;</a>
    ```

### footnotes

Enable [GFM footnotes](https://github.github.com/gfm/). A `[^id]` reference plus a matching
`[^id]: …` definition becomes a numbered superscript link, and all referenced footnotes are
collected into a `<section class="footnotes">` at the end of the document (with back-references).
A reference with no definition is left literal, and an unreferenced definition is dropped. Labels
may not contain whitespace and are href-escaped. Enabled by the [`gfm`](flavors.md) flavor.

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

=== "input"

    ```
    Here is a footnote reference.[^1]

    [^1]: And the footnote definition.
    ```

=== "output (value is `false`)"

    ```html
    <p>Here is a footnote reference.[^1]</p>
    <p>[^1]: And the footnote definition.</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>Here is a footnote reference.<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup></p>
    <section class="footnotes" data-footnotes>
    <ol>
    <li id="fn-1">
    <p>And the footnote definition. <a href="#fnref-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
    </li>
    </ol>
    </section>
    ```

!!! note "Reverse direction"

    When enabled, `makeMarkdown` also reverses this: a `<sup class="footnote-ref">` becomes its
    `[^id]` reference and the `<section class="footnotes">` becomes the `[^id]: …` definitions
    (back-references are dropped). See
    [HTML to Markdown](html-to-markdown.md#feature-options-matching-makehtml).

### ghCodeBlocks

Enable support for GFM code block style syntax (fenced codeblocks).

* type: `boolean`
* default value: `true`
* introduced in: `0.3.1`

=== "example"
    
    ```
     ```
     some code here
	 ```
    ```

### ghMentions

Enables support for GitHub `@mentions` that allows you to link to the GitHub profile page of the mentioned username.

* type: `boolean`
* default value: `false`
* introduced in: `1.6.0` 

=== "input"
    
    ```
    hello there @tivie
    ```

=== "output (value is `false`)"

    ```html
    <p>hello there @tivie</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>hello there <a href="https://github.com/tivie">@tivie</a></p>
    ```

### ghMentionsLink

Specify where the link generated by `@mentions` should point to. Showdown replaces `{u}` with the username. Works only when [`ghMentions: true`](#ghmentions).

* type: `string`
* default value: `https://github.com/{u}`
* introduced in: `1.6.2`

=== "input"
    
    ```
    hello there @tivie
    ```

=== "output (value is `https://github.com/{u}`)"

    ```html
    <p>hello there <a href="https://github.com/tivie">@tivie</a></p>
    ```

=== "output (value is `http://mysite.com/{u}/profile`)"

    ```html
    <p>hello there <a href="//mysite.com/tivie/profile">@tivie</a></p>
    ```

### headerLevelStart

Set starting level for the heading tags.

* type: `integer`
* default value: `1`
* introduced in: `1.1.0`

=== "input"
    
    ```
    # This is a heading
    ```

=== "output (value is `1`)"

    ```html
    <h1>This is a heading</h1>
    ```

=== "output (value is `3`)"

    ```html
    <h3>This is a heading</h3>
    ```

### httpsAutoLinks

Use `https://` (instead of `http://`) when generating the protocol for autolinked `www.` URLs. Applies only to links generated by [`simplifiedAutoLink`](#simplifiedautolink).

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

=== "input"
    
    ```
    Lorem ipsum www.google.com
    ```

=== "output (value is `false`)"

    ```html
    <p>Lorem ipsum <a href="http://www.google.com">www.google.com</a></p>
    ```

=== "output (value is `true`)"

    ```html
    <p>Lorem ipsum <a href="https://www.google.com">www.google.com</a></p>
    ```

### literalMidWordUnderscores

Treat underscores in the middle of words as literal characters.

Underscores allow you to specify the words that should be emphasized. However, in some cases, this may be unwanted behavior. With this option enabled, underscores in the middle of words will no longer be interpreted as `<em>` and `<strong>`, but as literal underscores.

* type: `boolean`
* default value: `false`
* introduced in: `1.2.0`

=== "input"
    
    ```
    some text with__underscores__in the middle
    ```

=== "output (value is `false`)"

    ```html
    <p>some text with<strong>underscores</strong>in the middle</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>some text with__underscores__in the middle</p>
    ```

### metadata

Enable support for document metadata (front-matter). You can define metadata at the top of a document between `««« »»»` or `--- ---` symbols.

* type: `boolean`
* default value: `false`
* introduced in: `1.8.5`

=== "input"
    
    ```js
    let ref = `referenced value`;

    var markdown = `
    ---
    first: Lorem
    second: Ipsum
    ref_variable: ${ref}
    ---
    `

    var conv = new showdown.Converter({metadata: true});
    var html = conv.makeHtml(markdown);
    var metadata = conv.getMetadata();
    ```

=== "output (value is `true`)"

    ```js
    // console.log(metadata)
    {
        first: 'Lorem',
        second: 'Ipsum',
        ref_variable: 'referenced value'
    }
    ```

### moreStyling

Add some useful CSS styling classes to the generated HTML.

Currently, this adds the class `task-list-item-complete` to completed task items in GFM [`tasklists`](#tasklists).

* type: `boolean`
* default value: `false`
* introduced in: `3.0.0`

=== "input"
    
    ```
    - [x] done
    - [ ] pending
    ```

=== "output (value is `true`)"

    ```html
    <ul>
    <li class="task-list-item task-list-item-complete" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;" checked> done</li>
    <li class="task-list-item" style="list-style-type: none;"><input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"> pending</li>
    </ul>
    ```

!!! note ""
    Without `moreStyling`, completed items get the same `task-list-item` class as pending ones — only the `task-list-item-complete` class on checked items is added by this option.

### noHeaderId

Disable automatic generation of heading IDs.

!!! note ""
    By default Showdown generates **GitHub-compatible** heading IDs (spaces become dashes, most non-alphanumeric characters are stripped, lower-cased). Use [`rawHeaderId`](#rawheaderid) for minimal sanitization instead, or `noHeaderId` to disable IDs entirely.

!!! warning ""
    Setting the option to `true` overrides the following options:

    * [`prefixHeaderId`](#prefixheaderid)
    * [`rawHeaderId`](#rawheaderid)

* type: `boolean`
* default value: `false`
* introduced in: `1.1.0`

=== "input"
    
    ```
    # This is a heading
    ```

=== "output (value is `false`)"

    ```html
    <h1 id="this-is-a-heading">This is a heading</h1>
    ```

=== "output (value is `true`)"

    ```html
    <h1>This is a heading</h1>
    ```

### omitExtraWLInCodeBlocks

Omit trailing newline in code blocks (which is set by default before the closing tag). This option affects both indented and fenced (gfm style) code blocks.

* type: `boolean`
* default value: `false`
* introduced in: `1.0.0`

=== "input"
    
    ```
        var foo = 'bar';
    ```

=== "output (value is `false`)"

    ```html
    <code><pre>var foo = 'bar';
    </pre></code>
    ```

=== "output (value is `true`)"

    ```html
    <code><pre>var foo = 'bar';</pre></code>
    ```

### parseImgDimensions

Set image dimensions from within Markdown syntax.

* type: `boolean`
* default value: `false`
* introduced in: `1.1.0`

=== "example"
    
    ```
    ![foo](foo.jpg =100x80)   set width to 100px and height to 80px
    ![bar](bar.jpg =100x*)    set width to 100px and height to "auto"
    ![baz](baz.jpg =80%x5em)  set width to 80% and height to 5em
    ```

### prefixHeaderId

Add a prefix to the generated heading ID:

* Passing a string will add that string to the heading ID.
* Passing `true` will add a generic `section` prefix.

!!! warning ""
    This option can be overridden with the [`noHeaderId`](#noheaderid) option.

* type: `string / boolean`
* default value: `false`

=== "input"
    
    ```
    # This is a heading
    ```

=== "output (value is `false`)"

    ```html
    <h1 id="this-is-a-heading">This is a heading</h1>
    ```

=== "output (value is `true`)"

    ```html
    <h1 id="section-this-is-a-heading">This is a heading</h1>
    ```

=== "output (value is `showdown`)"

     ```html
     <h1 id="showdownthis-is-a-heading">This is a heading</h1>
     ```

### rawHeaderId

Use minimal sanitization for generated heading IDs instead of the default GitHub-compatible style: only ` ` (space), `'`, `"`, `>` and `<` are replaced with `-` (dash), including in any prefix. All other characters are kept verbatim (and the result is lower-cased).

!!! danger ""
    **Use with caution** as it might result in malformed IDs.

* type: `boolean`
* default value: `false`
* introduced in: `1.7.3`

### relativePathBaseUrl

Prepend a base URL to relative paths (in links and images). Absolute paths (those starting with a protocol, `//`, or `#`) are left untouched.

* type: `string`
* default value: `''` (empty — disabled)
* introduced in: `3.0.0`

=== "input"
    
    ```
    [link](some/page.html)
    ```

=== "output (value is `''`)"

    ```html
    <p><a href="some/page.html">link</a></p>
    ```

=== "output (value is `https://example.com/`)"

    ```html
    <p><a href="https://example.com/some/page.html">link</a></p>
    ```

### requireSpaceBeforeHeadingText

Require a space between a heading `#` and the heading text.

* type: `boolean`
* default value: `false`
* introduced in: `1.5.3`

=== "input"
    
    ```
    #heading
    ```

=== "output (value is `false`)"

    ```html
    <h1 id="heading">heading</h1>
    ```

=== "output (value is `true`)"

    ```html
    <p>#heading</p>
    ```

### simpleLineBreaks

Parse line breaks as `<br/>` in paragraphs (GitHub-style behavior).

* type: `boolean`
* default value: `false`
* introduced in: `1.5.1`

=== "input"
    
    ```
    a line
    wrapped in two
    ```

=== "output (value is `false`)"

    ```html
    <p>a line
    wrapped in two</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>a line<br>
    wrapped in two</p>
    ```

### simplifiedAutoLink

Enable automatic linking for plain text URLs.

* type: `boolean`
* default value: `false`
* introduced in: `1.2.0`

=== "input"
    
    ```
    Lorem ipsum www.google.com
    ```

=== "output (value is `false`)"

    ```html
    <p>Lorem ipsum www.google.com</p>
    ```

=== "output (value is `true`)"

    ```html
    <p>Lorem ipsum <a href="www.google.com">www.google.com</a></p>
    ```

### smartIndentationFix

Resolve indentation problems related to ES6 template strings in the midst of indented code.

* type: `boolean`
* default value: `false`
* introduced in: `1.4.2`

### splitAdjacentBlockquotes

Split adjacent blockquote blocks.

* type: `boolean`
* default value: `false`
* introduced in: `1.8.6`

=== "input"
    
    ```
    > Quote #1
    >> Sub-quote 1

    > Quote #2
    >> Sub-quote 2
    ```

=== "output (value is `false`)"

    ```html
    <blockquote>
      <p>Quote #1</p>
      <blockquote>
        <p>Sub-quote 1</p>
      </blockquote>
      <p>Quote #2</p>
      <blockquote>
        <p>Sub-quote 2</p>
      </blockquote>
    </blockquote>
    ```

=== "output (value is `true`)"

    ```html
    <blockquote>
      <p>Quote #1</p>
      <blockquote>
        <p>Sub-quote 1</p>
      </blockquote>
    </blockquote>
    <blockquote>
      <p>Quote #2</p>
      <blockquote>
        <p>Sub-quote 2</p>
      </blockquote>
    </blockquote>    
    ```

### strikethrough

Enable support for strikethrough (`<del>`). Enabled by default.

* type: `boolean`
* default value: `true`
* introduced in: `1.2.0`

=== "input"
    
    ```
    ~~strikethrough~~
    ```

=== "output (value is `true`)"

    ```html
    <del>strikethrough</del>
    ```

### tables

Enable support for tables syntax.

* type: `boolean`
* default value: `false`
* introduced in: `1.2.0`

=== "example"
    
    ```
    | h1    |    h2   |      h3 |
    |:------|:-------:|--------:|
    | 100   | [a][1]  | ![b][2] |
    | *foo* | **bar** | ~~baz~~ |
    ```

### tablesHeaderId

Generate automatic IDs for table headings. Works only when [`tables: true`](#tables).

* type: `boolean`
* default value: `false`
* introduced in: `1.2.0`

### tasklists

Enable support for GitHub style tasklists.

* type: `boolean`
* default value: `false`
* introduced in: `1.2.0`

=== "example"
    
    ```
     - [x] This task is done
     - [ ] This task is still pending
    ```

### underline

Enable support for underline. If enabled, underscores will no longer be parsed as `<em>` and `<strong>`.

* type: `boolean`
* default value: `false`
* status: `Experimental`

=== "example"
    
    ```
    __underlined word__     // double underscores

    ___underlined word___   // triple underscores
    ```
