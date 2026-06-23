////
// makehtml/decodeEntities.js
// Copyright (c) 2024 ShowdownJS
//
// Resolves HTML5 named (`&copy;`), decimal (`&#35;`) and hexadecimal (`&#xcab;`)
// character references to their corresponding characters, per the CommonMark spec.
//
// This diverges from Showdown's default behavior (which preserves entities verbatim),
// so it is gated behind the `decodeEntities` option (enabled by the `commonmark` flavor).
//
// It runs late in the pipeline - after inline parsing and while code spans/blocks are
// still hashed - so that:
//   - a decoded markdown character (e.g. `&#42;` -> `*`) is NOT re-parsed as emphasis;
//   - entities inside code remain escaped (the code is hashed, hence untouched);
//   - decoded newlines stay literal inside their block.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.decodeEntities', function (text, options, globals) {
  'use strict';

  if (!options.decodeEntities) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.decodeEntities.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  const entities = showdown.helper.htmlEntities;

  // Re-escape HTML-significant characters so a decoded char (e.g. `&lt;` -> `<`) stays
  // a literal in the HTML output rather than being read as markup.
  function escapeOutput (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Map a code point to its character, replacing disallowed values with U+FFFD.
  function fromCodePoint (cp) {
    if (cp === 0 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) {
      return '�';
    }
    try {
      return String.fromCodePoint(cp);
    } catch (e) {
      return '�';
    }
  }

  // Match any `&…;` candidate that survived encodeAmpsAndAngles (which already escaped
  // bare ampersands and `&name`/`&name?;` non-references). We classify each candidate here.
  text = text.replace(/&([#0-9a-zA-Z]+);/g, function (wholeMatch, body) {
    let m;
    // decimal numeric reference: 1-7 digits
    if ((m = /^#([0-9]{1,7})$/.exec(body))) {
      return escapeOutput(fromCodePoint(parseInt(m[1], 10)));
    }
    // hexadecimal numeric reference: 1-6 hex digits
    if ((m = /^#[xX]([0-9a-fA-F]{1,6})$/.exec(body))) {
      return escapeOutput(fromCodePoint(parseInt(m[1], 16)));
    }
    // named reference (must be a known HTML5 entity name)
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(body) && entities.hasOwnProperty(body)) {
      return escapeOutput(entities[body]);
    }
    // not a valid reference - escape the ampersand and leave the rest intact
    return '&amp;' + body + ';';
  });

  let afterEvent = new showdown.Event('makehtml.decodeEntities.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
