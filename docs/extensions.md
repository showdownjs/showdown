Showdown allows you to load additional functionality via extensions. You can find a list of known Showdown extensions [here][ext-list].

You can also check the [boilerplate repo][boilerplate-repo], to create your own extension(s).

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