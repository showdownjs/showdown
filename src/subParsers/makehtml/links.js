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

(function () {
  /**
   * Helper function: Wrapper function to pass as second replace parameter
   *
   * @param {RegExp} rgx
   * @param {string} evtRootName
   * @param {{}} options
   * @param {{}} globals
   * @returns {Function}
   */
  function replaceAnchorTag (rgx, evtRootName, options, globals, emptyCase) {
    emptyCase = !!emptyCase;
    return function (wholeMatch, text, id, url, m5, m6, title) {
      // bail we we find 2 newlines somewhere
      if (/\n\n/.test(wholeMatch)) {
        return wholeMatch;
      }

      var evt = createEvent(rgx, evtRootName + '.captureStart', wholeMatch, text, id, url, title, options, globals);
      return writeAnchorTag(evt, options, globals, emptyCase);
    };
  }

  /**
   * TODO Normalize this
   * Helper function: Create a capture event
   * @param {RegExp} rgx
   * @param {String} evtName Event name
   * @param {String} wholeMatch
   * @param {String} text
   * @param {String} id
   * @param {String} url
   * @param {String} title
   * @param {{}} options
   * @param {{}} globals
   * @returns {showdown.helper.Event|*}
   */
  function createEvent (rgx, evtName, wholeMatch, text, id, url, title, options, globals) {
    return globals.converter._dispatch(evtName, wholeMatch, options, globals, {
      regexp: rgx,
      matches: {
        wholeMatch: wholeMatch,
        text: text,
        id: id,
        url: url,
        title: title
      }
    });
  }

  /**
   * Helper Function: Normalize and write an anchor tag based on passed parameters
   * @param evt
   * @param options
   * @param globals
   * @param {boolean} emptyCase
   * @returns {string}
   */
  function writeAnchorTag (evt, options, globals, emptyCase) {

    var wholeMatch = evt.getMatches().wholeMatch;
    var text = evt.getMatches().text;
    var id = evt.getMatches().id;
    var url = evt.getMatches().url;
    var title = evt.getMatches().title;
    var target = '';

    if (!title) {
      title = '';
    }
    id = (id) ? id.toLowerCase() : '';

    if (emptyCase) {
      url = '';
    } else if (!url) {
      if (!id) {
        // lower-case and turn embedded newlines into spaces
        id = text.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + id;

      if (!showdown.helper.isUndefined(globals.gUrls[id])) {
        url = globals.gUrls[id];
        if (!showdown.helper.isUndefined(globals.gTitles[id])) {
          title = globals.gTitles[id];
        }
      } else {
        return wholeMatch;
      }
    }
    //url = showdown.helper.escapeCharacters(url, '*_:~', false); // replaced line to improve performance
    url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

    if (title !== '' && title !== null) {
      title = title.replace(/"/g, '&quot;');
      //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
      title = title.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
      title = ' title="' + title + '"';
    }

    // optionLinksInNewWindow only applies
    // to external links. Hash links (#) open in same page
    if (options.openLinksInNewWindow && !/^#/.test(url)) {
      // escaped _
      target = ' target="¨E95Eblank"';
    }

    // Text can be a markdown element, so we run through the appropriate parsers
    text = showdown.subParser('makehtml.codeSpans')(text, options, globals);
    text = showdown.subParser('makehtml.emoji')(text, options, globals);
    text = showdown.subParser('makehtml.underline')(text, options, globals);
    text = showdown.subParser('makehtml.italicsAndBold')(text, options, globals);
    text = showdown.subParser('makehtml.strikethrough')(text, options, globals);
    text = showdown.subParser('makehtml.ellipsis')(text, options, globals);
    text = showdown.subParser('makehtml.hashHTMLSpans')(text, options, globals);

    //evt = createEvent(rgx, evtRootName + '.captureEnd', wholeMatch, text, id, url, title, options, globals);

    var result = '<a href="' + url + '"' + title + target + '>' + text + '</a>';

    //evt = createEvent(rgx, evtRootName + '.beforeHash', wholeMatch, text, id, url, title, options, globals);

    result = showdown.subParser('makehtml.hashHTMLSpans')(result, options, globals);

    return result;
  }

  var evtRootName = 'makehtml.links';

  /**
   * Turn Markdown link shortcuts into XHTML <a> tags.
   */
  showdown.subParser('makehtml.links', function (text, options, globals) {

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    // 1. Handle reference-style links: [link text] [id]
    text = showdown.subParser('makehtml.links.reference')(text, options, globals);

    // 2. Handle inline-style links: [link text](url "optional title")
    text = showdown.subParser('makehtml.links.inline')(text, options, globals);

    // 3. Handle reference-style shortcuts: [link text]
    // These must come last in case there's a [link text][1] or [link text](/foo)
    text = showdown.subParser('makehtml.links.referenceShortcut')(text, options, globals);

    // 4. Handle angle brackets links -> `<http://example.com/>`
    // Must come after links, because you can use < and > delimiters in inline links like [this](<url>).
    text = showdown.subParser('makehtml.links.angleBrackets')(text, options, globals);

    // 5. Handle GithubMentions (if option is enabled)
    text = showdown.subParser('makehtml.links.ghMentions')(text, options, globals);

    // 6. Handle <a> tags and img tags
    text = text.replace(/<a\s[^>]*>[\s\S]*<\/a>/g, function (wholeMatch) {
      return showdown.helper._hashHTMLSpan(wholeMatch, globals);
    });

    text = text.replace(/<img\s[^>]*\/?>/g, function (wholeMatch) {
      return showdown.helper._hashHTMLSpan(wholeMatch, globals);
    });

    // 7. Handle naked links (if option is enabled)
    text = showdown.subParser('makehtml.links.naked')(text, options, globals);

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();
    return text;
  });

  /**
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.inline', function (text, options, globals) {
    var evtRootName = evtRootName + '.inline';

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    // 1. Look for empty cases: []() and [empty]() and []("title")
    var rgxEmpty = /\[(.*?)]()()()()\(<? ?>? ?(?:["'](.*)["'])?\)/g;
    text = text.replace(rgxEmpty, replaceAnchorTag(rgxEmpty, evtRootName, options, globals, true));

    // 2. Look for cases with crazy urls like ./image/cat1).png
    var rgxCrazy = /\[((?:\[[^\]]*]|[^\[\]])*)]()\s?\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
    text = text.replace(rgxCrazy, replaceAnchorTag(rgxCrazy, evtRootName, options, globals));

    // 3. inline links with no title or titles wrapped in ' or ":
    // [text](url.com) || [text](<url.com>) || [text](url.com "title") || [text](<url.com> "title")
    //var rgx2 = /\[[ ]*[\s]?[ ]*([^\n\[\]]*?)[ ]*[\s]?[ ]*] ?()\(<?[ ]*[\s]?[ ]*([^\s'"]*)>?(?:[ ]*[\n]?[ ]*()(['"])(.*?)\5)?[ ]*[\s]?[ ]*\)/; // this regex is too slow!!!
    var rgx2 = /\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s*(?:()(['"])(.*?)\5)? *\)/g;
    text = text.replace(rgx2, replaceAnchorTag(rgx2, evtRootName, options, globals));

    // 4. inline links with titles wrapped in (): [foo](bar.com (title))
    var rgx3 = /\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s+()()\((.*?)\) *\)/g;
    text = text.replace(rgx3, replaceAnchorTag(rgx3, evtRootName, options, globals));

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();

    return text;
  });

  /**
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.reference', function (text, options, globals) {
    var evtRootName = evtRootName + '.reference';

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    var rgx = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;
    text = text.replace(rgx, replaceAnchorTag(rgx, evtRootName, options, globals));

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();

    return text;
  });

  /**
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.referenceShortcut', function (text, options, globals) {
    var evtRootName = evtRootName + '.referenceShortcut';

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    var rgx = /\[([^\[\]]+)]()()()()()/g;
    text = text.replace(rgx, replaceAnchorTag(rgx, evtRootName, options, globals));

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();

    return text;
  });

  /**
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.ghMentions', function (text, options, globals) {
    var evtRootName = evtRootName + 'ghMentions';

    if (!options.ghMentions) {
      return text;
    }

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    var rgx = /(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gi;

    text = text.replace(rgx, function (wholeMatch, st, escape, mentions, username) {
      // bail if the mentions was escaped
      if (escape === '\\') {
        return st + mentions;
      }

      // check if options.ghMentionsLink is a string
      // TODO Validation should be done at initialization not at runtime
      if (!showdown.helper.isString(options.ghMentionsLink)) {
        throw new Error('ghMentionsLink option must be a string');
      }
      var url = options.ghMentionsLink.replace(/{u}/g, username);
      var evt = createEvent(rgx, evtRootName + '.captureStart', wholeMatch, mentions, null, url, null, options, globals);
      // captureEnd Event is triggered inside writeAnchorTag function
      return st + writeAnchorTag(evt, options, globals);
    });

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();

    return text;
  });

  /**
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.angleBrackets', function (text, options, globals) {
    var evtRootName = 'makehtml.links.angleBrackets';

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    // 1. Parse links first
    var urlRgx  = /<(((?:https?|ftp):\/\/|www\.)[^'">\s]+)>/gi;
    text = text.replace(urlRgx, function (wholeMatch, url, urlStart) {
      var text = url;
      url = (urlStart === 'www.') ? 'http://' + url : url;
      var evt = createEvent(urlRgx, evtRootName + '.captureStart', wholeMatch, text, null, url, null, options, globals);
      return writeAnchorTag(evt, options, globals);
    });

    // 2. Then Mail Addresses
    var mailRgx = /<(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;
    text = text.replace(mailRgx, function (wholeMatch, mail) {
      var url = 'mailto:';
      mail = showdown.subParser('makehtml.unescapeSpecialChars')(mail, options, globals);
      if (options.encodeEmails) {
        url = showdown.helper.encodeEmailAddress(url + mail);
        mail = showdown.helper.encodeEmailAddress(mail);
      } else {
        url = url + mail;
      }
      var evt = createEvent(mailRgx, evtRootName + '.captureStart', wholeMatch, mail, null, url, null, options, globals);
      return writeAnchorTag(evt, options, globals);
    });

    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();
    return text;
  });

  /**
   * TODO MAKE THIS WORK (IT'S NOT ACTIVATED)
   * TODO WRITE THIS DOCUMENTATION
   */
  showdown.subParser('makehtml.links.naked', function (text, options, globals) {
    if (!options.simplifiedAutoLink) {
      return text;
    }

    var evtRootName = 'makehtml.links.naked';

    text = globals.converter._dispatch(evtRootName + '.start', text, options, globals).getText();

    // 2. Now we check for
    // we also include leading markdown magic chars [_*~] for cases like __https://www.google.com/foobar__
    var urlRgx = /([_*~]*?)(((?:https?|ftp):\/\/|www\.)[^\s<>"'`´.-][^\s<>"'`´]*?\.[a-z\d.]+[^\s<>"']*)\1/gi;
    text = text.replace(urlRgx, function (wholeMatch, leadingMDChars, url, urlPrefix) {

      // we now will start traversing the url from the front to back, looking for punctuation chars [_*~,;:.!?\)\]]
      var len = url.length;
      var suffix = '';
      for (var i = len - 1; i >= 0; --i) {
        var char = url.charAt(i);

        if (/[_*~,;:.!?]/.test(char)) {
          // it's a punctuation char
          // we remove it from the url
          url = url.slice(0, -1);
          // and prepend it to the suffix
          suffix = char + suffix;
        } else if (/\)/.test(char)) {
          var opPar = url.match(/\(/g) || [];
          var clPar = url.match(/\)/g);

          // it's a curved parenthesis so we need to check for "balance" (kinda)
          if (opPar.length < clPar.length) {
            // there are more closing Parenthesis than opening so chop it!!!!!
            url = url.slice(0, -1);
            // and prepend it to the suffix
            suffix = char + suffix;
          } else {
            // it's (kinda) balanced so our work is done
            break;
          }
        } else if (/]/.test(char)) {
          var opPar2 = url.match(/\[/g) || [];
          var clPar2 = url.match(/\]/g);
          // it's a squared parenthesis so we need to check for "balance" (kinda)
          if (opPar2.length < clPar2.length) {
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
      var text = url;
      // finally, if it's a www shortcut, we prepend http
      url = (urlPrefix === 'www.') ? 'http://' + url : url;

      // url part is done so let's take care of text now
      // we need to escape the text (because of links such as www.example.com/foo__bar__baz)
      text = text.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

      // finally we dispatch the event
      var evt = createEvent(urlRgx, evtRootName + '.captureStart', wholeMatch, text, null, url, null, options, globals);

      // and return the link tag, with the leadingMDChars and  suffix. The leadingMDChars are added at the end too because
      // we consumed those characters in the regexp
      return leadingMDChars + writeAnchorTag(evt, options, globals) + suffix + leadingMDChars;
    });

    // 2. Then mails
    var mailRgx = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi;
    text = text.replace(mailRgx, function (wholeMatch, leadingChar, mail) {
      var url = 'mailto:';
      mail = showdown.subParser('makehtml.unescapeSpecialChars')(mail, options, globals);
      if (options.encodeEmails) {
        url = showdown.helper.encodeEmailAddress(url + mail);
        mail = showdown.helper.encodeEmailAddress(mail);
      } else {
        url = url + mail;
      }
      var evt = createEvent(mailRgx, evtRootName + '.captureStart', wholeMatch, mail, null, url, null, options, globals);
      return leadingChar + writeAnchorTag(evt, options, globals);
    });


    text = globals.converter._dispatch(evtRootName + '.end', text, options, globals).getText();
    return text;
  });
})();
