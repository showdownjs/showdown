showdown.subParser('autoLinks', function (text) {
  'use strict';

  text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, '<a href=\"$1\">$1</a>');

  // Email addresses: <address@domain.foo>

  /*
   text = text.replace(/
   <
   (?:mailto:)?
   (
   [-.\w]+
   \@
   [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
   )
   >
   /gi);
   */
  var pattern = /<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;
  text = text.replace(pattern, function (wholeMatch, m1) {
    var unescapedStr = showdown.subParser('unescapeSpecialChars')(m1);
    return showdown.subParser('encodeEmailAddress')(unescapedStr);
  });

  return text;

});
