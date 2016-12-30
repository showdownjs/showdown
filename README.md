![Showdown][sd-logo]

[![Build Status](https://travis-ci.org/showdownjs/showdown.svg?branch=master)](https://travis-ci.org/showdownjs/showdown) [![npm version](https://badge.fury.io/js/showdown.svg)](http://badge.fury.io/js/showdown) [![Bower version](https://badge.fury.io/bo/showdown.svg)](http://badge.fury.io/bo/showdown) [![Join the chat at https://gitter.im/showdownjs/showdown](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/showdownjs/showdown?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

------

Showdown is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs).

## Live DEMO

Check a live Demo here http://showdownjs.github.io/demo/


## Who uses Showdown (or a fork)

 - [GoogleCloudPlatform](https://github.com/GoogleCloudPlatform)
 - [Ghost](https://ghost.org/)
 - [Meteor](https://www.meteor.com/)
 - [Stackexchange](http://stackexchange.com/) - forked as [PageDown](https://code.google.com/p/pagedown/)
 - [docular](https://github.com/Vertafore/docular)
 - [and some others...](https://www.npmjs.com/browse/depended/showdown)


## Installation

### Download tarball

You can download the latest release tarball directly from [releases][releases]

### Bower

    bower install showdown

### npm (server-side)

    npm install showdown

### NuGet package

    PM> Install-Package showdownjs

The NuGet Packages can be [found here](https://www.nuget.org/packages/showdownjs/).

### CDN

You can also use one of several CDNs available: 

* github CDN

        https://cdn.rawgit.com/showdownjs/showdown/<version tag>/dist/showdown.min.js

* cdnjs

        https://cdnjs.cloudflare.com/ajax/libs/showdown/<version tag>/showdown.min.js


## Browser Compatibility

Showdown has been tested successfully with:

  * Firefox 1.5 and 2.0
  * Chrome 12.0
  * Internet Explorer 6 and 7
  * Safari 2.0.4
  * Opera 8.54 and 9.10
  * Netscape 8.1.2
  * Konqueror 3.5.4

In theory, Showdown will work in any browser that supports ECMA 262 3rd Edition (JavaScript 1.5).  The converter itself might even work in things that aren't web browsers, like Acrobat.  No promises.


## Node compatibility

Showdown has been tested with node 0.8 and 0.10. However, it should work with previous versions, such as node 0.6.


## Legacy version

If you're looking for showdown v<1.0.0, you can find it in the [**legacy branch**][legacy-branch].

## Changelog

You can check the full [changelog][changelog]

## Extended documentation
Check our [wiki pages][wiki] for examples and a more in-depth documentation.


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

    <h1 id="hellomarkdown">hello, markdown!</h1>

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
    var converter = new showdown.Converter({optionKey: 'value'});
    ```

 * **through the setOption() method**
    ```js
    var converter = new showdown.Converter();
    converter.setOption('optionKey', 'value');
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
var thisConverterSpecificOptions = converter.getOptions();
```

### Retrieve the default options

You can get showdown's default options with:
```js
var defaultOptions = showdown.getDefaultOptions();
```

### Valid Options

 * **omitExtraWLInCodeBlocks**: (boolean) [default false] Omit the trailing newline in a code block. Ex:
   
    This:
    ```html
    <code><pre>var foo = 'bar';
    </pre></code>
    ```
    Becomes this:
    ```html
    <code><pre>var foo = 'bar';</pre></code>
    ```

 * **noHeaderId**: (boolean) [default false] Disable the automatic generation of header ids. Setting to true overrides **prefixHeaderId**

 * **ghCompatibleHeaderId**: (boolean) [default false] Generate header ids compatible with github style (spaces are replaced with dashes, ][&~$!@#*()=:/,;?+'.%\ chars are removed

 * **prefixHeaderId**: (string/boolean) [default false] Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to `true` will add a generic 'section' prefix.
 
 * **parseImgDimensions**: (boolean) [default false] Enable support for setting image dimensions from within markdown syntax.
   Examples:
   ```
   ![foo](foo.jpg =100x80)     simple, assumes units are in px
   ![bar](bar.jpg =100x*)      sets the height to "auto"
   ![baz](baz.jpg =80%x5em)  Image with width of 80% and height of 5em
   ```
 
 * **headerLevelStart**: (integer) [default 1] Set the header starting level. For instance, setting this to 3 means that

    ```md
    # foo
    ```
    will be parsed as 
    
    ```html
    <h3>foo</h3>
    ```

 * **simplifiedAutoLink**: (boolean) [default false] Turning this option on will enable automatic linking to urls. This means that 

   ```md
   some text www.google.com
   ```
   will be parsed as 
   ````
   <p>some text <a href="www.google.com">www.google.com</a>
   ```
 
 * **excludeTrailingPunctuationFromURLs**: (boolean) [default false] This option excludes trailing punctuation from autolinking urls.
   Punctuation excluded: `. !  ? ( )`. Only applies if **simplifiedAutoLink** option is set to `true`.
   
   ```md
   check this link www.google.com!
   ```
   will be parsed as
   ```html
   <p>check this link <a href="www.google.com">www.google.com</a>!</p>
   ```
   
 * **literalMidWordUnderscores**: (boolean) [default false] Turning this on will stop showdown from interpreting underscores in the middle of words as `<em>` and `<strong>` and instead treat them as literal underscores. 

   Example:
   
   ```md
   some text with__underscores__in middle
   ```
   will be parsed as
   ```html
   <p>some text with__underscores__in middle</p>
   ```
   
 * **strikethrough**: (boolean) [default false] Enable support for strikethrough syntax.
   `~~strikethrough~~` as `<del>strikethrough</del>`
   
 * **tables**: (boolean) [default false] Enable support for tables syntax. Example:
    
   ```md
   | h1    |    h2   |      h3 |
   |:------|:-------:|--------:|
   | 100   | [a][1]  | ![b][2] |
   | *foo* | **bar** | ~~baz~~ |
   ```
   
   See the wiki for more info

 * **tablesHeaderId**: (boolean) [default false] If enabled adds an id property to table headers tags.

 * **ghCodeBlocks**: (boolean) [default true] Enable support for GFM code block style.

 * **tasklists**:(boolean) [default false] Enable support for GFM takslists. Example:
 
   ```md
    - [x] This task is done
    - [ ] This is still pending
   ```
 * **smoothLivePreview**: (boolean) [default false] Prevents weird effects in live previews due to incomplete input
 
 * **smartIndentationFix**: (boolean) [default false] Tries to smartly fix indentation problems related to es6 template strings in the midst of indented code.

 * **disableForced4SpacesIndentedSublists**: (boolean) [default false] Disables the requirement of indenting sublists by 4 spaces for them to be nested, 
 effectively reverting to the old behavior where 2 or 3 spaces were enough. (since v1.5.0)
 
 * **simpleLineBreaks**: (boolean) [default false] Parses line breaks as <br> like GitHub does, without needing 2 spaces at the end of the line (since v1.5.1)
 
   ```md
   a line
   wrapped in two
   ```
    
   turns into:
    
   ```html
   <p>a line<br>
   wrapped in two</p>
   ```

 * **requireSpaceBeforeHeadingText**: (boolean) [default false] Makes adding a space between `#` and the header text mandatory (since v1.5.3)
 
## Flavors

You can also use flavors or presets to set the correct options automatically, so that showdown behaves like popular markdown flavors.

Currently, there are two flavors available:

 * github - GFM (GitHub Flavored Markdown)
 * vanilla - original markdown flavor

### Global
```javascript
showdown.setFlavor('github');
```

### Instance
```javascript
converter.setFlavor('github');
```


## CLI Tool

Showdown also comes bundled with a Command Line Interface tool. You can check the [CLI wiki page][cli-wiki] for more info

## Integration with AngularJS

ShowdownJS project also provides seamlessly integration with AngularJS via a "plugin".
Please visit https://github.com/showdownjs/ngShowdown for more information.

## Integration with TypeScript

If you're using TypeScript you maybe want to use the types from [DefinitelyTyped][definitely-typed]

## Integration with SystemJS/JSPM

Integration with SystemJS can be obtained via the third party ["system-md" plugin](https://github.com/guybedford/system-md).

## XSS vulnerability

Showdown doesn't sanitize the input. This is by design since markdown relies on it to allow certain features to be correctly parsed into HTML.
This, however, means XSS injection is quite possible.

Please refer to the wiki article [Markdown's XSS Vulnerability (and how to mitigate it)][xss-wiki]
for more information.

## Extensions

Showdown allows additional functionality to be loaded via extensions. (you can find a list of known showdown extensions [here][ext-wiki])
You can also find a boilerplate, to create your own extensions in [this repository][boilerplate-repo]

### Client-side Extension Usage

```js
<script src="showdown.js" />
<script src="twitter-extension.js" />

var converter = new showdown.Converter({ extensions: ['twitter'] });
```

### Server-side Extension Usage

```js
var showdown    = require('showdown'),
    myExtension = require('myExtension'),
    converter = new showdown.Converter({ extensions: ['myExtension'] });
```

## Tests

A suite of tests is available which require node.js.  Once node is installed, run the following command from the project root to install the dependencies:

    npm install

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
 - Try to follow our [**coding style rules**][coding-rules].
   Breaking them prevents the PR to pass the tests.
 - Refrain from fixing multiple issues in the same pull request. It's preferable to open multiple small PRs instead of one
   hard to review big one.
 - If the PR introduces a new feature or fixes an issue, please add the appropriate test case.
 - We use commit notes to generate the changelog. It's extremely helpful if your commit messages adhere to the
 [**AngularJS Git Commit Guidelines**][ng-commit-guide].
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



[sd-logo]: https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png
[legacy-branch]: https://github.com/showdownjs/showdown/tree/legacy
[releases]: https://github.com/showdownjs/showdown/releases
[changelog]: https://github.com/showdownjs/showdown/blob/master/CHANGELOG.md
[wiki]: https://github.com/showdownjs/showdown/wiki
[cli-wiki]: https://github.com/showdownjs/showdown/wiki/CLI-tool
[definitely-typed]: https://github.com/borisyankov/DefinitelyTyped/tree/master/showdown
[xss-wiki]: https://github.com/showdownjs/showdown/wiki/Markdown's-XSS-Vulnerability-(and-how-to-mitigate-it)
[ext-wiki]: https://github.com/showdownjs/showdown/wiki/extensions
[coding-rules]: https://github.com/showdownjs/code-style/blob/master/README.md
[ng-commit-guide]: https://github.com/showdownjs/code-style/blob/master/README.md#commit-message-convention
[boilerplate-repo]: https://github.com/showdownjs/extension-boilerplate
