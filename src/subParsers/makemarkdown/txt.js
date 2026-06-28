showdown.subParser('makeMarkdown.txt', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.txt.onStart', node.nodeValue);
  startEvent
    .setOutput(null)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  startEvent = globals.converter.dispatch(startEvent);

  let result;
  if (startEvent.output && startEvent.output !== '') {
    result = startEvent.output;
  } else {
    result = (function () {
      let txt = node.nodeValue;

      // multiple spaces are collapsed
      txt = txt.replace(/ +/g, ' ');

      // replace the custom ¨NBSP; with a space
      txt = txt.replace(/¨NBSP;/g, ' ');

      // ", <, > and & should replace escaped html entities
      txt = showdown.helper.unescapeHTMLEntities(txt);

      // reverse the `ellipsis` option: … -> ...  (only when the converter would have produced it)
      if (options.ellipsis) {
        txt = txt.replace(/…/g, '...');
      }

      // reverse the `emoji` option: turn unicode emoji back into their `:code:` form.
      // Done before the magic-char escaping below so an emoji whose value contains a markdown
      // metachar (e.g. asterisk -> *️⃣) becomes :asterisk: instead of an escaped \*.
      // Note: like underline, this is symmetric but opt-in - any literal emoji the source HTML
      // already contained is also rewritten to a code when this option is on.
      if (options.emoji) {
        let emojiReverse = showdown.helper.emojiReverse();
        txt = txt.replace(emojiReverse.regex, function (wholeMatch) {
          return ':' + emojiReverse.unicode[wholeMatch] + ':';
        });
      }

      // escape markdown magic characters
      // emphasis, strong and strikethrough - can appear everywhere
      // we also escape pipe (|) because of tables
      // and escape ` because of code blocks and spans
      txt = txt.replace(/([*_~|`])/g, '\\$1');

      // escape > because of blockquotes
      txt = txt.replace(/^(\s*)>/g, '\\$1>');

      // hash character, only troublesome at the beginning of a line because of headers
      txt = txt.replace(/^#/gm, '\\#');

      // horizontal rules
      txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, '$1\\$2$3');

      // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
      txt = txt.replace(/^( {0,3}\d+)\./gm, '$1\\.');

      // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
      txt = txt.replace(/^( {0,3})([+-])/gm, '$1\\$2');

      // images and links, ] followed by ( is problematic, so we escape it
      txt = txt.replace(/](\s*)\(/g, '\\]$1\\(');

      // reference URIs must also be escaped
      txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, '\\[$1]:');

      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.txt.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
