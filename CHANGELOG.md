<a name="1.3.0"></a>
# [1.3.0](https://github.com/showdownjs/showdown/compare/1.2.3...1.3.0) (2015-10-19)


### Bug Fixes

* **literalMidWordUnderscores:** fix different behavior with asterisks ([e86aea8](https://github.com/showdownjs/showdown/commit/e86aea8)), closes [#198](https://github.com/showdownjs/showdown/issues/198)
* **simpleautolink:** fix mail simpleAutoLink to ignore urls with @ symbol ([8ebb25e](https://github.com/showdownjs/showdown/commit/8ebb25e)), closes [#204](https://github.com/showdownjs/showdown/issues/204)

### Features

* **eventDispatcher:** add an event dispatcher to converter ([2734326](https://github.com/showdownjs/showdown/commit/2734326))
* **hashHTMLSpans:** add support for hashing span elements ([3097bd4](https://github.com/showdownjs/showdown/commit/3097bd4)), closes [#196](https://github.com/showdownjs/showdown/issues/196) [#175](https://github.com/showdownjs/showdown/issues/175)


<a name"1.2.3"></a>
### 1.2.3 (2015-08-27)


#### Bug Fixes

* **blockGamut:** fix for headings inside blockquotes ([3df70624](http://github.com/showdownjs/showdown/commit/3df70624), closes [#191](http://github.com/showdownjs/showdown/issues/191))
* **blockQuote:** fix 'github style codeblocks' not being parsed inside 'blockquote' ([ed2cf595](http://github.com/showdownjs/showdown/commit/ed2cf595), closes [#192](http://github.com/showdownjs/showdown/issues/192))
* **simpleAutoLinks:** fix emails being treated as simple urls ([7dc3fb1d](http://github.com/showdownjs/showdown/commit/7dc3fb1d), closes [#187](http://github.com/showdownjs/showdown/issues/187))
* **tables:** fix md tables being parsed inside indented code blocks. ([50256233](http://github.com/showdownjs/showdown/commit/50256233), closes [#193](http://github.com/showdownjs/showdown/issues/193))


<a name"1.2.2"></a>
### 1.2.2 (2015-08-02)


#### Bug Fixes

* **lists:** fix github code blocks not being parsed inside lists ([7720c88b](http://github.com/showdownjs/showdown/commit/7720c88b), closes [#142](http://github.com/showdownjs/showdown/issues/142), [#183](http://github.com/showdownjs/showdown/issues/183), [#184](http://github.com/showdownjs/showdown/issues/184))


<a name"1.2.1"></a>
### 1.2.1 (2015-07-22)


#### Features

* **smoothLivePreview:** fix weird effects due to parsing incomplete input ([62ba3733](http://github.com/showdownjs/showdown/commit/62ba3733))
* **subParsers/githubCodeBlock:** add extra language class to conform to html5 spec ([b7f5e32](http://github.com/showdownjs/showdown/commit/b7f5e32))


#### Bug Fixes

* **tables:** 

  * fix undefined error in malformed tables ([6176977](http://github.com/showdownjs/showdown/commit/6176977))
      
      Cannot read property 'trim' of undefined happens when the parser is fed a malformed table.
      This happens in live previews (for instance, when using Angularjs).
  
  * add support for md span elements in table headers ([789dc18](http://github.com/showdownjs/showdown/commit/789dc18))
  
      Closes #179
    
* **italicsAndBold:** 

    * fix broken em/strong tags when used with literalMidWordUnderscores ([7ee2017](http://github.com/showdownjs/showdown/commit/7ee2017))
    
       When literalMidWordUnderscoresis set to true, em and strong tags that start or end a paragraph don't get parsed as such.
       This fixes this issue.
    
       Closes #174
    
    * fix underscores not being correctly parsed when used in conjunction with literalMidWordsUnderscores option ([c9e85f1](http://github.com/showdownjs/showdown/commit/c9e85f1))
    
* **codeSpans:** Fix issue with code html tags not being correctly escaped ([5f043ca](http://github.com/showdownjs/showdown/commit/5f043ca))

* **images:** fix alt attribute not being escaped correctly ([542194e](http://github.com/showdownjs/showdown/commit/542194e))


<a name"1.2.0"></a>
## 1.2.0 (2015-07-13)

This release moves some of the most popular extensions (such as table-extension and github-extension) to core.
Also introduces a simple cli tool that you can use to quickly convert markdown files into html. 


#### Bug Fixes

* **headerLevelStart:** fix for NaN error when specifying a non number as headerLevelStart param ([be72b487](http://github.com/showdownjs/showdown/commit/be72b487))


#### Features

* **CLI:** simple cli tool (ALPHA) ([f6a33e40](http://github.com/showdownjs/showdown/commit/f6a33e40))
* **flavours:** add markdown presets/flavors ([7e55bceb](http://github.com/showdownjs/showdown/commit/7e55bceb), closes [#164](http://github.com/showdownjs/showdown/issues/164))
* **ghCodeBlocks:** add option to disable GH codeblocks ([c33f9888](http://github.com/showdownjs/showdown/commit/c33f9888))
* **literalMidWordUnderscores:**  add support for GFM literal midword underscores ([0c0cd7db](http://github.com/showdownjs/showdown/commit/0c0cd7db))
* **simplifiedAutoLink:** add support for GFM autolinks ([cff02372](http://github.com/showdownjs/showdown/commit/cff02372))
* **strikethrough:**  add support for GFM strikethrough ([43e9448d](http://github.com/showdownjs/showdown/commit/43e9448d))
* **tables:**  add support for GFM tables ([3a924e3c](http://github.com/showdownjs/showdown/commit/3a924e3c))
* **tasklists:** add support for GFM tasklists ([dc72403a](http://github.com/showdownjs/showdown/commit/dc72403a))


<a name"1.1.0"></a>
## 1.1.0 (2015-06-18)


#### Bug Fixes

* **converter.js:** add error if the passed constructor argument is not an object ([d86ed450](http://github.com/showdownjs/showdown/commit/d86ed450))
* **output modifiers:** fix for output modifiers running twice ([dcbdc61e](http://github.com/showdownjs/showdown/commit/dcbdc61e))


#### Features

* **headerLevelStart:** add support for setting the header starting level ([b84ac67d](http://github.com/showdownjs/showdown/commit/b84ac67d), closes [#69](http://github.com/showdownjs/showdown/issues/69))
* **image dimensions:** add support for setting image dimensions within markdown syntax ([af82c2b6](http://github.com/showdownjs/showdown/commit/af82c2b6), closes [#143](http://github.com/showdownjs/showdown/issues/143))
* **noHeaderId:** add option to suppress automatic generation of ids in headers ([7ac893e9](http://github.com/showdownjs/showdown/commit/7ac893e9))
* **showdown.getDefaultOptions:** add method to retrieve default global options keypairs ([2de53a7d](http://github.com/showdownjs/showdown/commit/2de53a7d))


#### Breaking Changes

* Deprecates `showdown.extensions` property. To migrate, extensions should use the new method `showdown.extension(<ext name>, <extension>)` to register.
  For more information on the new extension loading mechanism, please check the wiki pages.
  ([4ebd0caa](http://github.com/showdownjs/showdown/commit/4ebd0caa))


<a name"1.0.2"></a>
### 1.0.2 (2015-05-28)

#### Bug Fixes

* **Gruntfile.js** add missing comma in footer. This bug prevented concatenating other js scripts and libraries
  with showdown([5315508](http://github.com/showdownjs/showdown/commit/5315508). Credits to Alexandre Courtiol.


<a name"1.0.1"></a>
### 1.0.1 (2015-05-27)


#### Bug Fixes

* **bower.json:** update bower.json main attribute to point to dist directory ([bc3a092f](http://github.com/showdownjs/showdown/commit/bc3a092f))


<a name"1.0.0"></a>
## 1.0.0 (2015-05-27)

#### Release Information
This is a major code refactor with some big changes such as:
  - showdown.js file was split in several files, called sub-parsers. This should improve code maintainability.
  - angular integration was removed from core and move to its own repository, similar to what was done with extensions
  - A new extension registering system is on the "cooks" that should reduce errors when using extensions. The old mechanism
  is kept so old extensions should be compatible.

#### Bug Fixes

* **extensions:** support for old extension loading mechanism ([95ed7c68](http://github.com/showdownjs/showdown/commit/95ed7c68))
* **helpers:** fix wrong function call 'escapeCharacters' due to old strayed code ([18ba4e75](http://github.com/showdownjs/showdown/commit/18ba4e75))
* **showdown.js:**
  - fix showdown extension loader ([a38c76d2](http://github.com/showdownjs/showdown/commit/a38c76d2)),
  closes [#50](http://github.com/showdownjs/showdown/issues/50),[#56](http://github.com/showdownjs/showdown/issues/56),
  [#104](http://github.com/showdownjs/showdown/issues/104), [#108](http://github.com/showdownjs/showdown/issues/108),
  [#109](http://github.com/showdownjs/showdown/issues/109), [#111](http://github.com/showdownjs/showdown/issues/111),
  [#118](http://github.com/showdownjs/showdown/issues/118), [#122](http://github.com/showdownjs/showdown/issues/122)
  - add unique id prefix and suffix to headers ([c367a4b9](http://github.com/showdownjs/showdown/commit/c367a4b9), closes [#81](http://github.com/showdownjs/showdown/issues/81), [#82](http://github.com/showdownjs/showdown/issues/82))
* **options.omitExtraWLInCodeBlocks:** fix for options.omitExtraWLInCodeBlocks only applying in gitHub flavoured code b ([e6f40e19](http://github.com/showdownjs/showdown/commit/e6f40e19))
* **showdown:** fix for options merging into globalOptions ([ddd6011d](http://github.com/showdownjs/showdown/commit/ddd6011d), closes [#153](http://github.com/showdownjs/showdown/issues/153))

#### Features

* **registerExtension():** new extension loading mechanism. Now extensions can be registered using this function.
  The system, however, is not final and will probably be changed until the final version([0fd10cb] (http://github.com/showdownjs/showdown/commit/0fd10cb))
* **allowBlockIndents:** indented inline block elements can now be parsed as markdown ([f6326b84](http://github.com/showdownjs/showdown/commit/f6326b84))
* **omitExtraWLInCodeBlocks:**  add option to omit extra newline at the end of codeblocks ([141e3f5](http://github.com/showdownjs/showdown/commit/141e3f5))
* **prefixHeaderId:** add options to prefix header ids to prevent id clash ([141e3f5](http://github.com/showdownjs/showdown/commit/141e3f5))
* **Converter.options:** add getOption(), setOption() and getOptions() to Converter object ([db6f79b0](http://github.com/showdownjs/showdown/commit/db6f79b0))

#### Breaking Changes
* **NAMESPACE:** showdown's namespace changed.

   To migrate your code you should update all references to `Showdown` with `showdown`.

* **Converter:** converter reference changed from `converter` to `Converter`.

   To migrate you should update all references to `Showdown.converter` with `showdown.Converter`

* **angular:** angular integration was removed from core and now lives in it's own [repository](http://github.com/showdownjs/angular/).

   If you're using angular integration, you should install ng-showdown. Ex: `bower install ng-showdown`

* **extensions:** showdown extensions were removed from core package and now live in their own repository. See the [project's github page](https://github.com/showdownjs) for available extensions
