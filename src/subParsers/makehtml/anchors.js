/**
 * Turn Markdown link shortcuts into XHTML <a> tags.
 */
showdown.subParser('makehtml.anchors', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.anchors.before', text, options, globals).getText();

  var writeAnchorTag = function (rgx) {

    return function (wholeMatch1, linkText1, linkId1, url1, m5, m6, title1) {
      var evt = globals.converter._dispatch('makehtml.anchors.capture_begin', wholeMatch1, options, globals, {
        regexp: rgx,
        matches: {
          wholeMatch: wholeMatch1,
          linkText: linkText1,
          linkId: linkId1,
          url: url1,
          title: title1
        }
      });

      var wholeMatch = evt.getMatches().wholeMatch;
      var linkText = evt.getMatches().linkText;
      var linkId = evt.getMatches().linkId;
      var url = evt.getMatches().url;
      var title = evt.getMatches().title;

      if (showdown.helper.isUndefined(title)) {
        title = '';
      }
      linkId = linkId.toLowerCase();

      // Special case for explicit empty url
      if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
        url = '';
      } else if (!url) {
        if (!linkId) {
          // lower-case and turn embedded newlines into spaces
          linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
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

      //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
      url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

      var result = '<a href="' + url + '"';

      if (title !== '' && title !== null) {
        title = title.replace(/"/g, '&quot;');
        //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
        title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
        result += ' title="' + title + '"';
      }

      // optionLinksInNewWindow only applies
      // to external links. Hash links (#) open in same page
      if (options.openLinksInNewWindow && !/^#/.test(url)) {
        // escaped _
        result += ' target="¨E95Eblank"';
      }

      result += '>' + linkText + '</a>';

      return result;
    };
  };

  var referenceRegex = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;
  // First, handle reference-style links: [link text] [id]
  text = text.replace(referenceRegex, writeAnchorTag(referenceRegex));

  // Next, inline-style links: [link text](url "optional title")
  // cases with crazy urls like ./image/cat1).png
  var inlineRegexCrazy = /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
  text = text.replace(inlineRegexCrazy, writeAnchorTag(inlineRegexCrazy));

  // normal cases
  var inlineRegex = /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
  text = text.replace(inlineRegex, writeAnchorTag(inlineRegex));

  // handle reference-style shortcuts: [link text]
  // These must come last in case you've also got [link test][1]
  // or [link test](/foo)
  var referenceShortcutRegex = /\[([^\[\]]+)]()()()()()/g;
  text = text.replace(referenceShortcutRegex, writeAnchorTag(referenceShortcutRegex));

  // Lastly handle GithubMentions if option is enabled
  if (options.ghMentions) {
    text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gmi, function (wm, st, escape, mentions, username) {
      if (escape === '\\') {
        return st + mentions;
      }

      //check if options.ghMentionsLink is a string
      if (!showdown.helper.isString(options.ghMentionsLink)) {
        throw new Error('ghMentionsLink option must be a string');
      }
      var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
          target = '';
      if (options.openLinksInNewWindow) {
        target = ' target="¨E95Eblank"';
      }

      // lnk = showdown.helper.escapeCharacters(lnk, '*_', false); // replaced line to improve performance
      lnk = lnk.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

      return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
    });
  }

  text = globals.converter._dispatch('makehtml.anchors.after', text, options, globals).getText();
  return text;
});
