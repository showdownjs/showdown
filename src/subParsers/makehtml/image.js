////
// makehtml/blockquote.js
// Copyright (c) 2018 ShowdownJS
//
// Turn Markdown image into <img> tags.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.image', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.image.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let inlineRegExp      = /!\[([^\]]*?)][ \t]*\([ \t]?<?(\S+?(?:\(\S*?\)\S*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\5)?[ \t]?\)/g,
      crazyRegExp       = /!\[([^\]]*?)][ \t]*\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\5)?[ \t]?\)/g,
      base64RegExp      = /!\[([^\]]*?)][ \t]*\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z\d+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
      referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]/g,
      refShortcutRegExp = /!\[([^\[\]]+)]/g;

  // First, handle reference-style labeled images: ![alt text][id]
  text = text.replace(referenceRegExp, function (wholeMatch, altText, linkId) {
    return writeImageTag ('reference', referenceRegExp, wholeMatch, altText, null, linkId);
  });

  // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")
  if (options.cmSpec) {
    // CommonMark inline-image parsing, symmetric to the link scanner: balanced-paren
    // and `<...>` destinations, titles, backslash escapes, arbitrary label nesting.
    text = parseCmInlineImages(text);
  } else {
    // base64 encoded images
    text = text.replace(base64RegExp, function (wholeMatch, altText, url, width, height, m5, title) {
      url = url.replace(/\s/g, '');
      return writeImageTag ('inline', base64RegExp, wholeMatch, altText, url, null, width, height, title);
    });

    // cases with crazy urls like ./image/cat1).png
    text = text.replace(crazyRegExp, function (wholeMatch, altText, url, width, height, m5, title) {
      url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
      return writeImageTag ('inline', crazyRegExp, wholeMatch, altText, url, null, width, height, title);
    });

    // normal cases
    text = text.replace(inlineRegExp, function (wholeMatch, altText, url, width, height, m5, title) {
      url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
      return writeImageTag ('inline', inlineRegExp, wholeMatch, altText, url, null, width, height, title);
    });
  }

  // handle reference-style shortcuts: ![img text]
  text = text.replace(refShortcutRegExp, function (wholeMatch, altText) {
    return writeImageTag ('reference', refShortcutRegExp, wholeMatch, altText);
  });

  let afterEvent = new showdown.Event('makehtml.image.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;



  /**
   * @param {string} subEvtName
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @param {string} altText
   * @param {string|null} [url]
   * @param {string|null} [linkId]
   * @param {string|null} [width]
   * @param {string|null} [height]
   * @param {string|null} [title]
   * @returns {string}
   */
  function writeImageTag (subEvtName, pattern, wholeMatch, altText, url, linkId, width, height, title) {

    let gUrls    = globals.gUrls,
        gTitles  = globals.gTitles,
        gDims    = globals.gDimensions,
        matches = {
          _wholeMatch: wholeMatch,
          _altText: altText,
          _linkId: linkId,
          _url: url,
          _width: width,
          _height: height,
          _title: title
        },
        otp,
        attributes;

    if (linkId) {
      linkId = options.cmSpec ? showdown.helper.cmNormalizeLabel(linkId) : showdown.helper.caseFold(linkId);
    } else {
      linkId = null;
    }

    if (!title) {
      title = null;
    }
    // Special case for explicit empty url
    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
      url = '';

    } else if (showdown.helper.isUndefined(url) || url === '' || url === null) {
      if (linkId === '' || linkId === null) {
        // lower-case and turn embedded newlines into spaces
        linkId = options.cmSpec ? showdown.helper.cmNormalizeLabel(altText) : showdown.helper.caseFold(altText).replace(/ ?\n/g, ' ');
      }
      if (!showdown.helper.isUndefined(gUrls[linkId])) {
        url = gUrls[linkId];
        if (!showdown.helper.isUndefined(gTitles[linkId])) {
          title = gTitles[linkId];
        }
        if (!showdown.helper.isUndefined(gDims[linkId])) {
          width = gDims[linkId].width;
          height = gDims[linkId].height;
        }
      } else {
        return wholeMatch;
      }
    }

    if (options.cmSpec) {
      // CommonMark: the alt text is the plain-text rendering of the label, with
      // inline markup stripped (`![foo *bar*]` -> alt="foo bar").
      altText = flattenAltText(altText);
    }
    altText = altText
      .replace(/"/g, '&quot;')
      //altText = showdown.helper.escapeCharacters(altText, '*_', false);
      .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    //url = showdown.helper.escapeCharacters(url, '*_', false);
    if (options.cmSpec) {
      url = showdown.helper.cmNormalizeURL(url);
    }
    url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    // escape characters that would otherwise break out of the quoted src attribute
    // (a `"` in the URL is an attribute-injection vector). cmSpec flavors already
    // percent-encode the URL above, so this is a no-op there.
    url = url
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (title && showdown.helper.isString(title)) {
      if (options.cmSpec) {
        title = showdown.helper.cmEscapeTitle(title);
      } else {
        title = title
          .replace(/"/g, '&quot;');
      }
      title = title.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    }

    // Image dimensions are a non-standard extension: only honor them when
    // parseImgDimensions is enabled. The `=WxH` syntax is still consumed by the
    // regex (so it never leaks into the output), but the width/height attributes
    // are dropped when the option is off - matching the reference-definition path,
    // which only stores dimensions in gDimensions when the option is on.
    if (options.parseImgDimensions && width) {
      width  = (width === '*') ? 'auto' : width;
    } else {
      width = null;
    }

    if (options.parseImgDimensions && height) {
      height = (height === '*') ? 'auto' : height;
    } else {
      height = null;
    }

    let captureStartEvent = new showdown.Event('makehtml.image.' + subEvtName + '.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches(matches)
      .setAttributes({
        src: url,
        alt: altText,
        title: title,
        width: width,
        height: height
      });

    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      otp = '<img' + showdown.helper._populateAttributes(attributes) + ' />';
    }

    let beforeHashEvent = new showdown.Event('makehtml.image.' + subEvtName + '.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;

    return otp;
  }

  /**
   * CommonMark inline-image scanner. Finds `![label](destination "title")` spans,
   * matching the label by counting nested brackets and parsing the destination and
   * title with the shared cursor-based helpers.
   * @param {string} str
   * @returns {string}
   */
  function parseCmInlineImages (str) {
    let inlineImgRegexp = /!\[[\s\S]*?]\([\s\S]*?\)/, // representative pattern (event metadata only)
        n = str.length,
        out = '',
        last = 0,
        i = 0;
    while (i < n) {
      if (str.charAt(i) !== '!' || str.charAt(i + 1) !== '[') { i++; continue; }
      let depth = 1, k = i + 2, labelEnd = -1;
      while (k < n) {
        let c = str.charAt(k);
        if (c === '\\' && k + 1 < n) { k += 2; continue; }
        if (c === '[') { depth++; } else if (c === ']') {
          depth--;
          if (depth === 0) { labelEnd = k; break; }
        }
        k++;
      }
      if (labelEnd !== -1 && str.charAt(labelEnd + 1) === '(') {
        let parsed = parseCmImgDestTitle(str, labelEnd + 2);
        if (parsed) {
          let label = str.slice(i + 2, labelEnd),
              url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, parsed.url);
          out += str.slice(last, i);
          out += writeImageTag('inline', inlineImgRegexp, str.slice(i, parsed.end + 1), label, url, null, null, null, parsed.title);
          i = parsed.end + 1;
          last = i;
          continue;
        }
      }
      i++;
    }
    out += str.slice(last);
    return out;
  }

  /**
   * Parse an image destination and optional title starting just after the opening
   * `(`. Returns `{url, title, end}` (end = index of the closing `)`) or `null`.
   * @param {string} str
   * @param {number} j
   * @returns {{url: string, title: (string|null), end: number}|null}
   */
  function parseCmImgDestTitle (str, j) {
    let n = str.length,
        isWs = function (c) { return c === ' ' || c === '\t' || c === '\n'; };
    while (j < n && isWs(str.charAt(j))) { j++; }
    let dest = showdown.helper.cmScanDestination(str, j);
    if (!dest) { return null; }
    j = dest.end;
    let hadWs = false;
    while (j < n && isWs(str.charAt(j))) { hadWs = true; j++; }
    let title = null,
        tc = str.charAt(j);
    if (j < n && (tc === '"' || tc === '\'' || tc === '(')) {
      if (!hadWs) { return null; }
      let t = showdown.helper.cmScanTitle(str, j);
      if (!t) { return null; }
      title = t.title;
      j = t.end;
    }
    while (j < n && isWs(str.charAt(j))) { j++; }
    if (j >= n || str.charAt(j) !== ')') { return null; }
    return {url: dest.url, title: title, end: j};
  }

  /**
   * Produce the plain-text rendering of an image label for the `alt` attribute,
   * per CommonMark: inline markup is processed and then flattened to text. Nested
   * images contribute their own alt text; links and emphasis contribute their
   * text content.
   * @param {string} t
   * @returns {string}
   */
  function flattenAltText (t) {
    t = showdown.subParser('makehtml.codeSpan')(t, options, globals);
    t = showdown.subParser('makehtml.image')(t, options, globals);
    t = showdown.subParser('makehtml.link')(t, options, globals);
    t = showdown.subParser('makehtml.emoji')(t, options, globals);
    t = showdown.subParser('makehtml.underline')(t, options, globals);
    t = showdown.subParser('makehtml.emphasisAndStrong')(t, options, globals);
    t = showdown.subParser('makehtml.strikethrough')(t, options, globals);
    t = showdown.subParser('makehtml.ellipsis')(t, options, globals);
    // restore hashed spans (e.g. produced by nested images/links) so we can read them
    t = showdown.subParser('makehtml.unhashHTMLSpans')(t, options, globals);
    // a nested image contributes its alt text; every other tag contributes its
    // text content, so replace images by their alt then strip the remaining tags
    t = t.replace(/<img\b[^>]*?\salt="([^"]*)"[^>]*?\/?>/g, '$1');
    t = t.replace(/<[^>]*>/g, '');
    return t;
  }

});
