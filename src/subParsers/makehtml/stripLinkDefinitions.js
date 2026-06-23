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
    linkId = showdown.helper.caseFold(linkId);
    if (showdown.helper.caseFold(text).split(linkId).length - 1 < 2) {
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

  if (options.cmSpec) {
    text = parseCmLinkDefinitions(text);
  } else {
    // first we try to find base64 link references
    text = text.replace(base64Regex, replaceFunc);

    text = text.replace(regex, replaceFunc);
  }

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = new showdown.Event('makehtml.stripLinkDefinitions.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

  /**
   * CommonMark link reference definition parsing. Scans block by block: a
   * definition may appear at the start of the document, after a blank line, or
   * immediately after another definition. Supports multi-line definitions,
   * `<...>` (and empty `<>`) destinations, multi-line titles, backslash escapes
   * and first-definition-wins for duplicate labels.
   * @param {string} str text with the trailing `¨0` sentinel
   * @returns {string}
   */
  function parseCmLinkDefinitions (str) {
    let n = str.length,
        out = '',
        i = 0,
        atBlockStart = true;
    while (i < n) {
      if (atBlockStart) {
        let def = tryParseCmDefinition(str, i);
        if (def) {
          commitDefinition(def);
          i = def.end;
          atBlockStart = true; // consecutive definitions are allowed
          continue;
        }
      }
      // consume one line verbatim
      let nl = str.indexOf('\n', i);
      if (nl === -1) {
        out += str.slice(i);
        break;
      }
      let line = str.slice(i, nl + 1);
      out += line;
      i = nl + 1;
      // A definition can begin after a blank line or after a self-contained leaf
      // block such as an ATX heading or a thematic break, but it must not
      // interrupt a paragraph.
      atBlockStart = /^[ \t]*\n$/.test(line) ||
        /^ {0,3}#{1,6}(?:[ \t]|\n)/.test(line) ||
        /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}\n$/.test(line);
    }
    return out;
  }

  /**
   * Store a parsed definition, honoring first-definition-wins, and dispatch the
   * capture event so listener extensions still observe link-definition captures.
   * @param {{linkId: string, url: string, title: (string|null), wholeMatch: string}} def
   */
  function commitDefinition (def) {
    let captureStartEvent = new showdown.Event('makehtml.stripLinkDefinitions.onCapture', def.wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(null)
      .setMatches({
        _wholeMatch: def.wholeMatch,
        linkId: def.linkId,
        url: def.url,
        title: def.title
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    let linkId = captureStartEvent.matches.linkId,
        url = captureStartEvent.matches.url,
        title = captureStartEvent.matches.title;

    // first definition wins
    if (showdown.helper.isUndefined(globals.gUrls[linkId])) {
      globals.gUrls[linkId] = url;
      if (title !== null && !showdown.helper.isUndefined(title)) {
        globals.gTitles[linkId] = title;
      }
      // parseImgDimensions: store reference-style dimensions (gating copied from the
      // legacy stripLinkDefinitions replaceFunc); consumed by cmInline's image builder
      if (options.parseImgDimensions && def.width && def.height) {
        globals.gDimensions[linkId] = { width: def.width, height: def.height };
      }
    }
  }

  /**
   * Attempt to parse a single CommonMark link reference definition starting at
   * `start` (a line start). Returns the parsed definition with `end` (index just
   * past the consumed text) or `null` if there is no definition here.
   * @param {string} str
   * @param {number} start
   * @returns {{linkId: string, url: string, title: (string|null), wholeMatch: string, end: number}|null}
   */
  function tryParseCmDefinition (str, start) {
    let n = str.length,
        j = start,
        isEnd = function (p) { return p >= n || str.charAt(p) === '\n' || str.slice(p, p + 2) === '¨0'; };

    // up to 3 leading spaces
    let sp = 0;
    while (j < n && str.charAt(j) === ' ' && sp < 3) { j++; sp++; }
    if (str.charAt(j) !== '[') { return null; }
    j++;

    // label: up to the first unescaped ']', no nested '[' or blank line
    let label = '', sawNonWs = false;
    while (j < n) {
      let c = str.charAt(j);
      if (c === '\\' && j + 1 < n) { label += c + str.charAt(j + 1); j += 2; sawNonWs = true; continue; }
      if (c === ']') { break; }
      if (c === '[') { return null; }
      if (!/\s/.test(c)) { sawNonWs = true; }
      label += c; j++;
    }
    if (j >= n || str.charAt(j) !== ']' || !sawNonWs || /\n[ \t]*\n/.test(label)) { return null; }
    j++; // consume ']'
    if (str.charAt(j) !== ':') { return null; }
    j++;

    // whitespace (incl at most one line ending) before the destination
    let nlCount = 0;
    while (j < n && /[ \t\n]/.test(str.charAt(j))) {
      if (str.charAt(j) === '\n') { nlCount++; if (nlCount > 1) { return null; } }
      j++;
    }

    let dest = showdown.helper.cmScanDestination(str, j);
    if (!dest || (!dest.angle && dest.url === '')) { return null; }
    let afterDest = dest.end,
        url = dest.url;

    // parseImgDimensions (Showdown extension, not CommonMark): an optional ` =WxH`
    // between the destination and the title. Always consumed here; only stored as
    // dimensions when the option is on (see commitDefinition). Regex fragment copied
    // from the inline image regex in image.js.
    let width = null, height = null;
    let dimPos = afterDest;
    while (dimPos < n && /[ \t]/.test(str.charAt(dimPos))) { dimPos++; }
    if (dimPos > afterDest && str.charAt(dimPos) === '=') {
      let dim = /^=([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4})/.exec(str.slice(dimPos));
      if (dim) {
        width = dim[1];
        height = dim[2];
        afterDest = dimPos + dim[0].length;
      }
    }

    // optional title, separated from the destination by whitespace (and at most
    // one line ending, with no blank line)
    let k = afterDest, sawSpace = false, sawNl = false;
    while (k < n && /[ \t]/.test(str.charAt(k))) { k++; sawSpace = true; }
    if (str.charAt(k) === '\n') { sawNl = true; k++; while (k < n && /[ \t]/.test(str.charAt(k))) { k++; } }

    let title = null, end;
    let tc = str.charAt(k);
    if ((sawSpace || sawNl) && (tc === '"' || tc === '\'' || tc === '(')) {
      let t = showdown.helper.cmScanTitle(str, k);
      if (t) {
        let p = t.end;
        while (p < n && /[ \t]/.test(str.charAt(p))) { p++; }
        if (isEnd(p)) {
          title = t.title;
          end = (str.charAt(p) === '\n') ? p + 1 : p;
        }
      }
    }

    if (title === null) {
      // no (valid) title: the destination must be the last token on its line
      let p = afterDest;
      while (p < n && /[ \t]/.test(str.charAt(p))) { p++; }
      if (!isEnd(p)) { return null; }
      end = (str.charAt(p) === '\n') ? p + 1 : p;
    }

    let linkId = showdown.helper.cmNormalizeLabel(label);
    if (linkId === '') { return null; }

    if (url.match(/^data:.+?\/.+?;base64,/)) {
      url = url.replace(/\s/g, '');
    } else {
      url = showdown.helper.cmNormalizeURL(showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url));
    }
    if (title !== null) { title = showdown.helper.cmEscapeTitle(title); }

    return {
      linkId: linkId,
      url: url,
      title: title,
      width: width,
      height: height,
      wholeMatch: str.slice(start, end),
      end: end
    };
  }
});
