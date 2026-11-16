/**
 * @file      makemarkdown/txt.js
 * @summary   Renders a text node: collapses space runs, restores `¨NBSP;` sentinels, re-escapes entity-like text and tag openers, and reverses `ellipsis`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * A `makeMarkdown.*` DOM-node subparser (HTML→Markdown). Emits `makeMarkdown.txt.onStart`/`onCapture`/`onEnd`.
 */
showdown.subParser('makeMarkdown.txt', function (node, options, globals) {
  'use strict';

  // text nodes have no outerHTML; their source is the node value
  let input = node.nodeValue;
  showdown.Event.dispatchStart('makeMarkdown.txt.onStart', input, options, globals, {_node: node});

  let text = (function () {
    let txt = node.nodeValue;

    // multiple spaces are collapsed
    txt = txt.replace(/ +/g, ' ');

    // replace the custom ¨NBSP; with a space
    txt = txt.replace(/¨NBSP;/g, ' ');

    // the DOM has already decoded entities, so nodeValue is plain text. Markdown reads `&name;`
    // as an entity and `<tag` as raw html, so a literal `&lt;` or `<br>` must be re-escaped,
    // or it round-trips into a different character or a real tag.
    txt = txt.replace(/&(?=#?\w+;)/g, '&amp;').replace(/<(?=[A-Za-z/])/g, '&lt;');

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

  let captureEvent = showdown.Event.dispatchCapture('makeMarkdown.txt.onCapture', input, {
    regexp: null,
    matches: {_wholeMatch: input, _node: node, text: text},
    attributes: null
  }, options, globals);

  let result;
  if (captureEvent.output && captureEvent.output !== '') {
    result = captureEvent.output;
  } else {
    result = captureEvent.matches.text;
  }

  return showdown.Event.dispatchEnd('makeMarkdown.txt.onEnd', result, options, globals, {_node: node}).output;
});
