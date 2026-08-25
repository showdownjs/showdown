/**
 * @file      makehtml/stripLinkDefinitions.js
 * @summary   Removes `[id]: url "title"` link-reference definitions and stores them (with optional dimensions) in `globals`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * One line-reference-definition scanner for every flavor (the CommonMark block scanner). Case-folds
 * link ids, supports multi-line and base64 data-URL destinations and `=WxH` dimensions. The only
 * flavor divergence is documented and gated: entity references in the URL and title are decoded only
 * when `decodeEntities` is on (the `commonmark`/`gfm` presets); everything else — label normalization,
 * percent-encoding, title escaping, first-definition-wins and no-paragraph-interruption — follows
 * CommonMark for all flavors (spec-silent → CommonMark). A definition renders no inline content, so
 * its capture events carry no `text` key — only descriptive fields (`linkId`, `url`, `title`, `width`,
 * `height`). Emits the `makehtml.stripLinkDefinitions.*` event family.
 */
showdown.subParser('makehtml.stripLinkDefinitions', function (text, options, globals) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.stripLinkDefinitions.onStart', text, options, globals);
  text = startEvent.output;

  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  text = parseCmLinkDefinitions(text);

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = showdown.Event.dispatchEnd('makehtml.stripLinkDefinitions.onEnd', text, options, globals);
  return afterEvent.output;

  /**
   * CommonMark link reference definition parsing. Scans block by block: a
   * definition may appear at the start of the document, after a blank line, or
   * immediately after another definition. Supports multi-line definitions,
   * `<...>` (and empty `<>`) destinations, multi-line (base64) destinations,
   * multi-line titles, backslash escapes and first-definition-wins for duplicate
   * labels.
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
          // a listener may override the (normally empty) rendered output; otherwise the
          // definition is stored and removed from the text
          out += commitDefinition(def);
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
   * capture/hash lifecycle so listener extensions still observe (and may override)
   * link-definition captures. Returns the rendered output — normally the empty
   * string (a definition is stored, not emitted), or a listener-provided override.
   * @param {{linkId: string, url: string, title: (string|null), width: (string|null), height: (string|null), wholeMatch: string}} def
   * @returns {string}
   */
  function commitDefinition (def) {
    let captureEvent = showdown.Event.dispatchCapture('makehtml.stripLinkDefinitions.onCapture', def.wholeMatch, {
      regexp: null,
      matches: {
        _wholeMatch: def.wholeMatch,
        linkId: def.linkId,
        url: def.url,
        title: def.title,
        width: def.width,
        height: def.height
      },
      attributes: {}
    }, options, globals);

    let otp;
    // if a listener passed output, it takes precedence and is emitted verbatim
    if (captureEvent.output && captureEvent.output !== '') {
      otp = captureEvent.output;
    } else {
      // a listener may have normalized the captured groups
      let linkId = captureEvent.matches.linkId,
          url    = captureEvent.matches.url,
          title  = captureEvent.matches.title,
          width  = captureEvent.matches.width,
          height = captureEvent.matches.height;

      // first definition wins
      if (showdown.helper.isUndefined(globals.gUrls[linkId])) {
        globals.gUrls[linkId] = url;
        if (title !== null && !showdown.helper.isUndefined(title)) {
          globals.gTitles[linkId] = title;
        }
        // parseImgDimensions: store reference-style dimensions (consumed by the image
        // builder). The `=WxH` grammar is always parsed, but only stored when the option is on.
        if (options.parseImgDimensions && width && height) {
          globals.gDimensions[linkId] = { width: width, height: height };
        }
      }
      // a definition is stored, never rendered inline
      otp = '';
    }

    let hashEvent = showdown.Event.dispatchHash('makehtml.stripLinkDefinitions.onHash', otp, options, globals);
    return hashEvent.output;
  }

  /**
   * Attempt to parse a single CommonMark link reference definition starting at
   * `start` (a line start). Returns the parsed definition with `end` (index just
   * past the consumed text) or `null` if there is no definition here.
   * @param {string} str
   * @param {number} start
   * @returns {{linkId: string, url: string, title: (string|null), width: (string|null), height: (string|null), wholeMatch: string, end: number}|null}
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

    // Multi-line base64 data URLs (issue #429): a bare `data:...;base64,` destination may
    // wrap across several lines. cmScanDestination stops at the first newline, so fold in
    // the following pure-base64 continuation lines (kept for all flavors). The trailing
    // `.replace(/\s/g, '')` below strips any residual whitespace.
    if (!dest.angle && /^data:[^/]+\/[^;]+;base64,[A-Za-z\d+/=]*$/.test(url)) {
      while (str.charAt(afterDest) === '\n') {
        let lineEnd = str.indexOf('\n', afterDest + 1);
        if (lineEnd === -1) { lineEnd = n; }
        let contLine = str.slice(afterDest + 1, lineEnd);
        if (!/^[A-Za-z\d+/=]+$/.test(contLine)) { break; }
        url += contLine;
        afterDest = lineEnd;
      }
    }

    // parseImgDimensions (Showdown extension, not CommonMark): an optional ` =WxH`
    // between the destination and the title. Always consumed here; only stored as
    // dimensions when the option is on (see commitDefinition). Regex fragment mirrors
    // the historic inline-image regex.
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

    if (url.match(/^data:[^/]+\/[^;]+;base64,/)) {
      url = url.replace(/\s/g, '');
    } else {
      url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
      url = normalizeDefinitionURL(url);
    }
    if (title !== null) { title = escapeDefinitionTitle(title); }

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

  /**
   * Normalize a link-definition destination. Percent-encoding, backslash-escape
   * resolution and residual-`&` guarding are CommonMark behavior for every flavor
   * (spec-silent → CommonMark); decoding character references is the one documented
   * divergence, gated on `decodeEntities` (on in the `commonmark`/`gfm` presets) — the
   * `decode` flag is threaded straight through to `cmNormalizeURL`.
   * @param {string} url the destination with `relativePathBaseUrl` already applied
   * @returns {string}
   */
  function normalizeDefinitionURL (url) {
    return showdown.helper.cmNormalizeURL(url, options.decodeEntities);
  }

  /**
   * Escape a link-definition title for use in a `title="..."` attribute. Guarding
   * the residual `&` and escaping `<`, `>`, `"` is CommonMark behavior for every
   * flavor; decoding character references is gated on `decodeEntities` — the `decode`
   * flag is threaded straight through to `cmEscapeTitle`.
   * @param {string} title
   * @returns {string}
   */
  function escapeDefinitionTitle (title) {
    return showdown.helper.cmEscapeTitle(title, options.decodeEntities);
  }
});
