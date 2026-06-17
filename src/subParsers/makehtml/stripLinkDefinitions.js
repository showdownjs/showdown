/**
 * Strips link definitions from text, stores the URLs and titles in
 * hash references.
 * Link defs are in the form: ^[id]: url "optional title"
 */
showdown.subParser('makehtml.stripLinkDefinitions', function (text, options, globals) {
  'use strict';

  const regex     = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
      base64Regex = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z\d+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

  let startEvent = new showdown.Event('makehtml.stripLinkDefinitions.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  let replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {

    // if there aren't two instances of linkId it must not be a reference link so back out
    linkId = linkId.toLowerCase();
    if (text.toLowerCase().split(linkId).length - 1 < 2) {
      return wholeMatch;
    }

    let captureStartEvent = new showdown.Event('makehtml.stripLinkDefinitions.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(regex)
      .setMatches({
        _wholeMatch: wholeMatch,
        linkId: linkId,
        url: url,
        width: width,
        height: height,
        blankLines: blankLines,
        title: title
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    let otp;
    // if something was passed as output, it takes precedence and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      // a listener may have normalized the captured groups
      linkId     = captureStartEvent.matches.linkId;
      url        = captureStartEvent.matches.url;
      width      = captureStartEvent.matches.width;
      height     = captureStartEvent.matches.height;
      blankLines = captureStartEvent.matches.blankLines;
      title      = captureStartEvent.matches.title;

      if (url.match(/^data:.+?\/.+?;base64,/)) {
        // remove newlines
        globals.gUrls[linkId] = url.replace(/\s/g, '');
      } else {
        url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);

        globals.gUrls[linkId] = showdown.subParser('makehtml.encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
      }

      if (blankLines) {
        // Oops, found blank lines, so it's not a title.
        // Put back the parenthetical statement we stole.
        otp = blankLines + title;

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
        // Completely remove the definition from the text
        otp = '';
      }
    }

    let beforeHashEvent = new showdown.Event('makehtml.stripLinkDefinitions.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  };

  // first we try to find base64 link references
  text = text.replace(base64Regex, replaceFunc);

  text = text.replace(regex, replaceFunc);

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = new showdown.Event('makehtml.stripLinkDefinitions.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
