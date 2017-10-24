Markdown test adapted from BitBucket
====================

[Markdown][fireball] for readmes is pretty popular.  So, I've given you a demo
here of all the markup we support. In some cases, I copied the doc/examples entirely from the Fireball Markdown site. 

I didn't duplicate all the Markdown doc everything tho. For the entire docs and a deeper explanation of Markdown, you still need to go to the [Markdown][fireball] site.

You can also use [Markdown mark up][BBmarkup] in comments, issues, and commit messages.

On this page:


* [Span Elements](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-span-elements)
    * [Emphasis](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-emphasis)

    * [Strikethrough](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-strikethrough)
    
    * [Preformatted code](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-preformatted-code)

    * [Links](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-links)

    * [Images](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-images)

* [Block Elements](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-block-elements)
    * [Headings](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-headings)

    * [Paragraphs and blockquotes](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-paragraphs-and-blockquotes)

    * [Lists](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-lists)

    * [Tables](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-tables)

    * [Code and Syntax highlighting](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-code-and-syntax-highlighting)

    * [Horizontal rules](https://Markdown.org/tutorials/markdowndemo/overview#markdown-header-horizontal-rules)

- - -

# Span Elements

These elements occur within a line of text.  So, for example font changes or links.

 
## Emphasis

Markdown treats * (asterisk) as emphasis markers. 

*single asterisks*
**double asterisks**

All are created from this:

    *single asterisks*

    **double asterisks**


## Underline [experimental]


__double underscores__

___triple underscores___


All are created from this:


    __double underscores__

    ___triple underscores___


You must use the same character must be used to open and close an emphasis span. Emphasis can be used in the mi*dd*le of a word.

    Emphasis can be used in the mi*dd*le of a word.

But if you surround an * or _ with spaces, it will be treated as a literal asterisk or underscore.

To produce a literal asterisk or underscore at a position where it would otherwise be used as an emphasis delimiter, you can backslash escape it:

    \*this text is surrounded by literal asterisks\*

## Strikethrough

Markdown's Markdown parser supports strikethrough by wrapping text in `~~`:

~~text that has been struckthrough~~

is created from:

    ~~text that has been struckthrough~~

## Preformatted code

To indicate a span of code, wrap it with `` ` `` (backtick). Unlike a pre-formatted code block, a code span indicates code within a normal paragraph. For example:

Use the `printf()` function.

is produced from:

    Use the `printf()` function.
    
To include a literal backtick character within a code span, you can use multiple backticks as the opening and closing delimiters:

``There is a literal backtick (`) here.``    


## Links

Markdown supports inline and reference links. In both styles, the link text is delimited by [square brackets]. To create an inline link, use this syntax:

    [ Text for the link ](URL)

So an inline link to [Yahoo](http://www.yahoo.com) looks like this:

    So an inline link to [Yahoo](http://www.yahoo.com) looks like this:

Reference-style links use a second set of square brackets, inside which you place a label of your choosing to identify the link:

    This is [an example][id] reference-style link.
    
Which gives you a link like this:

This is [an example][id] reference-style link.
    
Elsewhere in the document, usually at the bottom of the file, you define your link label on a line by itself:

    [id]: http://example.com/  "Optional Title Here"
    
Links can get pretty fancy, so if you want the long form version, visit the 
 official [Markdown][fireball] docs.


## Images

Markdown uses an image syntax that is intended to resemble the syntax for links, allowing for two styles: inline and reference. Images appear like this:

![Alt text](http://www.addictedtoibiza.com/wp-content/uploads/2012/12/example.png)



    ![Alt text](http://www.addictedtoibiza.com/wp-content/uploads/2012/12/example.png)

    ![Alt text](http://www.addictedtoibiza.com/wp-content/uploads/2012/12/example.png "Optional title")
    
- - -
# Block Elements

These are elements that are a single or multiple lines in length



## Headings
You can create Atx-style headings by prefixing with a # (hash mark)

# Heading 1 markup  `# Heading 1`
# 
## Heading 2 markup  `## Heading 2`
## 
### Heading 3 markup   `### Heading 3`
### 
#### Heading 4 markup  `#### Heading 4`
#### 
##### Heading 5 markup  `##### Heading 5`
##### 
###### Heading 6 markup  `###### Heading 6`
###### 
You can also create Setext-style headings which have two levels.

Level 1 markup use an equal sign = (equal sign) 
==============================


     Level 1 markup use an equal sign = (equal sign)        
     ==============================
     
Level 2 markup uses - (dashes) 
-------------


    Level 2 markup uses - (dashes) 
    -------------




## PARAGRAPHS and BLOCKQUOTES


A paragraph is one or more consecutive lines of text separated by one or more
blank lines. A blank line contains nothing but spaces or tabs. Do not indent
normal paragraphs with spaces or tabs. New lines/carriage returns within paragraphs require two spaces at the end of the preceding line.

This is one paragraph.

This is a second.

    This is one paragraph.

    This is a second.

Markdown uses email-style > (greater than) characters for blockquoting. If youâ€™re familiar with quoting passages of text in an email message, then you know how to create a blockquote in Markdown. It looks best if you hard wrap the text and put a > before every line:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> 
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.


    > This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
    > consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
    > 
    > Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
    > id sem consectetuer libero luctus adipiscing.
    
Blockquotes can be nested (i.e. a blockquote-in-a-blockquote):

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

    > This is the first level of quoting.
    >
    > > This is nested blockquote.
    >
    > Back to the first level.

Blockquotes can contain other Markdown elements, including headers, lists, and code blocks:

> ## This is a header.
> 
> 1.   This is the first list item.
> 2.   This is the second list item.
> 
> Here's some example code:
> 
>     return shell_exec("echo $input | $markdown_script");


    > ## This is a header.
    > 
    > 1.   This is the first list item.
    > 2.   This is the second list item.
    > 
    > Here's some example code:
    > 
    >     return shell_exec("echo $input | $markdown_script");
    



## Lists

Markdown supports ordered (numbered) and unordered (bulleted) lists.  List markers typically start at the left margin, but may be indented by up to three spaces. List markers must be followed by one or more spaces or a tab.

Form bulleted lists with any of * (asterisk), + (plus), or - (dash). You can one or any or mix of these to form a list:

* Red 
+ Green 
- Blue


        * Red
        + Green
        - Blue
    
Ordered lists require a numeric character followed by a . (period).

1. Item one
1. Item two 
1. Item three

        1. Item one
        1. Item two 
        1. Item three
    
Notice the actual value of the number doesn't matter in the list result. However, for readability better to use this markup:

        1. Item one
        2. Item two 
        3. Item three
        
Lists can be embedded in lists. List items may consist of multiple paragraphs. Each subsequent paragraph in a list item must be indented by either 4 spaces or one tab:

* Red 
+ Green 
    * dark  green 
    * lime    
- Blue        
    1. Item one
        1. subitem 1 
        1. subitem 2
    1. Item two 
    
        This is is a first paragraph. 
        
        * Green 
        * Blue
        
        This is a second paragraph.
        
    1. Item three
    
The code for these embedded lists or paragraphs is:

            * Red 
            + Green 
                * dark  green 
                * lime    
            - Blue        
                1. Item one
                    1. subitem 1
                    1. subitem 2
                1. Item two 
    
                    This is is a first paragraph. 
        
                    * Green 
                    * Blue
        
                    This is a second paragraph.
        
                1. Item three

You can also embed blockquotes in a list.

* Green
> What is this?  It is embedded blockquote.  Mix 'em and match 'em.
* Blue
* Red

        * Green
        > What is this?  It is embedded blockquote.  Mix 'em and match 'em.
        * Blue
        * Red



You can also embed code blocks in a list.

* Green

    Try this code:

        This is an embedded code block.

    Then this:

        More code!

* Blue
* Red

        * Green

            Try this code:

                This is an embedded code block.

            Then this:

                More code!

        * Blue
        * Red


## Tables



Markdown does not support `<html>` so you need to use the - (dash) and the | (pipe) symbols to construct a table. The first line contains column headers. Separate columns with the pipe symbol.

The  second line must be a mandatory separator line between the headers and the content. Subsequent lines are table rows. Columns are always separated by the pipe (|) character.  For example this table:

First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell

Comes from this code:

    First Header  | Second Header
    ------------- | -------------
    Content Cell  | Content Cell
    Content Cell  | Content Cell
    
    
You can only put simple lines in a table.

You can specify alignment for each column by adding colons to separator lines. A colon at the left of the separator line, left-aligns the column. A colon on the right, right-aligns the column. Add colons to both sides to center the column is center-aligned.

Right     | Left   | Center 
---------:| :----- |:-----:
Computer  |  $1600 | one
Phone     |    $12 | three
Pipe      |     $1 | eleven

    Right     | Left   | Center 
    ---------:| :----- |:-----:
    Computer  |  $1600 | one
    Phone     |    $12 | three
    Pipe      |     $1 | eleven


You can apply inline formatting (span-level changes such as fonts or links) to the content of each cell using regular Markdown syntax:


| Function name | Description                    |
| ------------- | ------------------------------ |
| `help()`      | Display the __help__ window.   |
| `destroy()`   | **Destroy your computer!**     |

    | Function name | Description                    |
    | ------------- | ------------------------------ |
    | `help()`      | Display the __help__ window.   |
    | `destroy()`   | **Destroy your computer!**     |




- -  -


## Code and Syntax highlighting


Pre-formatted code blocks are used for writing about programming or markup source code. Rather than forming normal paragraphs, the code block linesare interpreted literally.  Markdown wraps a code block in both `<pre>` and `<code>` tags.

To produce a code block in Markdown, indent every line of the block by at least 4 spaces or 1 tab. For :

This is a normal paragraph:

    This is a code block.

The code reveals the indentation.

        This is a normal paragraph:

            This is a code block.

A code block continues until it reaches a line that is not indented (or the end of the page).

Within a code block, & (ampersands) and < > (angle brackets) are automatically converted into HTML entities. This makes it very easy to include example HTML source code using Markdown â€” just paste it and indent it. Markdown will handle the hassle of encoding the ampersands and angle brackets. For example, this:

<p>Here is an example of AppleScript:</p>

    <p>Here is an example of AppleScript:</p>

To produce a code block in Markdown, simply indent every line of the block by at least 4 spaces or 1 tab. For example, given this input:


You can also highlight snippets of text (Markdown uses the excellent [Pygments][] library) to allow you to use code highlighting  Here's an example of some Python code:

```
#!python
#
def wiki_rocks(text): formatter = lambda t: "funky"+t return formatter(text)         
```

To do this, do not indent the block. Start the block with ` ``` ` three ticks. Then, provide the comment with the type of syntax you are using.  There is a [the vast library of Pygment lexers][lexers]. Markdown accepts the 'short name' or the 'mimetype' of anything in there.

You can also use a fence style for code.

```
This is a code block, fenced-style
```

Which you create with this code:

    ```
    This is a code block, fenced-style
    ```
    
See [Michel Fortin's blog][extra] to try out more examples of this coding style. Not everything he demos is guaranteed to work though.


- - -

# Horizontal Rules

You can produce a horizontal line with any of the following codes:

    * * *

    ***

    *****

    - - - -

    -----------------------
    
The output looks like this:

* * *

***

*****

- - - 

-----------------------

- - -



[lexers]: http://pygments.org/docs/lexers/
[fireball]: http://daringfireball.net/projects/markdown/ 
[Pygments]: http://pygments.org/ 
[Extra]: http://michelf.ca/projects/php-markdown/extra/
[id]: http://example.com/  "Optional Title Here"
[BBmarkup]: https://confluence.atlassian.com/x/xTAvEw