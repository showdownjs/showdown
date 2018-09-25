# Event System

## Introduction


## The Event Object


## Events

Events are raised when a subparser is run (or about to be run).
Within a subparser, the events always follow a certain order (sequence). For instance, **.before** events always run before **.captureStart**.
Each subparser raises several events sequentially:

 1. **.start**: **always runs** except it subparser is disabled

    Raised when the **subparser has started**, but no capturing or any modification to the text was done.
    
    **Always runs** (except if the subparser is deactivated through options).
    
    ***Properties***:
         
    | property | type      | access     | description                                                        |
    |----------|-----------|------------|--------------------------------------------------------------------|
    | input    | string    | read       | The full text that was passed to the subparser                     |
    | output   | string    | write      | The full text with modification that will be passed along the chain|
    | regex    | null      |            |                                                                    |
    | matches  | null      |            |                                                                    |
    
    Usually you would want to use this event if you wish to change the input to the subparser
     
 2. **.captureStart**: *might not be run*;
 
     Raised when a regex match is found and a capture was successful. Some normalization and modification 
     of the regex captured groups might be performed.
     
     Might not be run if no regex match is found.
     
     ***Properties***:
     
     | property | type      | access     | description                                                        |
     |----------|-----------|------------|--------------------------------------------------------------------|
     | input    | string    | read       | The captured text                                                  |
     | output   | string    | write      | The text that will be passed to the subparser/other listeners      |
     | regex    | RegExp    | readonly   | Regular Expression used to capture groups                          |
     | matches  | object    | read/write | Matches groups. Changes to this object are reflected in the output |
     
     Usually you would want to use this event if you wish to modify a certain subparser behavior.
     Exs: remove all title attributes from links; change indentation of code blocks; etc...
 
 3. **.captureEnd**: *might not be run*;
 
    Raised after the modifications to the captured text are done but before the replacement is introduced in the document.
    
    Might not be run if no regex match is found.
         
    ***Properties***:
    
    | property   | type      | access     | description                                                                    |
    |------------|-----------|------------|--------------------------------------------------------------------------------|
    | input      | string    | read       | The captured text                                                              |
    | output     | string    | write      | The text that will be passed to the subparser/other listeners                  |
    | regex      | RegExp    | readonly   | Regular Expression used to capture groups                                      |
    | matches    | object    | read/write | Keypairs of matches groups. Changes to this object are reflected in the output |
    | attributes | object    | read/write | Attributes to add to the HTML output                                           |
 
 4. **.beforeHash**: *might not be run*;
 
    Raised before the output is hashed.
    
    Always run (except if the subparser was deactivated through options), even if no hashing is performed. 
    
    ***Properties***:
        
    | property | type       | access     | description                                                        |
    |----------|------------|------------|--------------------------------------------------------------------|
    | input    | string     | read       | The captured text                                                  |
    | output   | string     | write      | The text that will be passed to the subparser/other listeners      |
    | regex    | null       |            |                                                                    |
    | matches  | null       |            |                                                                    |
 
    Usually you would want to use this event if you wish change the subparser output before it is hashed
 
 5. **.end**: *always runs*;
 
    Raised when the subparser has finished its work and is about to exit.
     
    Always runs (except if the subparser is deactivated through options).
    
    ***Properties***:
    
    | property | type      | access     | description                                                        |
    |----------|-----------|------------|--------------------------------------------------------------------|
    | input    | string    | read       | The partial/full text with the subparser modifications             |
    | output   | string    | write      | The text that will be passed to other subparsers                   |
    | regex    | null      |            |                                                                    |
    | matches  | null      |            |                                                                    |
     
    Usually you would want to use this event if you wish change the subparser hashed output


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
    | regex    | null      |            |                                                                    |
    | matches  | null      |            |                                                                    |
    
 2. **.after**.{subparserName}: *always runs*;
 
    Raised when the **{subparserName} has exited** and before the next one is called.
    
    ***Properties***:
    
    | property | type      | access     | description                                                        |
    |----------|-----------|------------|--------------------------------------------------------------------|
    | input    | string    | read       | The partial/full text with the subparser modifications             |
    | output   | string    | write      | The text that will be passed to other subparsers                   |
    | regex    | null      |            |                                                                    |
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
