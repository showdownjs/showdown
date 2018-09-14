/**
 * These are all the transformations that form block-level
 * tags like paragraphs, headers, and list items.
 */
showdown.subParser('makehtml.blockGamut', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.blockGamut.before', text, options, globals).getText();

  // we parse blockquotes first so that we can have headings and hrs
  // inside blockquotes
  text = showdown.subParser('makehtml.blockQuotes')(text, options, globals);
  text = showdown.subParser('makehtml.headers')(text, options, globals);

  // Do Horizontal Rules:
  text = showdown.subParser('makehtml.horizontalRule')(text, options, globals);

  text = showdown.subParser('makehtml.lists')(text, options, globals);
  text = showdown.subParser('makehtml.codeBlocks')(text, options, globals);
  text = showdown.subParser('makehtml.tables')(text, options, globals);

  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
  // was to escape raw HTML in the original Markdown source. This time,
  // we're escaping the markup we've just created, so that we don't wrap
  // <p> tags around block-level tags.
  text = showdown.subParser('makehtml.hashHTMLBlocks')(text, options, globals);
  text = showdown.subParser('makehtml.paragraphs')(text, options, globals);

  text = globals.converter._dispatch('makehtml.blockGamut.after', text, options, globals).getText();

  return text;
});
