To quickstart with Showdown, install it as a package (for server-side) or include it to your browser (client-side) via CDN:

## Installation

### Server-side

=== "npm"

    ```
    npm install showdown
    ```

=== "bower"

    ```
    bower install showdown
    ```

=== "NuGet"

    ```
    PM> Install-Package showdownjs
    ```

    More information about the package you can find on the [NuGet website](https://www.nuget.org/packages/showdownjs/).

### Client-side

=== "jsDelivr"

    ```
    https://cdn.jsdelivr.net/npm/showdown@<version>/dist/showdown.min.js
    ```
    
    [Showndown page on jsDelivr](https://www.jsdelivr.com/package/npm/showdown)

=== "cdnjs"

    ```
    https://cdnjs.cloudflare.com/ajax/libs/showdown/<version>/showdown.min.js
    ```

    [Showndown page on cdnjs](https://cdnjs.com/libraries/showdown)

=== "unpkg"

    ```
    https://unpkg.com/showdown/dist/showdown.min.js
    ```

    [Showndown page on unpkg](https://unpkg.com/browse/showdown@latest/)

!!! note ""
    Replace `<version>` with an actual full length version you're interested in. For example, `2.0.3`.

## Usage

Once installed, you can use Showndown according to the chosen method:

### Server-side

!!! example "Node.js"

    === "code"

        ```js
        var showdown  = require('showdown'),
            converter = new showdown.Converter(),
            text      = '# hello, markdown!',
            html      = converter.makeHtml(text);
        ```
    
    === "output"

        ```html
        <h1 id="hellomarkdown">hello, markdown!</h1>
        ```

### Client-side

!!! example "Browser"

    === "code"

        ```js
        var converter = new showdown.Converter(),
            text      = '# hello, markdown!',
            html      = converter.makeHtml(text);
        ```

    === "output"

        ```html
        <h1 id="hellomarkdown">hello, markdown!</h1>
        ```

!!! warning "Potential XSS vulnerabilities"
    Showdown doesn't sanitize the input since Markdown relies on it to parse certain features correctly into HTML. As a result, this may lead to potential XSS injection vulnerabilities.

    Please refer to the [Markdown's XSS vulnerability](xss.md) page for more information.

## Other installation methods

### Tarball

You can download the latest tarball directly from [releases][releases].

## Previous versions

If you're looking for Showdown prior to version 1.0.0, you can find them in the [legacy branch][legacy-branch].

## Changelog

The full changelog is available [here][changelog].

[legacy-branch]: https://github.com/showdownjs/showdown/tree/legacy
[releases]: https://github.com/showdownjs/showdown/releases
[changelog]: https://github.com/showdownjs/showdown/blob/master/CHANGELOG.md