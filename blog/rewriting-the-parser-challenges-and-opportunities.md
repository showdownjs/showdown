«««
title: Rewriting the parser: Challenges and opportunities,
author: Estevão Soares dos Santos,
author_avatar: img/avatars/tivie.jpg,
date: 2018-09-25,
language: en,
image: img/blog/2018.09.25.jpg,
summary: There comes a time when tough (and exciting) choices need to be made. With a version 2.0 in the oven 
    (and the exciting reverse parser already completed), it seemed an excellent opportunity for doing something 
    that I wished for a long time: rewriting showdown's parser from scratch. But maybe that challenge was a lot 
    more tough than I first anticipated!
»»»

***There comes a time when tough (and exciting) choices need to be made. With a version 2.0 in the oven 
(and the exciting reverse parser already completed), it seemed an excellent opportunity for doing something that 
I wished for a long time: rewriting showdown's parser from scratch.***

But maybe that challenge was a lot more tough than I first anticipated!

## The old parser

The old parser was based on replacing markdown text *in loco* and in the original string with HTML, through a series of 
Regular Expression.
While this was true to showdown's origins in John Gruber's Markdown.pl, during the last 3 years it became clear that
Regex, at least by itself, was not suitable for the parsing job.

Don't get me wrong, Regex is a great tool: *not only does it works for 99% of use cases*, it also makes it extremely easy
to develop extensions that complement showdown's features, even for beginner programmers.

The problem, however, are those pesky edge cases... that 1% of weird scenarios that ended up making showdown's Regular Expressions
increasingly complex over time

In fact, when you compare v 1.0 to v. 1.8.6, it's plain to see that almost all bug fixes (with notable exceptions)
were, in fact, edge case fixes.

## Regex Madness

Some regexes grew so weirdly that I ended up needing to split them in chunks and do some convoluted stuff to keep them minimally sane.
For instance, it takes 6 RegExps just to parse `__foo__bar__baz__`.
```javascript
  if (options.literalMidWordUnderscores) {
    text = text.replace(/\b___(\S[\s\S]*)___\b/g, function (wm, txt) {
      return parseInside (txt, '<strong><em>', '</em></strong>');
    });
    text = text.replace(/\b__(\S[\s\S]*)__\b/g, function (wm, txt) {
      return parseInside (txt, '<strong>', '</strong>');
    });
    text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
      return parseInside (txt, '<em>', '</em>');
    });
  } else {
    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
    });
    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
    });
    text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
      return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
    });
  }
```

Others, which were inherited from when I took over the project, were just plainly poorly coded and 
[hid some nasty bugs within](https://codereview.stackexchange.com/questions/150277/regex-to-parse-horizontal-rules-in-markdown).

Javascript's regex limitations (such as no support for Lookbehind or atomic and possessive grouping) meant that I needed to rely
on the language's quirks and look for hacks to overcome those limitations.
At some point I even had to adapt a [recursive RegExp extension](https://github.com/showdownjs/showdown/blob/version_1.x/src/helpers.js#L210)
which seems an overkill for a syntax that doesn't really care about balanced stuff.

And some stuff was just []impossible to fix](https://github.com/showdownjs/showdown/issues/549) without making the parser
very VERY slow for everyone. 


## Enter the new parser

For all those reasons, and some more, I felt that version 2.0 should have a shinny and **proper new parser** that read
the code sequentially and was aware of context (use more code logic and less RexExp wizardry :tada:). The new parser is, 
in fact, a lot more similar to a PEG parser than a RegExp converter with in place substitutions.

Some key features include:

  - **Sequential**
  
    The new parser reads the input sequentially. When a syntax element match is found, it "stores" the element without
    changing the original string. This means that Showdown no longer relies on (nor needs) a specific order in which 
    sub parsers are invoked.

  - **Full separation of the *parsing* and *conversion* steps**
    
    Instead of making in place substitutions of the original input, the new parser creates an intermediary abstract layer,
    an object that is a *node tree* of elements, similar to the DOM Tree in the browser, which makes it easy to manipulate
    each node before outputting it as a string again, in other format.
    
    
  - **Output manipulation is extremely easy and customizable through templates**
  
    The node tree (and each individual node) can be manipulated as you see fit since it's, in practice, an agnostic 
    representation of an element. Each node has a template for each supported format: HTML and Markdown. But you can 
    even add more formats if you wish. 
    
    What is cool is that, **not only can you can manipulate the tree (add, delete or swap nodes)**, you can also **tweak 
    or completely change the output of all nodes of a type or even a specific, individual node**.
    
  - **Extensions are a lot more powerful now**
  
    The extension system is being completely redone and will tie in really really well with the new parser and 
    **Reverse Converter**.
    
  - **Faster (it seems)**
    
    RegExps, specially the complex ones, are slow. So, moving away from them, and only using RegExp for quick checks,
    should speed up the parser a lot. Well, at least in theory.
    

## Not everything are roses though

Unfortunately, to accomplish this and successfully move away from RexExp, 3 things were needed:

1. Keep the extension logic simple (while making it more powerful)
2. Time
3. Accurately estimate number 2 (time needed vs free time)


While I feel that the first one is being accomplished quite nicely (if I may say so myself), **I might have over estimated
my free time** and I definitely failed at number 3. Which meant I had to keep delaying the alpha release for v2.0, which
I intended to release in mid 2018.

Between work and family, the little free time I get, I dedicate it to this library. I do feel that things 
are still going on the right track, albeit a lot more slowly than expected (and than I wished for).

Regardless, **I'm really excited about the new features for version 2.0, specially the reverse converter and how it will tie in 
toegether with the new parser and event system**


## I would really, really, really appreciate if you could donate, you know?

For all those reasons, working on the 2.0 version consumes a lot of my free time which, unfortunately, I don't have that much lately.

I would really, REALLY appreciate if you could donate. Your contribution will mean a lot to me and really help me 
dedicate less time to my dayjob (and those annoying extra hours) and more time developing this (awesome) library.

So... if you like my work and find our library useful, 
please donate ~~[through Patreon (coming soon)](https://www.patreon.com/showdownjs) or~~ 
directly [through paypal](https://www.paypal.me/tiviesantos)!! 

Thank you!!
