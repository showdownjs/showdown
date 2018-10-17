«««
title: Annoucement: Showdown 2.0,
author: Estevão Soares dos Santos,
author_avatar: img/avatars/tivie.jpg,
date: 2017-12-12,
language: en,
image: img/blog/2017.12.12.jpg,
summary: Showdown version 1.0.0 was released almost 3 years ago, back in May 2015.
    Since then, it has seen a lot of improvements, with a boost to performance and a significant number of features now
    included in the core of the library. However, do to backwards compatibility constrains, we are still supporting a
    lot of legacy features, that prevent us from moving the software forward.
    With that in mind, **it is time to start thinking about Showdown version 2.0.**
    For the next major release of Showdown we have planned a range of **significant changes and additions**.
»»»
Showdown version 1.0.0 was released almost 3 years ago, back in May 2015.
Since then, it has seen a lot of improvements, with a boost to performance and
a significant number of features now included in the core of the library.

However, do to backwards compatibility constrains, we are still supporting a lot
of legacy features, that prevent us from moving the software forward.

With that in mind, **it is time to start thinking about Showdown version 2.0.**

For the next major release of Showdown we have planned a range of **significant changes
and additions**. Here are a few of the most important ones:

## Reverse Conversion (HTML to MD)

Being a popular request by our users, we though that a new major version is the perfect
opportunity to implement this feature.

This feature requires a number of changes throughout the code and API. For instance,
the extension system must be redesigned to allow for extensions to hook unto both
processes (HTML->MD and MD->HTML). Event and option names must also reflect this
since, as they stand now, they might cause confusion.

## Extensions

We are (finally) **completely dropping support for legacy extensions**. Although there are a
couple old ones still in the wild, most of them (if not all) have already
migrated to the modern extension system.

We are also revamping the extension system. For starters, **we're dropping old "lang"
and "output" extension in favour of event extensions**.

The **API of event extensions will also change** in order to mimic the browser events
and play nicely with other libraries and frameworks.

## Subparsers

**Subparsers will also see a major code refactoring**, with performance improvements.
Although performance is no longer an issue, mainly due to the way new browsers
handle Regular Expressions, there are a couple of issues that still need to be addressed.
Most of the issues can be fixed if we drop support for old browsers and old nodejs versions.

## Development

Formally, Showdown 2.0 will start development in the beginning of 2018 and all
development efforts will be put into it.
This means **Showdown 1.x will now enter maintenance mode, that is, no new features
will be added** and only important bugfixes will be committed.

We expect to release an alpha version of Showdown 2.0 somewhere around ~~August 2018,~~
the fall of 2018. ***So, if you are as excited as we are, stay tuned for more information***.
