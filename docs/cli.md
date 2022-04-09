Showdown comes bundled with a Command-line interface (CLI) tool that allows you to run Showdown converter from the command line.

## Requirements

* [Node.js](https://nodejs.org/en/)

## Quick start guide

1. Check that Showdown CLI is accessible.

    * If you installed Showdown globally via `npm install showdown -g`, you can access the CLI tool help by typing `showdown -h` in the command line:

        === "input"

            ```sh
            showdown -h
            ```

        === "output"

            ```
            Usage: showdown <command> [options]

            CLI to Showdownjs markdown parser v3.0.0-alpha

            Options:
              -V, --version       output the version number
              -q, --quiet         Quiet mode. Only print errors
              -m, --mute          Mute mode. Does not print anything
              -h, --help          display help for command

            Commands:
              makehtml [options]  Converts markdown into html
              help [command]      display help for command
            ```

    * If you installed Showdown locally via `npm install showdown`, open the folder where Showdown is installed, and type `node ./bin/showdown.js -h` in the command line:

        === "input"

            ```sh
            node ./bin/showdown.js -h
            ```

        === "output"

            ```
            Usage: showdown <command> [options]

            CLI to Showdownjs markdown parser v3.0.0-alpha

            Options:
              -V, --version       output the version number
              -q, --quiet         Quiet mode. Only print errors
              -m, --mute          Mute mode. Does not print anything
              -h, --help          display help for command

            Commands:
              makehtml [options]  Converts markdown into html
              help [command]      display help for command
            ```

1. Use `makehtml` command to convert your document to HTML. For example:

    !!! example "Convert `foo.md` into `bar.html`"
        
        ```sh
        showdown makehtml -i foo.md -o bar.html
        ```

## Commands

### `makehtml`

Convert a Markdown input into HTML.

**Usage**

```sh
showdown makehtml [options]
```

#### Options

###### `-i / --input`

* Short format: `-i`
* Alias: `--input`
* Description: Input source. Usually a `.md` file. If omitted or empty, reads from `stdin`.
* Examples:

    !!! example ""

        ```sh
        // Read from stdin and output to stdout
        showdown makehtml -i

        // Read from the foo.md file and output to stdout
        showdown makehtml --input foo.md
        ```

###### `-o/--output`

* Short format: `-o`
* Alias: `--output`
* Description: Output target. Usually a `.html` file. If omitted or empty, writes to `stdout`.
* Example:

    !!! example ""

        ```sh
        // Read from the foo.md file and output to bar.html
        showdown makehtml -i foo.md -o bar.html
        ```

###### `-a/--append`

* Short format: `-a`
* Alias: `--append`
* Description: Append data to output instead of overwriting.
* Example: 

    !!! example ""

        ```sh
        showdown makehtml -a
        ```

###### `-u/--encoding`

* Short format: `-u`
* Alias: `--encoding`
* Description: Specify the input encoding.
* Example: 
    
    !!! example ""

        ```sh
        showdown makehtml -u UTF8
        ```

###### `-e/--extensions`

* Short format: `-e`
* Alias: `--extension`
* Description: Load the specified extension(s). Should be valid path(s) to Node-compatible extensions.
* Example:

    !!! example ""

        ```sh
        showdown makehtml -e ~/twitter.js -e ~/youtube.js
        ```

## Extra options

You can specify any of the [supported options](available-options.md), and they will be passed to the converter.
For example, you can enable strikethrough support via the following command:

```
showdown makehtml -i foo.md -o bar.html --strikethrough
```

this command is equivalent of doing:

```js
var conv = new showdown.Converter({strikethrough: true});
```

!!! warning ""
    In the CLI tool, all the extra options are **disabled** by default. This is the opposite of what is defined for node and browser, where some options, like `ghCodeBlocks` are enabled (for backward compatibility and historical reasons).
