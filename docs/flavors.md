## Overview

You can use _flavors_ (or presets) to set the preferred options automatically. In this way, Showdown behaves like popular Markdown flavors.

Currently, the following flavors are available:

 * `original`: Original Markdown flavor as in [John Gruber's spec](https://daringfireball.net/projects/markdown/)
 * `vanilla`:  Showdown base flavor (v1.3.1 onwards)
 * `github`: [GitHub Flavored Markdown, or GFM](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
 * `commonmark`: [CommonMark](https://spec.commonmark.org/) (v3.0.0 onwards). Enables the full set of `commonmark*` options — see [Spec compliance](spec-compliance.md).

## Options activated by each flavor

A flavor is simply a bundle of [option](available-options.md) overrides applied on top of Showdown's defaults. The table below lists every option that at least one flavor sets:

 * `vanilla` applies no overrides of its own — its column shows the plain Showdown defaults.

Legend: ✅ = `on` · ❌ = `off` · _(blank)_ = `off` (default).

| Option                                 | `vanilla` | `original` | `github` | `commonmark` |
|----------------------------------------|:---------:|:----------:|:--------:|:------------:|
| `noHeaderId`                           |           |     ✅     |          |      ✅      |
| `ghCompatibleHeaderId`                 |           |            |    ✅    |              |
| `requireSpaceBeforeHeadingText`        |           |            |    ✅    |      ✅      |
| `ghCodeBlocks`                         |    ✅     |     ❌     |    ✅    |      ✅      |
| `omitExtraWLInCodeBlocks`              |           |            |    ✅    |              |
| `simplifiedAutoLink`                   |           |            |    ✅    |              |
| `literalMidWordUnderscores`            |           |            |    ✅    |              |
| `strikethrough`                        |           |            |    ✅    |              |
| `tables`                               |           |            |    ✅    |              |
| `tablesHeaderId`                       |           |            |    ✅    |              |
| `tasklists`                            |           |            |    ✅    |              |
| `disableForced4SpacesIndentedSublists` |           |            |    ✅    |              |
| `simpleLineBreaks`                     |           |            |    ✅    |              |
| `ghMentions`                           |           |            |    ✅    |              |
| `backslashEscapesHTMLTags`             |           |            |    ✅    |              |
| `emoji`                                |           |            |    ✅    |              |
| `splitAdjacentBlockquotes`             |           |            |    ✅    |              |
| `decodeEntities`                       |           |            |          |      ✅      |
| `commonmarkEmphasis`                   |           |            |          |      ✅      |
| `commonmarkAutolinks`                  |           |            |          |      ✅      |
| `commonmarkLinks`                      |           |            |          |      ✅      |
| `commonmarkRawHTML`                    |           |            |          |      ✅      |
| `commonmarkHTMLBlocks`                 |           |            |          |      ✅      |
| `commonmarkBlockquotes`                |           |            |          |      ✅      |
| `commonmarkLists`                      |           |            |          |      ✅      |
| `commonmarkInline`                     |           |            |          |      ✅      |
| `commonmarkTabs`                       |           |            |          |      ✅      |
| `commonmarkContainers`                 |           |            |          |      ✅      |

!!! note
    `ghCodeBlocks` defaults to `on`, so `vanilla`, `github` and `commonmark` all keep GFM fenced code blocks enabled; only `original` turns them off.

## Set flavor

=== "Globally"

    ```js
    showdown.setFlavor('github');
    ```

=== "Locally"

    ```js
    converter.setFlavor('github');
    ```