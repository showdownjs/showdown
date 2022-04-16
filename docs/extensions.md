Showdown allows you to load additional functionality via extensions. You can find a list of known Showdown extensions [here][ext-wiki].

You can also check the [boilerplate repo][boilerplate-repo], to create your own extension(s).

## Usage

=== "Server-side"

    ```js
    // Using a bundled extension
    var showdown = require('showdown');
    var converter = new showdown.Converter({ extensions: ['twitter'] });

    // Using a custom extension
    var mine = require('./custom-extensions/mine');
    var converter = new showdown.Converter({ extensions: ['twitter', mine] });
    ```

=== "Client-side"

    ```js
    <script src="src/showdown.js"></script>
    <script src="src/extensions/twitter.js"></script>
    <script>var converter = new showdown.Converter({ extensions: ['twitter'] });</script>
    ```

=== "CLI"

    In the CLI tool, use the [`-e` flag](/cli/#-e-extensions) to load an extension.

    ```sh
    showdown -e twitter -i foo.md -o bar.html
    ```

[ext-wiki]: https://github.com/showdownjs/showdown/wiki/extensions
[boilerplate-repo]: https://github.com/showdownjs/extension-boilerplate