# Use language and output extensions on the same block

## Overview

Showdown allows you to define and use any number of extensions that act on the same block. These extensions can be executed sequentially or at different moments.

This enables you to pre-parse/mark a block of text but defer any modifications for the last by using a combination of language and output extensions.

This is useful if you, for example, don't want Showdown to parse the contents of your new language construct.

## Example

Let's say you create an extension that captures everything between `%start%` and `%end%`. However, that content should not be modified by Showdown. Obviously, you can use `<pre>` tags but that is beside the point.

Although Showdown doesn't have any flag to prevent parsing the content of an extension, the same effect can be easily achieved by using lang and output extensions together.

!!! example ""
    The fully working example you can see in [Fiddle][1].

### Code

[Create your extensions](../create-extension.md) with the following content:

```js
showdown.extension('myExt', function() {
  var matches = [];
  return [
    { 
      type: 'lang',
      regex: /%start%([^]+?)%end%/gi,
      replace: function(s, match) { 
        matches.push(match);
        var n = matches.length - 1;
        return '%PLACEHOLDER' + n + '%';
      }
    },
    {
      type: 'output',
      filter: function (text) {
        for (var i=0; i< matches.length; ++i) {
          var pat = '<p>%PLACEHOLDER' + i + '% *<\/p>';
          text = text.replace(new RegExp(pat, 'gi'), matches[i]);
        }
        //reset array
        matches = [];
        return text;
      }
    }
  ]
});
```

In this example, you created a [`lang` extension](../create-extension.md#type) that:

1. Checks for the pseudo tags `%start%` and `%end%`.
1. Extracts everything in between the tags.
1. Saves the content between the tags in a variable.
1. Replaces the saved content with a placeholder to identify the exact position of the extracted text.

and an [`output` extension](../create-extension.md#type) that replaces the placeholder with the saved content, once Showdown is finished parsing.

[1]: http://jsfiddle.net/tivie/1rqr7xy8/