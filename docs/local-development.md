## Prerequesites

* [Node.js](https://nodejs.org/) v12+
* [npm](https://www.npmjs.com/package/npm)
* [npx](https://www.npmjs.com/package/npx)

## Build

Building your clone of the repository is easy:

1. run `npm install`.
1. run `npx grunt build` (see [`Gruntfile.js`][gruntfile]). This command:

    1. Cleans the repo.
    1. Checks code quality ([JSHint](https://jshint.com/) and [ESLint](https://eslint.org/)).
    1. Runs tests.
    1. Creates the [distributable][sd-dist] and [minified][sd-min] files in the [`dist`][dist-folder] folder.

## Test

A suite of tests is available which require Node.js. Once Node is installed, run the following command from
the project root to install the dependencies:

```
npm install
```

Once installed, run tests from the project root:

```
npm test
```

You can easily add new tests:

1. Create a markdown file (ending in `.md`) that contains the markdown to test.
1. Create a `.html` file with the same name as the markdown one from the previous step. This `html` file will automatically be tested when the tests are executed with `mocha`.

[gruntfile]: https://github.com/showdownjs/showdown/blob/master/Gruntfile.js
[sd-dist]: https://github.com/showdownjs/showdown/blob/master/dist/showdown.js
[sd-min]: https://github.com/showdownjs/showdown/blob/master/dist/showdown.min.js
[dist-folder]: https://github.com/showdownjs/showdown/tree/master/dist