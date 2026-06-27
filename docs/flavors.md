## Overview

You can use _flavors_ (or presets) to set the preferred options automatically. In this way, Showdown behaves like popular Markdown flavors.

Currently, the following flavors are available:

 * `original`: Original Markdown flavor as in [John Gruber's spec](https://daringfireball.net/projects/markdown/)
 * `vanilla`:  Showdown base flavor (v1.3.1 onwards)
 * `gfm`: [GitHub Flavored Markdown, or GFM](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax). Also available under its former name `github`, kept as a backwards-compatible alias (both resolve to the exact same options).
 * `commonmark`: [CommonMark](https://spec.commonmark.org/) (v3.0.0 onwards). Enables the `cmSpec` option — see [Spec compliance](spec-compliance.md).

## Options activated by each flavor

A flavor is simply a bundle of [option](available-options.md) overrides applied on top of Showdown's defaults. The table below lists every option that at least one flavor sets:

 * `vanilla` applies no overrides of its own — its column shows the plain Showdown defaults.

Legend: ✅ = `on` · ❌ = `off` · _(blank)_ = `off` (default).

| Option                                 | `vanilla` | `original` | `gfm` | `commonmark` |
|----------------------------------------|:---------:|:----------:|:--------:|:------------:|
| `noHeaderId`                           |           |     ✅     |          |      ✅      |
| `requireSpaceBeforeHeadingText`        |           |            |    ✅    |      ✅      |
| `ghCodeBlocks`                         |    ✅     |     ❌     |    ✅    |      ✅      |
| `strikethrough`                        |    ✅     |     ❌     |    ✅    |      ❌      |
| `omitExtraWLInCodeBlocks`              |           |            |    ✅    |              |
| `simplifiedAutoLink`                   |           |            |    ✅    |              |
| `literalMidWordUnderscores`            |           |            |    ✅    |              |
| `tables`                               |           |            |    ✅    |              |
| `tablesHeaderId`                       |           |            |    ✅    |              |
| `tasklists`                            |           |            |    ✅    |              |
| `disableForced4SpacesIndentedSublists` |           |            |    ✅    |              |
| `ghMentions`                           |           |            |    ✅    |              |
| `backslashEscapesHTMLTags`             |           |            |    ✅    |              |
| `emoji`                                |           |            |    ✅    |              |
| `splitAdjacentBlockquotes`             |           |            |    ✅    |              |
| `decodeEntities`                       |           |            |          |      ✅      |
| `cmSpec`                               |           |            |          |      ✅      |

!!! note
    `ghCodeBlocks` defaults to `on`, so `vanilla`, `gfm` and `commonmark` all keep GFM fenced code blocks enabled; only `original` turns them off. `strikethrough` likewise defaults to `on` (enabled in `vanilla` and `gfm`); the spec-oriented `original` and `commonmark` flavors turn it off.

## Set flavor

=== "Globally"

    ```js
    showdown.setFlavor('gfm');
    ```

=== "Locally"

    ```js
    converter.setFlavor('gfm');
    ```

!!! note "`github` alias"
    `github` is kept as a backwards-compatible alias for `gfm`, so `setFlavor('github')` and `getFlavorOptions('github')` keep working and return the same options. `getFlavors()` lists both names. New code should prefer `gfm`.