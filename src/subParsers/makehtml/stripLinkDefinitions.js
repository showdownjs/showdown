/**
 * Strips link definitions from text, stores the URLs and titles in
 * hash references.
 * Link defs are in the form: ^[id]: url "optional title"
 */
showdown.subParser('makehtml.stripLinkDefinitions', function (text, options, globals) {
  'use strict';

  const regex     = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*((?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0)))/gm,
      base64Regex = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z\d+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*((?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[)))/gm;

  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  let replaceFunc = function (wholeMatch, linkId, url, width, height, rest, blankLines, title) {

    // if there aren't two instances of linkId it must not be a reference link so back out
    linkId = linkId.toLowerCase();
    if (text.toLowerCase().split(linkId).length - 1 < 2) {
      return wholeMatch;
    }
    if (url.match(/^data:.+?\/.+?;base64,/)) {
      // remove newlines
      globals.gUrls[linkId] = url.replace(/\s/g, '');
    } else {
      url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);

      globals.gUrls[linkId] = showdown.subParser('makehtml.encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
    }

    if (blankLines) {
      // oops, found blank lines, so it's not a title, put back the
      // parenthetical statement we stole
      //
      // if a input such as below is provided the rest of the string needs to be
      // returned, in this case it would match the headers of the table, but
      // they need to be returned as original, otherwise the rendering will not
      // work, see issue #929 for details
      //
      // https://github.com/showdownjs/showdown/issues/929
      //
      // === input
      // [^1]: https://example.com =200x200
      //
      // | Column1 | Column2 |
      // | ---     | ---     |
      // | key     | value   |
      // ===
      //
      // === whole match
      // [^1]: https://example.com =200x200
      //
      // | Column1 | Column2 |
      // ===
      //
      // === rest
      //
      // | Column1 | Column2 |
      // ===
      //
      // in this case it should omit the URL and return the rest of the string
      // since due to the blank line we know it isn't a title, the new lines are
      // important as changing these will also result in the subsequent table
      // breaking
      return rest;
    } else {
      if (title) {
        globals.gTitles[linkId] = title.replace(/["']/g, '&quot;');
      }

      if (options.parseImgDimensions && width && height) {
        globals.gDimensions[linkId] = {
          width:  width,
          height: height
        };
      }
    }

    // completely remove the definition from the text
    return '';
  };

  // first we try to find base64 link references
  text = text.replace(base64Regex, replaceFunc);

  text = text.replace(regex, replaceFunc);

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  return text;
});
