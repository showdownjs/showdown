
This is [an example][id] reference-style link.
This is [another] [foo] reference-style link.
This is [a third][bar] reference-style link.
This is [a fourth][4] reference-style link.

  [id]: http://example.com/  "Optional Title Here"
  [foo]: http://example.com/  (Optional Title Here)
  [bar]: http://example.com/  (Optional Title Here)
  [4]: <http://example.com/>
    "Optional Title Here"
  
 

<http://example.com/>
  
 
> a blockquote
    with a 4 space indented line (not code)

sep

> a blockquote

    with some code after
  
 
    > this is a pseudo blockquote
    > inside a code block

foo

    > this is another bq
    inside code
  
 
> ## This is a header.
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");
  
 
  
  > This is a multi line blockquote test
  >
  > With more than one line.
  
 

This is some HTML:

    <h1>Heading</h1>
  
 

This is a normal paragraph:

    This is a code block.
  
 

 *  Bird

 *  Magic
  
 
*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

text *with italic sentence* in middle

text __with bold sentence__ in middle

text with __bold text that
spans across multiple__ lines

underscored_word

doubleunderscore__word

asterix*word

doubleasterix**word

line with_underscored word

line with__doubleunderscored word

line with*asterixed word

line with**doubleasterixed word

some line_with_inner underscores

some line__with__inner double underscores

some line*with*inner asterixs

some line**with**inner double asterixs

another line with just _one underscore

another line with just __one double underscore

another line with just *one asterix

another line with just **one double asterix

a sentence with_underscore and another_underscore

a sentence with__doubleunderscore and another__doubleunderscore

a sentence with*asterix and another*asterix

a sentence with**doubleasterix and another**doubleasterix

escaped word\_with\_underscores

escaped word\_\_with\_\_double underscores

escaped word_\_with\__single italic underscore

escaped word\*with*asterixs

escaped word\*\*with\*\*asterixs

escaped word**\*with\***bold asterixs
  
 
It happened in 1986\. What a great season.
  
 

These should all be escaped:

\\

\`

\*

\_

\{

\}

\[

\]

\(

\)

\#

\+

\-

\.

\!
  
 
```
function MyFunc(a) {
    // ...
}
```

That is some code!
  
 
> Define a function in javascript:
>
> ```
> function MyFunc(a) {
>     var s = '`';
> }
> ```
>
>> And some nested quote
>>
>> ```html
>> <div>HTML!</div>
>> ```
  
 

Define a function in javascript:

```
function MyFunc(a) {
    var s = '`';
}
```

And some HTML

```html
<div>HTML!</div>
```
  
 
```
code can go here
this is rendered on a second line
```
  
 
# This is an H1 #
  
 
This is an H1
=============
  
 
# This is an H1
  
 
This is an H2
-------------
  
 
## This is an H2 ##
  
 
## This is an H2
  
 
### This is an H3 ###
  
 
### This is an H3
  
 
#### This is an H4
  
 
##### This is an H5
  
 
###### This is an H6
  
 

* * *

***

*****

- - -

---------------------------------------
  
 
<!-- a comment -->

<!-- a comment with *bogus* __markdown__ inside -->

words <!-- a comment --> words

<!-- comment --> words

   <!-- comment -->

    <!-- comment -->
  
 
  - list item 1

    ```html
    <a href="www.google.com">google</a>
    <div>
      <div>some div</div>
    </div>
    ```
  
 

These HTML5 tags should pass through just fine.

<section>hello</section>
<header>head</header>
<footer>footsies</footer>
<nav>navigation</nav>
<article>read me</article>
<aside>ignore me</aside>
<article>read
me</article>
<aside>
ignore me
</aside>

the end

<table class="test">
    <tr>
        <td>Foo</td>
    </tr>
    <tr>
        <td>Bar</td>
    </tr>
</table>

<table class="test">
    <thead>
        <tr>
            <td>Foo</td>
        </tr>
    </thead>
    <tr>
        <td>Bar</td>
    </tr>
    <tfoot>
        <tr>
            <td>Bar</td>
        </tr>
    </tfoot>
</table>

<audio class="podcastplayer" controls>
    <source src="foobar.mp3" type="audio/mp3" preload="none"></source>
    <source src="foobar.off" type="audio/ogg" preload="none"></source>
</audio>

<video src="foo.ogg">
    <track kind="subtitles" src="foo.en.vtt" srclang="en" label="English">
    <track kind="subtitles" src="foo.sv.vtt" srclang="sv" label="Svenska">
</video>

<address>My street</address>

<canvas id="canvas" width="300" height="300">
    Sorry, your browser doesn't support the &lt;canvas&gt; element.
</canvas>

<figure>
    <img src="mypic.png" alt="An awesome picture">
    <figcaption>Caption for the awesome picture</figcaption>
</figure>

<hgroup>
  <h1>Main title</h1>
  <h2>Secondary title</h2>
</hgroup>

<output name="result"></output>
  
 

![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")

![Alt text][id]

  [id]: url/to/image  "Optional title attribute"
  
 

Search the web at [Google][] or [Daring Fireball][].

  [Google]: http://google.com/
  [Daring Fireball]: http://daringfireball.net/
  
 

This is [an example](http://example.com/ "Title") inline link.

[This link](http://example.net/) has no title attribute.
  
 

Create a new `function`.

Use the backtick in MySQL syntax ``SELECT `column` FROM whatever``.

A single backtick in a code span: `` ` ``

A backtick-delimited string in a code span: `` `foo` ``

Please don't use any `<blink>` tags.

`&#8212;` is the decimal-encoded equivalent of `&mdash;`.
  
 

Hello.this\_is\_a\_variable
and.this.is.another_one
  
 

<style>
    p { line-height: 20px; }
</style>

An exciting sentence.
  
 

  > This is a multi line blockquote test

  > With more than one line.
  
 
<a href="foo">some text</a> words

<br> words
  
 
# some title

1. list item 1
2. list item 2

> some text in a blockquote

* another list item 1
* another list item 2
  
 
# some title

1. list item 1
2. list item 2

```
some code

and some other line of code
```

* another list item 1
* another list item 2
  
 
*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
  
 
*   A list item with code:

        alert('Hello world!');
  
 
<code>some **code** yeah</code>

some <code>inline **code** block</code>

<code>some inline **code**</code> block

yo dawg <code start="true">some <code start="false">code</code> inception</code>

<div>some **div** yeah</div>
  
 

 1.  This is a major bullet point.

    That contains multiple paragraphs.

 2.  And another line
  
 

 - This line spans
 more than one line and is lazy
 - Similar to this line
  
 

  > This is a multi line blockquote test
  >
  > > And nesting!
  >
  > With more than one line.
  
 

 1.  Red
 1.  Green
 1.  Blue
  
 

 8.  Red
 1.  Green
 3.  Blue
  
 

 1.  Red
 2.  Green
 3.  Blue
  
 
 - foo
 
    - bazinga
    
    - yeah
 
 - bar
 
    1. damn
    
    2. so many paragraphs
 
 - baz
  
 
code inception

```
<pre><code>
<div>some html code inside code html tags inside a fenced code block</div>
</code></pre>
```
  
 
<pre>
<code>
foobar
</code>
</pre>

blabla

<pre nhaca="zulu"><code bla="bla">
foobar
</code>
</pre>

<pre><code>
<div>some html code</div>
</code></pre>
  
 

See my [About](/about/) page for details.
  
 
# Same Title

some text

# Same Title
  
 

Hello, world!
  
 

**important**

__important__

really **freaking**strong
  
 

 * Red
 * Green
 * Blue
  
 

 - Red
 - Green
 - Blue
  
 

 + Red
 + Green
 + Blue
  
 
There's an [episode](http://en.memory-alpha.org/wiki/Darmok_(episode)) of Star Trek: The Next Generation
  
 
# some title

Test **bold** and _italic_
  
 
![my image](./pic/pic1_50.png =100pxx20px)

![my image2][1]

[1]: ./pic/pic1_50.png =100pxx20px
  
 
foo.bar

www.foobar

www.foobar.com

http://foobar.com

https://www.foobar.com/baz?bazinga=nhecos;

<a href="http://www.google.com/">http://www.google.com</a>
  
 
this is a sentence_with_mid underscores

this is a sentence with just_one underscore

this _should be parsed_ as emphasis

this is double__underscore__mid word

this has just__one double underscore

this __should be parsed__ as bold

emphasis at _end of sentence_

_emphasis at_ line start

multi _line emphasis
yeah it is_ yeah
  
 
a ~~strikethrough~~ word

this should~~not be parsed

~~strike-through text~~
  
 
# my things

 -  foo
 - [] bar
 - [ ] baz
 - [x] bazinga

otherthings
  
 
# some markdown

blabla
<div>This is **not parsed**</div>
<div markdown="1">This is **parsed**</div>
<div>This is **not parsed**</div>
  
 
​pointer *ptr *thing

something _else _bla

something __else __bla
  
 
http://website.com/img@x2.jpg

http://website.com/img-x2.jpg

http://website.com/img@x2

http://website.com/img@.jpg
  
 
a simple
wrapped line
  
 
Your friend ~~[**test\***](www.google.com)~~ (~~[*@test*](www.google.com)~~) updated his/her description
  
 
      ## markdown doc
      
      you can use markdown for card documentation
        - foo
        - bar
  
 
this is a link to www.github.com

this is a link to <www.google.com>
  
 
1. One
2. Two
    - A
    - B
3. Three

> this has
> simple linebreaks

    testing
    some
    code

 1. paragraphed list

    this belongs
    to the first list item
    
 2. This text
    also

simple
text

 - a list
   item
 - another
   list item

simple
text

  - some item
 
    another
    paragraph
   
      - And
        now
     
        paragraph
        sublist
     
          - and
            even
       
            another
            one

 - foo

  
 
foo烫
bar

foo
bar
  
 
# some header

# some header with &+$,/:;=?@\"#{}|^~[]`\\*()%.!' chars

# another header > with < chars
  
 
**Nom :** aaaa
**Nom :** aaa
  
 
Just an example info@example.com ok?​
  
 
#Given

#When

#Then

foo
===

bar
---
  
 
http://en.wikipedia.org/wiki/Tourism_in_Germany
  
 
this email <foobar@example.com> should not be encoded
  
 
this is some text

```php
function thisThing() {
  echo "some weird formatted code!";
}
```

some other text
  
 
* foo
  * bar

...

* baz
  1. bazinga
  
 
url http://www.google.com.

url http://www.google.com!

url http://www.google.com? foo

url (http://www.google.com) bazinga
  
 
hello @tivie how are you?

this email foo@gmail.com is not parsed

this \@mentions is not parsed also
  
 
# header

#header
  
 
 1. One
 2. Two
    foo
    
    bar
    bazinga
    
    
    
    
    nhecos
    
 3. Three
    
    - foo
    
    - bar
     
 
| *foo* | **bar** | ~~baz~~ |
|-------|---------|---------|
| 100   | blabla  |  aaa    |
  
 
|key|value|
|--|--| 
|My Key|My Value|
  
 
| First Header  | Second Header |
| :------------ | :------------ |
| Row 1 Cell 1  | Row 1 Cell 2  |
| Row 2 Cell 1  | Row 2 Cell 2  |
  
 
| First Header  | Second Header |
| ------------- | ------------- |
| Row 1 Cell 1  | Row 1 Cell 2  |
| Row 2 Cell 1  | Row 2 Cell 2  |
  
 
| First Header  | Second Header |
| ------------- | ------------- |
| Row 1 Cell 1  | Row 1 Cell 2  |
| Row 2 Cell 1  | Row 2 Cell 2  |
  
 
First Header  | Second Header|Third Header
------------- | -------------|---
Content Cell  | Content Cell|C
Content Cell  | Content Cell|C
  
 
| First Header  | Second Header | Third Header  | Fourth Header |
| :------------ |: ----------- :| ------------ :| ------------- |
| Row 1 Cell 1  | Row 1 Cell 2  | Row 1 Cell 3  | Row 1 Cell 4  |
| Row 2 Cell 1  | Row 2 Cell 2  | Row 2 Cell 3  | Row 2 Cell 4  |
| Row 3 Cell 1  | Row 3 Cell 2  | Row 3 Cell 3  | Row 3 Cell 4  |
| Row 4 Cell 1  | Row 4 Cell 2  | Row 4 Cell 3  | Row 4 Cell 4  |
| Row 5 Cell 1  | Row 5 Cell 2  | Row 5 Cell 3  | Row 5 Cell 4  |
  
 
| First Header  | Second Header | Third Header  | Fourth Header |
| ------------- | ------------- | ------------  | ------------- |
| Row 1 Cell 1  | Row 1 Cell 2  | Row 1 Cell 3  | Row 1 Cell 4  |
| Row 2 Cell 1  | Row 2 Cell 2  | Row 2 Cell 3  | Row 2 Cell 4  |
| Row 3 Cell 1  | Row 3 Cell 2  | Row 3 Cell 3  | Row 3 Cell 4  |
| Row 4 Cell 1  | Row 4 Cell 2  | Row 4 Cell 3  | Row 4 Cell 4  |
| Row 5 Cell 1  | Row 5 Cell 2  | Row 5 Cell 3  | Row 5 Cell 4  |
  
 
| Left-Aligned  |    Center-Aligned    | Right-Aligned |
| :------------ |:--------------------:| -------------:|
| col 3 is      | some wordy paragraph |         $1600 |
| col 2 is      |       centered       |           $12 |
| zebra stripes |       are neat       |            $1 |
  
 
Table Test
============

section 1
------------

|header1    |header2    |header3|
|-----------|-----------|---------|
|Value1     |Value2     |Value3   |


section 2
-----------

|headerA    |headerB    |headerC|
|-----------|-----------|---------|
|ValueA     |ValueB     |ValueC   |
  
 
some text


    | Tables        | Are           | Cool  |
    | ------------- |:-------------:| -----:|
    | **col 3 is**  | right-aligned | $1600 |
    | col 2 is      | *centered*    |   $12 |
    | zebra stripes | ~~are neat~~  |    $1 |
  
 

### Stats


Status | AGENT1 | AGENT2 | AGENT3 | AGENT4 | AGENT5 | AGENT6 | AGENT7 | AGENT8 | AGENT9 | TOTAL |
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
AGENT ERROR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
APPROVED | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
  
 
| First Header  | Second Header |
| ============= | ============= |
| Row 1 Cell 1  | Row 1 Cell 2  |
| Row 2 Cell 1  | Row 2 Cell 2  |
  
 
| First Header  | Second Header     |
| ------------- | ----------------- |
| **bold**      | ![img](foo.jpg)   |
| _italic_      | [link](bla.html)  |
| `some code`   | [google][1]       |
| <www.foo.com> | normal            |


  [1]: www.google.com
  
 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nisi est, 
ullamcorper euismod iaculis sed, tristique at neque. Nullam metus risus, 
malesuada vitae imperdiet ac, tincidunt eget lacus. Proin ullamcorper 
vulputate dictum. Vestibulum consequat ultricies nibh, sed tempus nisl mattis a.

| First Header  | Second Header |
| ------------- | ------------- |
| Row 1 Cell 1  | Row 1 Cell 2  |
| Row 2 Cell 1  | Row 2 Cell 2  |

Phasellus ac porttitor quam. Integer cursus accumsan mauris nec interdum. 
Etiam iaculis urna vitae risus facilisis faucibus eu quis risus. Sed aliquet 
rutrum dictum. Vivamus pulvinar malesuada ultricies. Pellentesque in commodo 
nibh. Maecenas justo erat, sodales vel bibendum a, dignissim in orci. Duis 
blandit ornare mi non facilisis. Aliquam rutrum fringilla lacus in semper. 
Sed vel pretium lorem.
  
 
| First Header  | Second Header |
| ------------- | ------------- |
  
 
| First Header  | Second Header |
  
 
### Automatic Links

```
https://ghost.org
```

https://ghost.org

### Markdown Footnotes

```
The quick brown fox[^1] jumped over the lazy dog[^2].

[^1]: Foxes are red
[^2]: Dogs are usually not red
```

The quick brown fox[^1] jumped over the lazy dog[^2].


### Syntax Highlighting

    ```language-javascript
       [...]
    ```

Combined with [Prism.js](http://prismjs.com/) in the Ghost theme:

```language-javascript
// # Notifications API
// RESTful API for creating notifications
var Promise            = require('bluebird'),
    _                  = require('lodash'),
    canThis            = require('../permissions').canThis,
    errors             = require('../errors'),
    utils              = require('./utils'),

    // Holds the persistent notifications
    notificationsStore = [],
    // Holds the last used id
    notificationCounter = 0,
    notifications;
```
  
 
foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo

_baz_bar_foo_

__baz_bar_foo__

___baz_bar_foo___

baz bar foo _baz_bar_foo foo bar baz_ and foo

foo\_bar\_baz foo\_bar\_baz\_bar\_foo \_foo\_bar baz\_bar\_ baz\_foo

`foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo`


    foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo


```html
foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo
```

<pre>foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</pre>

<pre><code class="language-html">foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</code></pre>

<pre class="lang-html"><code class="language-html">foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</code></pre>

<script>
var strike = "foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo";
var foo_bar_baz_bar_foo = "foo_bar_";
</script>

[foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo](http://myurl.com/foo_bar_baz_bar_foo)

<a href="http://myurl.com/foo_bar_baz_bar_foo" title="foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo">foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</a>

<img src="http://myurl.com/foo_bar_baz_bar_foo" alt="foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo">

foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo
-----

### foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo

1. foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo
2. foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo

> blockquote foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo

* foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo
* foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo

-------

http://en.wikipedia.org/wiki/Tourism_in_Germany

[an example] [wiki]

Another [example][wiki] of a link

[wiki]: http://en.wikipedia.org/wiki/Tourism_in_Germany

<p><code>foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</code></p>

<!-- These two cases still have bad <ems> because showdown handles them incorrectly -->

<code>foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo</code>

![foo_bar_baz foo_bar_baz_bar_foo _foo_bar baz_bar_ baz_foo](http://myurl.com/foo_bar_baz_bar_foo)

http://myurl.com/foo_bar_baz_bar_foo

<http://myurl.com/foo_bar_baz_bar_foo>

_italics_.

_italics_   .
  
 
escaped word\_with\_underscores

escaped word\_\_with\_\_double underscores

escaped word_\_with\__single italic underscore

escaped word\*with*asterixs

escaped word\*\*with\*\*asterixs

escaped word**\*with\***bold asterixs
  
 
* Item 1
* Item 2

1. Item 1
2. Item 2

- Item 1
- Item 2
  
 
2015-10-04
  
 
1. Hi, I am a thing

   ```sh
    
   $ git clone thing.git
   
   dfgdfg
   ```

1. I am another thing!

   ```sh
   
   $ git clone other-thing.git

   foobar
   ```
  
 
> a blockquote
# followed by an heading
  
 
Test pre in a list

- & <
- `& <`
    - & <
    - `& <`
        - & <
        - `& <`
            - & <
            - `& <`
  
 
Title 1
-------

<div></div>


# Title 2


<div>
</div>
  
 
<pre lang="no-highlight"><code>
foo

```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```

bar
</code></pre>

this is a long paragraph

this is another long paragraph

<pre lang="no-highlight"><code>```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```

```python
s = "Python syntax highlighting"
print s
```
</code></pre>
  
 
<pre lang="no-highlight"><code>
```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```

```python
s = "Python syntax highlighting"
print s
```

```
No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.
```
</code></pre>
  
 
<pre lang="no-highlight"><code>```python
var s;
```
</code></pre>

this is a long paragraph

<pre lang="no-highlight"><code>
```javascript
var s;
```
</code></pre>
  
 
![sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png) [sd-ref][sd-logo]

foo

[sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png) ![sd-ref][sd-logo]

foo

![sd-ref][sd-logo] [sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

foo

[sd-ref][sd-logo] ![sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

foo

[![sd-ref][sd-logo]](http://www.google.com/)

[sd-logo]: https://www.google.pt/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png
  
 
![sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png) ![sd-ref][sd-logo]

foo

![sd-ref][sd-logo] ![sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

[sd-logo]: https://www.google.pt/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png
  
 
[sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png) [sd-ref][sd-logo]

foo

[sd-ref][sd-logo] [sd-inline](https://raw.githubusercontent.com/showdownjs/logo/master/dist/logo.readme.png)

[sd-logo]: https://www.google.pt/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png
  
 
* list item 1

    ```
    <parent>
    <child>child1</child>
    <!-- This is a comment -->
    <child>child2</child>
    <child>some text <!-- a comment --></child>
    </parent>
    ```

* list item 2

```
<parent>
<child>child1</child>
<!-- This is a comment -->
<child>child2</child>
<child>some text <!-- a comment --></child>
</parent>
```
  
 
 * one
 1. two

foo

  * one
  1. two

foo

   * one
   1. two

foo

   * one
     1. two

foo

 * one
 * two

foo

  * one
  * two

foo

   * one
   * two

foo

   * one
* two

foo

   * one
    * two
  
 
 * one long paragraph of
text
 1. two

foo

  * one long paragraph of
text
   1. two
  
 
* one
1. two

foo

* one
 1. two

foo

* one
  1. two

foo

* one
   1. two

foo

* uli one
* uli two

foo

* uli one
 * uli two

foo

* uli one
  * uli two

foo

* uli one
   * uli two
  
 
- - - a

a

+ - * - - + a

a

1. 2. 3. 4. 5.

a

1. 2. 3. 4. 5. a
  
 
- - - a

+ - * - - + a

1. 2. 3. 4. 5.

1. 2. 3. 4. 5. a
  
 
- - 
a


fooo


- - - aaaaa

   bbbbb
  
 
- - - - -- - - - - - - -- - - - - - - - - - -    - - - - - - - - -  abcd
  
 
   ---

   - - -
  
 
plain text link http://test.com/this_has/one.html with underscores

legit·word_with·1·underscore

a word_with_2underscores (gets em)
  
 
this is a underscore_test ![my cat](http://myserver.com/my_kitty.jpg)

another ![my cat](http://myserver.com/my_kitty.jpg) underscore_test bla
  
 
This is a first paragraph,
on multiple lines.
     
This is a second paragraph.
There are spaces in between the two.
  
 
This is a first paragraph,
on multiple lines.

This is a second paragraph
which has multiple lines too.
  
 
A first paragraph.



A second paragraph after 3 CR (carriage return).
  
 
This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph on 1 line.
     
A few spaces and a new long long long long long long long long long long long long long long long long paragraph on 1 line.
  
 
This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph on 1 line.
	
1 tab to separate them and a new long long long long long long long long long long long long long long long long paragraph on 1 line.
  
 
This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph on 1 line.

A new long long long long long long long long long long long long long long long long paragraph on 1 line.
  
 
An ampersand & in the text flow is escaped as an html entity.
  
 
There is an [ampersand](http://validator.w3.org/check?uri=http://www.w3.org/&verbose=1) in the URI.
  
 
This is \*an asterisk which should stay as is.
  
 
This is * an asterisk which should stay as is.
  
 
\\   backslash
\`   backtick
\*   asterisk
\_   underscore
\{\}  curly braces
\[\]  square brackets
\(\)  parentheses
\#   hash mark
\+   plus sign
\-   minus sign (hyphen)
\.   dot
\!   exclamation mark
  
 
> # heading level 1
> 
> paragraph
  
 
>A blockquote with a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long line.

>and a second very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long line.
  
 
>This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph in a blockquote.
  
 
> A blockquote
> on multiple lines
> like this.
  
 
>A blockquote 
>on multiple lines 
>like this. 
  
 
>A blockquote
>on multiple lines
>like this.
>
>But it has
>two paragraphs.
  
 
>A blockquote
>on multiple lines
>like this
  
 
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
  
 
> This is the first level of quoting.
>
> > This is nested blockquote.
  
 
> This is the first level of quoting.
> > This is nested blockquote.
> Back to the first level.
  
 
> This is the first level of quoting.
> > This is nested blockquote.
  
 
	10 PRINT HELLO INFINITE
	20 GOTO 10
  
 
    10 PRINT < > &
    20 GOTO 10
  
 
    10 PRINT HELLO INFINITE
    20 GOTO 10
  
 
as*te*risks
  
 
*single asterisks*
  
 
_single underscores_
  
 
HTML entities are written using ampersand notation: &copy;
  
 
These lines all end with end of line (EOL) sequences.

Seriously, they really do.

If you don't believe me: HEX EDIT!

  
 
These lines all end with end of line (EOL) sequences.Seriously, they really do.If you don't believe me: HEX EDIT!  
 
These lines all end with end of line (EOL) sequences.

Seriously, they really do.

If you don't believe me: HEX EDIT!

  
 
This is an H1
=============
  
 
# This is an H1 #
  
 
 # This is an H1
   
 
# this is an h1 with two trailing spaces  
A new paragraph.
  
 
# This is an H1
  
 
This is an H2
-------------
  
 
## This is an H2 ##
  
 
## This is an H2
  
 
### This is an H3 ###
  
 
### This is an H3
  
 
#### This is an H4 ####
  
 
#### This is an H4
  
 
##### This is an H5 #####
  
 
##### This is an H5
  
 
###### This is an H6  ######
  
 
###### This is an H6
  
 
- - -
  
 
---
  
 
***
  
 
___
  
 
-------
  
 
![HTML5][h5]

[h5]: http://www.w3.org/html/logo/img/mark-word-icon.png "HTML5 for everyone"
  
 
![HTML5][h5]

[h5]: http://www.w3.org/html/logo/img/mark-word-icon.png
  
 
![HTML5](http://www.w3.org/html/logo/img/mark-word-icon.png "HTML5 logo for everyone")
  
 
![HTML5](http://www.w3.org/html/logo/img/mark-word-icon.png)
  
 
We love `<code> and &` for everything
  
 
``We love `code` for everything``
  
 
``We love `code` for everything``
  
 
A first sentence  
and a line break.
  
 
A first sentence     
and a line break.
  
 
This is an automatic link <http://www.w3.org/>
  
 
[W3C](http://www.w3.org/ "Discover w3c")
  
 
[W3C](http://www.w3.org/)
  
 
[World Wide Web Consortium][w3c]

[w3c]: <http://www.w3.org/>
  
 
[World Wide Web Consortium][]

[World Wide Web Consortium]: http://www.w3.org/
  
 
[w3c][]

[w3c]: http://www.w3.org/
  
 
[World Wide Web Consortium] [w3c]

[w3c]: http://www.w3.org/
  
 
[World Wide Web Consortium][w3c]

[w3c]: http://www.w3.org/
   "Discover W3C"
  
 
[World Wide Web Consortium][w3c]

[w3c]: http://www.w3.org/ (Discover w3c)
  
 
[World Wide Web Consortium][w3c]

[w3c]: http://www.w3.org/ 'Discover w3c'
  
 
[World Wide Web Consortium][w3c]

[w3c]: http://www.w3.org/ "Discover w3c"
  
 
[World Wide Web Consortium][w3c]

[w3c]: http://www.w3.org/
  
 
*   a list containing a blockquote

    > this the blockquote in the list
  
 
*   a list containing a block of code

	    10 PRINT HELLO INFINITE
	    20 GOTO 10
  
 
*   This is a list item with two paragraphs. Lorem ipsum dolor
	sit amet, consectetuer adipiscing elit. Aliquam hendrerit
	mi posuere lectus.

	Vestibulum enim wisi, viverra nec, fringilla in, laoreet
	vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
	sit amet velit.

*   Suspendisse id sem consectetuer libero luctus adipiscing.
  
 
*   This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

*   Suspendisse id sem consectetuer libero luctus adipiscing.
  
 
1\. ordered list escape
  
 
1. 1

    - inner par list

2. 2
  
 
1. list item 1
8. list item 2
1. list item 3
  
 
1. list item 1
2. list item 2
3. list item 3
  
 
This is a paragraph
on multiple lines
with hard return.
  
 
This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph on 1 line.
  
 
 This is a paragraph with a trailing and leading space. 
  
 
This is a paragraph with 1 trailing tab.	
  
 
  This is a paragraph with 2 leading spaces.
  
 
   This is a paragraph with 3 leading spaces.
  
 
 This is a paragraph with 1 leading space.
  
 
This is a paragraph with a trailing space.   
 
as**te**risks
  
 
**double asterisks**
  
 
__double underscores__
  
 
* list item 1
* list item 2
* list item 3
  
 
- list item 1
- list item 2
- list item 3
  
 
 * list item 1
 * list item 2
 * list item 3
  
 
  * list item 1
  * list item 2
  * list item 3
  
 
   * list item 1
   * list item 2
   * list item 3
  
 
+ list item 1
+ list item 2
+ list item 3
  
 
* list item in paragraph

* another list item in paragraph
  
 
*   This a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long paragraph in a list.
*   and yet another long long long long long long long long long long long long long long long long long long long long long long line.
  
 
*   This is a list item
    with the content on
    multiline and indented.
*   And this another list item
    with the same principle.
  
 
