showdown.subParser('italicsAndBold', function (text, options) {
  'use strict';

  if (options.literalMidWordUnderscores) {
    //underscores
    // Since we are consuming a \s character, we need to add it
    text = text.replace(/(^|\s)__(?=\S)([^]+?)__(?=\s|$)/gm, '$1<strong>$2</strong>');
    text = text.replace(/(^|\s)_(?=\S)([^]+?)_(?=\s|$)/gm, '$1<em>$2</em>');
    //asterisks
    text = text.replace(/\*\*(?=\S)([^]+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(?=\S)([^]+?)\*/g, '<em>$1</em>');

  } else {
    // <strong> must go first:
    text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, '<strong>$2</strong>');
    text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>');
  }
  return text;
});
