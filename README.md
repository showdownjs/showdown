![Showdown](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

[![Build Status](https://travis-ci.org/showdownjs/showdown.svg?branch=master)](https://travis-ci.org/showdownjs/showdown)

Showdown is a Javascript Markdown to HTML converter, based on the original works by John Gruber. Showdown can be used client side (in the browser) or server side (with NodeJs).


## Installation

### Download tarball

You can download the latest release's tarball directly from https://github.com/showdownjs/showdown/releases

### Bower

    bower install showdown

### npm (server-side)

    npm install showdown


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

## Integration with AngularJS

ShowdownJS project also provides seamlessly integration with AngularJS via a "plugin".
Please visit https://github.com/showdownjs/ngShowdown for more information.


## Extensions

Showdown allows additional functionality to be loaded via extensions.

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


## Known Differences in Output

In most cases, Showdown's output is identical to that of Perl Markdown v1.0.2b7.  What follows is a list of all known deviations.  Please file an issue if you find more.

  * This release uses the HTML parser from Markdown 1.0.2b2,
    which means it fails `Inline HTML (Advanced).text` from
    the Markdown test suite:

        <div>
        <div>
        unindented == broken
        </div>
        </div>

  * Showdown doesn't support the markdown="1" attribute:

        <div markdown="1">
             Markdown does *not* work in here.
        </div>

    This is half laziness on my part and half stubbornness.
    Markdown is smart enough to process the contents of span-
    level tags without screwing things up; shouldn't it be
    able to do the same inside block elements?  Let's find a
    way to make markdown="1" the default.


  * You can only nest square brackets in link titles to a
    depth of two levels:

        [[fine]](http://www.attacklab.net/)
        [[[broken]]](http://www.attacklab.net/)

    If you need more, you can escape them with backslashes.


  * When sublists have paragraphs, Showdown produces equivalent
    HTML with a slightly different arrangement of newlines:

        + item

             - subitem

               The HTML has a superfluous newline before this
               paragraph.

             - subitem

               The HTML here is unchanged.

             - subitem

               The HTML is missing a newline after this
               list subitem.



  * Markdown.pl creates empty title attributes for
    inline-style images:

        Here's an empty title on an inline-style
        ![image](http://w3.org/Icons/valid-xhtml10).

    I tried to replicate this to clean up my diffs during
    testing, but I went too far: now Showdown also makes
    empty titles for reference-style images:

        Showdown  makes an empty title for
        reference-style ![images][] too.

        [images]: http://w3.org/Icons/valid-xhtml10


  * With crazy input, Markdown will mistakenly put
    `<strong>` or `<em>` tags in URLs:

        <a href="<*Markdown adds em tags in here*>">
           improbable URL
        </a>

    Showdown won't.  But still, don't do that.


## Creating Markdown Extensions

A showdown extension is simply a function which returns an array of extensions.  Each single extension can be one of two types:

  * Language Extension -- Language extensions are ones that that add new markdown syntax to showdown.  For example, say you wanted `^^youtube http://www.youtube.com/watch?v=oHg5SJYRHA0` to automatically render as an embedded YouTube video, that would be a language extension.
  * Output Modifiers -- After showdown has run, and generated HTML, an output modifier would change that HTML.  For example, say you wanted to change `<div class="header">` to be `<header>`, that would be an output modifier.

Each extension can provide two combinations of interfaces for showdown.

### Regex/Replace

Regex/replace style extensions are very similar to Javascript's `string.replace` function.  Two properties are given, `regex` and `replace`.  `regex` is a string and `replace` can be either a string or a function.  If `replace` is a string, it can use the `$1` syntax for group substitution, exactly as if it were making use of `string.replace` (internally it does this actually);  The value of `regex` is assumed to be a global replacement.

**Example:**

```js
var demo = function(converter) {
  return [
    // Replace escaped @ symbols
    { type: 'lang', regex: '\\@', replace: '@' }
  ];
}
```

### Filter

Alternately, if you'd just like to do everything yourself, you can specify a filter which is a callback with a single input parameter, text (the current source text within the showdown engine).

**Example:**

```js
var demo = function(converter) {
  return [
    // Replace escaped @ symbols
    { type: 'lang', filter: function(text) {
      return text.replace(/\\@/g, '@');
    }}
  ];
}
```

### Implementation Concerns

One bit which should be taken into account is maintaining both client-side and server-side compatibility.  This can be achieved with a few lines of boilerplate code.  First, to prevent polluting the global scope for client-side code, the extension definition should be wrapped in a self-executing function.

```js
(function(){
  // Your extension here
}());
```

Second, client-side extensions should add a property onto `Showdown.extensions` which matches the name of the file.  As an example, a file named `demo.js` should then add `Showdown.extensions.demo`.  Server-side extensions can simply export themselves.

```js
(function(){
  var demo = function(converter) {
    // ... extension code here ...
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.demo = demo; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = demo;
}());
```

### Testing Extensions

The showdown test runner is setup to automatically test cases for extensions.  To add test cases for an extension,
create a new folder under `./test/extensions` which matches the name of the `.js` file in `./src/extensions`.
Place any test cases into the folder using the md/html format and they will automatically be run when tests are run.


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
