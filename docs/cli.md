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

            CLI to Showdownjs markdown parser v3.0.0

            Options:
              -V, --version       output the version number
              -q, --quiet         Quiet mode. Only print errors
              -m, --mute          Mute mode. Does not print anything
              -v, --verbose       Verbose mode. Print extra information about the conversion
              --color             Force colored output even when the output is not a terminal
              --no-color          Disable colored output
              -h, --help          display help for command

            Commands:
              makehtml [options]      Converts markdown into html
              makemarkdown [options]  Converts html into markdown
              help [command]          display help for command
            ```

    * If you installed Showdown locally via `npm install showdown`, open the folder where Showdown is installed, and type `node ./bin/showdown.js -h` in the command line:

        === "input"

            ```sh
            node ./bin/showdown.js -h
            ```

        === "output"

            ```
            Usage: showdown <command> [options]

            CLI to Showdownjs markdown parser v3.0.0

            Options:
              -V, --version       output the version number
              -q, --quiet         Quiet mode. Only print errors
              -m, --mute          Mute mode. Does not print anything
              -v, --verbose       Verbose mode. Print extra information about the conversion
              --color             Force colored output even when the output is not a terminal
              --no-color          Disable colored output
              -h, --help          display help for command

            Commands:
              makehtml [options]      Converts markdown into html
              makemarkdown [options]  Converts html into markdown
              help [command]          display help for command
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
* Description: Input source. One or more `.md` files (or glob patterns). If omitted or empty, reads from `stdin`.
* Notes:
    * Multiple inputs can be passed at once: `-i a.md b.md c.md`.
    * Glob patterns (`*`, `?`) are supported. Your shell normally expands them; on Windows (or
      when the pattern is quoted) Showdown expands a single-level pattern itself, e.g. `-i "*.md"`.
* Examples:

    !!! example ""

        ```sh
        // Read from stdin and output to stdout
        showdown makehtml -i

        // Read from the foo.md file and output to stdout
        showdown makehtml --input foo.md

        // Convert several files at once
        showdown makehtml -i a.md b.md -o out/

        // Convert every markdown file in the current directory
        showdown makehtml -i *.md -o out/
        ```

###### `-o/--output`

* Short format: `-o`
* Alias: `--output`
* Description: Output target. Usually a `.html` file. If omitted or empty, writes to `stdout`.
* Multiple inputs (batch mode):
    * If `-o` is a **directory** (an existing directory, or a path ending in a separator such
      as `out/`), each result is written there using the source basename with the extension
      swapped (`foo.md` → `foo.html`). The directory is created if it does not exist.
    * If `-o` is omitted, each result is written **beside its source file**.
    * Passing a single output **file** with multiple inputs is an error (it would overwrite itself).
    * Batch conversion continues past individual file errors and exits non-zero if any file failed.
* A single input can also be sent to a directory the same way (e.g. `-o out/` writes `out/<name>.html`).
* Example:

    !!! example ""

        ```sh
        // Read from the foo.md file and output to bar.html
        showdown makehtml -i foo.md -o bar.html

        // Convert many files into an output directory
        showdown makehtml -i *.md -o build/
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

###### `-y/--output-encoding`

* Short format: `-y`
* Alias: `--output-encoding`
* Description: Specify the output encoding. Defaults to `utf8`.
* Example:

    !!! example ""

        ```sh
        showdown makehtml -i foo.md -o bar.html -y latin1
        ```

###### `-e/--extensions`

* Short format: `-e`
* Alias: `--extensions`
* Description: Load the specified extension(s). Each value is a path to a Node-compatible
  extension (relative, absolute, or `~/`-prefixed), **or** the name of an installed npm package
  (a bare specifier is passed straight to `require()`).
* Example:

    !!! example ""

        ```sh
        showdown makehtml -e ~/twitter.js -e ~/youtube.js
        showdown makehtml -e showdown-katex        # an installed npm package
        ```

###### `-p/--flavor`

* Short format: `-p`
* Alias: `--flavor`
* Description: Run with a predetermined [flavor](options.md#available-options) of options. Defaults to `vanilla`.
* Available flavors: `gfm`, `original`, `commonmark`, `vanilla` (`github` is a backwards-compatible
  alias for `gfm`). Use `--list-flavors` to print the list at any time. An unrecognised flavor is
  reported as an error listing the valid flavors.
* Example:

    !!! example ""

        ```sh
        showdown makehtml -i foo.md -o bar.html -p github
        showdown makehtml --list-flavors
        ```

###### `-c/--config`

* Short format: `-c`
* Alias: `--config`
* Description: Enable or disable parser options.
* Introduced in: `2.0.1` (Breaking change. See the [`Extra options`](#extra-options) section below)
* Value handling:
    * A bare option name enables a boolean option: `-c strikethrough`.
    * Booleans can also be set explicitly with `=true`/`=false`. Use `=false` to **disable** an
      option that a flavor enables, e.g. `-p gfm -c tables=false`.
    * Number options take a numeric value: `-c headerLevelStart=2`.
    * String options take a string value: `-c ghMentionsLink=https://github.com/{u}`.
    * Values are coerced to the option's declared type. Unknown option names and values that
      do not match the option type are reported as warnings and ignored.
* Example: 

    !!! example ""

        ```sh
        showdown makehtml -i foo.md -o bar.html -c strikethrough
        showdown makehtml -i foo.md -o bar.html -c strikethrough -c emoji
        showdown makehtml -i foo.md -o bar.html -c headerLevelStart=2
        showdown makehtml -i foo.md -o bar.html -p gfm -c tables=false
        ```

###### `--config-help`

* Description: Print every Showdown parser option — with its default value and description — then
  exit without converting. Use it to discover what you can pass to [`-c`](#-c-config).
* Example:

    !!! example ""

        ```sh
        showdown makehtml --config-help
        ```

###### `--list-flavors`

* Description: List the available [flavors](flavors.md) (the default, `vanilla`, is marked) and exit
  without converting.
* Example:

    !!! example ""

        ```sh
        showdown makehtml --list-flavors
        ```

### `makemarkdown`

Convert an HTML input into Markdown (the reverse of `makehtml`).

**Usage**

```sh
showdown makemarkdown [options]
```

#### Options

`makemarkdown` accepts the same options as [`makehtml`](#makehtml): `-i/--input`, `-o/--output`,
`-a/--append`, `-u/--encoding`, `-y/--output-encoding`, `-e/--extensions`, `-p/--flavor`,
`-c/--config`, `--config-help` and `--list-flavors`. Here the input is HTML and the output is Markdown.

* Examples:

    !!! example ""

        ```sh
        // Read from stdin and output to stdout
        showdown makemarkdown -i

        // Convert foo.html into bar.md
        showdown makemarkdown -i foo.html -o bar.md
        ```

## Output verbosity and color

These are global flags — place them before the command (`showdown -v makehtml ...`) or after it,
they apply to both `makehtml` and `makemarkdown`.

###### `-q/--quiet`

* Description: Quiet mode. Suppresses informational messages; only errors (and the final `DONE!`) are printed.

###### `-m/--mute`

* Description: Mute mode. Suppresses **everything**, including error messages. The converted output is still produced.

###### `-v/--verbose`

* Description: Verbose mode. Prints extra diagnostic information (resolved input files, per-file
  `source -> target` mappings in batch mode, input sizes and total time). Ignored when `-q`/`-m` is set.
* Example:

    !!! example ""

        ```sh
        showdown makehtml -v -i *.md -o build/
        ```

###### `--color` / `--no-color`

* Description: Controls colorization of the status/diagnostic messages (the converted output itself
  is never colored).
* Default: color is enabled automatically only when the message stream is a terminal (TTY). The
  `NO_COLOR` and `FORCE_COLOR` environment variables are honored.
* `--color` forces colored output even when the output is redirected; `--no-color` disables it.

## Extra options

Starting from the version `2.0.1`, CLI the format of passing extra options has changed. Please make the necessary changes to your code, if required.

=== "since `v2.0.1`"

    ```sh
    showdown makehtml -i foo.md -o bar.html -c strikethrough -c emoji
    ```

=== "before `v2.0.1`"

    ```sh
    showdown makehtml -i foo.md -o bar.html --strikethrough --emoji
    ```


You can specify any of the [supported options](options.md#available-options), and they will be passed to the converter.

The above commands are equivalent of doing:

```js
var conv = new showdown.Converter({strikethrough: true, emoji: true});
```

!!! note ""
    The CLI runs with the `vanilla` flavor by default, which is the same set of defaults used by
    the node and browser builds. This means a few options, such as `ghCodeBlocks`, `ellipsis` and
    `encodeEmails`, are **enabled** out of the box. Use a different flavor with `-p` or override
    individual options with `-c <option>=true|false`.
