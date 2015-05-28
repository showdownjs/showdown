![Showdown](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

[![Build Status](https://travis-ci.org/showdownjs/showdown.svg?branch=master)](https://travis-ci.org/showdownjs/showdown) [![npm version](https://badge.fury.io/js/showdown.svg)](http://badge.fury.io/js/showdown) [![Bower version](https://badge.fury.io/bo/showdown.svg)](http://badge.fury.io/bo/showdown) [![Join the chat at https://gitter.im/showdownjs/showdown](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/showdownjs/showdown?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

------

Showdown is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs).


## Installation

### Download tarball

You can download the latest release tarball directly from https://github.com/showdownjs/showdown/releases

### Bower

    bower install showdown

### npm (server-side)

    npm install showdown

### CDN

You can also use github CDN directly in your html file(s).

    https://cdn.rawgit.com/showdownjs/showdown/<version tag>/dist/showdown.min.js

## Browser Compatibility

Showdown has been tested successfully with:

  * Firefox 1.5 and 2.0
  * Internet Explorer 6 and 7
  * Safari 2.0.4
  * Opera 8.54 and 9.10
  * Netscape 8.1.2
  * Konqueror 3.5.4

In theory, Showdown will work in any browser that supports ECMA 262 3rd Edition (JavaScript 1.5).  The converter itself might even work in things that aren't web browsers, like Acrobat.  No promises.


## Node compatibility

Showdown has been tested with node 0.8 and 0.10. However, it should work with previous versions, such as node 0.6.


## Legacy version

If you're looking for showdown v<1.0.0, you can find it in the [**legacy branch**](https://github.com/showdownjs/showdown/tree/legacy).


## Quick Example

### Node

```js
var showdown  = require('showdown'),
    converter = new showdown.Converter(),
    text      = '#hello, markdown!',
    html      = converter.makeHtml(text);
```

### Browser

```js
var converter = new showdown.Converter(),
    text      = '#hello, markdown!',
    html      = converter.makeHtml(text);
```

### Output 

Both examples should output...

```html
<h1 id="hellomarkdown">hello, markdown!</h1>
```

## Options

You can change some of showdown's default behavior through options. 

### Setting options

Options can be set:

#### Globally

Setting a "global" option affects all instances of showdown

```js
showdown.setOption('optionKey', 'value');
```

#### Locally
Setting a "local" option only affects the specified Converter object. 
Local options can be set:

 * **through the constructor**
    ```js
    var converter = new showdown.Converter({optionKey: 'value');
    ```

 * **through the setOption() method**
    ```js
    var converter = new showdown.Converter();
    conveter.setOption('optionKey', 'value');
    ```

### Getting an option

Showdown provides 2 methods (both local and global) to retrieve previous set options.

#### getOption()

```js
// Global
var myOption = showdown.getOption('optionKey');

//Local
var myOption = converter.getOption('optionKey');
```

#### getOptions()

```js
// Global
var showdownGlobalOptions = showdown.getOptions();

//Local
var thisConverterSpecificOptions = conveter.getOptions();
```

### Valid Options

 * **omitExtraWLInCodeBlocks**: (boolean) Omits the trailing newline in a code block. Ex:
   
    This:
    ```html
    <code><pre>var foo = 'bar';
    </pre></code>
    ```
    Becomes this:
    ```html
    <code><pre>var foo = 'bar';</pre></code>
    ```

 * **prefixHeaderId**: (string/boolean) Adds a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to `true` will add a generic 'section' prefix.


## Integration with AngularJS

ShowdownJS project also provides seamlessly integration with AngularJS via a "plugin".
Please visit https://github.com/showdownjs/ngShowdown for more information.


## Extensions

Showdown allows additional functionality to be loaded via extensions. (you can find a list of known showdown extensions [here](https://github.com/showdownjs/showdown/wiki/extensions))

### Client-side Extension Usage

```js
<script src="showdown.js" />
<script src="twitter-extension.js" />

var converter = new showdown.Converter({ extensions: 'twitter' });
```

### Server-side Extension Usage

```js
var showdown    = require('showdown'),
    myExtension = require('myExtension'),
    converter = new showdown.Converter({ extensions: ['myExtension'] });
```

## Tests

A suite of tests is available which require node.js.  Once node is installed, run the following command from the project root to install the development dependencies:

    npm install --dev

Once installed the tests can be run from the project root using:

    npm test

New test cases can easily be added.  Create a markdown file (ending in `.md`) which contains the markdown to test.  Create a `.html` file of the exact same name.  It will automatically be tested when the tests are executed with `mocha`.

## Contributing

If you wish to contribute please read the following quick guide.

### Want a Feature?
You can request a new feature by submitting an issue. If you would like to implement a new feature feel free to issue a
Pull Request.


### Pull requests (PRs)
PRs are awesome. However, before you submit your pull request consider the following guidelines:

 - Search GitHub for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
 - When issuing PRs that change code, make your changes in a new git branch based on master:

   ```bash
   git checkout -b my-fix-branch master
   ```

 - Documentation (i.e: README.md) changes can be made directly against master.
 - Run the full test suite before submitting and make sure all tests pass (obviously =P).
 - Try to follow our [**coding style rules**](https://github.com/showdownjs/code-style/blob/master/README.md).
   Breaking them prevents the PR to pass the tests.
 - Refrain from fixing multiple issues in the same pull request. It's preferable to open multiple small PRs instead of one
   hard to review big one.
 - If the PR introduces a new feature or fixes an issue, please add the appropriate test case.
 - We use commit notes to generate the changelog. It's extremely helpful if your commit messages adhere to the
 [**AngularJS Git Commit Guidelines**](https://github.com/showdownjs/code-style/blob/master/README.md#commit-message-convention).
 - If we suggest changes then:
   - Make the required updates.
   - Re-run the Angular test suite to ensure tests are still passing.
   - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

   ```bash
   git rebase master -i
   git push origin my-fix-branch -f
   ```
 - After your pull request is merged, you can safely delete your branch.

If you have time to contribute to this project, we feel obliged that you get credit for it.
These rules enable us to review your PR faster and will give you appropriate credit in your GitHub profile.
We thank you in advance for your contribution!

### Joining the team
We're looking for members to help maintaining Showdown.
Please see [this issue](https://github.com/showdownjs/showdown/issues/114) to express interest or comment on this note.

## Credits
Full credit list at https://github.com/showdownjs/showdown/blob/master/CREDITS.md

Showdown is powered by:<br/>
[![webstorm](https://www.jetbrains.com/webstorm/documentation/docs/logo_webstorm.png)](https://www.jetbrains.com/webstorm/)
