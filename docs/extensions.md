Showdown allows you to load additional functionality via extensions. You can find a list of known Showdown extensions [here][ext-list].

You can also check the [boilerplate repo][boilerplate-repo], to create your own extension(s).

## Extension modes

An extension is made up of one or more sub-extensions, each of a given `type`. There are two ways an extension can hook into Showdown:

* **Listener extensions (recommended)** — a `listener` sub-extension hooks the [event system](event-system.md), the main extension mode. It subscribes to the events emitted by Showdown's sub-parsers and can inspect or modify their captures, matches, attributes and output mid-conversion — with far more precision than the legacy modes. See [Create an extension → Listener extensions](create-extension.md#listener-extensions).

* **Legacy `lang`/`output` extensions** _(deprecated)_ — the original extension modes, based on `regex`/`replace` or a `filter` callback that rewrites the text before parsing (`lang`) or the HTML after parsing (`output`). They still work but are now thin wrappers over document-level events, and loading one logs a deprecation warning. Prefer a `listener` extension in new code. See [Create an extension → Type](create-extension.md#type).

## Usage

An extension can be loaded in two ways:

* **By name** — first register it globally with [`showdown.extension()`](api-reference.md#showdownextensionname-ext), then reference that name.
* **Inline** — pass the extension object (or function) directly, with no prior registration.

=== "Server-side"

    ```js
    var showdown = require('showdown');
    var myExtension = require('./my-extension');

    // Inline: pass the extension object directly
    var converter = new showdown.Converter({ extensions: [myExtension] });

    // By name: register it first, then reference it
    showdown.extension('myext', myExtension);
    var converter2 = new showdown.Converter({ extensions: ['myext'] });
    ```

=== "Client-side"

    ```html
    <script src="dist/showdown.js"></script>
    <script src="my-extension.js"></script>
    <script>
      // my-extension.js registered itself via showdown.extension('myext', ...)
      var converter = new showdown.Converter({ extensions: ['myext'] });
    </script>
    ```

=== "CLI"

    In the CLI tool, use the [`-e` flag](cli.md#-e-extensions) to load an extension from a file path.

    ```sh
    showdown makehtml -e ./my-extension.js -i foo.md -o bar.html
    ```

[ext-list]: extensions-list.md
[boilerplate-repo]: https://github.com/showdownjs/extension-boilerplate