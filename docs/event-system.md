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

Events are emitted when a sub-parser runs (or about to be run).
In the sub-parser, the events follow strict order sequence: [`onStart`](#onstart) -> [`onCapture`](#oncapture) -> [`onHash`](#onhash) -> [`onEnd`](#onend)

It means that `.before` events always run before `.captureStart`.

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

## Special Events

There are special events useful for *"positioning"* a listener extension in the main chain of events.
Usually, these extensions introduce new syntax that, due to precedence

In contrary, the special events will always be called, regardless of options or circumstances. 

### .before.{subparserName}

**`.before.{subparserName}`**: **always runs**
    
Emitted just before the **`{subparserName}` is about to be entered**.
    
**Properties**

| property  | type     | access  | description                                                    |
|-----------|----------|---------|----------------------------------------------------------------|
| `input`   | `string` | `read`  | Full text that was passed to the subparser                     |
| `output`  | `string` | `write` | Full text with modification that will be passed along the chain |
| `regexp`  | `null`   |         |                                                                |
| `matches` | `null`   |         |                                                                |

!!! note "Difference between `before.{subparserName}` and `{subparserName}.start`"
    
    1. **`before.{subparserName}`** is always guaranteed to be called, **even if the subparser is disabled**,
    while **{subparserName}.start** isn't.

        For example, `makehtml.before.strikethrough` is always called even if the option `strikethrough` is `false`.
        
    1. **`before.{subparserName}`** is only emitted **once** in a span context while **`{subparserName}.start`** is emitted
    everytime **`{subparserName}`** is called.

    <!-- As a rule of thumb --> 

### .after.{subparserName}

**`.after.{subparserName}`**: **always runs**;
 
Emitted when the **`{subparserName}` has exited** and before the next one is called.
    
**Properties**
    
| property  | type     | access  | description                                       |   
|-----------|----------|---------|---------------------------------------------------|
| `input`   | `string` | `read`  | Partial/full text with the subparser modifications |
| `output`  | `string` | `write` | The text that will be passed to other subparsers  |
| `regexp`  | `null`   |         |                                                   |
| `matches` | `null`   |         |                                                   |

<!--
## Events List

### blockquote

### metadata
-->
