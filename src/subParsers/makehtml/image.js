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
      attributes = {};

    linkId = (linkId) ? linkId.toLowerCase() : null;

    if (!title) {
      title = null;
    }
    // Special case for explicit empty url
    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
      url = '';

    } else if (showdown.helper.isUndefined(url) || url === '' || url === null) {
      if (linkId === '' || linkId === null) {
        // lower-case and turn embedded newlines into spaces
        linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + linkId;

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

    altText = altText
      .replace(/"/g, '&quot;')
      //altText = showdown.helper.escapeCharacters(altText, '*_', false);
      .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    //url = showdown.helper.escapeCharacters(url, '*_', false);
    url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

    if (title && showdown.helper.isString(title)) {
      title = title
        .replace(/"/g, '&quot;')
        .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    }

    if (width) {
      width  = (width === '*') ? 'auto' : width;
    } else {
      width = null;
    }

    if (height) {
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

});
