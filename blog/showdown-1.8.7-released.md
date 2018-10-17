«««
title: Showdown 1.8.7 released,
author: Estevão Soares dos Santos,
author_avatar: img/avatars/tivie.jpg,
date: 2018-10-16,
language: en,
image: img/blog/2018.10.16.jpg,
summary: While everyone's waiting for the new Showdown 2.0, I released version 1.8.7 with some improvements and several bugfixes.
»»»

Showdown's version 2.0 is coming together although not as fast as I wanted, maybe 
[due to the extensive refactor done to the parser][rewriting-the-parser]. But while the community is patiently  waiting, 
I felt that some important bugfixes could (and should) be backported to v 1.x.


## What's new in 1.8.7?

Some long awaited bugfixes were backported, namely:


* **emojis:** fix emoji excessive size

* **gfm-codeblocks:**

    * add support for spaces before language declaration
    
    * leading space no longer breaks gfm codeblocks
    
* **images:** fix js error when using image references

* **literalMidWordAsterisks:** now parses single characters enclosed by * correctly

* **mentions:** allow for usernames with dot, underscore and dash

* **nbsp:** fix replacing of nbsp with regular spaces



You can download/use the new version from [github], [npm] and [CDNJS].


[rewriting-the-parser]: http://shwodownjs.com/#!/blog/rewriting-the-parser-challenge-or-opportunity
[npm]: https://www.npmjs.com/package/showdown
[github]: https://github.com/showdownjs/showdown
[CDNJS]: https://cdnjs.com/libraries/showdown
