<a name="1.5.1"></a>
# [1.5.1](https://github.com/showdownjs/showdown/compare/1.5.0...1.5.1) (2016-12-01)


### Features

* **simpleLineBreaks:** option that parses linebreaks as <br />. This option enables linebreaks to always be treated as `<br />` tags 
  without needing to add spaces in front of the line, the same way GitHub does. ([0942b5e](https://github.com/showdownjs/showdown/commit/0942b5e)), closes [#206](https://github.com/showdownjs/showdown/issues/206)
* **excludeTrailingPunctuationFromURLs:** option that excludes trailing punctuation from auto linked URLs. ([d2fc2a0](https://github.com/showdownjs/showdown/commit/d2fc2a0)), closes [#266](https://github.com/showdownjs/showdown/issues/266) [#308](https://github.com/showdownjs/showdown/issues/308)



<a name="1.5.0"></a>
# [1.5.0](https://github.com/showdownjs/showdown/compare/1.4.4...1.5.0) (2016-11-11)


### Bug Fixes

* **lists:** enforce 4 space indentation in sublists ([d51be6e](https://github.com/showdownjs/showdown/commit/d51be6e))
* **lists:** fix sublists inconsistent behavior ([9cfe8b1](https://github.com/showdownjs/showdown/commit/9cfe8b1)), closes [#299](https://github.com/showdownjs/showdown/issues/299)

### Features

* **disableForced4SpacesIndentedSublists:** option that disables the requirement of indenting nested sublists by 4 spaces. The option is disabled by default ([0be39bc](https://github.com/showdownjs/showdown/commit/0be39bc))


### BREAKING CHANGES

* syntax for sublists is now more restrictive. Before, sublists SHOULD be
indented by 4 spaces, but indenting at least 2 spaces would work. 
Now, sublists MUST be indented 4 spaces or they won't work.

With this input:
```md
* one
  * two
    * three
```

Before (ouput):
```html
<ul>
  <li>one
    <ul>
      <li>two
        <ul><li>three</li></ul>
      <li>
    </ul>
  </li>
<ul>
```

After (output):
```html
<ul>
  <li>one</li>
  <li>two
    <ul><li>three</li></ul>
  </li>
</ul>
```

To migrate either fix source md files or activate the option `disableForced4SpacesIndentedSublists`:
```md
showdown.setOption('disableForced4SpacesIndentedSublists', true);
```


<a name="1.4.4"></a>
# [1.4.4](https://github.com/showdownjs/showdown/compare/1.4.3...1.4.4) (2016-11-02)


### Bug Fixes

* make some regexes a bit faster and make tab char equivalent to 4 spaces ([b7e7560](https://github.com/showdownjs/showdown/commit/b7e7560))
* **double linebreaks:** fix double linebreaks in html output ([f97e072](https://github.com/showdownjs/showdown/commit/f97e072)), closes [#291](https://github.com/showdownjs/showdown/issues/291)
* **lists linebreaks:** fix lists linebreaks in html output ([2b813cd](https://github.com/showdownjs/showdown/commit/2b813cd)), closes [#291](https://github.com/showdownjs/showdown/issues/291)
* **parser:** fix issue with comments inside nested code blocks ([799abea](https://github.com/showdownjs/showdown/commit/799abea)), closes [#288](https://github.com/showdownjs/showdown/issues/288)



<a name="1.4.3"></a>
# [1.4.3](https://github.com/showdownjs/showdown/compare/1.4.2...1.4.3) (2016-08-19)


### Bug Fixes

* **bower:** fix sourceMappingURL errors in bower by including source ([9b5a233](https://github.com/showdownjs/showdown/commit/9b5a233)), closes [#200](https://github.com/showdownjs/showdown/issues/200)
* **comments:** Fix html comment parser ([238726c](https://github.com/showdownjs/showdown/commit/238726c)), closes [#276](https://github.com/showdownjs/showdown/issues/276)
* **ie8 compatibility:** Improve ie8 compatibility ([984942e](https://github.com/showdownjs/showdown/commit/984942e)), closes [#275](https://github.com/showdownjs/showdown/issues/275) [#271](https://github.com/showdownjs/showdown/issues/271)
* **simplifiedAutoLink:** fix simplified autolink to match GFM behavior ([0cc55b0](https://github.com/showdownjs/showdown/commit/0cc55b0)), closes [#284](https://github.com/showdownjs/showdown/issues/284) [#285](https://github.com/showdownjs/showdown/issues/285)



<a name="1.4.2"></a>
# [1.4.2](https://github.com/showdownjs/showdown/compare/1.4.1...1.4.2) (2016-06-21)


### Bug Fixes

* **image-parser:** fix ref style imgs after inline style imgs not parsing correctly ([73206b0](https://github.com/showdownjs/showdown/commit/73206b0)), closes [#261](https://github.com/showdownjs/showdown/issues/261)
* **tables:** add check for undefined on text due to failing to parse tables ([6e30a48](https://github.com/showdownjs/showdown/commit/6e30a48)), author [stewartmckee](https://github.com/stewartmckee), closes [#257](https://github.com/showdownjs/showdown/pull/247)

### Features

* **smart-indent-fix:** fix for es6 indentation problems ([261f127](https://github.com/showdownjs/showdown/commit/261f127)), closes [#259](https://github.com/showdownjs/showdown/issues/259)



<a name="1.4.1"></a>
# [1.4.1](https://github.com/showdownjs/showdown/compare/1.4.0...1.4.1) (2016-05-17)


### Bug Fixes

* **tables:** fix table heading separators requiring 3 dashes instead of 2 ([ddaacfc](https://github.com/showdownjs/showdown/commit/ddaacfc)), closes [#256](https://github.com/showdownjs/showdown/issues/256)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/showdownjs/showdown/compare/1.3.0...1.4.0) (2016-05-13)


### Bug Fixes

* **hashHTMLBlock:** fix issue with html breaking markdown parsing ([2746949](https://github.com/showdownjs/showdown/commit/2746949)), closes [#220](https://github.com/showdownjs/showdown/issues/220)
* **HTMLParser:** fix code tags parsing ([71a5873](https://github.com/showdownjs/showdown/commit/71a5873)), closes [#231](https://github.com/showdownjs/showdown/issues/231)
* **HTMLParser:** fix ghCodeBlocks being parsed inside code tags ([7d0436d](https://github.com/showdownjs/showdown/commit/7d0436d)), closes [#229](https://github.com/showdownjs/showdown/issues/229)
* **strikethrough:** Fix strikethrough issue with escaped chars ([5669317](https://github.com/showdownjs/showdown/commit/5669317)), closes [#214](https://github.com/showdownjs/showdown/issues/214)
* **tables:** fix tables to match github's md spec ([f58f014](https://github.com/showdownjs/showdown/commit/f58f014)), closes [#230](https://github.com/showdownjs/showdown/issues/230)

### Features

* **markdown="1":** enable parsing markdown inside HTML blocks ([c97f1dc](https://github.com/showdownjs/showdown/commit/c97f1dc)), closes [#178](https://github.com/showdownjs/showdown/issues/178)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/showdownjs/showdown/compare/1.2.3...1.3.0) (2015-10-19)


### Bug Fixes

* **literalMidWordUnderscores:** fix different behavior with asterisks ([e86aea8](https://github.com/showdownjs/showdown/commit/e86aea8)), closes [#198](https://github.com/showdownjs/showdown/issues/198)
* **simpleautolink:** fix mail simpleAutoLink to ignore urls with @ symbol ([8ebb25e](https://github.com/showdownjs/showdown/commit/8ebb25e)), closes [#204](https://github.com/showdownjs/showdown/issues/204)

### Features

* **eventDispatcher:** add an event dispatcher to converter ([2734326](https://github.com/showdownjs/showdown/commit/2734326))
* **hashHTMLSpans:** add support for hashing span elements ([3097bd4](https://github.com/showdownjs/showdown/commit/3097bd4)), closes [#196](https://github.com/showdownjs/showdown/issues/196) [#175](https://github.com/showdownjs/showdown/issues/175)


<a name"1.2.3"></a>
# [1.2.3](https://github.com/showdownjs/showdown/compare/1.2.2...1.2.3) (2015-08-27)


### Bug Fixes

* **blockGamut:** fix for headings inside blockquotes ([3df70624](http://github.com/showdownjs/showdown/commit/3df70624), closes [#191](http://github.com/showdownjs/showdown/issues/191))
* **blockQuote:** fix 'github style codeblocks' not being parsed inside 'blockquote' ([ed2cf595](http://github.com/showdownjs/showdown/commit/ed2cf595), closes [#192](http://github.com/showdownjs/showdown/issues/192))
* **simpleAutoLinks:** fix emails being treated as simple urls ([7dc3fb1d](http://github.com/showdownjs/showdown/commit/7dc3fb1d), closes [#187](http://github.com/showdownjs/showdown/issues/187))
* **tables:** fix md tables being parsed inside indented code blocks. ([50256233](http://github.com/showdownjs/showdown/commit/50256233), closes [#193](http://github.com/showdownjs/showdown/issues/193))


<a name"1.2.2"></a>
# [1.2.2](https://github.com/showdownjs/showdown/compare/1.2.1...1.2.2) (2015-08-02)


### Bug Fixes

* **lists:** fix github code blocks not being parsed inside lists ([7720c88b](http://github.com/showdownjs/showdown/commit/7720c88b), closes [#142](http://github.com/showdownjs/showdown/issues/142), [#183](http://github.com/showdownjs/showdown/issues/183), [#184](http://github.com/showdownjs/showdown/issues/184))


<a name"1.2.1"></a>
# [1.2.1](https://github.com/showdownjs/showdown/compare/1.2.0...1.2.1) (2015-07-22)


### Features

* **smoothLivePreview:** fix weird effects due to parsing incomplete input ([62ba3733](http://github.com/showdownjs/showdown/commit/62ba3733))
* **subParsers/githubCodeBlock:** add extra language class to conform to html5 spec ([b7f5e32](http://github.com/showdownjs/showdown/commit/b7f5e32))


### Bug Fixes

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
# [1.2.0](https://github.com/showdownjs/showdown/compare/1.1.0...1.2.0) (2015-07-13)

This release moves some of the most popular extensions (such as table-extension and github-extension) to core.
Also introduces a simple cli tool that you can use to quickly convert markdown files into html. 


### Bug Fixes

* **headerLevelStart:** fix for NaN error when specifying a non number as headerLevelStart param ([be72b487](http://github.com/showdownjs/showdown/commit/be72b487))


### Features

* **CLI:** simple cli tool (ALPHA) ([f6a33e40](http://github.com/showdownjs/showdown/commit/f6a33e40))
* **flavours:** add markdown presets/flavors ([7e55bceb](http://github.com/showdownjs/showdown/commit/7e55bceb), closes [#164](http://github.com/showdownjs/showdown/issues/164))
* **ghCodeBlocks:** add option to disable GH codeblocks ([c33f9888](http://github.com/showdownjs/showdown/commit/c33f9888))
* **literalMidWordUnderscores:**  add support for GFM literal midword underscores ([0c0cd7db](http://github.com/showdownjs/showdown/commit/0c0cd7db))
* **simplifiedAutoLink:** add support for GFM autolinks ([cff02372](http://github.com/showdownjs/showdown/commit/cff02372))
* **strikethrough:**  add support for GFM strikethrough ([43e9448d](http://github.com/showdownjs/showdown/commit/43e9448d))
* **tables:**  add support for GFM tables ([3a924e3c](http://github.com/showdownjs/showdown/commit/3a924e3c))
* **tasklists:** add support for GFM tasklists ([dc72403a](http://github.com/showdownjs/showdown/commit/dc72403a))


<a name"1.1.0"></a>
# [1.1.0](https://github.com/showdownjs/showdown/compare/1.0.2...1.1.0) (2015-06-18)


### Bug Fixes

* **converter.js:** add error if the passed constructor argument is not an object ([d86ed450](http://github.com/showdownjs/showdown/commit/d86ed450))
* **output modifiers:** fix for output modifiers running twice ([dcbdc61e](http://github.com/showdownjs/showdown/commit/dcbdc61e))


### Features

* **headerLevelStart:** add support for setting the header starting level ([b84ac67d](http://github.com/showdownjs/showdown/commit/b84ac67d), closes [#69](http://github.com/showdownjs/showdown/issues/69))
* **image dimensions:** add support for setting image dimensions within markdown syntax ([af82c2b6](http://github.com/showdownjs/showdown/commit/af82c2b6), closes [#143](http://github.com/showdownjs/showdown/issues/143))
* **noHeaderId:** add option to suppress automatic generation of ids in headers ([7ac893e9](http://github.com/showdownjs/showdown/commit/7ac893e9))
* **showdown.getDefaultOptions:** add method to retrieve default global options keypairs ([2de53a7d](http://github.com/showdownjs/showdown/commit/2de53a7d))


### Breaking Changes

* Deprecates `showdown.extensions` property. To migrate, extensions should use the new method `showdown.extension(<ext name>, <extension>)` to register.
  For more information on the new extension loading mechanism, please check the wiki pages.
  ([4ebd0caa](http://github.com/showdownjs/showdown/commit/4ebd0caa))


<a name"1.0.2"></a>
# [1.0.2](https://github.com/showdownjs/showdown/compare/1.0.1...1.0.2) (2015-05-28)

### Bug Fixes

* **Gruntfile.js** add missing comma in footer. This bug prevented concatenating other js scripts and libraries
  with showdown([5315508](http://github.com/showdownjs/showdown/commit/5315508). Credits to Alexandre Courtiol.


<a name"1.0.1"></a>
# [1.0.1](https://github.com/showdownjs/showdown/compare/1.0.0...1.0.1) (2015-05-27)


### Bug Fixes

* **bower.json:** update bower.json main attribute to point to dist directory ([bc3a092f](http://github.com/showdownjs/showdown/commit/bc3a092f))


<a name"1.0.0"></a>
# [1.0.0](https://github.com/showdownjs/showdown/compare/0.3.4...1.0.0) (2015-05-27)

### Release Information
This is a major code refactor with some big changes such as:
  - showdown.js file was split in several files, called sub-parsers. This should improve code maintainability.
  - angular integration was removed from core and move to its own repository, similar to what was done with extensions
  - A new extension registering system is on the "cooks" that should reduce errors when using extensions. The old mechanism
  is kept so old extensions should be compatible.

### Bug Fixes

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

### Features

* **registerExtension():** new extension loading mechanism. Now extensions can be registered using this function.
  The system, however, is not final and will probably be changed until the final version([0fd10cb] (http://github.com/showdownjs/showdown/commit/0fd10cb))
* **allowBlockIndents:** indented inline block elements can now be parsed as markdown ([f6326b84](http://github.com/showdownjs/showdown/commit/f6326b84))
* **omitExtraWLInCodeBlocks:**  add option to omit extra newline at the end of codeblocks ([141e3f5](http://github.com/showdownjs/showdown/commit/141e3f5))
* **prefixHeaderId:** add options to prefix header ids to prevent id clash ([141e3f5](http://github.com/showdownjs/showdown/commit/141e3f5))
* **Converter.options:** add getOption(), setOption() and getOptions() to Converter object ([db6f79b0](http://github.com/showdownjs/showdown/commit/db6f79b0))

### Breaking Changes
* **NAMESPACE:** showdown's namespace changed.

   To migrate your code you should update all references to `Showdown` with `showdown`.

* **Converter:** converter reference changed from `converter` to `Converter`.

   To migrate you should update all references to `Showdown.converter` with `showdown.Converter`

* **angular:** angular integration was removed from core and now lives in it's own [repository](http://github.com/showdownjs/angular/).

   If you're using angular integration, you should install ng-showdown. Ex: `bower install ng-showdown`

* **extensions:** showdown extensions were removed from core package and now live in their own repository. See the [project's github page](https://github.com/showdownjs) for available extensions
