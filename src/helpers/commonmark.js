/**
 * @file      helpers/commonmark.js
 * @summary   CommonMark-specific text processing: entity decoding, URL/title normalization, label folding, scanners and the flanking character classifiers.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * `cmDecodeEntities`, `cmEncodeURI`, `cmNormalizeURL`, `cmEscapeTitle`, `cmNormalizeLabel`, the
 * link-destination/title scanners (`cmScanDestination`/`cmScanTitle`) and the `isAsciiPunct`
 * character classifier (with the authoritative `cmAsciiPunct` class it shares with the flanking
 * classifiers in inline/emphasis.js). Also the shared close-bracket machinery for the link/image
 * constructs: `cmScanLinkSuffix` (the inline `(dest "title")` suffix scan), `cmResolveLinkReference`
 * (the reference/collapsed/shortcut resolution) and the destination/title finishing helpers
 * `cmNormalizeAnchorDest`/`cmBuildTitleAttr`, all shared by `inline/link.js` and
 * `inline/image.js`. Load-order safe: every reference to another helper
 * (`htmlEntities`, `unescapePlaceholders`) happens inside function bodies (call time), never at
 * load time.
 */

/* jshint esnext: false, esversion: 9 */
// (esversion 9 enables the \p{...} Unicode property escapes used for CommonMark flanking rules)

// Guarded ampersand: a bare `&` that does NOT already begin an entity reference. Shared by
// cmNormalizeURL and cmEscapeTitle (both HTML-escape residual bare ampersands the same way).
// File-local const (load-order safe: only read inside function bodies below, at call time).
const cmGuardedAmpersand = /&(?![a-zA-Z#0-9]+;)/g;

// CommonMark punctuation = ASCII punctuation + Unicode P and S categories. This is the authoritative
// copy of the class: `isAsciiPunct` (below) tests it directly, and the flanking `isPunct` classifier
// in inline/emphasis.js reads this same const at call time (one shared concat scope). File-local
// const (load-order safe: only read inside function bodies).
const cmAsciiPunct = /[!-/:-@[-`{-~]/;

// Sticky regex anchored at the scan cursor (lastIndex) so it never slices the tail of the
// string - keeps the tokenizer linear on `<`-heavy input. Reused across calls; it sets
// lastIndex before exec and the parse is not re-entrant within a single string.
// Showdown flavors only (see the `!cmSpec` gate at cmScanLinkSuffix's call site below): a
// `data:...;base64,` inline-image destination may be split across newlines. The historic Showdown
// image parser matched base64 image URLs with a char class that allowed `\n` and then stripped all
// whitespace out of the URL, so a payload wrapped across lines still resolves to one `src`.
// cmScanDestination stops at the first newline (CommonMark forbids newlines in destinations), so
// the Showdown flavors scan the base64 body with this recognizer instead and strip the embedded
// whitespace. Sticky + anchored at the scan cursor; a single greedy class is linear / ReDoS-safe.
// File-local const (load-order safe: only read inside cmScanLinkSuffix, at call time).
const cmInlineBase64Dest = /<?(data:[^\s<>]+?\/[^\s<>]+?;base64,[A-Za-z\d+/=\n]+)>?/y;

/**
 * Unicode case folding for case-insensitive matching of link reference labels.
 * Uses `toLowerCase().toUpperCase()` (the round-trip used by commonmark.js) so that
 * characters like `ß`, `ẞ` and `SS` all fold together - which plain `toLowerCase`
 * does not (`ẞ` -> `ß`, not `ss`). File-local to commonmark.js (cmNormalizeLabel is its sole caller).
 * @param {string} str
 * @returns {string}
 */
function caseFold (str) {
  return str.toLowerCase().toUpperCase();
}

/**
 * Resolve backslash escapes of ASCII punctuation to the literal character (`\*` -> `*`); a
 * backslash before a non-punctuation character stays literal. File-local to commonmark.js
 * (`cmNormalizeAnchorDest` and `cmBuildTitleAttr` are its two callers here).
 * @param {string} str
 * @returns {string}
 */
function cmResolveBackslash (str) {
  return str.replace(/\\([!-/:-@[-`{-~])/g, '$1');
}

/**
 * Find the closing `]` of a reference label starting at `j` (just past the opening `[`),
 * honoring backslash escapes and refusing to match across a nested unescaped `[`. File-local to
 * commonmark.js (`cmResolveLinkReference` is its sole caller).
 * @param {string} str
 * @param {number} j
 * @returns {number} the index of the closing `]`, or -1 if not found
 */
function cmFindRefClose (str, j) {
  let n = str.length;
  while (j < n) {
    let c = str.charAt(j);
    if (c === '\\' && j + 1 < n) { j += 2; continue; }
    if (c === ']') { return j; }
    if (c === '[') { return -1; }
    j++;
  }
  return -1;
}

/**
 * True when `ch` is an ASCII punctuation character (and defined). Used for
 * backslash-escapability and as one input to the flanking rules.
 * @param {string|undefined} ch
 * @returns {boolean}
 */
showdown.helper.isAsciiPunct = function (ch) {
  return ch !== undefined && cmAsciiPunct.test(ch);
};

/**
 * The single character-reference decoder backing both `cmDecodeEntities` (raw output) and the
 * `makehtml.decodeEntities` subparser (HTML-re-escaped output). Resolves HTML5 named (`&ouml;`),
 * decimal (`&#246;`) and hexadecimal (`&#xf6;`) references. The `escapeOutput` policy flag is the
 * only difference between the two public surfaces:
 *  - `false` (CommonMark helper): emit the raw decoded character; leave an invalid reference verbatim.
 *  - `true` (subparser): HTML-escape the decoded character (so e.g. `&lt;` -> `&lt;`, not a live `<`)
 *    and rewrite an invalid reference's leading `&` to `&amp;`.
 * @param {string} str
 * @param {boolean} escapeOutput
 * @returns {string}
 */
showdown.helper.decodeCharacterReferences = function (str, escapeOutput) {
  let entities = showdown.helper.htmlEntities || {};
  function fromCodePoint (cp) {
    if (cp === 0 || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) {
      return '�';
    }
    try {
      return String.fromCodePoint(cp);
    } catch {
      return '�';
    }
  }
  function emit (ch) {
    return escapeOutput ? showdown.helper.escapeHTMLEntities(ch) : ch;
  }
  return str.replace(/&([#0-9a-zA-Z]+);/g, function (wholeMatch, body) {
    let m;
    if ((m = /^#([0-9]{1,7})$/.exec(body))) {
      return emit(fromCodePoint(parseInt(m[1], 10)));
    }
    if ((m = /^#[xX]([0-9a-fA-F]{1,6})$/.exec(body))) {
      return emit(fromCodePoint(parseInt(m[1], 16)));
    }
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(body) && Object.prototype.hasOwnProperty.call(entities, body)) {
      return emit(entities[body]);
    }
    // not a valid reference
    return escapeOutput ? ('&amp;' + body + ';') : wholeMatch;
  });
};

/**
 * Resolve HTML5 named (`&ouml;`), decimal (`&#246;`) and hexadecimal (`&#xf6;`)
 * character references to their corresponding characters (CommonMark behavior).
 * Unlike makehtml.decodeEntities, this returns the raw decoded characters (no
 * HTML re-escaping) so the result can be percent-encoded for a URL or further
 * processed. Invalid references are left verbatim.
 * @param {string} str
 * @returns {string}
 */
showdown.helper.cmDecodeEntities = function (str) {
  return showdown.helper.decodeCharacterReferences(str, false);
};

/**
 * CommonMark URL percent-encoding: percent-encode every character outside the
 * "safe" set, while preserving sequences that are already percent-encoded.
 * Mirrors mdurl.encode's default behavior.
 * @param {string} uri
 * @returns {string}
 */
showdown.helper.cmEncodeURI = function (uri) {
  const safe = ';/?:@&=+$,-_.!~*\'()#';
  let out = '';
  for (let i = 0; i < uri.length; ++i) {
    let ch = uri.charAt(i),
        code = uri.charCodeAt(i);
    if (ch === '%' && /^[0-9a-fA-F]{2}$/.test(uri.slice(i + 1, i + 3))) {
      out += uri.slice(i, i + 3);
      i += 2;
    } else if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) ||
               (code >= 97 && code <= 122) || safe.indexOf(ch) !== -1) {
      out += ch;
    } else {
      out += encodeURIComponent(ch);
    }
  }
  return out;
};

/**
 * Full CommonMark URL normalization for a link/image destination:
 * 1. restore showdown's `¨E<code>E` backslash-escape placeholders to their literal
 *    characters (so escaped punctuation is treated literally, not re-processed);
 * 2. resolve raw backslash escapes of ASCII punctuation (`\*` -> `*`); a backslash
 *    before a non-punctuation character stays literal (and is later percent-encoded);
 * 3. resolve HTML character references (`&ouml;` -> `ö`) — skipped when `decode` is
 *    `false`;
 * 4. percent-encode the result;
 * 5. HTML-escape any residual bare `&` so the href stays valid HTML.
 *
 * The `decode` flag exists for definition-collection time (stripLinkDefinitions), where entity
 * decoding is gated on `options.decodeEntities` and must not happen here when that option is off.
 * Every other caller omits it, so step 3 runs exactly as before (`decode !== false`).
 * @param {string} url
 * @param {boolean} [decode]
 * @returns {string}
 */
showdown.helper.cmNormalizeURL = function (url, decode) {
  url = showdown.helper.unescapePlaceholders(url);
  url = url.replace(/\\([!-/:-@[-`{-~])/g, '$1');
  if (decode !== false) {
    url = showdown.helper.cmDecodeEntities(url);
  }
  url = showdown.helper.cmEncodeURI(url);
  return url.replace(cmGuardedAmpersand, '&amp;');
};

/**
 * CommonMark link/image title processing: resolve character references (skipped when `decode`
 * is `false`), then HTML-escape the significant characters so the title attribute is valid HTML.
 *
 * The `decode` flag exists for definition-collection time (stripLinkDefinitions), where entity
 * decoding is gated on `options.decodeEntities` and must not happen here when that option is off.
 * Every other caller omits it, so the decode step runs exactly as before (`decode !== false`).
 * @param {string} title
 * @param {boolean} [decode]
 * @returns {string}
 */
showdown.helper.cmEscapeTitle = function (title, decode) {
  title = (decode !== false) ? showdown.helper.cmDecodeEntities(title) : title;
  return title
    .replace(cmGuardedAmpersand, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Normalize a CommonMark link label for reference matching: restore showdown's
 * `¨E<code>E` escape placeholders to their literal character, collapse internal
 * whitespace runs to a single space, trim and case-fold. The same normalization
 * must be applied to both the definition label and the use label so that they
 * compare equal.
 * @param {string} label
 * @returns {string}
 */
showdown.helper.cmNormalizeLabel = function (label) {
  // CommonMark matches labels by case-fold + whitespace collapse only; raw backslash
  // escapes are NOT resolved (`[foo\!]` does not match a `[foo!]` definition), which is
  // why the inline link construct passes the raw source label. The `¨E<code>E` replace below only restores
  // placeholders produced earlier in the pipeline, so definition and use labels that went
  // through the same escaping normalize identically.
  return caseFold(showdown.helper.unescapePlaceholders(label)
    .replace(/\s+/g, ' ')
    .trim());
};

/**
 * Scan a CommonMark link destination starting at index `j`. Handles both
 * `<...>` destinations (no raw newline or unescaped `<`) and bare destinations
 * with balanced parentheses. Returns `{url, end, angle}` (url may be empty for
 * `<>`) or `null` when the destination is malformed.
 * @param {string} str
 * @param {number} j
 * @returns {{url: string, end: number, angle: boolean}|null}
 */
showdown.helper.cmScanDestination = function (str, j) {
  let n = str.length;
  if (str.charAt(j) === '<') {
    j++;
    let buf = '';
    while (j < n && str.charAt(j) !== '>') {
      let c = str.charAt(j);
      if (c === '\n' || c === '<') { return null; }
      if (c === '\\' && j + 1 < n) { buf += c + str.charAt(j + 1); j += 2; continue; }
      buf += c; j++;
    }
    if (j >= n || str.charAt(j) !== '>') { return null; }
    return {url: buf, end: j + 1, angle: true};
  }
  let depth = 0, buf = '';
  while (j < n) {
    let c = str.charAt(j),
        code = str.charCodeAt(j);
    if (c === '\\' && j + 1 < n) { buf += c + str.charAt(j + 1); j += 2; continue; }
    if (c === ' ' || c === '\t' || c === '\n') { break; }
    if (code < 0x20 || code === 0x7f) { break; }
    if (c === '(') {
      depth++;
      // Spec-sanctioned implementation limit (link-destination definition): "Implementations
      // may impose limits on parentheses nesting to avoid performance issues, but at least
      // three levels of nesting should be supported." Without a cap, an adversarial tail of
      // unmatched `(` with no whitespace walks to end-of-string before failing - one full-tail
      // walk per candidate destination, quadratic overall on input with many such candidates
      // (e.g. `[](`.repeat(n)). cmark/cmark-gfm's manual_scan_link_url refuses a destination
      // past 32 unmatched open parens; mirrored here so the walk bails in ~33 characters
      // instead of scanning the rest of the input. Counts UNMATCHED depth, not total parens -
      // a destination with many balanced, sequentially-closed pairs never trips this.
      if (depth > 32) { return null; }
      buf += c; j++; continue;
    }
    if (c === ')') {
      if (depth === 0) { break; }
      depth--; buf += c; j++; continue;
    }
    buf += c; j++;
  }
  if (depth !== 0) { return null; }
  return {url: buf, end: j, angle: false};
};

/**
 * Scan a CommonMark link title starting at index `j` (which must point at the
 * opening delimiter `"`, `'` or `(`). The title may span multiple lines but not
 * contain a blank line. Returns `{title, end}` or `null` if malformed.
 * @param {string} str
 * @param {number} j
 * @returns {{title: string, end: number}|null}
 */
showdown.helper.cmScanTitle = function (str, j) {
  let n = str.length,
      open = str.charAt(j),
      close = (open === '(') ? ')' : open;
  if (open !== '"' && open !== '\'' && open !== '(') { return null; }
  j++;
  let buf = '';
  while (j < n) {
    let c = str.charAt(j);
    if (c === '\\' && j + 1 < n) { buf += c + str.charAt(j + 1); j += 2; continue; }
    if (open === '(' && c === '(') { return null; }
    if (c === close) {
      if (/\n[ \t]*\n/.test(buf)) { return null; }
      return {title: buf, end: j + 1};
    }
    buf += c; j++;
  }
  return null;
};

/**
 * Scan the inline `(dest "title")` suffix of a Markdown link/image immediately after its
 * closing `]`. `idx` points at the character right after the `]` (the expected `(`); returns
 * `null` immediately when that character is not `(`. Sole caller: the `makehtml.inline.link`
 * close-bracket resolution, shared by both the link and image bracket constructs (a `![` opener
 * also resolves its suffix here before inline/image.js renders it).
 *
 * Order of operations, matching the original: skip leading whitespace; try the Showdown-flavor
 * `data:...;base64,` recognizer first (off under `options.cmSpec`, since CommonMark destinations
 * may not contain a raw newline); otherwise `cmScanDestination`; then always consume an optional
 * ` =WxH` (`options.parseImgDimensions` gates only whether a caller renders it - the grammar is
 * consumed unconditionally so it never leaks into the output as literal text); then a title, but
 * only when whitespace preceded it and
 * the next character is `"`, `'` or `(`; then the closing `)`. Does not resolve backslash escapes
 * or normalize the destination - that is left to the caller (`cmNormalizeAnchorDest`), exactly as
 * in the original.
 * @param {string} str
 * @param {number} idx index of the character immediately after the `]` (the expected `(`)
 * @param {object} options converter options (`cmSpec`, `parseImgDimensions`)
 * @returns {{dest: string, title: (string|null), width: (string|null), height: (string|null), end: number}|null}
 *   `end` is the index just past the closing `)`; `null` when the suffix does not parse.
 */
showdown.helper.cmScanLinkSuffix = function (str, idx, options) {
  if (str.charAt(idx) !== '(') { return null; }
  let j = idx + 1, n2 = str.length, isWs = function (c) { return c === ' ' || c === '\t' || c === '\n'; };
  while (j < n2 && isWs(str.charAt(j))) { j++; }
  let d = null;
  // Showdown flavors (historic image-parser base64 parity): a `data:...;base64,` destination may
  // be split across newlines. cmScanDestination stops at the first newline, so scan the
  // base64 body here (newlines tolerated) and strip the embedded whitespace, the way the historic
  // base64 image regex did. cmSpec keeps CommonMark's strict scan (no newlines in a URL).
  if (!options.cmSpec) {
    cmInlineBase64Dest.lastIndex = j;
    let b64 = cmInlineBase64Dest.exec(str);
    if (b64) { d = {url: b64[1].replace(/\s/g, ''), end: j + b64[0].length}; }
  }
  if (!d) { d = showdown.helper.cmScanDestination(str, j); }
  if (!d) { return null; }
  j = d.end;
  // parseImgDimensions (Showdown extension, not CommonMark): an optional ` =WxH` between
  // destination and title. The `=WxH` is always consumed here so it never leaks into the
  // output; the caller only renders it when the option is on. Regex fragment copied from the
  // historic inline-image regex.
  let width = null, height = null,
      dimStart = j;
  while (dimStart < n2 && isWs(str.charAt(dimStart))) { dimStart++; }
  if (dimStart > j && str.charAt(dimStart) === '=') {
    let dim = /^=([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4})/.exec(str.slice(dimStart));
    if (dim) {
      width = dim[1];
      height = dim[2];
      j = dimStart + dim[0].length;
    }
  }
  let hadWs = false;
  while (j < n2 && isWs(str.charAt(j))) { hadWs = true; j++; }
  let tc = str.charAt(j), t = null;
  if (hadWs && (tc === '"' || tc === '\'' || tc === '(')) {
    t = showdown.helper.cmScanTitle(str, j);
    if (t) { j = t.end; }
  }
  while (j < n2 && isWs(str.charAt(j))) { j++; }
  if (str.charAt(j) !== ')') { return null; }
  return {dest: d.url, title: t ? t.title : null, width: width, height: height, end: j + 1};
};

/**
 * Resolve a reference-style link/image close-bracket: full `[label][ref]`, collapsed
 * `[label][]` or shortcut `[label]`. `idx` is the index of the closing `]`; `sourceStart` is the
 * index where the label text begins (the bracket-stack entry's recorded position). Sole caller:
 * the `makehtml.inline.link` close-bracket resolution, shared by both the link and image bracket
 * constructs.
 *
 * Uses the RAW source label (`str.slice(sourceStart, idx)`, backslash escapes intact) - CommonMark
 * matches labels by case-fold + whitespace collapse only, so `[foo\!]` must not match a `[foo!]`
 * definition (see `cmNormalizeLabel`). Under `!options.cmSpec` (Original-Markdown's space-tolerant
 * references), an optional run of spaces/tabs and at most one newline between the `]` and the `[`
 * of the reference label is skipped before looking for `[`; `options.cmSpec` keeps CommonMark's
 * strict no-space rule. The full-label form is found with `cmFindRefClose`; collapsed `[]` reuses
 * the source label; shortcut (no trailing `[...]` at all) also reuses it. The resolved key is
 * `cmNormalizeLabel(refKey)`; an empty key, or a key with no matching definition, resolves to
 * `null`.
 *
 * `globals.gUrls`/`globals.gTitles`/`globals.gDimensions` are the link-reference-definition stores
 * built by stripLinkDefinitions.js, keyed by `cmNormalizeLabel`: `gUrls[key]` is the already
 * normalized destination string, `gTitles[key]` is the already HTML-escaped title string (absent
 * when the definition had no title), and `gDimensions[key]` is `{width, height}` (present only
 * when `parseImgDimensions` was on and the definition carried a ` =WxH`).
 * @param {string} str
 * @param {number} idx index of the closing `]`
 * @param {number} sourceStart index where the label text begins
 * @param {object} options converter options (`cmSpec`)
 * @param {object} globals converter globals (`gUrls`, `gTitles`, `gDimensions`)
 * @returns {{dest: string, title: (string|undefined), width: (string|null), height: (string|null), endIdx: number}|null}
 *   `endIdx` is the index just past the consumed reference syntax; `null` when no definition matches.
 */
showdown.helper.cmResolveLinkReference = function (str, idx, sourceStart, options, globals) {
  let labelText = str.slice(sourceStart, idx),
      refKey = null,
      bracketPos = idx + 1,
      endIdx = idx + 1;
  // Gate B (reference-with-space). The Showdown flavors honor Original-Markdown's
  // space-tolerant references - `[an example] [id]` - allowing optional whitespace (a
  // space/tab run and at most one newline) between the `]` that closes the link text and
  // the `[` that opens the label. cmSpec keeps CommonMark's strict no-space rule (a space
  // there makes the first `[..]` a shortcut reference). Only the position of the `[` moves;
  // the whitespace itself is not part of the label.
  if (!options.cmSpec) {
    let k = idx + 1, sawNewline = false;
    while (k < str.length) {
      let c = str.charAt(k);
      if (c === ' ' || c === '\t') {
        k++;
      } else if (c === '\n' && !sawNewline) {
        sawNewline = true;
        k++;
      } else {
        break;
      }
    }
    if (str.charAt(k) === '[') { bracketPos = k; }
  }
  if (str.charAt(bracketPos) === '[') {
    let close = cmFindRefClose(str, bracketPos + 1);
    if (close !== -1) {
      let inner = str.slice(bracketPos + 1, close);
      refKey = inner.trim() === '' ? labelText : inner;
      endIdx = close + 1;
    }
  } else {
    refKey = labelText; // shortcut
    endIdx = idx + 1;
  }
  if (refKey === null) { return null; }
  let key = showdown.helper.cmNormalizeLabel(refKey);
  if (key === '' || showdown.helper.isUndefined(globals.gUrls[key])) { return null; }
  let width = null, height = null;
  // parseImgDimensions: reference-style dimensions stored by stripLinkDefinitions
  if (globals.gDimensions[key]) {
    width = globals.gDimensions[key].width;
    height = globals.gDimensions[key].height;
  }
  return {dest: globals.gUrls[key], title: globals.gTitles[key], width: width, height: height, endIdx: endIdx};
};

/**
 * Normalize a resolved link/image destination for the `href`/`src` attribute: resolve backslash
 * escapes, apply `options.relativePathBaseUrl`, then run CommonMark URL normalization. Callers:
 * `makehtml.inline.link`'s `buildLink` and `makehtml.inline.image.build`.
 * @param {string} dest
 * @param {object} options converter options (`relativePathBaseUrl`)
 * @returns {string}
 */
showdown.helper.cmNormalizeAnchorDest = function (dest, options) {
  dest = cmResolveBackslash(dest);
  dest = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, dest);
  return showdown.helper.cmNormalizeURL(dest);
};

/**
 * Set a `title` attribute from a resolved link/image title, resolving backslash escapes and
 * HTML-escaping via `cmEscapeTitle` first. Mutates `attributes` in place (no-op, including no
 * `title` key at all, when `title` is `null`/`undefined`). Does not use `options` (backslash
 * resolution is a plain string transform); `options` is accepted for signature symmetry with
 * `cmNormalizeAnchorDest` and is currently unused. Callers: `makehtml.inline.link`'s `buildLink`
 * and `makehtml.inline.image.build`.
 * @param {object} attributes
 * @param {(string|null|undefined)} title
 * @param {object} options converter options (unused; kept for signature symmetry)
 * @returns {void}
 */
showdown.helper.cmBuildTitleAttr = function (attributes, title, options) { // eslint-disable-line no-unused-vars
  if (title !== null && title !== undefined) {
    attributes.title = showdown.helper.cmEscapeTitle(cmResolveBackslash(title));
  }
};
