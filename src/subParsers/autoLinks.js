showdown.subParser('autoLinks', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('autoLinks.before', text, options, globals);

  var simpleURLRegex  = /\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)()(?=\s|$)(?!["<>])/gi,
      simpleURLRegex2 = /\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?()]?)(?=\s|$)(?!["<>])/gi,
      delimUrlRegex   = /<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)>/gi,
      simpleMailRegex = /(?:^|\s)([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?:$|\s)/gi,
      delimMailRegex  = /<(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;

  text = text.replace(delimUrlRegex, replaceLink);
  text = text.replace(delimMailRegex, replaceMail);
  // simpleURLRegex  = /\b(((https?|ftp|dict):\/\/|www\.)[-.+~:?#@!$&'()*,;=[\]\w]+)\b/gi,
  // Email addresses: <address@domain.foo>

  if (options.simplifiedAutoLink) {
    if (options.excludeTrailingPunctuationFromURLs) {
      text = text.replace(simpleURLRegex2, replaceLink);
    } else {
      text = text.replace(simpleURLRegex, replaceLink);
    }
    text = text.replace(simpleMailRegex, replaceMail);
  }

  function replaceLink(wm, link, m2, m3, trailingPunctuation) {
    var lnkTxt = link,
        append = '';
    if (/^www\./i.test(link)) {
      link = link.replace(/^www\./i, 'http://www.');
    }
    if (options.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
      append = trailingPunctuation;
    }
    return '<a href="' + link + '">' + lnkTxt + '</a>' + append;
  }

  function replaceMail(wholeMatch, mail) {
    var unescapedStr = showdown.subParser('unescapeSpecialChars')(mail);
    return showdown.subParser('encodeEmailAddress')(unescapedStr);
  }

  text = globals.converter._dispatch('autoLinks.after', text, options, globals);

  return text;
});
