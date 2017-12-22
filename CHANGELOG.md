<a name="1.8.6"></a>
## [1.8.6](https://github.com/showdownjs/showdown/compare/1.8.5...1.8.6) (2017-12-22)


### Features

* **splitAdjacentBlockquotes:** add option to split adjacent blockquote blocks ([da328f2](https://github.com/showdownjs/showdown/commit/da328f2)), closes [#477](https://github.com/showdownjs/showdown/issues/477)



<a name="1.8.5"></a>
# [1.8.5](https://github.com/showdownjs/showdown/compare/1.8.4...1.8.5) (2017-12-10)


### Features

* **completeHTMLDocument:** add option to output a complete HTML document ([a8427c9](https://github.com/showdownjs/showdown/commit/a8427c9))
* **metadata:** add support for embedded metadata ([63d949f](https://github.com/showdownjs/showdown/commit/63d949f)), closes [#260](https://github.com/showdownjs/showdown/issues/260)



<a name="1.8.4"></a>
## [1.8.4](https://github.com/showdownjs/showdown/compare/1.8.3...1.8.4) (2017-12-05)


### Bug Fixes

* **tables:** raw html inside code tags in tables no longer breaks tables ([4ef4c5e](https://github.com/showdownjs/showdown/commit/4ef4c5e)), closes [#471](https://github.com/showdownjs/showdown/issues/471)



<a name="1.8.3"></a>
## [1.8.3](https://github.com/showdownjs/showdown/compare/1.8.2...1.8.3) (2017-11-28)


### Bug Fixes

* **literalMidWordAsterisks:** no longer treats colon as alphanumeric char ([21194c8](https://github.com/showdownjs/showdown/commit/21194c8)), closes [#461](https://github.com/showdownjs/showdown/issues/461)
* **spanGamut:** code spans are hashed after parsing ([f4f63c5](https://github.com/showdownjs/showdown/commit/f4f63c5)), closes [#464](https://github.com/showdownjs/showdown/issues/464)
* **tables:** pipe character in code spans no longer breaks table ([0c933a0](https://github.com/showdownjs/showdown/commit/0c933a0)), closes [#465](https://github.com/showdownjs/showdown/issues/465)



<a name="1.8.2"></a>
## [1.8.2](https://github.com/showdownjs/showdown/compare/1.8.1...1.8.2) (2017-11-11)


### Bug Fixes

* **fenced codeblocks:** add tilde as fenced code block delimiter ([c956ede](https://github.com/showdownjs/showdown/commit/c956ede)), closes [#456](https://github.com/showdownjs/showdown/issues/456)
* **openLinksInNewWindow:** hash links are not affected by the option ([11936ec](https://github.com/showdownjs/showdown/commit/11936ec)), closes [#457](https://github.com/showdownjs/showdown/issues/457)



<a name="1.8.1"></a>
## [1.8.1](https://github.com/showdownjs/showdown/compare/1.8.0...1.8.1) (2017-11-01)


### Dependencies update

* **package:** update yargs to version 10.0.3 ([#447](https://github.com/showdownjs/showdown/issues/447)) ([906b26d](https://github.com/showdownjs/showdown/commit/906b26d))

### Bug Fixes

* **CDNjs:** bump version to fix version missmatch with CDNjs ([#452](https://github.com/showdownjs/showdown/issues/452))


<a name="1.8.0"></a>
# [1.8.0](https://github.com/showdownjs/showdown/compare/1.7.6...1.8.0) (2017-10-24)

### NOTICE

Don't use the CDNjs version of this release. See issue [#452](https://github.com/showdownjs/showdown/issues/452) for more details.


### Bug Fixes

* **autolinks:** prevent _ and * to be parsed in links ([61929bb](https://github.com/showdownjs/showdown/commit/61929bb)), closes [#444](https://github.com/showdownjs/showdown/issues/444)


### Features

* **ellipsis:** add auto-ellipsis support ([25f1978](https://github.com/showdownjs/showdown/commit/25f1978))

  - *Example:*
    
      input
    
      ```md
      this is an ellipsis...
      ```
        
      output
    
      ```html
      <p>this is an ellipsis…</p>
      ```

* **emoji:** add emoji support through option `emoji`([5b8f1d3](https://github.com/showdownjs/showdown/commit/5b8f1d3)), closes [#448](https://github.com/showdownjs/showdown/issues/448)

  - *Usage:*
    
      ```js
      var conv = new showdown.Converter({emoji: true});
      ```      
    
  - *Example:*
    
      input
    
      ```md
      this is a smile :smile: emoji
      ```
        
      output
    
      ```html
      <p>this is a smile 😄 emoji</p>
      ```
    
* **start ordered lists at an arbitrary number:** add support for defining the first item number of ordered lists ([9cdc35e](https://github.com/showdownjs/showdown/commit/9cdc35e)), closes [#377](https://github.com/showdownjs/showdown/issues/377)

  - *Example:*
    
      input

       ```md
       3. foo
       4. bar
       5. baz
       ```

      output
    
      ```html
      <ol start="3">
        <li>foo</li>
        <li>bar</li>
        <li>baz</li>
      </ol>
      ```

* **underline:** add EXPERIMENTAL support for underline ([084b819](https://github.com/showdownjs/showdown/commit/084b819)), closes [#450](https://github.com/showdownjs/showdown/issues/450)

  - *Usage:*
    
      ```js
      var conv = new showdown.Converter({underline: true});
      ```
    
  - *Example:*
    
      input
    
      ```md
      this is __underlined__ and this is ___also underlined___
      ```
        
      output
    
      ```html
      <p>this is <u>underlined</u> and this is <u>also underlined</u></p>
      ```
	
  - *Note:*	With this option enabled, underscore no longer parses as `<em>` or `<strong>`	  
			
### BREAKING CHANGES

* start ordered lists at an arbitrary number: Since showdown now supports starting ordered lists at an arbitrary number, 
list output may differ.



<a name="1.7.6"></a>
## [1.7.6](https://github.com/showdownjs/showdown/compare/1.7.5...1.7.6) (2017-10-06)


### Bug Fixes

* **tables:** tables are properly rendered when followed by a single linebreak and a list ([d88b095](https://github.com/showdownjs/showdown/commit/d88b095)), closes [#443](https://github.com/showdownjs/showdown/issues/443)
* **tables:** trailing spaces no longer prevent table parsing ([66bdd21](https://github.com/showdownjs/showdown/commit/66bdd21)), closes [#442](https://github.com/showdownjs/showdown/issues/442)



<a name="1.7.5"></a>
## [1.7.5](https://github.com/showdownjs/showdown/compare/1.7.4...1.7.5) (2017-10-02)


### Bug Fixes

* **html-comments:** changed regex to precent malformed long comment to freeze showdown ([3efcd10](https://github.com/showdownjs/showdown/commit/3efcd10)), closes [#439](https://github.com/showdownjs/showdown/issues/439)



<a name="1.7.4"></a>
## [1.7.4](https://github.com/showdownjs/showdown/compare/1.7.3...1.7.4) (2017-09-08)


### Bug Fixes

* **helper.isArray:** replace a.constructor === Array with Array.isArray ([466a2eb](https://github.com/showdownjs/showdown/commit/466a2eb)), closes [#425](https://github.com/showdownjs/showdown/issues/425)
* **loader:** allow AMD loader to be used within Node env  ([ff24bdb](https://github.com/showdownjs/showdown/commit/ff24bdb))


### Features

* **base64-wrapping:** support for wrapping base64 strings ([8c593a4](https://github.com/showdownjs/showdown/commit/8c593a4)), closes [#429](https://github.com/showdownjs/showdown/issues/429)



<a name="1.7.3"></a>
## [1.7.3](https://github.com/showdownjs/showdown/compare/1.7.2...1.7.3) (2017-08-23)


### Bug Fixes

* **github flavor:** add backslashEscapesHTMLTags to GFM flavor ([5284439](https://github.com/showdownjs/showdown/commit/5284439))
* **literalMidWordAsterisks:** option no longer treats punctuation as word character ([8f05be7](https://github.com/showdownjs/showdown/commit/8f05be7)), closes [#398](https://github.com/showdownjs/showdown/issues/398)
* **tables:** allow for one column table ([fef110c](https://github.com/showdownjs/showdown/commit/fef110cccb2d02b218183398d9baa0ae256a7283)), closes [#406](https://github.com/showdownjs/showdown/issues/406)

### Features

* **rawHeaderId:** Remove only spaces, ' and " from generated header ids ([1791cf0](https://github.com/showdownjs/showdown/commit/1791cf0)), closes [#409](https://github.com/showdownjs/showdown/issues/409)
* **rawPrefixHeaderId:** add option to prevent showdown from modifying the prefix ([ff26c08](https://github.com/showdownjs/showdown/commit/ff26c08)), closes [#409](https://github.com/showdownjs/showdown/issues/409)



<a name="1.7.2"></a>
## [1.7.2](https://github.com/showdownjs/showdown/compare/1.7.1...1.7.2) (2017-08-05)


### Bug Fixes

* **githubMentions:** githubMentions now works with openLinksInNewWindow options ([1194d88](https://github.com/showdownjs/showdown/commit/1194d88)), closes [#403](https://github.com/showdownjs/showdown/issues/403)
* **lists:** fix multi paragraph lists with sublists ([a2259c0](https://github.com/showdownjs/showdown/commit/a2259c0)), closes [#397](https://github.com/showdownjs/showdown/issues/397)
* **tablesHeaderId:** fix missmatch of option name ([51e4693](https://github.com/showdownjs/showdown/commit/51e4693)), closes [#412](https://github.com/showdownjs/showdown/issues/412)


### Features

* **backslashEscapesHTMLTags:** backslash escapes HTML tags ([5a5aff6](https://github.com/showdownjs/showdown/commit/5a5aff6)), closes [#374](https://github.com/showdownjs/showdown/issues/374)



<a name="1.7.1"></a>
## [1.7.1](https://github.com/showdownjs/showdown/compare/1.7.0...1.7.1) (2017-06-02)

Important HOTFIX

### Bug Fixes

* **HTML Parser:** fix nasty bug where malformed HTML would hang showdown ([6566c72](https://github.com/showdownjs/showdown/commit/6566c72)), closes [#393](https://github.com/showdownjs/showdown/issues/393)



<a name="1.7.0"></a>
## [1.7.0](https://github.com/showdownjs/showdown/compare/1.6.4...1.7.0) (2017-06-01)

(DEPRECATED)

### Bug Fixes

* **anchors:** fix issue with brackets in link URL ([7ba18dd](https://github.com/showdownjs/showdown/commit/7ba18dd)), closes [#390](https://github.com/showdownjs/showdown/issues/390)
* **excludeTrailingPunctuationFromURL:** add comma to punctuation list ([fa35fd5](https://github.com/showdownjs/showdown/commit/fa35fd5)), closes [#354](https://github.com/showdownjs/showdown/issues/354)
* **excludeTrailingPunctuationFromURLs:** fix weird character when this option with simplifiedAutoLinks ([71acff5](https://github.com/showdownjs/showdown/commit/71acff5)), closes [#378](https://github.com/showdownjs/showdown/issues/378)
* **HTML parsing:** fix HTML parsing issues with nested tags ([6fbc072](https://github.com/showdownjs/showdown/commit/6fbc072)), closes [#357](https://github.com/showdownjs/showdown/issues/357) [#387](https://github.com/showdownjs/showdown/issues/387)
* **openLinksInNewWindow:** encode _ to prevent clash with em ([813f832](https://github.com/showdownjs/showdown/commit/813f832)), closes [#379](https://github.com/showdownjs/showdown/issues/379)
* **package:** update yargs to version 7.0.1 ([#349](https://github.com/showdownjs/showdown/issues/349)) ([9308d7b](https://github.com/showdownjs/showdown/commit/9308d7b))
* **package:** update yargs to version 8.0.1 ([#385](https://github.com/showdownjs/showdown/issues/385)) ([5fd847b](https://github.com/showdownjs/showdown/commit/5fd847b))
* **simpleAutoLinks:** URLs with emphasis/strikethrough are parsed ([5c50675](https://github.com/showdownjs/showdown/commit/5c50675)), closes [#347](https://github.com/showdownjs/showdown/issues/347)
* **tables:** pipe char can now be escaped ([1ebc195](https://github.com/showdownjs/showdown/commit/1ebc195)), closes [#345](https://github.com/showdownjs/showdown/issues/345)
* **url parsing:** fix url edge case parsing in images and links ([30aa18c](https://github.com/showdownjs/showdown/commit/30aa18c))


### Features

* **customizeHeaderId:** add option for customizing header ids ([94c570a](https://github.com/showdownjs/showdown/commit/94c570a)), closes [#383](https://github.com/showdownjs/showdown/issues/383)
* **images:** add support for image's implicit reference syntax ([0c6c07b](https://github.com/showdownjs/showdown/commit/0c6c07b)), closes [#366](https://github.com/showdownjs/showdown/issues/366)
* **literalMidWordAsterisks:** add option for mid word asterisks ([5bec8f9](https://github.com/showdownjs/showdown/commit/5bec8f9))
* **openLinksInNewWindow:** add option to open all links in a new window ([50235d6](https://github.com/showdownjs/showdown/commit/50235d6)), closes [#362](https://github.com/showdownjs/showdown/issues/362) [#337](https://github.com/showdownjs/showdown/issues/337) [#249](https://github.com/showdownjs/showdown/issues/249) [#247](https://github.com/showdownjs/showdown/issues/247) [#222](https://github.com/showdownjs/showdown/issues/222)



<a name="1.6.4"></a>
## [1.6.4](https://github.com/showdownjs/showdown/compare/1.6.3...1.6.4) (2017-02-06)


### Bug Fixes

* **encodeAmpsAndAngles:** fix > and < encoding ([7f43b79](https://github.com/showdownjs/showdown/commit/7f43b79)), closes [#236](https://github.com/showdownjs/showdown/issues/236)
* **encodeEmail:** now produces valid emails ([605d8b7](https://github.com/showdownjs/showdown/commit/605d8b7)), closes [#340](https://github.com/showdownjs/showdown/issues/340)
* **flavor: github:** new version of github does not use prefix 'user-content' in headers ([368f0b6](https://github.com/showdownjs/showdown/commit/368f0b6))
* **hashCodeTags:** escape code tags ([41cb3f6](https://github.com/showdownjs/showdown/commit/41cb3f6)), closes [#339](https://github.com/showdownjs/showdown/issues/339)
* **italicsAndBold:** fix double emphasis edge case ([1832b7f](https://github.com/showdownjs/showdown/commit/1832b7f))
* **paragraph:** workaround QML bug ([f7a429e](https://github.com/showdownjs/showdown/commit/f7a429e)), closes [#246](https://github.com/showdownjs/showdown/issues/246) [#338](https://github.com/showdownjs/showdown/issues/338)
* **prefixHeaderId:** make `prefixHeaderId` string be parsed along the generated id ([f641a7d](https://github.com/showdownjs/showdown/commit/f641a7d))


### Features

* **flavor: ghost:** add Ghost flavor ([6374b5b](https://github.com/showdownjs/showdown/commit/6374b5b))
* **flavor: original:** add John Gruber's markdown flavor ([6374b5b](https://github.com/showdownjs/showdown/commit/6374b5b))



<a name="1.6.3"></a>
## [1.6.3](https://github.com/showdownjs/showdown/compare/1.6.2...1.6.3) (2017-01-30)


### Bug Fixes

* **codeSpans:** add - and = to escaped chars inside code spans ([4243a31](https://github.com/showdownjs/showdown/commit/4243a31))
* **italicsAndBold:** fix inconsistency in italicsAndBold parsing ([a4f05d4](https://github.com/showdownjs/showdown/commit/a4f05d4)), closes [#332](https://github.com/showdownjs/showdown/issues/332)
* **literalMidWordUnderscores:** fix inconsistent behavior of emphasis and strong with literalMidWordUndescores ([0292ae0](https://github.com/showdownjs/showdown/commit/0292ae0)), closes [#333](https://github.com/showdownjs/showdown/issues/333)
* **paragraphs:** fix empty lines generating empty paragraphs ([54bf744](https://github.com/showdownjs/showdown/commit/54bf744)), closes [#334](https://github.com/showdownjs/showdown/issues/334)
* **strikethrough:** fix striketrough being wrongly parsed inside codeSpans ([169cbe8](https://github.com/showdownjs/showdown/commit/169cbe8))

### Features

* **events:** add events to all subparsers ([7d63a3e](https://github.com/showdownjs/showdown/commit/7d63a3e))



<a name="1.6.2"></a>
## [1.6.2](https://github.com/showdownjs/showdown/compare/1.6.1...1.6.2) (2017-01-29)


### Bug Fixes

* **escapeSpecialCharsWithinTagAttributes:** add ~ and = to escaped chars ([bfcc0e4](https://github.com/showdownjs/showdown/commit/bfcc0e4))
* **strikethrough:** allow escapinging tilde char ([24d47d7](https://github.com/showdownjs/showdown/commit/24d47d7)), closes [#331](https://github.com/showdownjs/showdown/issues/331)

### Features

* **ghMentionsLink:** add ability to define the generated url in @mentions ([a4c24c9](https://github.com/showdownjs/showdown/commit/a4c24c9))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/showdownjs/showdown/compare/1.6.0...1.6.1) (2017-01-28)


### Bug Fixes

* **simplifiedAutoLink:** fix missing spaces before and after email addresses ([5190b6a](https://github.com/showdownjs/showdown/commit/5190b6a)), closes [#330](https://github.com/showdownjs/showdown/issues/330)

### Features

* **encodeEmail:** add option to enable/disable mail obfuscation ([90c52b8](https://github.com/showdownjs/showdown/commit/90c52b8))

### Notes

This release also improves performance a bit (around 8%)



<a name="1.6.0"></a>
## [1.6.0](https://github.com/showdownjs/showdown/compare/1.5.5...1.6.0) (2017-01-09)


### Bug Fixes

* **ghCompatibleHeaderId:** improve the number of removed chars ([d499feb](https://github.com/showdownjs/showdown/commit/d499feb))
* **IE8:** fix for IE8 error on using isUndefined function ([561dc5f](https://github.com/showdownjs/showdown/commit/561dc5f)), closes [#280](https://github.com/showdownjs/showdown/issues/280)
* **options:** fix ghCompatibleHeaderId that was set as string instead of boolean ([de7c37e](https://github.com/showdownjs/showdown/commit/de7c37e))
* **simpleLineBreaks:** fix simpleLineBreaks option not working with non-ASCII chars and markdown delimiters ([b1c458a](https://github.com/showdownjs/showdown/commit/b1c458a)), closes [#318](https://github.com/showdownjs/showdown/issues/318) [#323](https://github.com/showdownjs/showdown/issues/323)

### Features

* **CLI:** add -q (quiet) and -m (mute) mode to CLI ([f3b86f0](https://github.com/showdownjs/showdown/commit/f3b86f0))
* **CLI:flavor:** add flavor option to CLI ([2d6cd1e](https://github.com/showdownjs/showdown/commit/2d6cd1e))
* **getFlavor:** add getFlavor method to showdown and Converter ([0eaf105](https://github.com/showdownjs/showdown/commit/0eaf105))
* **ghMentions:** add support for github's @mentions ([f2671c0](https://github.com/showdownjs/showdown/commit/f2671c0)), closes [#51](https://github.com/showdownjs/showdown/issues/51)

### BREAKING CHANGES:

* CLI tool now uses the same option defaults as showdown main library. This mean
  the default flavor is vanilla and ghCodeBlocks options is enabled by default.
    
    To update, add `--ghCodeBlocks="false"` to the command.


<a name="1.5.5"></a>
## [1.5.5](https://github.com/showdownjs/showdown/compare/1.5.4...1.5.5) (2016-12-30)

### Features

* **ghCompatibleHeaderId:** generate header ids compatible with github ([db97a90](https://github.com/showdownjs/showdown/commit/db97a90)), closes [#320](https://github.com/showdownjs/showdown/issues/320) [#321](https://github.com/showdownjs/showdown/issues/321)



<a name="1.5.4"></a>
## [1.5.4](https://github.com/showdownjs/showdown/compare/1.5.3...1.5.4) (2016-12-21)


### Bug Fixes

* **horizontal rule:** revert backwards incompatibility change ([113f5f6](https://github.com/showdownjs/showdown/commit/113f5f6)), closes [#317](https://github.com/showdownjs/showdown/issues/317)
* **simpleLineBreaks:** fix simpleLineBreak option breaking lists html ([ed4c33f](https://github.com/showdownjs/showdown/commit/ed4c33f)), closes [#316](https://github.com/showdownjs/showdown/issues/316)



<a name="1.5.3"></a>
## [1.5.3](https://github.com/showdownjs/showdown/compare/1.5.2...1.5.3) (2016-12-19)


### Bug Fixes

* parser slowness with certain inputs ([da8fb53](https://github.com/showdownjs/showdown/commit/da8fb53)), closes [#315](https://github.com/showdownjs/showdown/issues/315)

### Features

* **requireSpaceBeforeHeadingText:** option to make space between `#` and header text mandatory ([5d19877](https://github.com/showdownjs/showdown/commit/5d19877)), closes [#277](https://github.com/showdownjs/showdown/issues/277)



<a name="1.5.2"></a>
## [1.5.2](https://github.com/showdownjs/showdown/compare/1.5.1...1.5.2) (2016-12-17)


### Bug Fixes

* **listeners:** fix listeners typo ([f0d25b7](https://github.com/showdownjs/showdown/commit/f0d25b7)), closes [#290](https://github.com/showdownjs/showdown/issues/290)
* **lists:** lines with mutiple dashes being parsed as multilists ([10b3410](https://github.com/showdownjs/showdown/commit/10b3410)), closes [#312](https://github.com/showdownjs/showdown/issues/312)
* **nbsp:** nbsp are replaced with simple spaces ([6e90f7c](https://github.com/showdownjs/showdown/commit/6e90f7c))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/showdownjs/showdown/compare/1.5.0...1.5.1) (2016-12-01)


### Features

* **simpleLineBreaks:** option that parses linebreaks as <br />. This option enables linebreaks to always be treated as `<br />` tags 
  without needing to add spaces in front of the line, the same way GitHub does. ([0942b5e](https://github.com/showdownjs/showdown/commit/0942b5e)), closes [#206](https://github.com/showdownjs/showdown/issues/206)
* **excludeTrailingPunctuationFromURLs:** option that excludes trailing punctuation from auto linked URLs. ([d2fc2a0](https://github.com/showdownjs/showdown/commit/d2fc2a0)), closes [#266](https://github.com/showdownjs/showdown/issues/266) [#308](https://github.com/showdownjs/showdown/issues/308)



<a name="1.5.0"></a>
## [1.5.0](https://github.com/showdownjs/showdown/compare/1.4.4...1.5.0) (2016-11-11)


### Bug Fixes

* **lists:** enforce 4 space indentation in sublists ([d51be6e](https://github.com/showdownjs/showdown/commit/d51be6e))
* **lists:** fix sublists inconsistent behavior ([9cfe8b1](https://github.com/showdownjs/showdown/commit/9cfe8b1)), closes [#299](https://github.com/showdownjs/showdown/issues/299)

### Features

* **disableForced4SpacesIndentedSublists:** option that disables the requirement of indenting nested sublists by 4 spaces. The option is disabled by default ([0be39bc](https://github.com/showdownjs/showdown/commit/0be39bc))


### BREAKING CHANGES

* syntax for sublists is now more restrictive. Before, sublists SHOULD be indented by 4 spaces, but indenting at least 2 spaces would work. 
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
## [1.4.4](https://github.com/showdownjs/showdown/compare/1.4.3...1.4.4) (2016-11-02)


### Bug Fixes

* make some regexes a bit faster and make tab char equivalent to 4 spaces ([b7e7560](https://github.com/showdownjs/showdown/commit/b7e7560))
* **double linebreaks:** fix double linebreaks in html output ([f97e072](https://github.com/showdownjs/showdown/commit/f97e072)), closes [#291](https://github.com/showdownjs/showdown/issues/291)
* **lists linebreaks:** fix lists linebreaks in html output ([2b813cd](https://github.com/showdownjs/showdown/commit/2b813cd)), closes [#291](https://github.com/showdownjs/showdown/issues/291)
* **parser:** fix issue with comments inside nested code blocks ([799abea](https://github.com/showdownjs/showdown/commit/799abea)), closes [#288](https://github.com/showdownjs/showdown/issues/288)



<a name="1.4.3"></a>
## [1.4.3](https://github.com/showdownjs/showdown/compare/1.4.2...1.4.3) (2016-08-19)


### Bug Fixes

* **bower:** fix sourceMappingURL errors in bower by including source ([9b5a233](https://github.com/showdownjs/showdown/commit/9b5a233)), closes [#200](https://github.com/showdownjs/showdown/issues/200)
* **comments:** Fix html comment parser ([238726c](https://github.com/showdownjs/showdown/commit/238726c)), closes [#276](https://github.com/showdownjs/showdown/issues/276)
* **ie8 compatibility:** Improve ie8 compatibility ([984942e](https://github.com/showdownjs/showdown/commit/984942e)), closes [#275](https://github.com/showdownjs/showdown/issues/275) [#271](https://github.com/showdownjs/showdown/issues/271)
* **simplifiedAutoLink:** fix simplified autolink to match GFM behavior ([0cc55b0](https://github.com/showdownjs/showdown/commit/0cc55b0)), closes [#284](https://github.com/showdownjs/showdown/issues/284) [#285](https://github.com/showdownjs/showdown/issues/285)



<a name="1.4.2"></a>
## [1.4.2](https://github.com/showdownjs/showdown/compare/1.4.1...1.4.2) (2016-06-21)


### Bug Fixes

* **image-parser:** fix ref style imgs after inline style imgs not parsing correctly ([73206b0](https://github.com/showdownjs/showdown/commit/73206b0)), closes [#261](https://github.com/showdownjs/showdown/issues/261)
* **tables:** add check for undefined on text due to failing to parse tables ([6e30a48](https://github.com/showdownjs/showdown/commit/6e30a48)), author [stewartmckee](https://github.com/stewartmckee), closes [#257](https://github.com/showdownjs/showdown/pull/247)

### Features

* **smart-indent-fix:** fix for es6 indentation problems ([261f127](https://github.com/showdownjs/showdown/commit/261f127)), closes [#259](https://github.com/showdownjs/showdown/issues/259)



<a name="1.4.1"></a>
## [1.4.1](https://github.com/showdownjs/showdown/compare/1.4.0...1.4.1) (2016-05-17)


### Bug Fixes

* **tables:** fix table heading separators requiring 3 dashes instead of 2 ([ddaacfc](https://github.com/showdownjs/showdown/commit/ddaacfc)), closes [#256](https://github.com/showdownjs/showdown/issues/256)



<a name="1.4.0"></a>
## [1.4.0](https://github.com/showdownjs/showdown/compare/1.3.0...1.4.0) (2016-05-13)


### Bug Fixes

* **hashHTMLBlock:** fix issue with html breaking markdown parsing ([2746949](https://github.com/showdownjs/showdown/commit/2746949)), closes [#220](https://github.com/showdownjs/showdown/issues/220)
* **HTMLParser:** fix code tags parsing ([71a5873](https://github.com/showdownjs/showdown/commit/71a5873)), closes [#231](https://github.com/showdownjs/showdown/issues/231)
* **HTMLParser:** fix ghCodeBlocks being parsed inside code tags ([7d0436d](https://github.com/showdownjs/showdown/commit/7d0436d)), closes [#229](https://github.com/showdownjs/showdown/issues/229)
* **strikethrough:** Fix strikethrough issue with escaped chars ([5669317](https://github.com/showdownjs/showdown/commit/5669317)), closes [#214](https://github.com/showdownjs/showdown/issues/214)
* **tables:** fix tables to match github's md spec ([f58f014](https://github.com/showdownjs/showdown/commit/f58f014)), closes [#230](https://github.com/showdownjs/showdown/issues/230)

### Features

* **markdown="1":** enable parsing markdown inside HTML blocks ([c97f1dc](https://github.com/showdownjs/showdown/commit/c97f1dc)), closes [#178](https://github.com/showdownjs/showdown/issues/178)



<a name="1.3.0"></a>
## [1.3.0](https://github.com/showdownjs/showdown/compare/1.2.3...1.3.0) (2015-10-19)


### Bug Fixes

* **literalMidWordUnderscores:** fix different behavior with asterisks ([e86aea8](https://github.com/showdownjs/showdown/commit/e86aea8)), closes [#198](https://github.com/showdownjs/showdown/issues/198)
* **simpleautolink:** fix mail simpleAutoLink to ignore urls with @ symbol ([8ebb25e](https://github.com/showdownjs/showdown/commit/8ebb25e)), closes [#204](https://github.com/showdownjs/showdown/issues/204)

### Features

* **eventDispatcher:** add an event dispatcher to converter ([2734326](https://github.com/showdownjs/showdown/commit/2734326))
* **hashHTMLSpans:** add support for hashing span elements ([3097bd4](https://github.com/showdownjs/showdown/commit/3097bd4)), closes [#196](https://github.com/showdownjs/showdown/issues/196) [#175](https://github.com/showdownjs/showdown/issues/175)


<a name"1.2.3"></a>
## [1.2.3](https://github.com/showdownjs/showdown/compare/1.2.2...1.2.3) (2015-08-27)


### Bug Fixes

* **blockGamut:** fix for headings inside blockquotes ([3df70624](http://github.com/showdownjs/showdown/commit/3df70624), closes [#191](http://github.com/showdownjs/showdown/issues/191))
* **blockQuote:** fix 'github style codeblocks' not being parsed inside 'blockquote' ([ed2cf595](http://github.com/showdownjs/showdown/commit/ed2cf595), closes [#192](http://github.com/showdownjs/showdown/issues/192))
* **simpleAutoLinks:** fix emails being treated as simple urls ([7dc3fb1d](http://github.com/showdownjs/showdown/commit/7dc3fb1d), closes [#187](http://github.com/showdownjs/showdown/issues/187))
* **tables:** fix md tables being parsed inside indented code blocks. ([50256233](http://github.com/showdownjs/showdown/commit/50256233), closes [#193](http://github.com/showdownjs/showdown/issues/193))


<a name"1.2.2"></a>
## [1.2.2](https://github.com/showdownjs/showdown/compare/1.2.1...1.2.2) (2015-08-02)


### Bug Fixes

* **lists:** fix github code blocks not being parsed inside lists ([7720c88b](http://github.com/showdownjs/showdown/commit/7720c88b), closes [#142](http://github.com/showdownjs/showdown/issues/142), [#183](http://github.com/showdownjs/showdown/issues/183), [#184](http://github.com/showdownjs/showdown/issues/184))


<a name"1.2.1"></a>
## [1.2.1](https://github.com/showdownjs/showdown/compare/1.2.0...1.2.1) (2015-07-22)


### Features

* **smoothLivePreview:** fix weird effects due to parsing incomplete input ([62ba3733](http://github.com/showdownjs/showdown/commit/62ba3733))
* **subParsers/githubCodeBlock:** add extra language class to conform to html5 spec ([b7f5e32](http://github.com/showdownjs/showdown/commit/b7f5e32))


### Bug Fixes

* **tables:** 

  * fix undefined error in malformed tables ([6176977](http://github.com/showdownjs/showdown/commit/6176977))
  * add support for md span elements in table headers ([789dc18](http://github.com/showdownjs/showdown/commit/789dc18)), closes [#179](http://github.com/showdownjs/showdown/issues/179)
    
* **italicsAndBold:** 

    * fix broken em/strong tags when used with literalMidWordUnderscores ([7ee2017](http://github.com/showdownjs/showdown/commit/7ee2017)), closes [#179](http://github.com/showdownjs/showdown/issues/179)
    * fix underscores not being correctly parsed when used in conjunction with literalMidWordsUnderscores option ([c9e85f1](http://github.com/showdownjs/showdown/commit/c9e85f1))
    
* **codeSpans:** Fix issue with code html tags not being correctly escaped ([5f043ca](http://github.com/showdownjs/showdown/commit/5f043ca))

* **images:** fix alt attribute not being escaped correctly ([542194e](http://github.com/showdownjs/showdown/commit/542194e))


<a name"1.2.0"></a>
## [1.2.0](https://github.com/showdownjs/showdown/compare/1.1.0...1.2.0) (2015-07-13)

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
## [1.1.0](https://github.com/showdownjs/showdown/compare/1.0.2...1.1.0) (2015-06-18)


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
## [1.0.2](https://github.com/showdownjs/showdown/compare/1.0.1...1.0.2) (2015-05-28)

### Bug Fixes

* **Gruntfile.js** add missing comma in footer. This bug prevented concatenating other js scripts and libraries
  with showdown([5315508](http://github.com/showdownjs/showdown/commit/5315508). Credits to Alexandre Courtiol.


<a name"1.0.1"></a>
## [1.0.1](https://github.com/showdownjs/showdown/compare/1.0.0...1.0.1) (2015-05-27)


### Bug Fixes

* **bower.json:** update bower.json main attribute to point to dist directory ([bc3a092f](http://github.com/showdownjs/showdown/commit/bc3a092f))


<a name"1.0.0"></a>
## [1.0.0](https://github.com/showdownjs/showdown/compare/0.3.4...1.0.0) (2015-05-27)

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
