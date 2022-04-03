////
// makehtml/blockquote.js
// Copyright (c) 2018 ShowdownJS
//
// Transforms MD headings into `<h#>` html entities
//
// Setext-style headers:
//	Header 1
//	========
//
//	Header 2
//	--------
//
// atx-style headers:
//  # Header 1
//  ## Header 2
//  ## Header 2 with closing hashes ##
//  ...
//  ###### Header 6
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.heading', function (text, options, globals) {
  'use strict';

  function parseHeader (pattern, wholeMatch, headingText, headingLevel, headingId) {
    let captureStartEvent = new showdown.Event('makehtml.heading.onCapture', headingText),
        otp;

    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        heading: headingText
      })
      .setAttributes({
        id: headingId
      });
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;

    } else {
      headingText = captureStartEvent.matches.heading;
      let spanGamut = showdown.subParser('makehtml.spanGamut')(headingText, options, globals),
          attributes = captureStartEvent.attributes;
      otp = '<h' + headingLevel + showdown.helper._populateAttributes(attributes) + '>' + spanGamut + '</h' + headingLevel + '>';
    }

    let beforeHashEvent = new showdown.Event('makehtml.heading.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;

    return showdown.subParser('makehtml.hashBlock')(otp, options, globals);
  }

  let startEvent = new showdown.Event('makehtml.heading.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let setextRegexH1 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
      setextRegexH2 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm,
      atxRegex      = (options.requireSpaceBeforeHeadingText) ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

  text = text.replace(setextRegexH1, function (wholeMatch, headingText) {
    let id = (options.noHeaderId) ? null : showdown.subParser('makehtml.heading.id')(headingText, options, globals);
    return parseHeader(setextRegexH1, wholeMatch, headingText, options.headerLevelStart, id);
  });

  text = text.replace(setextRegexH2, function (wholeMatch, headingText) {
    let id = (options.noHeaderId) ? null : showdown.subParser('makehtml.heading.id')(headingText, options, globals);
    return parseHeader(setextRegexH2, wholeMatch, headingText, options.headerLevelStart + 1, id);
  });

  text = text.replace(atxRegex, function (wholeMatch, m1, m2) {
    let headingLevel = options.headerLevelStart - 1 + m1.length,
        headingText = (options.customizedHeaderId) ? m2.replace(/\s?{([^{]+?)}\s*$/, '') : m2,
        id = (options.noHeaderId) ? null : showdown.subParser('makehtml.heading.id')(m2, options, globals);
    return parseHeader(setextRegexH2, wholeMatch, headingText, headingLevel, id);
  });


  let afterEvent = new showdown.Event('makehtml.heading.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});

showdown.subParser('makehtml.heading.id', function (m, options, globals) {
  let title,
      prefix;

  // It is separate from other options to allow combining prefix and customized
  if (options.customizedHeaderId) {
    let match = m.match(/{([^{]+?)}\s*$/);
    if (match && match[1]) {
      m = match[1];
    }
  }

  title = m;

  // Prefix id to prevent causing inadvertent pre-existing style matches.
  if (showdown.helper.isString(options.prefixHeaderId)) {
    prefix = options.prefixHeaderId;
  } else if (options.prefixHeaderId === true) {
    prefix = 'section-';
  } else {
    prefix = '';
  }

  if (!options.rawPrefixHeaderId) {
    title = prefix + title;
  }

  if (options.ghCompatibleHeaderId) {
    title = title
      .replace(/ /g, '-')
      // replace previously escaped chars (&, ¨ and $)
      .replace(/&amp;/g, '')
      .replace(/¨T/g, '')
      .replace(/¨D/g, '')
      // replace rest of the chars (&~$ are repeated as they might have been escaped)
      // borrowed from github's redcarpet (so they should produce similar results)
      .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, '')
      .toLowerCase();
  } else if (options.rawHeaderId) {
    title = title
      .replace(/ /g, '-')
      // replace previously escaped chars (&, ¨ and $)
      .replace(/&amp;/g, '&')
      .replace(/¨T/g, '¨')
      .replace(/¨D/g, '$')
      // replace " and '
      .replace(/["']/g, '-')
      .toLowerCase();
  } else {
    title = title
      .replace(/[^\w]/g, '')
      .toLowerCase();
  }

  if (options.rawPrefixHeaderId) {
    title = prefix + title;
  }

  if (globals.hashLinkCounts[title]) {
    title = title + '-' + (globals.hashLinkCounts[title]++);
  } else {
    globals.hashLinkCounts[title] = 1;
  }
  return title;
});
