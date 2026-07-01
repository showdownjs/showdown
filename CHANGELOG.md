# [3.0.0-rc3](https://github.com/showdownjs/showdown/compare/3.0.0-rc2...3.0.0-rc3) (2026-07-01)


# [3.0.0-rc2](https://github.com/showdownjs/showdown/compare/3.0.0-rc1...3.0.0-rc2) (2026-07-01)

### Bug Fixes

* **build:** force LF line endings in build output and enforce via gitattributes ([73e9e53](https://github.com/showdownjs/showdown/commit/73e9e53902eae4d6a324c8ef4134ce978196a1ac))
* **deps:** restore chai 4.3.6 lockfile to fix karma-chai in CI ([184a0f2](https://github.com/showdownjs/showdown/commit/184a0f28384ff9bbe84eff88100a3d8d5f7e3d1f))


# [3.0.0-rc1](https://github.com/showdownjs/showdown/compare/2.1.0...3.0.0-rc1) (2026-06-29)

### Bug Fixes

* add polyfill method for array.isArray ([16cac70](https://github.com/showdownjs/showdown/commit/16cac70aeed7c0079db67f7a5dc31a4a8038b1f6)), closes [#497](https://github.com/showdownjs/showdown/issues/497)
* Add rel="noopener noreferrer" to links when openLinksInNewWindow is on ([caab5bb](https://github.com/showdownjs/showdown/commit/caab5bb7bc617c1721967bd1a12c633927f2aafb)), closes [#670](https://github.com/showdownjs/showdown/issues/670)
* allow escaping of colons ([a4be301](https://github.com/showdownjs/showdown/commit/a4be301331178b2ad2f14f039e871a033b9a3b75))
* **autolinks:** align GFM extended autolinks with the spec ([e24ca0d](https://github.com/showdownjs/showdown/commit/e24ca0d9041607478bec47d5d00f870f93c79f79))
* **autolinks:** link URLs and mentions inside emphasis ([f34b753](https://github.com/showdownjs/showdown/commit/f34b753724d4d1b42dcdf596445eb833f544d87b))
* **blockquote:** cap nesting depth to avoid stack overflow and quadratic blowup ([e1d508f](https://github.com/showdownjs/showdown/commit/e1d508f1e99bf410190f635042da7d1f7486c24f))
* **cli:** clearer messages for recursive globs and directory inputs ([6a74eec](https://github.com/showdownjs/showdown/commit/6a74eec87b4917805bd81d24f69eb38819a4fa82))
* **cli:** cli now works properly ([c3411a5](https://github.com/showdownjs/showdown/commit/c3411a567deb67dea983cb56d3218dc2be74992b)), closes [#893](https://github.com/showdownjs/showdown/issues/893) [#894](https://github.com/showdownjs/showdown/issues/894)
* **cli:** create batch output directories and honor trailing-slash output ([6fdcca9](https://github.com/showdownjs/showdown/commit/6fdcca9056a1c2fb8b3edcf45081c76134fcfc9b))
* **cli:** read input data using stream ([#358](https://github.com/showdownjs/showdown/issues/358)) ([1967652](https://github.com/showdownjs/showdown/commit/1967652acfff5c676052826329d82b782bbd35db)), closes [#353](https://github.com/showdownjs/showdown/issues/353)
* **cli:** remove checking stdin size ([7acd65e](https://github.com/showdownjs/showdown/commit/7acd65e498ce3df92d97e2077029b73242e505f1))
* **cmSpec:** stop escaping generated HTML from strikethrough and emoji ([0d7294d](https://github.com/showdownjs/showdown/commit/0d7294dc96fe927a8f839503868438e5290fb993))
* **commonmark:** blank lines inside an item fence keep the list tight ([10d8362](https://github.com/showdownjs/showdown/commit/10d836284c0661d6362686df9c14ae0c877f08c8)), closes [#318](https://github.com/showdownjs/showdown/issues/318)
* **commonmark:** do not mistake an indent-0 closing fence for an opener ([f16c35b](https://github.com/showdownjs/showdown/commit/f16c35b1828f69042b06ce078a080043a096e8bc)), closes [#131](https://github.com/showdownjs/showdown/issues/131)
* **commonmark:** indented code as an empty list item's first block ([32c4ac1](https://github.com/showdownjs/showdown/commit/32c4ac1e7b729c6188bdfbe5a67b766ec12b6d8a)), closes [#278](https://github.com/showdownjs/showdown/issues/278)
* **commonmark:** keep entities in raw HTML blocks verbatim ([245fdb6](https://github.com/showdownjs/showdown/commit/245fdb69d9b20b4b599031e7ad62c97dd9688879)), closes [#31](https://github.com/showdownjs/showdown/issues/31)
* **commonmark:** lazy continuation through nested block quote + list (gated) ([4891ac3](https://github.com/showdownjs/showdown/commit/4891ac377e707465121a3d3abade4c8c056a9c4c)), closes [#292](https://github.com/showdownjs/showdown/issues/292) [#293](https://github.com/showdownjs/showdown/issues/293)
* **commonmark:** per-list loose/tight respects container nesting ([d61d16d](https://github.com/showdownjs/showdown/commit/d61d16d2912f160ed0d495b6576d810c8cde73d6)), closes [#307](https://github.com/showdownjs/showdown/issues/307) [#319](https://github.com/showdownjs/showdown/issues/319)
* **commonmark:** recognize indented code revealed after a block quote ([495037a](https://github.com/showdownjs/showdown/commit/495037afd82d68a0d88fa78c83b7144309c027f4)), closes [#236](https://github.com/showdownjs/showdown/issues/236)
* **commonmark:** reference labels match on raw source, no backslash resolution ([defbf09](https://github.com/showdownjs/showdown/commit/defbf09f2128b2045dad2cf2c2f2402f49a92a18)), closes [#544](https://github.com/showdownjs/showdown/issues/544) [#194](https://github.com/showdownjs/showdown/issues/194) [#548](https://github.com/showdownjs/showdown/issues/548) [#549](https://github.com/showdownjs/showdown/issues/549)
* **commonmark:** resolve backslash escapes in normalized URLs ([10d76e8](https://github.com/showdownjs/showdown/commit/10d76e822407770aca41e0f0704370a007ca53d6)), closes [#23](https://github.com/showdownjs/showdown/issues/23) [#202](https://github.com/showdownjs/showdown/issues/202)
* **commonmark:** setext/thematic-break interference with list items (gated) ([6b46b80](https://github.com/showdownjs/showdown/commit/6b46b8063b94a3f8d23c8bea4987fe5786836319)), closes [#281](https://github.com/showdownjs/showdown/issues/281) [#282](https://github.com/showdownjs/showdown/issues/282) [#300](https://github.com/showdownjs/showdown/issues/300)
* **commonmark:** Unicode case-fold for reference labels ([a552f96](https://github.com/showdownjs/showdown/commit/a552f96227c450e2b2b549b78759c0037f55fd49)), closes [#539](https://github.com/showdownjs/showdown/issues/539)
* compress showdown emoji ([55f22de](https://github.com/showdownjs/showdown/commit/55f22de0a038b90abfb05437143ea185774cb9bc))
* **email:** now email address obfuscation always returns the same output  ([949c2bc](https://github.com/showdownjs/showdown/commit/949c2bcf868b565eb7cd0549f82ee4393b96aa4e)), closes [/stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316](https://github.com//stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316/issues/47593316)
* **flavors:** drop simpleLineBreaks from the github flavor ([43f1058](https://github.com/showdownjs/showdown/commit/43f10580f2b82d205dbc8fa0be8e734ad7c5b49c))
* **flavors:** remove the allOn flavor preset ([cdabba2](https://github.com/showdownjs/showdown/commit/cdabba2bfc6c07ae88293c22ee21a1d00d81ee62))
* **footnotes:** keep references in code spans and escaped refs literal ([718aadb](https://github.com/showdownjs/showdown/commit/718aadbbffe2c53c5b37668ef8f6fdf31e7c423d))
* **gfm-codeblock:** add support for spaces before language declaration ([1f0242c](https://github.com/showdownjs/showdown/commit/1f0242c6ea9fc6cc066276437a7628f68c4aa98e)), closes [#569](https://github.com/showdownjs/showdown/issues/569)
* **gfm-codeblocks:** leading space no longer breaks gfm codeblocks ([6259f37](https://github.com/showdownjs/showdown/commit/6259f37bd643af647171a286f2a37931c0c1f107)), closes [#523](https://github.com/showdownjs/showdown/issues/523)
* **gfmCodeBlocks:** allow the info string in gfmCodeBlocks to contain spaces ([6711425](https://github.com/showdownjs/showdown/commit/67114255ade0de5f6569c71e351c34fedc2c969f)), closes [#856](https://github.com/showdownjs/showdown/issues/856)
* **githubCodeBlock:** escape info string in generated code class ([668871d](https://github.com/showdownjs/showdown/commit/668871d73c66bc7af237d41d2fb32539ab2760b6))
* **hashHTMLBlocks:** recognise --!> as an HTML comment terminator ([32aa9e6](https://github.com/showdownjs/showdown/commit/32aa9e6d2d84eb2c9b9d6b1d6718526f225aa82b))
* **heading:** remove O(n^2) backtracking in setext heading regex ([ce94570](https://github.com/showdownjs/showdown/commit/ce94570af6a6634e45ff48a831b895c1f65f7aef))
* **headings:** inconsistent behavior in lists ([26abc7a](https://github.com/showdownjs/showdown/commit/26abc7a795d6a0dd9002b6e84de38af3d81ef3d2)), closes [#495](https://github.com/showdownjs/showdown/issues/495)
* **helpers:** allow usage in ES6 modules fix for [#676](https://github.com/showdownjs/showdown/issues/676) ([ed51972](https://github.com/showdownjs/showdown/commit/ed51972315c47b7e3341af54b51f8fe07ad90a53))
* **helpers:** update github flavored emoji to the latest ([#837](https://github.com/showdownjs/showdown/issues/837)) ([8e2b339](https://github.com/showdownjs/showdown/commit/8e2b339fe2ee4521d6f99c272464fd2c15364ab3))
* **helpers:** update octocat emoji image location; add tests ([5544e4d](https://github.com/showdownjs/showdown/commit/5544e4d995e181712221278c658f6cedf98f5338))
* **image:** honor parseImgDimensions for inline images ([fb28a68](https://github.com/showdownjs/showdown/commit/fb28a68dcae4c8ca5080c9863b822e59321244f1))
* **images:** fix error when using image references ([63763b1](https://github.com/showdownjs/showdown/commit/63763b136f8fc1a782b3ebc5543e667101ed3124)), closes [#585](https://github.com/showdownjs/showdown/issues/585)
* **images:** fix js error when using image references ([b0d475f](https://github.com/showdownjs/showdown/commit/b0d475fc087c8340d80f10a9bafb4fe1d05f6515)), closes [#585](https://github.com/showdownjs/showdown/issues/585)
* **italicsAndBold:** Make italicsAndBold lazy ([#608](https://github.com/showdownjs/showdown/issues/608)) ([4378abb](https://github.com/showdownjs/showdown/commit/4378abb4fa5a8d9913abee60b4459d3350ba8300)), closes [#544](https://github.com/showdownjs/showdown/issues/544)
* **link,image:** escape quotes in generated href/src ([4fb992c](https://github.com/showdownjs/showdown/commit/4fb992cd26631c108ec0410342630c80207ec7c6))
* **links:** a number of issues with links subparser ([d3ebff7](https://github.com/showdownjs/showdown/commit/d3ebff7ef0cde5abfc3874463946d5297fc82e78)), closes [#355](https://github.com/showdownjs/showdown/issues/355) [#534](https://github.com/showdownjs/showdown/issues/534)
* **lists:** codeblocks inside lists are now correctly parsed ([8cecdf0](https://github.com/showdownjs/showdown/commit/8cecdf0382220881e07073dae716e7679f19f4fc)), closes [#494](https://github.com/showdownjs/showdown/issues/494)
* **lists:** Fix makeMarkdown tasklist ([#846](https://github.com/showdownjs/showdown/issues/846)) ([626f661](https://github.com/showdownjs/showdown/commit/626f661e8eb8373c45d44480c0deb97823711eb8)), closes [#774](https://github.com/showdownjs/showdown/issues/774)
* **lists:** Fix tasklists to comply with GFM ([ac10478](https://github.com/showdownjs/showdown/commit/ac1047815f227618e9cbab24ce0190d5c5c26527)), closes [#655](https://github.com/showdownjs/showdown/issues/655)
* **loader:** failover to globalThis when top-level this is undefined ([7f23f79](https://github.com/showdownjs/showdown/commit/7f23f7941516e3e302045e7c878ea2ca21dfeb7f)), closes [#1017](https://github.com/showdownjs/showdown/issues/1017)
* **makehtml:** comply with CommonMark fenced-code info strings and lazy setext underlines ([17b16b7](https://github.com/showdownjs/showdown/commit/17b16b7cd05f5f569fa283d02b86f3dc064e4fb4))
* **makemarkdown.image:** fix bug width|height = auto  ([440170a](https://github.com/showdownjs/showdown/commit/440170aadc1da0b83cf45c84486cb1b140fbfb65)), closes [#622](https://github.com/showdownjs/showdown/issues/622)
* **makemarkdown.table:** col text align right ([5f85c53](https://github.com/showdownjs/showdown/commit/5f85c53910e500af52363719912d20c416bd3d83))
* **makeMarkdown:** handle <br> tags converting html to markdown ([2019694](https://github.com/showdownjs/showdown/commit/201969473a55664dcaf8f1cd530cff76664b7cbf))
* **makemarkdown:** keep a text-less checkbox list item as raw HTML ([04babdb](https://github.com/showdownjs/showdown/commit/04babdb212f0367a1d0d6ab83ed5c64cf3996a6a))
* **makemarkdown:** only reverse a checkbox to a task marker inside a list item ([15de710](https://github.com/showdownjs/showdown/commit/15de710a8ebe61eccf3e5998a08a0c6695e9c0f8))
* **makemarkdown:** start a nested list on its own line inside a list item ([78b6d49](https://github.com/showdownjs/showdown/commit/78b6d49a1b2a9f2769972180dc89f5d42a999f91))
* **mentions:** allow for usernames with dot, underscore and dash ([2ba0075](https://github.com/showdownjs/showdown/commit/2ba00751cc8e890b60585444b9dfb0a1825555e6)), closes [#574](https://github.com/showdownjs/showdown/issues/574)
* **metadata:** allow whitespaces after closing marks ([0d3ca4d](https://github.com/showdownjs/showdown/commit/0d3ca4da5a7451f585e052009c160401c103ed6e))
* **metadata:** Restore dollar signs and tremas. ([#730](https://github.com/showdownjs/showdown/issues/730)) ([ebc730c](https://github.com/showdownjs/showdown/commit/ebc730c0a05c0e4ad975d828c320ac6ca72c8dfd)), closes [#626](https://github.com/showdownjs/showdown/issues/626)
* **options:** remove the openLinksInNewWindow option ([8affebd](https://github.com/showdownjs/showdown/commit/8affebd26426b06eb55a82c42726327c53f7bdd9))
* **package:** update yargs to version 11.0.0 ([#491](https://github.com/showdownjs/showdown/issues/491)) ([6376d40](https://github.com/showdownjs/showdown/commit/6376d405843f03dd99a4d7864289e0f9f8ed7be9))
* **paragraphs:** replace deprecated RegExp.$n with exec() captures ([28cb15d](https://github.com/showdownjs/showdown/commit/28cb15d567d15d643d368e355df92e334756ea13)), closes [#1042](https://github.com/showdownjs/showdown/issues/1042)
* reduce npm package size ([6f93b3e](https://github.com/showdownjs/showdown/commit/6f93b3eab1b47ef991adbd8e30a777bde5e09bed))
* reduce npm package size  ([82f90eb](https://github.com/showdownjs/showdown/commit/82f90ebda276a92bdb4d35baa82448c011460793)), closes [#619](https://github.com/showdownjs/showdown/issues/619)
* replaces \u00A0 with &nbsp; ([f20dc75](https://github.com/showdownjs/showdown/commit/f20dc750241a77421c0d236aa337b596e85610cc)), closes [#521](https://github.com/showdownjs/showdown/issues/521)
* resolve broken link to installation guide ([1a24a4c](https://github.com/showdownjs/showdown/commit/1a24a4c24ccfd0bec5c677ed105ec8d9aecf66a7))
* **subParsers:** namespace heading capture/hash events by style ([9a4e0ba](https://github.com/showdownjs/showdown/commit/9a4e0baaadc0ebddc87a0350af55d3df689c1113))
* **subParsers:** strip international punctuation from github headers ([#950](https://github.com/showdownjs/showdown/issues/950)) ([4333646](https://github.com/showdownjs/showdown/commit/4333646c8ce3036e907ed36c6ad73cfda03b8b4b))
* **table:** align table parsing with the GFM spec ([92990a1](https://github.com/showdownjs/showdown/commit/92990a14ff41c6527d4661d4d5fd53c876ab6040))
* tables parse correctly with new version of jsdom ([db571fb](https://github.com/showdownjs/showdown/commit/db571fbaacce957d65667cf4b676307831563abe))
* **underline:** Make underline lazy ([81edc70](https://github.com/showdownjs/showdown/commit/81edc70da7372f662954321d4b372e1eae189870))
* Update yargs to 14.2.0 ([dae65c6](https://github.com/showdownjs/showdown/commit/dae65c6e36b17c9ba8510a6cb0564c52d6b0d464)), closes [#738](https://github.com/showdownjs/showdown/issues/738)


### Code Refactoring

* **options:** remove the dead smoothLivePreview option ([8a661d0](https://github.com/showdownjs/showdown/commit/8a661d0d2d342c41e65f246c4abba580b39931a1))
* **subParsers:** change name and directory of subparsers ([3db9200](https://github.com/showdownjs/showdown/commit/3db9200d2c293d3977948558b2a4aace3e86d6ac))


### Features

* **autolinks:** improve CommonMark compliance for angle-bracket links ([28363f6](https://github.com/showdownjs/showdown/commit/28363f6714314d8fcf90c510ab737e692da6cfc5))
* **cli:** add batch/glob input, verbose mode and colored output ([9be4b3c](https://github.com/showdownjs/showdown/commit/9be4b3c397e84cc18b0c260204975b9d69de260e))
* **cli:** add flavor listing and validation ([409e2d6](https://github.com/showdownjs/showdown/commit/409e2d664984b26e9da0937b6536349e3afdb68c))
* **cli:** add makemarkdown command and fix option handling ([26c753c](https://github.com/showdownjs/showdown/commit/26c753c3e5702ea5a1485a6960342e9089f8898b))
* **cmSpec:** support GFM link/image options under cmSpec ([1200139](https://github.com/showdownjs/showdown/commit/1200139e5aeb4c4f6c1410cec0440d8873baa26e))
* **cmSpec:** support reference-style image dimensions under cmSpec ([4e7ee79](https://github.com/showdownjs/showdown/commit/4e7ee79f3e25cc4e7789cf44c9e0777d00d26146))
* **cmSpec:** support underline and GFM task lists under cmSpec ([c7cad47](https://github.com/showdownjs/showdown/commit/c7cad47e7317a89f4c4904515128298f5f8b2235))
* **commonmark:** CommonMark autolinks (gated) ([d0d5662](https://github.com/showdownjs/showdown/commit/d0d566288aaf95f076035a7c6744efbe612226e4))
* **commonmark:** CommonMark container block quotes (gated) ([cb631d8](https://github.com/showdownjs/showdown/commit/cb631d803358e0869291a68545a2138aafed04a2))
* **commonmark:** CommonMark HTML blocks (gated) ([edc76db](https://github.com/showdownjs/showdown/commit/edc76db50e734375e94e67ed63e210b147ac7dad))
* **commonmark:** CommonMark images - alt flattening + inline parsing (gated) ([8e6d054](https://github.com/showdownjs/showdown/commit/8e6d054911b5df7eebfda0479804188981b6dcc8))
* **commonmark:** CommonMark link reference definitions (gated) ([7739a69](https://github.com/showdownjs/showdown/commit/7739a695230b81740051cca6b5d6dbede2698042))
* **commonmark:** container-aware fenced code via commonmarkContainers ([f96914c](https://github.com/showdownjs/showdown/commit/f96914c6d7ad99a096daecab829707ad1a0cdf2b)), closes [#321](https://github.com/showdownjs/showdown/issues/321) [#324](https://github.com/showdownjs/showdown/issues/324)
* **commonmark:** decode HTML5 character references (gated) ([37de87e](https://github.com/showdownjs/showdown/commit/37de87e1e4f4ca3a4427169bdfdf6b8b3870d807))
* **commonmark:** delimiter-run emphasis/strong parsing (gated) ([c25d9ed](https://github.com/showdownjs/showdown/commit/c25d9ed77e361bf65168847b366cf3f0ff0e2f78))
* **commonmark:** empty list item edge cases (gated) ([c45ae5e](https://github.com/showdownjs/showdown/commit/c45ae5eca3d7555f21f3687064016e0f94faf018)), closes [#280](https://github.com/showdownjs/showdown/issues/280) [#315](https://github.com/showdownjs/showdown/issues/315)
* **commonmark:** enable unified inline parser in the commonmark flavor ([e90d94c](https://github.com/showdownjs/showdown/commit/e90d94cf4733c78b21dcf542a1fbcc8d935ba059))
* **commonmark:** inline link destination/title parsing (gated) ([4094182](https://github.com/showdownjs/showdown/commit/40941828fcf8138c04b6fe74299d001fdd7c2858))
* **commonmark:** let an open HTML block absorb a following fenced block ([93a0bad](https://github.com/showdownjs/showdown/commit/93a0bad1576289a3c3440e0135a0a274c094081d)), closes [#161](https://github.com/showdownjs/showdown/issues/161)
* **commonmark:** list item indented code + same-line nesting (gated) ([7d76739](https://github.com/showdownjs/showdown/commit/7d76739cb57cc367ce241aa0e84e5f4c172f0066)), closes [#264](https://github.com/showdownjs/showdown/issues/264) [#270](https://github.com/showdownjs/showdown/issues/270) [#271](https://github.com/showdownjs/showdown/issues/271) [#273](https://github.com/showdownjs/showdown/issues/273) [#274](https://github.com/showdownjs/showdown/issues/274) [#298](https://github.com/showdownjs/showdown/issues/298) [#299](https://github.com/showdownjs/showdown/issues/299)
* **commonmark:** new CommonMark list container parser (gated) ([bf1f8ac](https://github.com/showdownjs/showdown/commit/bf1f8ac476be04b593e3caa1e5c2e9187630262b))
* **commonmark:** normalize link/image URLs and titles (gated) ([0ee5675](https://github.com/showdownjs/showdown/commit/0ee5675a0b80f49005d9306513117b1f72590bae))
* **commonmark:** recognize HTML blocks and link defs inside block quotes ([dbb3dc4](https://github.com/showdownjs/showdown/commit/dbb3dc4cb471f076c2f8f3e3d28e4aad93927ce8)), closes [#174](https://github.com/showdownjs/showdown/issues/174) [#218](https://github.com/showdownjs/showdown/issues/218)
* **commonmark:** strict inline raw HTML recognition (gated) ([dd2c524](https://github.com/showdownjs/showdown/commit/dd2c5243c58a557511b974fc1f65fa2b57d838ac))
* **commonmark:** tab expansion in block-structure indentation (gated) ([973a8d6](https://github.com/showdownjs/showdown/commit/973a8d6af3752e026b7380908683327054019afb))
* **commonmark:** unified inline parser (gated, not yet in flavor) ([5bfb1bc](https://github.com/showdownjs/showdown/commit/5bfb1bcd17499e463fd5dcfd2d025fdb1c77d1e7))
* **disallowRawHTML:** add GFM disallowed-raw-html tag filter ([2392f13](https://github.com/showdownjs/showdown/commit/2392f13aa0a3f68a0c41a25f9e701a3fd9cb187d))
* **events:** cover remaining subparsers with lifecycle events ([436273a](https://github.com/showdownjs/showdown/commit/436273a4b9e7a2d678f89805a374a8a31f31379c))
* **events:** emit missing makeHtml lifecycle events ([636f8d6](https://github.com/showdownjs/showdown/commit/636f8d6b45f40ec524e088d140c5eece42594cc3))
* **events:** wire the event system into makeMarkdown (HTML->MD) ([b1e62e1](https://github.com/showdownjs/showdown/commit/b1e62e1ccc3b2cc7140a24946fbd12f66ff108f6))
* **extensions:** unify lang/output extensions onto the event system ([c7701a3](https://github.com/showdownjs/showdown/commit/c7701a3899ffb8de13a6110e52aa132c33fa312b))
* **footnotes:** add GFM footnotes support ([9307a6c](https://github.com/showdownjs/showdown/commit/9307a6c4cb694fa28a58cc167e8a9944b80a4609))
* **links:** add httpsAutoLinks option to default autolinks to https ([695fc42](https://github.com/showdownjs/showdown/commit/695fc4225950707fa473f2781be8b13281a6822a)), closes [#998](https://github.com/showdownjs/showdown/issues/998) [#806](https://github.com/showdownjs/showdown/issues/806) [#998](https://github.com/showdownjs/showdown/issues/998)
* **makehtml.events:** implements event system refactor for converter.makeHtml ([#919](https://github.com/showdownjs/showdown/issues/919)) ([9f8c719](https://github.com/showdownjs/showdown/commit/9f8c7199eaefff07ab05c259b5cd4869d4d05d65)), closes [#920](https://github.com/showdownjs/showdown/issues/920)
* **makeMarkdown.ghMentions:** add support for ghMentions in makeMarkdown ([3a616c5](https://github.com/showdownjs/showdown/commit/3a616c5bf6f4be2fef26cbdb3e46e441b74a9dc1)), closes [#910](https://github.com/showdownjs/showdown/issues/910)
* **makemarkdown.table:** support non-strict tables ([5fc843e](https://github.com/showdownjs/showdown/commit/5fc843e175430951dae97992ba72c6959f7f0e97)), closes [#687](https://github.com/showdownjs/showdown/issues/687)
* **makemarkdown:** broaden HTML->Markdown conversion coverage ([cd5ef8f](https://github.com/showdownjs/showdown/commit/cd5ef8fe99c45e093b8e5e53fa24414f40fad2c6))
* **makeMarkdown:** convert HTML to MD ([358947b](https://github.com/showdownjs/showdown/commit/358947bd297c0f5851bc5a09674e837bf66f1b3a))
* **makemarkdown:** gate non-standard constructs on their options ([e55e811](https://github.com/showdownjs/showdown/commit/e55e811e4f89220e22e3d03d59034f232594eb6f))
* **makemarkdown:** reverse emoji and ellipsis to markdown ([2917ccf](https://github.com/showdownjs/showdown/commit/2917ccf71b31704cf8fe5f1b9c954013caa1a7d3))
* **makemarkdown:** reverse GFM footnotes (HTML -> Markdown) ([9ec49d9](https://github.com/showdownjs/showdown/commit/9ec49d95966937b18a4e379dfed432aa1c726734))
* **moreStyling:** add some useful classes for css styling ([5e0ed80](https://github.com/showdownjs/showdown/commit/5e0ed809dbf474ec76ba0c81a418bca663966d1b)), closes [#540](https://github.com/showdownjs/showdown/issues/540)
* **options:** enable strikethrough by default ([0e7acea](https://github.com/showdownjs/showdown/commit/0e7acea15e92ab45451f5b61ffe1e949690ba6a7))
* **relativePathBaseUrl:** Add support for prepending a base URL ([e3a5b59](https://github.com/showdownjs/showdown/commit/e3a5b5928f90f98a143cfbc8db3e60a6913f24ef)), closes [#536](https://github.com/showdownjs/showdown/issues/536)
* **splitAdjacentBlockquotes:** add option to split adjacent blockquote blocks ([ea3db5f](https://github.com/showdownjs/showdown/commit/ea3db5f180a079fc9562934553e719c92d72ea23)), closes [#477](https://github.com/showdownjs/showdown/issues/477)
* **strikethrough:** support single-tilde strikethrough ([b340b43](https://github.com/showdownjs/showdown/commit/b340b43e2966c0d01e2158b1d6bb89f96ca1333e))
* **tasklists:** emit GFM-compliant task list markup ([94e0624](https://github.com/showdownjs/showdown/commit/94e0624ab807427309560af039815d1875be36e6))


### remove

* **literalMidWordAsterisks:** remove literalMidWordAsterisks feature ([d9eea64](https://github.com/showdownjs/showdown/commit/d9eea64794a02930b42f151294e3e795434a2ad8)), closes [#499](https://github.com/showdownjs/showdown/issues/499)


### BREAKING CHANGES

* **strikethrough:** text wrapped in single tildes (`~foo~`) is now rendered as
`<del>foo</del>`. Escape the tildes to keep them literal.
* **tasklists:** by default task list items no longer include the
`task-list-item` class, the `list-style-type` list style or the inline
checkbox margin style. Enable `moreStyling` to restore the previous output.
* **table:** a table whose header and delimiter rows have a different
number of cells (e.g. `| a | b |` over `| --- |`) is no longer recognised
as a table and renders as a paragraph, matching GFM.
* **options:** the smoothLivePreview option is removed. It was a no-op
(unimplemented), so passing it had no effect; remove it from any config.
* **options:** strikethrough is now enabled by default (vanilla and github
flavors). Markdown using ~~...~~ renders as <del>...</del>, and the reverse
direction converts <del>/<s> back to ~~. Set strikethrough: false to restore
the previous behavior. The original and commonmark flavors keep it disabled.
* **options:** the openLinksInNewWindow option is removed. Use a
listener extension on makehtml.link.*.onCapture to add target/rel
attributes to anchors instead (see docs/event-system.md).
* **flavors:** the github flavor no longer enables simpleLineBreaks, so
single newlines inside a paragraph are no longer rendered as <br>. Set
simpleLineBreaks: true explicitly to restore the previous behavior.
* **extensions:** the instance methods `converter.removeExtension()` and
`converter.getAllExtensions()` have been removed. Use
`converter.unlisten()` to detach a listener. The static
`showdown.removeExtension()` / `showdown.getAllExtensions()` registry
methods are unaffected.
* **extensions:** `lang` and `output` extensions are deprecated and now log a
console warning when loaded. They keep working (as listeners on
`makehtml.onPreParse` / `makehtml.onEnd`) but should be rewritten as
`listener` extensions.
* **extensions:** the legacy `showdown.extensions` global object and its
deprecated extension-loading path have been removed.
* **links:** `excludeTrailingPunctuationFromURLs` option was removed. This is now the default behavior
* **literalMidWordAsterisks:** literalMidWordAsterisks option was removed and so asterisks will always retain their markdown magic meaning in a source text.
If you're using this feature, and you wish to retain this option, you can find a shim here: <https://gist.github.com/tivie/7f8a88c89ffb00d2afe6c59a25528386>
* **subParsers:** makeHtml subparsers names changed, by prepending 'makehtml.' to them.
Example: 'anchors', subparser is now named 'makehtml.anchors'.

Event names were also changed to reflect this.
Example: 'anchors.before' is now named 'makehtml.anchors.before'.

**To migrate:**

If you have a listener extension, replace the old event name with the new one. Example:

Replace this

```js
showdown.extension('myext', function() {
  return [{
    type: 'listener',
    listeners: {
      'anchors.before': function (event, text, converter, options, globals) {
        //... some code
        return text;
      }
  }];
});
```

with this
```js
showdown.extension('myext', function() {
  return [{
    type: 'listener',
    listeners: {
      'makehtml.anchors.before': function (event, text, converter, options, globals) {
        //... some code
        return text;
      }
  }];
});
```



## [2.1.0](https://github.com/showdownjs/showdown/compare/2.0.0...2.1.0) (2022-04-21)

* refactor(cli)!: Remove support for "extra options" and add -c flag, closes [#916](https://github.com/showdownjs/showdown/issues/916)


### Bug Fixes

* **cli:** cli displays the correct version number ([8b48882](https://github.com/showdownjs/showdown/commit/8b48882))


### BREAKING CHANGES

* the CLI no longer accepts "extra options". Instead you should pass the `-c` flag. To update:

before:
```
showdown makehtml -i foo.md -o bar.html --strikethrough --emoji
```

after:
```
showdown makehtml -i foo.md -o bar.html -c strikethrough -c emoji
```

<a name="2.0.0"></a>
# [2.0.0](https://github.com/showdownjs/showdown/compare/1.9.1...2.0.0) (2022-02-15)

### Breaking Changes
* Supported Node Versions were set to match the [node release schedule](https://nodejs.org/en/about/releases/) which at the time of writing includes Node 12.x, 14.x, 16.x and 17.x
* The `yargs` dependecy was updated to `^17.2.1` to mitigate a security issue.
* The Showdown Licesnse has been changed from  BSD-3-Clause to MIT

### Bug Fixes

* allow escaping of colons ([25c4420](https://github.com/showdownjs/showdown/commit/25c4420))
* reduce npm package size  ([35730b7](https://github.com/showdownjs/showdown/commit/35730b7)), closes [#619](https://github.com/showdownjs/showdown/issues/619)

### Features

* Added `ellipsis` option to configure if the ellipsis unicode character is used or not. ( Thanks @VladimirV99 )
* Added a default security policy. Please report security issues to the issues tab on GitHub.


<a name="1.9.1"></a>
## [1.9.1](https://github.com/showdownjs/showdown/compare/1.9.0...1.9.1) (2019-11-02)


### Bug Fixes

* **openLinksInNewWindow:** add rel="noopener noreferrer" to links ([1cd281f](https://github.com/showdownjs/showdown/commit/1cd281f)), closes [#670](https://github.com/showdownjs/showdown/issues/670)

<a name="1.0.0"></a>
# [1.9.0](https://github.com/showdownjs/showdown/compare/1.8.7...1.9.0) (2018-11-10)

Version 1.9.0 introduces a new feature, the Markdown to HTML converter. This feature is still experimental and is a partial backport of the new Reverse Converter planned for version 2.0.
### Bug Fixes

* **italicsAndBold:** fix issue with consecutive spans ([#608](https://github.com/showdownjs/showdown/issues/608)) ([5c0d67e](https://github.com/showdownjs/showdown/commit/5c0d67e)), closes [#544](https://github.com/showdownjs/showdown/issues/544)
* **underline:** fix issue with consecutive spans ([81edc70](https://github.com/showdownjs/showdown/commit/81edc70))

### Features

* **converter.makeMarkdown:** [EXPERIMENTAL] add an HTML to MD converter ([e4b0e69](https://github.com/showdownjs/showdown/commit/e4b0e69)), closes [#388](https://github.com/showdownjs/showdown/issues/388) [#233](https://github.com/showdownjs/showdown/issues/233)

<a name="1.8.7"></a>
# [1.8.7](https://github.com/showdownjs/showdown/compare/1.8.6...1.8.7) (2018-10-16)

### Bug Fixes

* **emojis:** fix emoji excessive size ([4aca41c](https://github.com/showdownjs/showdown/commit/4aca41c))
* **gfm-codeblocks:** add support for spaces before language declaration ([24bf7b1](https://github.com/showdownjs/showdown/commit/24bf7b1)), closes [#569](https://github.com/showdownjs/showdown/issues/569)
leading space no longer breaks gfm codeblocks ([828c32f](https://github.com/showdownjs/showdown/commit/828c32f)), closes [#523](https://github.com/showdownjs/showdown/issues/523)

* **images:** fix js error when using image references ([980e702](https://github.com/showdownjs/showdown/commit/980e702)), closes [#585](https://github.com/showdownjs/showdown/issues/585)
* **literalMidWordAsterisks:** now parses single characters enclosed by * correctly ([fe70e45](https://github.com/showdownjs/showdown/commit/fe70e45)), closes [#478](https://github.com/showdownjs/showdown/issues/478)
* **mentions:** allow for usernames with dot, underscore and dash ([dfeb1e2](https://github.com/showdownjs/showdown/commit/dfeb1e2)), closes [#574](https://github.com/showdownjs/showdown/issues/574)
* **nbsp:** fix replacing of nbsp with regular spaces ([8bc1f42](https://github.com/showdownjs/showdown/commit/8bc1f42))

<a name="1.8.6"></a>
# [1.8.6](https://github.com/showdownjs/showdown/compare/1.8.5...1.8.6) (2017-12-22)

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

* **CDNjs:** bump version to fix version mismatch with CDNjs ([#452](https://github.com/showdownjs/showdown/issues/452))


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

* **html-comments:** changed regex to prevent malformed long comment to freeze showdown ([3efcd10](https://github.com/showdownjs/showdown/commit/3efcd10)), closes [#439](https://github.com/showdownjs/showdown/issues/439)



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
* **tablesHeaderId:** fix mismatch of option name ([51e4693](https://github.com/showdownjs/showdown/commit/51e4693)), closes [#412](https://github.com/showdownjs/showdown/issues/412)


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
* **strikethrough:** fix strikethrough being wrongly parsed inside codeSpans ([169cbe8](https://github.com/showdownjs/showdown/commit/169cbe8))

### Features

* **events:** add events to all subparsers ([7d63a3e](https://github.com/showdownjs/showdown/commit/7d63a3e))



<a name="1.6.2"></a>
## [1.6.2](https://github.com/showdownjs/showdown/compare/1.6.1...1.6.2) (2017-01-29)


### Bug Fixes

* **escapeSpecialCharsWithinTagAttributes:** add ~ and = to escaped chars ([bfcc0e4](https://github.com/showdownjs/showdown/commit/bfcc0e4))
* **strikethrough:** allow escaping tilde char ([24d47d7](https://github.com/showdownjs/showdown/commit/24d47d7)), closes [#331](https://github.com/showdownjs/showdown/issues/331)

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
* **lists:** lines with multiple dashes being parsed as multilists ([10b3410](https://github.com/showdownjs/showdown/commit/10b3410)), closes [#312](https://github.com/showdownjs/showdown/issues/312)
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
    
    Before (output):
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
