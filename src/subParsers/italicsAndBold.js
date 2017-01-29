showdown.subParser('italicsAndBold', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

  // it's faster to have 2 separate regexes for each case than have just one
  // because of backtracing, in some cases, it could lead to an exponential effect
  // called "catastrophic backtrace". Ominous!
  if (options.literalMidWordUnderscores) {
    //underscores
    // Since we are consuming a \s character, we need to add it
    text = text.replace(/\b__(\S[\s\S]*?)__\b/gm, '<strong>$1</strong>');
    text = text.replace(/\b_(\S[\s\S]*?)_\b/gm, '<em>$1</em>');
    //asterisks
    text = text.replace(/\*\*(?=\S)([^\r]*?\S[*]*)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(\*)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>');

  } else {
    // <strong> must go first:
    text = text.replace(/__(\S[\s\S]*?)__/g, '<strong>$1</strong>');
    text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, '<strong>$1</strong>');
    // now <em>
    text = text.replace(/_(\S[\s\S]*?)_/g, '<em>$1</em>');
    text = text.replace(/\*(\S[\s\S]*?)\*/g, '<em>$1</em>');
  }

  text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
  return text;
});
