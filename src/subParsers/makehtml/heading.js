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
(function () {

  /**
   *
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @param {string} headingText
   * @param {string} headingLevel
   * @param {string} headingId
   * @param {{}} options
   * @param {{}} globals
   * @returns {string}
   */
  function parseHeader (pattern, wholeMatch, headingText, headingLevel, headingId, options, globals) {
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

  showdown.subParser('makehtml.heading', function (text, options, globals) {
    'use strict';

    let startEvent = new showdown.Event('makehtml.heading.onStart', text);
    startEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    startEvent = globals.converter.dispatch(startEvent);
    text = startEvent.output;

    text = showdown.subParser('makehtml.heading.setext')(text, options, globals);
    text = showdown.subParser('makehtml.heading.atx')(text, options, globals);

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
        .replace(/\W/g, '')
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

  showdown.subParser('makehtml.heading.setext', function (text, options, globals) {

    let startEvent = new showdown.Event('makehtml.heading.setext.onStart', text);
    startEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    startEvent = globals.converter.dispatch(startEvent);
    text = startEvent.output;

    const setextRegexH1 = /^( {0,3}([^ \t\n]+.*\n)(.+\n)?(.+\n)?)( {0,3}=+[ \t]*)$/gm,
        setextRegexH2 = /^( {0,3}([^ \t\n]+.*\n)(.+\n)?(.+\n)?)( {0,3}(-+)[ \t]*)$/gm;

    text = text.replace(setextRegexH1, function (wholeMatch, headingText, line1, line2, line3, line4) {
      return parseSetextHeading(setextRegexH2, options.headerLevelStart, wholeMatch, headingText, line1, line2, line3, line4);
    });

    text = text.replace(setextRegexH2, function (wholeMatch, headingText, line1, line2, line3, line4) {
      return parseSetextHeading(setextRegexH2, options.headerLevelStart + 1, wholeMatch, headingText, line1, line2, line3, line4);
    });

    let afterEvent = new showdown.Event('makehtml.heading.setext.onEnd', text);
    afterEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    afterEvent = globals.converter.dispatch(afterEvent);

    return showdown.subParser('makehtml.hashHTMLBlocks')(afterEvent.output, options, globals);


    function parseSetextHeading (pattern, headingLevel, wholeMatch, headingText, line1, line2, line3, line4) {

      // count lines
      let count = headingText.trim().split('\n').length;
      let prepend = '';
      let nPrepend;
      const hrCheckRgx = /^ {0,3}[-_*]([-_*] ?){2,}$/;

      // one liner edge cases
      if (count === 1) {
        // hr
        // let's find the hr edge case first
        if (showdown.helper.trimEnd(line1).match(hrCheckRgx)) {
          // it's the edge case, so it's a false positive
          prepend  = showdown.subParser('makehtml.horizontalRule')(line1, options, globals);
          if (prepend !== line1) {
            // it's an oneliner list
            return prepend.trim() + '\n' + line4;
          }
        }

        // now check if it's an unordered list
        if (line1.match(/^ {0,3}[-*+][ \t]/)) {
          if (line4.trim().match(/^=+/)) {
            line1 += line4;
          }
          prepend = showdown.subParser('makehtml.list')(line1, options, globals);
          if (prepend !== line1) {
            // it's an oneliner list
            return prepend.trim() + '\n' + line4;
          }
        }

        // check if it's a blockquote
        if (line1.match(/^ {0,3}>[ \t]?[^ \t]/)) {
          if (line4.trim().match(/^=+/)) {
            line1 += line4;
          }
          prepend = showdown.subParser('makehtml.blockquote')(line1, options, globals);
          if (prepend !== line1) {
            // it's an oneliner blockquote

            return prepend.trim() + '\n' + line4;
          }
        }

        // no edge case let's proceed as usual
      } else {
        let multilineText = '';

        // multiline is a bit trickier
        // first we must take care of the edge cases of:
        // case1: |  case2:
        // ---    |  ---
        // foo    |  foo
        // ---    |  bar
        //        |  ---
        //
        if (showdown.helper.trimEnd(line1).match(hrCheckRgx)) {
          nPrepend  = showdown.subParser('makehtml.horizontalRule')(line1, options, globals);
          if (nPrepend !== line1) {
            line1 = '';
            // we add the parsed block to prepend
            prepend = nPrepend.trim();
            // and remove the line from the headingText, so it doesn't appear repeated
            headingText = line2 + ((line3) ? line3 : '');
          }
        }

        // now we take care of these cases:
        // case1: |  case2:
        // foo    |  foo
        // ***    |  ***
        // ---    |  bar
        //        |  ---
        //
        if (showdown.helper.trimEnd(line2).match(hrCheckRgx)) {
          // This case sucks, because the first line could be anything!!!
          // first let's make sure it's a hr
          nPrepend  = showdown.subParser('makehtml.horizontalRule')(line2, options, globals);
          if (nPrepend !== line2) {
            line2 = nPrepend;
            // it is, so now we must parse line1 also
            if (line1) {
              line1 = showdown.subParser('makehtml.blockGamut')(line1, options, globals);
              line1 = showdown.subParser('makehtml.paragraphs')(line1, options, globals);
              line1 = line1.trim() + '\n';
              prepend = line1;
              // and clear line1
              line1 = '';
            }
            // we add the parsed blocks to prepend
            prepend += line2.trim() + '\n';
            line2 = '';
            // and remove the lines from the headingText, so it doesn't appear repeated
            headingText = (line3) ? line3 : '';
          }
        }

        // all edge cases should be treated now
        multilineText = line1 + line2 + ((line3) ? line3 : '');
        //if (line4.trim().match(/^=+/)) {
        //  multilineText += line4;
        //}

        nPrepend = showdown.subParser('makehtml.blockGamut')(multilineText, options, globals, 'makehtml.heading.setext');
        if (nPrepend !== multilineText) {
          // we found a block, so it should take precedence
          prepend += nPrepend;
          headingText = '';
        }
        console.log(prepend);
      }

      // trim stuff
      headingText = headingText.trim();

      // let's check if heading is empty
      // after looking for blocks, heading text might be empty which is a false positive
      if (!headingText) {
        return prepend + line4;
      }

      // after this, we're pretty sure it's a heading so let's proceed
      let id = (options.noHeaderId) ? null : showdown.subParser('makehtml.heading.id')(headingText, options, globals);
      return prepend + parseHeader(pattern, wholeMatch, headingText, headingLevel, id, options, globals);
    }


  });

  showdown.subParser('makehtml.heading.atx', function (text, options, globals) {

    let startEvent = new showdown.Event('makehtml.heading.atx.onStart', text);
    startEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    startEvent = globals.converter.dispatch(startEvent);
    text = startEvent.output;

    const atxRegex = (options.requireSpaceBeforeHeadingText) ? /^ {0,3}(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/gm : /^ {0,3}(#{1,6})[ \t]*(.+?)[ \t]*#*[ \t]*$/gm;
    text = text.replace(atxRegex, function (wholeMatch, m1, m2) {
      let headingLevel = options.headerLevelStart - 1 + m1.length,
          headingText = (options.customizedHeaderId) ? m2.replace(/\s?{([^{]+?)}\s*$/, '') : m2,
          id = (options.noHeaderId) ? null : showdown.subParser('makehtml.heading.id')(m2, options, globals);
      return parseHeader(atxRegex, wholeMatch, headingText, headingLevel, id, options, globals);
    });

    let afterEvent = new showdown.Event('makehtml.heading.atx.onEnd', text);
    afterEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    afterEvent = globals.converter.dispatch(afterEvent);

    return showdown.subParser('makehtml.hashHTMLBlocks')(afterEvent.output, options, globals);

  });

})();
