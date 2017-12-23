/**
 * These are all the transformations that occur *within* block-level
 * tags like paragraphs, headers, and list items.
 */
showdown.subParser('makehtml.spanGamut', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('smakehtml.panGamut.before', text, options, globals);
  text = showdown.subParser('makehtml.codeSpans')(text, options, globals);
  text = showdown.subParser('makehtml.escapeSpecialCharsWithinTagAttributes')(text, options, globals);
  text = showdown.subParser('makehtml.encodeBackslashEscapes')(text, options, globals);

  // Process anchor and image tags. Images must come first,
  // because ![foo][f] looks like an anchor.
  text = showdown.subParser('makehtml.images')(text, options, globals);
  text = showdown.subParser('makehtml.anchors')(text, options, globals);

  // Make links out of things like `<http://example.com/>`
  // Must come after anchors, because you can use < and >
  // delimiters in inline links like [this](<url>).
  text = showdown.subParser('makehtml.autoLinks')(text, options, globals);
  text = showdown.subParser('makehtml.simplifiedAutoLinks')(text, options, globals);
  text = showdown.subParser('makehtml.emoji')(text, options, globals);
  text = showdown.subParser('makehtml.underline')(text, options, globals);
  text = showdown.subParser('makehtml.italicsAndBold')(text, options, globals);
  text = showdown.subParser('makehtml.strikethrough')(text, options, globals);
  text = showdown.subParser('makehtml.ellipsis')(text, options, globals);

  // we need to hash HTML tags inside spans
  text = showdown.subParser('makehtml.hashHTMLSpans')(text, options, globals);

  // now we encode amps and angles
  text = showdown.subParser('makehtml.encodeAmpsAndAngles')(text, options, globals);

  // Do hard breaks
  if (options.simpleLineBreaks) {
    // GFM style hard breaks
    // only add line breaks if the text does not contain a block (special case for lists)
    if (!/\n\n¨K/.test(text)) {
      text = text.replace(/\n+/g, '<br />\n');
    }
  } else {
    // Vanilla hard breaks
    text = text.replace(/  +\n/g, '<br />\n');
  }

  text = globals.converter._dispatch('makehtml.spanGamut.after', text, options, globals);
  return text;
});
