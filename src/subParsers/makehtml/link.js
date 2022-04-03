////
// makehtml/links.js
// Copyright (c) 2018 ShowdownJS
//
// Transforms MD links into `<a>` html anchors
//
// A link contains link text (the visible text), a link destination (the URI that is the link destination), and
// optionally a link title. There are two basic kinds of links in Markdown.
// In inline links the destination and title are given immediately after the link text.
// In reference links the destination and title are defined elsewhere in the document.
//
// ***Author:***
// - Estevão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.link', function (text, options, globals) {

  /**
   *
   * @param {string} subEvtName
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @param {string} text
   * @param {string|null} [linkId]
   * @param {string|null} [url]
   * @param {string|null} [title]
   * @param {boolean} [emptyCase]
   */
  function writeAnchorTag (subEvtName, pattern, wholeMatch, text, linkId, url, title, emptyCase) {

    let otp = '';
    let target = null;

    title = title || null;
    url = url || null;
    linkId = (linkId) ? linkId.toLowerCase() : null;
    emptyCase = !!emptyCase;

    if (emptyCase) {
      url = '';
    } else if (!url) {
      if (!linkId) {
        // lower-case and turn embedded newlines into spaces
        linkId = text.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + linkId;

      if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
        url = globals.gUrls[linkId];
        if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
          title = globals.gTitles[linkId];
        }
      } else {
        return wholeMatch;
      }
    }

    url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

    if (title && showdown.helper.isString(title)) {
      title = title
        .replace(/"/g, '&quot;')
        .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    }

    // optionLinksInNewWindow only applies
    // to external links. Hash links (#) open in same page
    if (options.openLinksInNewWindow && !/^#/.test(url)) {
      // escaped _
      target = ' rel="noopener noreferrer" target="¨E95Eblank"';
    }

    // Text can be a markdown element, so we run through the appropriate parsers
    text = showdown.subParser('makehtml.codeSpan')(text, options, globals);
    text = showdown.subParser('makehtml.emoji')(text, options, globals);
    text = showdown.subParser('makehtml.underline')(text, options, globals);
    text = showdown.subParser('makehtml.emphasisAndStrong')(text, options, globals);
    text = showdown.subParser('makehtml.strikethrough')(text, options, globals);
    text = showdown.subParser('makehtml.ellipsis')(text, options, globals);
    text = showdown.subParser('makehtml.hashHTMLSpans')(text, options, globals);



    return otp;
  }

  let startEvent = new showdown.Event('makehtml.link.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let referenceRegex = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;

  // 1. Handle reference-style links: [link text] [id]
  text = text.replace(referenceRegex, function (wholeMatch, altText, linkId) {
    return writeAnchorTag ('reference', referenceRegex, wholeMatch, altText, linkId, '');
  });
});
