## Introduction

The Event System is the basis of the new Listener extensions, replacing the ["old" extension system](extensions.md) altogether.

In short, the Event System lifecycle looks as follows:

1. A sub-parser emits an event.

    !!! note ""
        Each sub-parser can emit a batch of events (see the list below)

1. Extension A (which is a _Listener Extension_) registers and listens to a specific event.

    !!! note ""
        An extension can only register for a specific event

1. Extension A receives an event object and modifies it.

    !!! note ""
        Certain properties of the event object can be changed, which will change the behavior or output of the sub-parser

1. Extension A returns the event object to the converter.
1. The converter passes the received event object to the next extension in the chain.

## Event Object

### Properties

#### matches

**matches** is an object that holds the text captured by the sub-parser. The properties of this object are different for each sub-parser.
Some properties can be read-only: their names start with `_` (underscore).

!!! example "blockquote `onCapture` event"

    ```js
    {
      _wholeMatch: "> some awesome quote",
      blockquote: "some awesome quote"
    }
    ```

<!-- ## Basic Event -->

## Event types

Events are emitted when a sub-parser runs (or is about to be run).
The `makehtml` (Markdown to HTML) sub-parsers emit up to four events, in this strict order: [`onStart`](#onstart) -> [`onCapture`](#oncapture) -> [`onHash`](#onhash) -> [`onEnd`](#onend).

The `makeMarkdown` (HTML to Markdown) sub-parsers emit a subset of these — see [makeMarkdown events](#makemarkdown-html-to-markdown-events) below.

### onStart

**`<converter>.<subparser>.onStart`**: **always runs** except if the sub-parser is disabled.

Emitted when the sub-parser has started, but no capturing or modifications to the text were done.

**Always runs** except if the sub-parser is disabled via options.

!!! hint "When to use `onStart` event"
    Use this event when you want to change the input passed to the sub-parser. 

!!! warning ""
    Please note that the input is the **full text** that was passed to the converter.
    
**Properties**
         
| property     | type     | access  | description                                                    |
|--------------|----------|---------|----------------------------------------------------------------|
| `input`      | `string` | `read`  | Full text that was passed to the subparser                     |
| `output`     | `string` | `write` | Full text with modification that will be passed along the chain |
| `regexp`     | `null`   |         |                                                                |
| `matches`    | `null`   |         |                                                                |
| `attributes` | `null`   |         |                                                                |

### onCapture

**`<converter>.<subparser>.onCapture`**: *might not be run*.
 
Emitted when a regex match is found and capture was successful.
Further normalization and modification of the regex captured groups might be performed.

Might not be run if no regex match found.

!!! hint "When to use `onCapture` event"
    Use this event if you want to:

    * modify the sub-parser behavior, text;
    * modify the HTML output of the sub-parser.

**Properties**

| property     | type     | access       | description                                                       |
|--------------|----------|--------------|-------------------------------------------------------------------|
| `input`      | `string` | `readonly`   | The captured text                                                 |
| `output`     | `string` | `write`      | `null` or well-formed HTML (see the Important Note below)         |
| `regexp`     | `RegExp` | `readonly`   | Regular Expression to capture groups                              |
| `matches`    | `object` | `read/write` | Match groups. Changes to this object are reflected in the output.  |
| `attributes` | `object` | `read/write` | Attributes to add to the HTML output                              |

!!! warning "IMPORTANT NOTE"
    Extensions listening to the `onCapture` event **should avoid** changing the output property.
    Instead, they should modify the values of the matches and attribute objects.
    
    The reason is that the **output property takes precedence over the matches objects** and
    **prevents showdown from calling other sub-parsers** inside the captured fragment.

    The above means the following:

    1. If something is passed as the output property, any changes to the matches and attributes objects will be ignored.
    1. Any changes made by other extensions to the matches or attributes objects will be ignored.
    1. Showdown will not call other sub-parsers, such as encode code or span gamut in the text fragment, which may lead to unexpected results.

    **Example**

    !!! example ""

        ```js hl_lines="4"
        // Showdown extension 1 that is listening to makehtml.blockquote.onCapture
        function extension_1 (showdownEvent) {
          // Let's imagine you're a bad person who writes to output
          showdownEvent.output = '<blockquote>foo</blockquote>'; // must be a well-formed HTML
          showdownEvent.matches.blockquote = 'some nice quote'; 
        }

        // Showdown extension 2 that is also listening to makehtml.blockquote.onCapture
        function extension_2 (showdownEvent) {
          // I make blockquotes bold
          let quote = showdownEvent.matches.blockquote;
          showdownEvent.matches.blockquote = '<strong>' + quote + '</strong>'; 
        }
        ```

        In the example above, the result will always be `<blockquote>foo</blockquote>`, regardless of the order of extension loading and call.

!!! danger "Infinite loop"
    Do not pass the input as output to the `onCapture` event, or you might trigger an infinite loop.

### onHash

**`<converter>.<subparser>.onHash`**: *always runs*.
 
Raised before the output is hashed.

**Always runs** (except if the sub-parser is disabled via options), even if no hashing is performed. 

!!! hint "When to use `onHash` event"
    Use this event when you want to change the sub-parser's raw output before it is hashed.

**Properties**
        
| property     | type     | access  | description                                  |
|--------------|----------|---------|----------------------------------------------|
| `input`      | `string` | `read`  | The captured text                            |
| `output`     | `string` | `write` | The text that will be passed along the chain |
| `regexp`     | `null`   |         |                                              |
| `matches`    | `null`   |         |                                              |
| `attributes` | `null`   |         |                                              |

### onEnd
 
**`<converter>.<subparser>.onEnd`**: **always runs**;
 
Emitted when the sub-parser has finished its work and is about to exit.

**Always runs** (except if the sub-parser is disabled via options).

!!! hint "When to use `onEnd` event"
    Use this event when you want to run code or perform changes to the text after the subparser has run and its output was hashed.

!!! warning ""
    Please note that the input is the **full text** and might contain hashed elements.

**Properties**
    
| property  | type     | access  | description                                                 |
|-----------|----------|---------|-------------------------------------------------------------|
| `input`   | `string` | `read`  | Full text with the subparser modifications (contains hashes) |
| `output`  | `string` | `write` | The text that will be passed to other subparsers            |
| `regexp`  | `null`   |         |                                                             |
| `matches` | `null`   |         |                                                             |

## makeMarkdown (HTML to Markdown) events

The reverse converter — `<converter>.makeMarkdown()`, which turns HTML back into Markdown — also emits namespaced events. Because its sub-parsers operate on **DOM nodes** (one construct at a time) rather than running regular expressions over text, they emit only two of the lifecycle events: [`onStart`](#onstart) and [`onEnd`](#onend). There is no `onCapture`/`onHash` phase, since there is no regex capture step.

Event names follow the same `<converter>.<subparser>.<event>` convention, with `makeMarkdown` as the converter prefix:

* **`makeMarkdown.<subparser>.onStart`**
* **`makeMarkdown.<subparser>.onEnd`**

emitted by each of these sub-parsers: `blockquote`, `break`, `codeBlock`, `codeSpan`, `emphasis`, `header`, `hr`, `image`, `input`, `links`, `list`, `listItem`, `paragraph`, `pre`, `strikethrough`, `strong`, `table`, `tableCell`, `txt`.

In addition, two **document-level** events wrap the whole conversion:

* **`makeMarkdown.onStart`** — emitted once with the raw HTML source, before it is parsed into a DOM. Listeners can rewrite the source.
* **`makeMarkdown.onEnd`** — emitted once with the final generated Markdown. Listeners can post-process it.

### Properties

Unlike the makehtml events, the `input` of a makeMarkdown event is a single node/fragment, **not** the full document text:

| property     | type     | access  | description                                                                                             |
|--------------|----------|---------|---------------------------------------------------------------------------------------------------------|
| `input`      | `string` | `read`  | `onStart`: the serialized HTML (or text value) of the node being processed. `onEnd`: the generated Markdown. |
| `output`     | `string` | `write` | The Markdown string that will be used / passed along (see the override note below).                     |
| `matches`    | `object` | `read`  | Holds `{ node }` — the source DOM node currently being converted.                                       |
| `regexp`     | `null`   |         |                                                                                                         |
| `attributes` | `null`   |         |                                                                                                         |

!!! hint "Overriding a node's rendering with `onStart`"
    The `onStart` event's `output` starts as `null`. If a listener sets it to a non-empty string, that string is used as the sub-parser's result and the **default rendering of the node is skipped** (the matching `onEnd` event still runs). This is the makeMarkdown equivalent of the `onCapture` output-precedence behavior.

    !!! example ""

        ```js
        // Render every <a> as bare text instead of a Markdown link
        converter.listen('makeMarkdown.links.onStart', function (evt) {
          evt.output = evt.matches.node.textContent;
          return evt;
        });
        ```

## Special Events

!!! warning "Removed"
    The `.before.{subparserName}` and `.after.{subparserName}` special events were **deprecated in 2.0** and have been **removed in 3.0**. Use the per-sub-parser [`onStart`](#onstart) and [`onEnd`](#onend) events instead.

<!--
## Events List

### blockquote

### metadata
-->
