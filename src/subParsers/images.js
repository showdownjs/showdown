/**
 * Turn Markdown image shortcuts into <img> tags.
 */
showdown.subParser('images', function (text, options, globals) {
  'use strict';

  var writeImageTag = function (wholeMatch, m1, m2, m3, m4, m5, m6, m7) {

    wholeMatch = m1;
    var altText = m2,
        linkId = m3.toLowerCase(),
        url = m4,
        title = m7,
        gUrls = globals.gUrls,
        gTitles = globals.gTitles;

    if (!title) {
      title = '';
    }

    if (url === '' || url === null) {
      if (linkId === '' || linkId === null) {
        // lower-case and turn embedded newlines into spaces
        linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + linkId;

      if (typeof gUrls[linkId] !== 'undefined') {
        url = gUrls[linkId];
        if (typeof gTitles[linkId] !== 'undefined') {
          title = gTitles[linkId];
        }
      } else {
        return wholeMatch;
      }
    }

    altText = altText.replace(/"/g, '&quot;');
    url = showdown.helper.escapeCharacters(url, '*_', false);
    var result = '<img src="' + url + '" alt="' + altText + '"';

    // attacklab: Markdown.pl adds empty title attributes to images.
    // Replicate this bug.

    //if (title != "") {
    title = title.replace(/"/g, '&quot;');
    title = showdown.helper.escapeCharacters(title, '*_', false);
    result += ' title="' + title + '"';
    //}

    result += ' />';

    return result;
  };

  // First, handle reference-style labeled images: ![alt text][id]
  /*
   text = text.replace(/
   (						// wrap whole match in $1
   !\[
   (.*?)				// alt text = $2
   \]

   [ ]?				// one optional space
   (?:\n[ ]*)?			// one optional newline followed by spaces

   \[
   (.*?)				// id = $3
   \]
   )()()()()				// pad rest of backreferences
   /g,writeImageTag);
   */
  text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeImageTag);

  // Next, handle inline images:  ![alt text](url "optional title")
  // Don't forget: encode * and _
  /*
   text = text.replace(/
   (						// wrap whole match in $1
   !\[
   (.*?)				// alt text = $2
   \]
   \s?					// One optional whitespace character
   \(					// literal paren
   [ \t]*
   ()					// no id, so leave $3 empty
   <?(\S+?)>?			// src url = $4
   [ \t]*
   (					// $5
   (['"])			// quote char = $6
   (.*?)			// title = $7
   \6				// matching quote
   [ \t]*
   )?					// title is optional
   \)
   )
   /g,writeImageTag);
   */
  text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeImageTag);

  return text;
});
