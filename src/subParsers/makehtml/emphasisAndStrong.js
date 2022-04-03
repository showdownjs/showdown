////
// makehtml/emphasisAndStrong.js
// Copyright (c) 2022 ShowdownJS
//
// Transforms MD emphasis and strong into `<em>` and `<strong>` html entities
//
// Markdown treats asterisks (*) and underscores (_) as indicators of emphasis.
// Text wrapped with one * or _ will be wrapped with an HTML <em> tag;
// double *’s or _’s will be wrapped with an HTML <strong> tag
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

showdown.subParser('makehtml.emphasisAndStrong', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.emphasisAndStrong.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  /**
   * @param {string} txt
   * @param {string} tags
   * @param {string} wholeMatch
   * @param {RegExp} pattern
   * @returns {string}
   */
  function parseInside (txt, tags, wholeMatch, pattern) {
    let otp = 'ERROR',
        attributes,
        subEventName;

    switch (tags) {
      case '<em>':
        attributes = {
          em: {}
        };
        subEventName = 'emphasis';
        break;
      case '<strong>':
        attributes = {
          strong: {}
        };
        subEventName = 'strong';
        break;
      case '<strong><em>':
        attributes = {
          em: {},
          strong: {}
        };
        subEventName = 'emphasisAndStrong';
        break;
      default:
        attributes = {};
        subEventName = 'emphasisAndStrong';
        break;
    }

    let captureStartEvent = new showdown.Event('makehtml.' + subEventName + '.onCapture', txt);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        text: txt
      })
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      if (showdown.helper.isUndefined(attributes.em)) {
        attributes.em = {};
      }
      if (showdown.helper.isUndefined(attributes.strong)) {
        attributes.strong = {};
      }
      switch (tags) {
        case '<em>':
          otp = '<em' + showdown.helper._populateAttributes(attributes.em) + '>' + txt + '</em>';
          break;
        case '<strong>':
          otp = '<strong' + showdown.helper._populateAttributes(attributes.strong) + '>' + txt + '</strong>';
          break;
        case '<strong><em>':
          otp = '<strong' + showdown.helper._populateAttributes(attributes.strong) + '>' +
                  '<em' + showdown.helper._populateAttributes(attributes.em) + '>' +
                    txt +
                  '</em>' +
                '</strong>';
          break;
      }
    }

    let beforeHashEvent = new showdown.Event('makehtml.' + subEventName + '.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    return otp;
  }

  // it's faster to have 3 separate regexes for each case than have just one
  // because of backtracking, in some cases, it could lead to an exponential effect
  // called "catastrophic backtrace". Ominous!
  const lmwuStrongEmRegex         = /\b___(\S[\s\S]*?)___\b/g,
      lmwuStrongRegex             = /\b__(\S[\s\S]*?)__\b/g,
      lmwuEmRegex                 = /\b_(\S[\s\S]*?)_\b/g,
      underscoreStrongEmRegex     = /___(\S[\s\S]*?)___/g,
      unserscoreStrongRegex       = /__(\S[\s\S]*?)__/g,
      unserscoreEmRegex           = /_([^\s_][\s\S]*?)_/g,

      asteriskStrongEm            = /\*\*\*(\S[\s\S]*?)\*\*\*/g,
      asteriskStrong              = /\*\*(\S[\s\S]*?)\*\*/g,
      asteriskEm                  = /\*([^\s*][\s\S]*?)\*/g;


  // Parse underscores
  if (options.literalMidWordUnderscores) {
    text = text.replace(lmwuStrongEmRegex, function (wm, txt) {
      return parseInside (txt, '<strong><em>', wm, lmwuStrongEmRegex);
    });
    text = text.replace(lmwuStrongRegex, function (wm, txt) {
      return parseInside (txt, '<strong>', wm, lmwuStrongRegex);
    });
    text = text.replace(lmwuEmRegex, function (wm, txt) {
      return parseInside (txt, '<em>', wm, lmwuEmRegex);
    });
  } else {
    text = text.replace(underscoreStrongEmRegex, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', wm, underscoreStrongEmRegex) : wm;
    });
    text = text.replace(unserscoreStrongRegex, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong>', wm, unserscoreStrongRegex) : wm;
    });
    text = text.replace(unserscoreEmRegex, function (wm, m) {
      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
      return (/\S$/.test(m)) ? parseInside (m, '<em>', wm, unserscoreEmRegex) : wm;
    });
  }

  // Now parse asterisks
  text = text.replace(asteriskStrongEm, function (wm, m) {
    return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', wm, asteriskStrongEm) : wm;
  });
  text = text.replace(asteriskStrong, function (wm, m) {
    return (/\S$/.test(m)) ? parseInside (m, '<strong>', wm, asteriskStrong) : wm;
  });
  text = text.replace(asteriskEm, function (wm, m) {
    // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
    return (/\S$/.test(m)) ? parseInside (m, '<em>', wm, asteriskEm) : wm;
  });
  //}
  let afterEvent = new showdown.Event('makehtml.emphasisAndStrong.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
