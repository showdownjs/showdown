# ROADMAP TO VERSION 2.0


## Options

- [ ] **ghCompatibleHeaderId** (removal)

    Will be removed and **will become the default behavior**.
    
- [ ] **customizedHeaderId** (removal)

    This option introduced non compliant syntax so it really belongs in an extension.
    The new **listener extension system** allows users to directly modify and customize
    the HTML and add any attributes they wish. 

- [ ] **rawPrefixHeaderId** (removal)

    This option will be superseeded by the option `rawHeaderId`. So basically activating `rawHeaderId` will make
    showdown only to replace spaces, ', ", > and < with dashes (-) from generated header ids, including prefixes.

- [X] **literalMidWordAsterisks** (removal)

    This option is weird, hard to maintain and really... makes little sense.

- [X] **excludeTrailingPunctuationFromURLs** (removal)

    This option will be removed and will be the default behavior from now on.

- [ ] **strikethrough** (change)

    Will be enabled by default

- [ ] **disableForced4SpacesIndentedSublists** (to think/postpone)

    This was only a temporary option for backwards compatibility reason. However, most flavours support lists indented
    with 2 spaces, so it puts us in a tight spot, specially since some markdown beautifiers out there insist in
    indenting lists with 2 spaces, probably in a misguided try to follow the CommonMark spec.
    
    The CommonMark spec is, IMHO, a bit confusing for users regarding this, since list sub-blocks (and lists) 
    are determined by the spaces from the start of the line and the first character after the list mark. And the proof
    are the MD beautifiers out there, which misinterpreted the spec and made a mess 
    
    Showdown syntax is actually easier (and fully compliant with the original spec): if you indent something 4 spaces,
    it becomes a sub-block. Since lists are blocks, you must indent it 4 spaces for it to become a sub-block.
    
    Regardless, we kinda have 2 solutions:
    
    - Drop support for 2 space indentation (and make a lot of users confused since GFM, CommonMark and others allow this)
    - Create a new list subparser that can be turned on with an option, like gfmListStyle
      (but postpones even more the alpha 2.0 release since the list subparser is probably the hardest thing to rewrite)
    
    Tough choices...

- [ ] **simpleLineBreaks** (change)

    Will be removed from Github Flavor since github only does this in comments (which is weird...)

- [ ] **openLinksInNewWindow** (removal)

    Will be removed in favor of the new listener extension, which will allow users to manipulate HTML tags attributes
    directly.
    
- [ ] Revamp the option system

    Revamp the option system so that it becomes more simple. Right now, it's really confusing. And option names are weird
    too. The idea is to pass options to the constructor under an option object, that can have hierarchical structure.
    Ex:
    
    ```js
    var conv = new showdown.Converter({ 
      options: { 
        links: {
          autoLinks: true
        },
        headings: {
          startLevel: 2
        }
      }
    });
    ``` 

## Legacy Code Removal
- [ ] Legacy extension support
        
    Old extensions that inject directly into extensions object property will no longer be supported
    
- [ ] HTML and OUTPUT extensions
    
    HTML and OTP extensions will be dropped in favor of Listener Extensions. We might even give them a new name
    
## Subparsers
- [X] **Anchors**: Revamp the anchors subparser so it calls strikethrough, bold, italic and underline directly
- [X] **autoLinks**: Fix some lingering bugs and issues with autolinks

## Priority Bugs
- [X] **#355**: *simplifiedAutoLink URLs inside parenthesis followed by another character are not parsed correctly*
- [X] **#534**: *Multiple parentheses () in url link is not parsed correctly*
- [ ] **#367**: *sublists rendering with 2 spaces* - related to disableForced4SpacesIndentedSublists option...
- [ ] **#537**: *master branch doesn't work in a web worker*

## CLI
- [ ] Refactor the CLI
- [ ] **#381**: *Support for src and dst directories in showdown cli*
- [ ] **#584**: *Fails to read from stdin*
- [ ] **#554**: *CLI not working with jsdom v10*

## Other stuff
- [X] Regexp rewrite for more performance oompf
- [ ] Full unit testing
- [ ] Better error reporting

## Stuff that probably won't make it to v2.0
- [ ] **#486**: *A backslash at the end of the line is a hard line break*
- [ ] **#548**: *anchors and images of subParser are errors when they are specific strings*
- [ ] **#549**: *Strange parsing issue with `<pre><code>`*
- [ ] Rethink the global variable

## NEW Features

### Event system
- [X] Listener system revamp
- [ ] Standardize events for all event types
- [ ] Unit testing
- [ ] Functional testing

This should address:
- **#567**: Allow not making header ids lowercase
- **#540**: Add complete class to the tasklist list element

### MD to HTML conversion
- [X] Basic support
- [X] Basic functional testcase
- [ ] Advanced support for all showdown MD features
- [ ] Advanced functional testcase
- [ ] Unit testing

## Documentation (for v2.0)
- [ ] Options
- [ ] Extensions (and the new event system)
- [ ] Cookbook (with stuff for backwards compatibility, specially regarding removed options)
