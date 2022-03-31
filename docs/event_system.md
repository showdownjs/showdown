# Event System )

## Introduction

The Event System is the basis of the new Listener extensions, replacing the old extension system altogether.

The life cycle can be summarized as this:

 - A subparsers emmits an event 
   - Each subparser can emmit a bunch of events (see list below)
 - Extension A, which is a _Listener Extension_ registers and listens to a specific event
   - An extension can only register to a specific event
 - Extension A receives an event object and modifies it
   - Certain properties of the event object can be changed, ehich will change the behavior or output of the subparser
 - The extension then returns the event object
 - The converter passes this event object to the next extension in the chain


Note: 

### The Event Object


## Basic Event 


## Event Types

Events are raised when a subparser is run (or about to be run).
Within a subparser, the events always follow a certain order (sequence). For instance, **.before** events always run before **.captureStart**.
Each subparser raises several events sequentially:

### onStart

**`<converter>.<subparser>.onStart`**: **always runs** except it subparser is disabled

Raised when the **subparser has started**, but no capturing or any modification to the text was done. 
**Always runs** (except if the subparser is deactivated through options).
    
***Properties***:
         
| property   | type      | access     | description                                                        |
|------------|-----------|------------|--------------------------------------------------------------------|
| input      | string    | read       | The full text that was passed to the subparser                     |
| output     | string    | write      | The full text with modification that will be passed along the chain|
| regexp     | null      |            |                                                                    |
| matches    | null      |            |                                                                    |
| attributes | null      |            |                                                                    |

    
Usually you would want to use this event if you wish to change the input to the subparser. Please note,
however, that the input text is the **complete text** that was fed to the converter.

### onCapture

**`<converter>.<subparser>.onCapture`**: *might not be run*;
 
Raised when a regex match is found and a capture was successful. Some normalization and modification 
of the regex captured groups might be performed.

Might not be run if no regex match is found.

***Properties***:

| property   | type     | access     | description                                                        |
|------------|----------|------------|--------------------------------------------------------------------|
| input      | string   | readonly   | The captured text                                                  |
| output     | string   | write      | null or well formed HTML (see note)                                |
| regexp     | RegExp   | readonly   | Regular Expression used to capture groups                          |
| matches    | object   | read/write | Matches groups. Changes to this object are reflected in the output |
| attributes | object   | read/write | Attributes to add to the HTML output                               |
    
Usually you would want to use this event if you wish to modify the subparser behavior, text or modify the HTML output
of the subparser.

**IMPORTANT NOTE**: Extensions listening to onCapture event should try to AVOID changing the output property.
Instead, they should modify the values of the matches and attributes objects. This is because 
the **output property takes precedence over the matches objects** and **prevents showdown to call other subparsers**
inside the captured fragment.This means 3 very important things:

 1. If something is passed as the output property, any changes to the matches and attributes objects will be ignored.
 2. Changes made by other extensions to the matches or attributes objects will also be ignored
 3. Showdown will not call other subparsers, such as encode code or span gamut in the text fragment, which may lead to
    weird results.

```javascript
// showdown extension 1 that is listening to makehtml.blockquote.onCapture
function extension_1 (showdownEvent) {
  // i'm bad and write to output
  showdownEvent.output = '<blockquote>foo</blockquote>'; // must be an well formed html string
  showdownEvent.matches.blockquote = 'some nice quote'; 
}

// showdown extension 1 that is also listening to makehtml.blockquote.onCapture
function extension_2 (showdownEvent) {
  // I make blockquotes become bold
  let quote = showdownEvent.matches.blockquote;
  showdownEvent.matches.blockquote = '<strong>' + quote + '</strong>'; 
}

// the result will always be <blockquote>foo</blockquote>, regardless of the order of extension loading and call
```


### onHash

**`<converter>.<subparser>.onHash`**: *always runs*;
 
Raised before the output is hashed. **Always runs** (except if the subparser was deactivated through options), 
even if no hashing is performed. 
    
***Properties***:
        
| property   | type       | access     | description                                                        |
|------------|------------|------------|--------------------------------------------------------------------|
| input      | string     | read       | The captured text                                                  |
| output     | string     | write      | The text that will be passed to the subparser/other listeners      |
| regexp     | null       |            |                                                                    |
| matches    | null       |            |                                                                    |
| attributes | null       |            |                                                                    |

Usually you would want to use this event if you wish change the subparser's raw output before it is hashed.

### onEnd
 
**`<converter>.<subparser>.onEnd`**: *always runs*;
 
Raised when the subparser has finished its work and is about to exit.
     
Always runs (except if the subparser is deactivated through options).
    
***Properties***:
    
| property | type      | access     | description                                                        |
|----------|-----------|------------|--------------------------------------------------------------------|
| input    | string    | read       | The full text with the subparser modifications (contains hashes)   |
| output   | string    | write      | The text that will be passed to other subparsers                   |
| regexp   | null      |            |                                                                    |
| matches  | null      |            |                                                                    |
     
Usually you would want to use this event if you want to run code or perform changes to the text after the subparser was
run and it's output was hashed. Keep in mind that the input is the full text and might contain hashed elements.


### Special Events

There are some special events that are useful for *"positioning"* a listener extension in the main chain of events.
Usually these extensions introduce new syntax that, due to precedence 
These events are always guaranteed to be called, regardless of options or circumstances. 

 1. **.before_{subparserName}**: *always runs*
    
    Raised just before the **{subparserName} is about to be entered**.
    
    ***Properties***:
         
    | property | type      | access     | description                                                        |
    |----------|-----------|------------|--------------------------------------------------------------------|
    | input    | string    | read       | The full text that was passed to the subparser                     |
    | output   | string    | write      | The full text with modification that will be passed along the chain|
    | regexp   | null      |            |                                                                    |
    | matches  | null      |            |                                                                    |
    
 2. **.after**.{subparserName}: *always runs*;
 
    Raised when the **{subparserName} has exited** and before the next one is called.
    
    ***Properties***:
    
    | property | type      | access     | description                                                        |
    |----------|-----------|------------|--------------------------------------------------------------------|
    | input    | string    | read       | The partial/full text with the subparser modifications             |
    | output   | string    | write      | The text that will be passed to other subparsers                   |
    | regexp   | null      |            |                                                                    |
    | matches  | null      |            |                                                                    |

 
### Notes

 - There are 2 main differences between **before.{subparserName}** and **{subparserName}.start**.
   
     1. **before.{subparserName}** is always guaranteed to be called, even if the subparser is disabled, 
        while **{subparserName}.start** doesn't.
        
        ex: `makehtml.before.strikethrough` is always called even if the option `strikethrough` is false 
        
     2. **before.{subparserName}** is only raised once in a span context while **{subparserName}.start** is raised
        everytime **{subparserName}** is called.

    As a rule of thumb, 

## Events List


### blockquote

#### 
