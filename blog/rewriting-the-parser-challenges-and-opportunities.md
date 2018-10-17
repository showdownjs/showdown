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

There comes a time when tough (and exciting) choices need to be made. With a version 2.0 in the oven 
(and the exciting reverse parser already completed), it seemed an excellent opportunity for doing something that 
I wished for a long time: rewriting showdown's parser from scratch. 

But maybe that challenge was a lot more tough than I first anticipated!

## The old parser

The old parser was based on replacing markdown text with HTML, through a series of Regular Expression in loco replaces.
While this was true to showdown's origins in Markdown.pl from John Gruber, during the last 3 years it became clear that
Regex (at least alone) was not suitable for the job.

Don't get me wrong, Regex is a great tool: *not only it works for 99% of use cases* but also makes it extremely easy,
to develop extensions that complement showdown's features, even for beginner programmers.

The problem, however, are those pesky edge cases... that 1% of of weird scenarios that made the Regular Expressions
increasingly complex over the time and forced me to make more and more exceptions to the rule.

In fact, when you compare v 1.0 to v. 1.8.6, it's plain to see that almost all bug fixes (with notable exceptions)
were, in fact, edge case fixes.

## Regex Madness

Some regexes grew so weirdly that I need to split them in chunks and do some convoluted stuff to keep sanity.

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
so HTML parsing was not as painful and slow as it was.


## Enter the new parser

For all those reasons, and some more, I felt that version 2.0 should have a shinny and **proper new parser** that relied 
on sequentiality and code logic rather than in place substitutions. But to move successfully away from RexExp, 3 things were needed:

1. Keep the extension logic simple (while making it more powerful)
2. Time
3. Accurately estimate number 2 (time needed vs free time)


While I feel that the first one is being accomplished quite nicely (if I may say so myself), I might have over estimated
my free time and I definitely failed at number 3. Which meant I had to keep pushing the alpha release since August.

Between work and family, the little free time I get, I dedicate it to this library. I do feel that things 
are still going on the right track, albeit a lot more slowly than expected (and than I wished for).

Regardless, **I'm really excited about the new features for version 2.0, specially the reverse converter and how it will tie in 
toegether with the new parser and event system** 


## I would really, really, really appreciate if you could donate, you know?

As you know, ShowdownJS is a free library and it will remain free forever.
However, maintaining and improving the library costs time and money.

So... if you like my work and find our library useful, 
please donate ~~[through Patreon (coming soon)](https://www.patreon.com/showdownjs) or~~ 
directly [through paypal](https://www.paypal.me/tiviesantos)!! 

Your contribution will mean a lot to me and really help me dedicate less time to my dayjob (and those annoying extra hours) 
and more time developing this (awesome) library. Thank you!!!
