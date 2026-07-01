# API reference

This page lists the public API of Showdown. It is split into:

* the [**`showdown.Converter`** instance API](#converter-instance) — methods you call on a converter you created with `new showdown.Converter()`;
* the [**static `showdown`** API](#static-showdown-api) — methods on the global `showdown` object that affect defaults, flavors, extensions and the sub-parser registry.

!!! hint ""
    Several methods are covered in depth on dedicated pages. Where that is the case, this page gives the signature and a one-line summary and links out:
    [Options](options.md) · [Flavors](flavors.md) · [Extensions](extensions.md) · [Event system](event-system.md).

## Converter instance

Create a converter, then call these on the instance:

```js
var converter = new showdown.Converter(/* optional options object */);
```

### `converter.makeHtml(text)`

Convert a Markdown string into HTML. Returns the generated HTML `string`.

```js
converter.makeHtml('# hello'); // '<h1 id="hello">hello</h1>'
```

### `converter.makeMarkdown(html)`

Convert an HTML string back into Markdown (the reverse direction). Returns the generated Markdown `string`. See [HTML to Markdown](html-to-markdown.md).

```js
converter.makeMarkdown('<h1>hello</h1>'); // '# hello'
```

### `converter.setOption(key, value)`

Set a single option on **this** converter. See [Options](options.md) and the [list of available options](options.md#available-options).

### `converter.getOption(key)`

Return the value of a single option on this converter.

### `converter.getOptions()`

Return the full options object for this converter.

### `converter.setFlavor(name)`

Apply a [flavor](flavors.md) preset (`'gfm'`, `'original'`, `'commonmark'`, `'vanilla'`) to this converter. Throws if the flavor is unknown. `'github'` is accepted as a backwards-compatible alias for `'gfm'`.

### `converter.getFlavor()`

Return the name of the flavor currently set on this converter.

### `converter.addExtension(extension, [name])`

Add an [extension](extensions.md) (object, function or array) to this converter. See [Create an extension](create-extension.md).

### `converter.useExtension(extensionName)`

Add a previously [registered](api-reference.md#showdownextensionname-ext) extension to this converter, by name.

### `converter.listen(name, callback)`

Attach a listener `callback` to a single [event](event-system.md#event-types) on this converter. The callback receives a [`showdown.Event`](event-system.md#event-object) and must return it. This is the one-off equivalent of a [`listener` extension](create-extension.md#listener-extensions). Returns the converter (chainable).

Because `lang` and `output` extensions are themselves [registered as listeners](create-extension.md#type) (on `makehtml.onPreParse` and `makehtml.onEnd` respectively), this is the underlying mechanism behind every extension that modifies conversion.

### `converter.unlisten(name, [callback])`

Detach a listener previously added with [`listen()`](#converterlistenname-callback) (or by an extension) from an [event](event-system.md#event-types) on this converter. Pass the same `callback` reference to remove that specific listener; omit `callback` to remove **every** listener for `name`. Unknown event names are a no-op. Returns the converter (chainable).

```js
function addClass (event) { event.attributes.class = 'h'; return event; }
converter.listen('makehtml.heading.atx.onCapture', addClass);
converter.unlisten('makehtml.heading.atx.onCapture', addClass); // detach
```

### `converter.dispatch(event)`

Fire a [`showdown.Event`](event-system.md#event-object) through this converter's listener chain and return the (possibly modified) event. *(Advanced — primarily used internally by sub-parsers; most code should use [`listen()`](#converterlistenname-callback) or a [`listener` extension](create-extension.md#listener-extensions) instead.)*

### `converter.getMetadata([raw])`

Return the [metadata](options.md#metadata) of the last parsed document. With no argument (or a falsy one), returns the parsed metadata object; pass `true` to get the raw, unparsed string. Requires the [`metadata`](options.md#metadata) option.

### `converter.getMetadataFormat()`

Return the format string of the last parsed document's metadata (e.g. the language tag declared on the opening metadata fence).

## Static `showdown` API

These live on the global `showdown` object and affect global defaults or shared registries.

### `showdown.setOption(key, value)`

Set a **global** option, inherited by every converter created afterwards. Returns `showdown` (chainable).

### `showdown.getOption(key)`

Return the value of a global option.

### `showdown.getOptions()`

Return the global options object.

### `showdown.resetOptions()`

Reset all global options back to their default values.

### `showdown.setFlavor(name)`

Set the global [flavor](flavors.md) applied to converters by default. Throws if the flavor is unknown.

### `showdown.getFlavor()`

Return the name of the currently set global flavor.

### `showdown.getFlavors()`

Return an array of the available [flavor](flavors.md) names (e.g. `['commonmark', 'gfm', 'original', 'vanilla', 'github']`). `github` appears alongside `gfm` because it is a backwards-compatible alias for it.

### `showdown.getFlavorOptions(name)`

Return the option overrides bundled in a given flavor, or `undefined` if the flavor was not found. Useful for passing into a constructor: `new showdown.Converter(showdown.getFlavorOptions('commonmark'))`.

### `showdown.getDefaultOptions([simple])`

Return Showdown's default options. By default returns a flat `{ key: value }` map; pass `false` to get the full descriptor objects (with `describe`, `type`, `defaultValue`).

### `showdown.extension(name, [ext])`

Register or retrieve an [extension](extensions.md). With two arguments it registers (and validates) `ext` under `name`; with one argument it returns the previously registered extension. Throws on an invalid extension or an unknown name.

### `showdown.getAllExtensions()`

Return all globally registered extensions as a `{ name: extension }` map.

### `showdown.removeExtension(name)`

Unregister a globally registered extension by name.

### `showdown.resetExtensions()`

Unregister all globally registered extensions.

### `showdown.validateExtension(ext)`

Return `true` if `ext` is a structurally valid extension, `false` otherwise. *(Advanced.)*

### `showdown.subParser(name, [func])`

Get or register a sub-parser. With two arguments it registers `func` under `name`; with one it returns the registered sub-parser (throws if not found). *(Advanced — used to override core conversion logic.)*

### `showdown.getSubParserList()`

Return the map of all registered sub-parsers. *(Advanced.)*
