## Overview

You can use _flavors_ (or presets) to set the preferred options automatically. In this way, Showdown behaves like popular Markdown flavors.

Currently, the following flavors are available:

 * `original`: Original Markdown flavor as in [John Gruber's spec](https://daringfireball.net/projects/markdown/)
 * `vanilla`:  Showdown base flavor (v1.3.1 onwards)
 * `github`: [GitHub Flavored Markdown, or GFM](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Set flavor

=== "Globally"

    ```js
    showdown.setFlavor('github');
    ```

=== "Locally"

    ```js
    converter.setFlavor('github');
    ```