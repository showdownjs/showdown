# Markdown to HTML

Converting Markdown to HTML is Showdown's core job. You do it with a `Converter` and its
[`makeHtml()`](api-reference.md#convertermakehtmltext) method:

```js
var showdown   = require('showdown'),
    converter  = new showdown.Converter(),
    html       = converter.makeHtml('# Hello, **world**!');

// <h1 id="helloworld">Hello, <strong>world</strong>!</h1>
```

That's the whole flow: **create a converter once, then call `makeHtml()`** as many times as you
like. A converter is cheap to reuse, so keep one around instead of creating a new one per call.

## Step by step

1. **Load Showdown** — `require('showdown')` on the server, or a `<script>` tag in the browser
   (see the [Quickstart](quickstart.md) for install options).
2. **Create a converter** — `new showdown.Converter(options)`. The `options` argument is optional.
3. **Convert** — pass a Markdown string to `converter.makeHtml(text)`; it returns an HTML string.

=== "Server-side (Node.js)"

    ```js
    var showdown  = require('showdown'),
        converter = new showdown.Converter(),
        text      = '# hello, markdown!',
        html      = converter.makeHtml(text);
    ```

=== "Client-side (browser)"

    ```html
    <script src="dist/showdown.min.js"></script>
    <script>
      var converter = new showdown.Converter(),
          text      = '# hello, markdown!',
          html      = converter.makeHtml(text);

      document.getElementById('output').innerHTML = html;
    </script>
    ```

## Tweaking the output with options

Showdown's defaults cover plain Markdown. Turn on extras — tables, strikethrough, task lists,
emoji, and more — with [options](options.md#available-options), either up front or on an existing
converter:

```js
// at construction
var converter = new showdown.Converter({ tables: true, strikethrough: true });

// or later
converter.setOption('tasklists', true);

converter.makeHtml('| a | b |\n|---|---|\n| 1 | 2 |');
```

See [Showdown options](options.md) for how options work and
[Available options](options.md#available-options) for the full list.

## Matching a Markdown dialect

If you want Showdown to behave like a specific dialect instead of setting options one by one, apply
a [flavor](flavors.md) preset:

```js
converter.setFlavor('github'); // GitHub Flavored Markdown
converter.makeHtml('~~done~~ and https://example.com');
```

The available flavors are [`vanilla`](markdown-syntax.md) (the default),
[`commonmark`](commonmark.md), [`gfm`](gfm.md) and `original` — see the
[Markdown Syntax](syntax-overview.md) section for how they differ.

## Going further

* **Custom syntax or output post-processing?** Write an [extension](extensions.md).
* **Need the reverse direction?** A converter can also turn HTML back into Markdown with
  [`makeMarkdown()`](html-to-markdown.md).

!!! warning "Sanitize before rendering untrusted Markdown"
    Showdown does **not** sanitize its output — Markdown can legitimately contain raw HTML, so a
    malicious input can produce an XSS payload. If you render Markdown from untrusted sources,
    run the generated HTML through a sanitizer (e.g. DOMPurify). See
    [XSS vulnerability](xss.md) for details.
