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

  //
  // Parser starts here
  //
  let startEvent = new showdown.Event('makehtml.link.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // 1. Handle reference-style links: [link text] [id]
  let referenceRegex = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]/g;
  text = text.replace(referenceRegex, function (wholeMatch, text, linkId) {
    // bail if we find 2 newlines somewhere
    if (/\n\n/.test(wholeMatch)) {
      return wholeMatch;
    }
    return writeAnchorTag ('reference', referenceRegex, wholeMatch, text, linkId);
  });

  // 2. Handle inline-style links: [link text](url "optional title")
  // 2.1. Look for empty cases: []() and [empty]() and []("title")
  let inlineEmptyRegex = /\[(.*?)]\(<? ?>? ?(["'](.*)["'])?\)/g;
  text = text.replace(inlineEmptyRegex, function (wholeMatch, text, m1, title) {
    return writeAnchorTag ('inline', inlineEmptyRegex, wholeMatch, text, null, null, title, true);
  });

  // 2.2. Look for cases with crazy urls like ./image/cat1).png
  // the url mus be enclosed in <>
  let inlineCrazyRegex = /\[((?:\[[^\]]*]|[^\[\]])*)]\s?\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\4))?[ \t]?\)/g;
  text = text.replace(inlineCrazyRegex, function (wholeMatch, text, url, m1, m2, title) {
    return writeAnchorTag ('inline', inlineCrazyRegex, wholeMatch, text, null, url, title);
  });

  // 2.3. inline links with no title or titles wrapped in ' or ":
  // [text](url.com) || [text](<url.com>) || [text](url.com "title") || [text](<url.com> "title")
  let inlineNormalRegex1 = /\[([\S ]*?)]\s?\( *<?([^\s'"]*?(?:\(\S*?\)\S*?)?)>?\s*(?:(['"])(.*?)\3)? *\)/g;
  text = text.replace(inlineNormalRegex1, function (wholeMatch, text, url, m1, title) {
    return writeAnchorTag ('inline', inlineNormalRegex1, wholeMatch, text, null, url, title);
  });

  // 2.4. inline links with titles wrapped in (): [foo](bar.com (title))
  let inlineNormalRegex2 = /\[([\S ]*?)]\s?\( *<?([^\s'"]*?(?:\(\S*?\)\S*?)?)>?\s+\((.*?)\) *\)/g;
  text = text.replace(inlineNormalRegex2, function (wholeMatch, text, url, title) {
    return writeAnchorTag ('inline', inlineNormalRegex2, wholeMatch, text, null, url, title);
  });


  // 3. Handle reference-style shortcuts: [link text]
  // These must come last in case there's a [link text][1] or [link text](/foo)
  let referenceShortcutRegex = /\[([^\[\]]+)]/g;
  text = text.replace(referenceShortcutRegex, function (wholeMatch, text) {
    return writeAnchorTag ('reference', referenceShortcutRegex, wholeMatch, text);
  });

  // 4. Handle angle brackets links -> `<http://example.com/>`
  // Must come after links, because you can use < and > delimiters in inline links like [this](<url>).

  // 4.1. Handle links first
  let angleBracketsLinksRegex = /<(((?:https?|ftp):\/\/|www\.)[^'">\s]+)>/gi;
  text = text.replace(angleBracketsLinksRegex, function (wholeMatch, url, urlStart) {
    let text = url;
    url = (urlStart === 'www.') ? 'http://' + url : url;
    return writeAnchorTag ('angleBrackets', angleBracketsLinksRegex, wholeMatch, text, null, url);
  });

  // 4.2. Then mail adresses
  let angleBracketsMailRegex = /<(?:mailto:)?([-.\w]+@[-a-z\d]+(\.[-a-z\d]+)*\.[a-z]+)>/gi;
  text = text.replace(angleBracketsMailRegex, function (wholeMatch, mail) {
    const m = parseMail(mail);
    return writeAnchorTag ('angleBrackets', angleBracketsMailRegex, wholeMatch, m.mail, null, m.url);
  });

  // 5. Handle GithubMentions (if option is enabled)
  if (options.ghMentions) {
    let ghMentionsRegex = /(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gi;
    text = text.replace(ghMentionsRegex, function (wholeMatch, st, escape, mentions, username) {
      // bail if the mentions was escaped
      if (escape === '\\') {
        return st + mentions;
      }
      // check if options.ghMentionsLink is a string
      // TODO Validation should be done at initialization not at runtime
      if (!showdown.helper.isString(options.ghMentionsLink)) {
        throw new Error('ghMentionsLink option must be a string');
      }
      let url = options.ghMentionsLink.replace(/\{u}/g, username);
      return st + writeAnchorTag ('reference', ghMentionsRegex, wholeMatch, mentions, null, url);
    });
  }

  // 6 and 7 have to come here to prevent naked links to catch html
  // 6. Handle <a> tags
  text = text.replace(/<a\s[^>]*>[\s\S]*<\/a>/g, function (wholeMatch) {
    return showdown.helper._hashHTMLSpan(wholeMatch, globals);
  });

  // 7. Handle <img> tags
  text = text.replace(/<img\s[^>]*\/?>/g, function (wholeMatch) {
    return showdown.helper._hashHTMLSpan(wholeMatch, globals);
  });

  // 8. Handle naked links (if option is enabled)
  if (options.simplifiedAutoLink) {
    // 8.1. Check for naked URLs
    // we also include leading markdown magic chars [_*~] for cases like __https://www.google.com/foobar__
    let nakedUrlRegex = /([_*~]*?)(((?:https?|ftp):\/\/|www\.)[^\s<>"'`´.-][^\s<>"'`´]*?\.[a-z\d.]+[^\s<>"']*)\1/gi;
    text = text.replace(nakedUrlRegex, function (wholeMatch, leadingMDChars, url, urlPrefix) {
      // we now will start traversing the url from the front to back, looking for punctuation chars [_*~,;:.!?\)\]]
      const len = url.length;
      let suffix = '';

      for (let i = len - 1; i >= 0; --i) {
        let char = url.charAt(i);
        if (/[_*~,;:.!?]/.test(char)) {
          // it's a punctuation char so we remove it from the url
          url = url.slice(0, -1);
          // and prepend it to the suffix
          suffix = char + suffix;
        } else if (/[)\]]/.test(char)) {
          // it's a parenthesis so we need to check for "balance" (kinda)
          let opPar, clPar;
          if (/\)/.test(char)) {
            // it's a curved parenthesis
            opPar = url.match(/\(/g) || [];
            clPar = url.match(/\)/g);
          } else {
            // it's a squared parenthesis
            opPar = url.match(/\[/g) || [];
            clPar = url.match(/]/g);
          }
          if (opPar.length < clPar.length) {
            // there are more closing Parenthesis than opening so chop it!!!!!
            url = url.slice(0, -1);
            // and prepend it to the suffix
            suffix = char + suffix;
          } else {
            // it's (kinda) balanced so our work is done
            break;
          }
        } else {
          // it's not a punctuation or a parenthesis so our work is done
          break;
        }
      }

      // we copy the treated url to the text variable
      let txt = url;
      // finally, if it's a www shortcut, we prepend http
      url = (urlPrefix === 'www.') ? 'http://' + url : url;

      // url part is done so let's take care of text now
      // we need to escape the text (because of links such as www.example.com/foo__bar__baz)
      txt = txt.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

      // and return the link tag, with the leadingMDChars and  suffix. The leadingMDChars are added at the end too because
      // we consumed those characters in the regexp
      return leadingMDChars +
        writeAnchorTag ('autoLink', nakedUrlRegex, wholeMatch, txt, null, url) +
        suffix +
        leadingMDChars;
    });

    // 8.2. Now check for naked mail
    let nakedMailRegex = /(^|\s)(?:mailto:)?([A-Za-z\d!#$%&'*+-/=?^_`{|}~.]+@[-a-z\d]+(\.[-a-z\d]+)*\.[a-z]+)(?=$|\s)/gmi;
    text = text.replace(nakedMailRegex, function (wholeMatch, leadingChar, mail) {
      const m = parseMail(mail);
      return leadingChar + writeAnchorTag ('autoLink', nakedMailRegex, wholeMatch, m.mail, null, m.url);
    });
  }

  let afterEvent = new showdown.Event('makehtml.link.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;



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
   * @returns {string}
   */
  function writeAnchorTag (subEvtName, pattern, wholeMatch, text, linkId, url, title, emptyCase) {

    let matches = {
          _wholeMatch: wholeMatch,
          _linkId: linkId,
          _url: url,
          _title: title,
          text: text
        },
        otp,
        attributes = {};

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

    url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
    url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
    attributes.href = url;

    if (title && showdown.helper.isString(title)) {
      title = title
        .replace(/"/g, '&quot;')
        .replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
      attributes.title = title;
    }

    // optionLinksInNewWindow only applies
    // to external links. Hash links (#) open in same page
    if (options.openLinksInNewWindow && !/^#/.test(url)) {
      attributes.rel = 'noopener noreferrer';
      attributes.target = '¨E95Eblank'; // escaped _
      attributes['aria-label'] = text + ' (opens in new tab)';

    }

    let captureStartEvent = new showdown.Event('makehtml.link.' + subEvtName + '.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches(matches)
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      text = captureStartEvent.matches.text || '';
      // Text can be a markdown element, so we run through the appropriate parsers
      text = showdown.subParser('makehtml.codeSpan')(text, options, globals);
      text = showdown.subParser('makehtml.emoji')(text, options, globals);
      text = showdown.subParser('makehtml.underline')(text, options, globals);
      text = showdown.subParser('makehtml.emphasisAndStrong')(text, options, globals);
      text = showdown.subParser('makehtml.strikethrough')(text, options, globals);
      text = showdown.subParser('makehtml.ellipsis')(text, options, globals);
      text = showdown.subParser('makehtml.hashHTMLSpans')(text, options, globals);
      otp = '<a' + showdown.helper._populateAttributes(attributes) + '>' + text + '</a>';
    }

    let beforeHashEvent = new showdown.Event('makehtml.link.' + subEvtName + '.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    return showdown.subParser('makehtml.hashHTMLSpans')(otp, options, globals);
  }

  /**
   * @param {string} mail
   * @returns {{mail: string, url: string}}
   */
  function parseMail (mail) {
    let url = 'mailto:';
    mail = showdown.subParser('makehtml.unescapeSpecialChars')(mail, options, globals);
    if (options.encodeEmails) {
      url = showdown.helper.encodeEmailAddress(url + mail);
      mail = showdown.helper.encodeEmailAddress(mail);
    } else {
      url = url + mail;
    }
    return {
      mail: mail,
      url: url
    };
  }
});
