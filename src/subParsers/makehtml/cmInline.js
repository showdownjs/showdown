////
// makehtml/cmInline.js
// Copyright (c) 2024 ShowdownJS
//
// Unified CommonMark inline parser (spec section 6).
//
// Invoked only when the `commonmarkInline` option is enabled. It resolves code
// spans, backslash escapes, character references, autolinks, raw HTML, links,
// images and emphasis together on a single delimiter stack, so the cross-construct
// precedence rules CommonMark requires (a link cannot contain a link; code spans /
// autolinks / raw HTML bind before links; emphasis interleaves with link brackets)
// are expressible - which the sequential per-construct passes could not.
//
// It is built on the same doubly-linked node list + delimiter stack + processEmphasis
// design used by makehtml.emphasisAndStrong's CommonMark path.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

/* jshint esnext: false, esversion: 9 */

showdown.subParser('makehtml.cmInline', function (text, options, globals) {
  'use strict';

  // ASCII punctuation, used by the flanking rules and backslash-escape check.
  // Declared before parseCmInline runs (const is in the temporal dead zone until here).
  const asciiPunct = /[!-/:-@[-`{-~]/;

  // Sticky regexes anchored at the scan cursor (lastIndex) so the recognizers never
  // slice the tail of the string - keeps the tokenizer linear on `<`/`&`-heavy input.
  // Reused across calls; each recognizer sets lastIndex before exec and the parse is
  // not re-entrant within a single string.
  const reEntity = /&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]*);/y;
  const reAutoUri = /<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\x00-\x20]*>/y;
  const reAutoEmail = /<[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*>/y;
  const reRawHtml = new RegExp('(?:' + showdown.helper.regexes.cmHTMLTagSource + ')', 'y');

  let startEvent = new showdown.Event('makehtml.cmInline.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = parseCmInline(text);

  let afterEvent = new showdown.Event('makehtml.cmInline.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

  // ---- shared character helpers (flanking rules) -------------------------------

  function isPunct (ch) {
    return ch !== undefined && (asciiPunct.test(ch) || /\p{P}/u.test(ch));
  }
  function isWhitespace (ch) {
    return ch === undefined || /\s/.test(ch) || /\p{Z}/u.test(ch);
  }
  function isEscapable (ch) {
    return ch !== undefined && asciiPunct.test(ch);
  }

  // HTML-escape a run of plain text (entities already resolved to characters)
  function escapeText (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashSpan (html) {
    return showdown.helper._hashHTMLSpan(html, globals);
  }

  // resolve backslash escapes of ASCII punctuation to the literal character
  function resolveBackslash (str) {
    return str.replace(/\\([!-/:-@[-`{-~])/g, '$1');
  }

  // ---- main parse --------------------------------------------------------------

  function parseCmInline (str) {
    let head = null,
        tail = null,
        delimiters = null, // top of emphasis delimiter stack
        brackets = null,   // top of bracket (link/image) stack
        // backtick runs of these lengths have no closer in the rest of the string;
        // future opens of the same length fail immediately (keeps backticks linear)
        backtickNoCloser = {};

    function appendNode (node) {
      node.prev = tail;
      node.next = null;
      node.raw = node.raw || false;
      if (tail) { tail.next = node; } else { head = node; }
      tail = node;
      return node;
    }
    function appendText (literal) {
      return appendNode({type: 'text', literal: literal});
    }
    // append already-final HTML that must not be escaped at render time
    function appendRaw (html) {
      return appendNode({type: 'text', literal: html, raw: true});
    }

    const len = str.length;
    let i = 0;
    while (i < len) {
      let ch = str.charAt(i);

      if (ch === '\n') {
        // hard line break: two+ trailing spaces or a backslash before the newline.
        // The <br /> is hashed so the later encodeAmpsAndAngles pass leaves it intact.
        let n = tail;
        if (n && n.type === 'text' && !n.raw && / {2,}$/.test(n.literal)) {
          n.literal = n.literal.replace(/ +$/, '');
          appendRaw(hashSpan('<br />') + '\n');
        } else if (n && n.type === 'text' && !n.raw && /\\$/.test(n.literal)) {
          n.literal = n.literal.slice(0, -1);
          appendRaw(hashSpan('<br />') + '\n');
        } else {
          if (n && n.type === 'text' && !n.raw) { n.literal = n.literal.replace(/ +$/, ''); }
          appendText('\n');
        }
        i++;
        continue;
      }

      if (ch === '\\') {
        let next = str.charAt(i + 1);
        if (next === '\n') {
          appendRaw(hashSpan('<br />') + '\n');
          i += 2;
        } else if (next === '¨' && str.charAt(i + 2) === 'D') {
          // escaped `$` (the converter hashes `$` to the `¨D` placeholder early)
          appendText('¨D');
          i += 3;
        } else if (isEscapable(next)) {
          appendText(next);
          i += 2;
        } else {
          appendText('\\');
          i++;
        }
        continue;
      }

      if (ch === '`') {
        let res = parseBacktick(str, i, backtickNoCloser);
        if (res) {
          appendRaw(res.html); i = res.end;
        } else {
          let e = skipRun(str, i, '`'); appendText(str.slice(i, e)); i = e;
        }
        continue;
      }

      if (ch === '<') {
        let res = parseAutolink(str, i) || parseRawHTML(str, i);
        if (res) { appendRaw(res.html); i = res.end; continue; }
        appendText('<');
        i++;
        continue;
      }

      if (ch === '&') {
        reEntity.lastIndex = i;
        let m = reEntity.exec(str);
        if (m) {
          let decoded = showdown.helper.cmDecodeEntities(m[0]);
          if (decoded !== m[0]) { appendText(decoded); i += m[0].length; continue; }
        }
        appendText('&');
        i++;
        continue;
      }

      if (ch === '!' && str.charAt(i + 1) === '[') {
        let node = appendText('![');
        pushBracket(node, true, i + 2);
        i += 2;
        continue;
      }
      if (ch === '[') {
        let node = appendText('[');
        pushBracket(node, false, i + 1);
        i++;
        continue;
      }
      if (ch === ']') {
        i = parseCloseBracket(str, i);
        continue;
      }

      if (ch === '*' || ch === '_') {
        let start = i;
        while (i < len && str.charAt(i) === ch) { ++i; }
        let run = str.slice(start, i),
            before = (start === 0) ? undefined : str.charAt(start - 1),
            after = (i >= len) ? undefined : str.charAt(i),
            beforeWs = isWhitespace(before),
            afterWs = isWhitespace(after),
            beforePt = isPunct(before),
            afterPt = isPunct(after),
            leftFlanking = !afterWs && (!afterPt || beforeWs || beforePt),
            rightFlanking = !beforeWs && (!beforePt || afterWs || afterPt),
            canOpen, canClose;
        if (ch === '_') {
          canOpen = leftFlanking && (!rightFlanking || beforePt);
          canClose = rightFlanking && (!leftFlanking || afterPt);
        } else {
          canOpen = leftFlanking;
          canClose = rightFlanking;
        }
        let node = appendNode({type: 'delim', cc: ch, literal: run, numdelims: run.length, origdelims: run.length, canOpen: canOpen, canClose: canClose});
        node.delimPrev = delimiters;
        node.delimNext = null;
        if (delimiters) { delimiters.delimNext = node; }
        delimiters = node;
        continue;
      }

      // plain text run up to the next significant char
      let start = i;
      while (i < len && '\n\\`<&![]*_'.indexOf(str.charAt(i)) === -1) { ++i; }
      if (i === start) {
        appendText(str.charAt(i)); i++;
      } else {
        appendText(str.slice(start, i));
      }
    }

    processEmphasis(null);

    // render the node list
    let out = '';
    for (let n = head; n !== null; n = n.next) {
      out += n.raw ? n.literal : escapeText(n.literal);
    }
    return out;

    // ---- bracket stack ---------------------------------------------------------

    function pushBracket (node, image, sourceStart) {
      brackets = {
        node: node,
        prev: brackets,
        prevDelim: delimiters,
        image: image,
        active: true,
        sourceStart: sourceStart // index in `str` where the label text begins
      };
    }

    function parseCloseBracket (s, idx) {
      let opener = brackets;
      if (opener === null) { appendText(']'); return idx + 1; }
      if (!opener.active) { brackets = opener.prev; appendText(']'); return idx + 1; }

      // try to parse the destination/title or a reference that follows the `]`
      let dest = null, title = null, matched = false, endIdx = idx + 1;

      if (s.charAt(idx + 1) === '(') {
        let j = idx + 2, n2 = s.length, isWs = function (c) { return c === ' ' || c === '\t' || c === '\n'; };
        while (j < n2 && isWs(s.charAt(j))) { j++; }
        let d = showdown.helper.cmScanDestination(s, j);
        if (d) {
          j = d.end;
          let hadWs = false;
          while (j < n2 && isWs(s.charAt(j))) { hadWs = true; j++; }
          let tc = s.charAt(j), t = null;
          if (hadWs && (tc === '"' || tc === '\'' || tc === '(')) {
            t = showdown.helper.cmScanTitle(s, j);
            if (t) { j = t.end; }
          }
          while (j < n2 && isWs(s.charAt(j))) { j++; }
          if (s.charAt(j) === ')') {
            dest = d.url;
            title = t ? t.title : null;
            matched = true;
            endIdx = j + 1;
          }
        }
      }

      if (!matched) {
        // reference: full [label], collapsed [] or shortcut. Use the RAW source label
        // (backslash escapes intact) - CommonMark matches labels by case-fold +
        // whitespace only, so `[foo\!]` must not match a `[foo!]` definition.
        let labelText = s.slice(opener.sourceStart, idx),
            refKey = null;
        if (s.charAt(idx + 1) === '[') {
          let close = findRefClose(s, idx + 2);
          if (close !== -1) {
            let inner = s.slice(idx + 2, close);
            refKey = inner.trim() === '' ? labelText : inner;
            endIdx = close + 1;
          }
        } else {
          refKey = labelText; // shortcut
          endIdx = idx + 1;
        }
        if (refKey !== null) {
          let key = showdown.helper.cmNormalizeLabel(refKey);
          if (key !== '' && !showdown.helper.isUndefined(globals.gUrls[key])) {
            dest = globals.gUrls[key];
            title = globals.gTitles[key];
            matched = true;
          }
        }
      }

      if (!matched) { brackets = opener.prev; appendText(']'); return idx + 1; }

      // process emphasis on the delimiters inside the brackets
      processEmphasis(opener.prevDelim);

      // collect and render the inner nodes
      let innerHTML = renderNodes(opener.node.next, null);

      let otpHTML;
      if (opener.image) {
        otpHTML = buildImage(innerHTML, dest, title);
      } else {
        otpHTML = buildLink(innerHTML, dest, title);
      }

      // drop the opener node and everything after it, append the built span
      removeFrom(opener.node);
      appendRaw(otpHTML);
      // remove any emphasis delimiters that belonged to the consumed range
      pruneDelimiters(opener.prevDelim);

      if (!opener.image) {
        // a link cannot be nested in another link
        for (let b = opener.prev; b !== null; b = b.prev) {
          if (!b.image) { b.active = false; }
        }
      }
      brackets = opener.prev;
      return endIdx;
    }

    // ---- rendering helpers -----------------------------------------------------

    // concatenate the rendered HTML of nodes [from .. to)
    function renderNodes (from, to) {
      let out = '';
      for (let n = from; n !== null && n !== to; n = n.next) {
        out += n.raw ? n.literal : escapeText(n.literal);
      }
      return out;
    }
    function removeFrom (node) {
      tail = node.prev;
      if (tail) { tail.next = null; } else { head = null; }
    }

    function normalizeDest (dest) {
      dest = resolveBackslash(dest);
      dest = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, dest);
      return showdown.helper.cmNormalizeURL(dest);
    }
    function buildTitleAttr (title) {
      if (title === null || title === undefined) { return ''; }
      return ' title="' + showdown.helper.cmEscapeTitle(resolveBackslash(title)) + '"';
    }

    function buildLink (innerHTML, dest, title) {
      let attrs = ' href="' + normalizeDest(dest) + '"' + buildTitleAttr(title);
      innerHTML = showdown.subParser('makehtml.hardLineBreaks')(innerHTML, options, globals);
      return hashSpan('<a' + attrs + '>' + innerHTML + '</a>');
    }

    function buildImage (innerHTML, dest, title) {
      // alt text is the plain-text rendering of the label (markup stripped); the inner
      // spans are hashed, so restore them before flattening
      let alt = showdown.subParser('makehtml.unhashHTMLSpans')(innerHTML, options, globals)
        .replace(/<img\b[^>]*?\salt="([^"]*)"[^>]*?\/?>/g, '$1')
        .replace(/<[^>]*>/g, '');
      let attrs = ' src="' + normalizeDest(dest) + '" alt="' + alt + '"' + buildTitleAttr(title);
      return hashSpan('<img' + attrs + ' />');
    }

    // ---- emphasis (CommonMark reference algorithm) -----------------------------

    function removeDelimiter (d) {
      if (d.delimPrev) { d.delimPrev.delimNext = d.delimNext; }
      if (d.delimNext) { d.delimNext.delimPrev = d.delimPrev; } else { delimiters = d.delimPrev; }
    }
    function insertAfter (node, newNode) {
      newNode.prev = node;
      newNode.next = node.next;
      if (node.next) { node.next.prev = newNode; } else { tail = newNode; }
      node.next = newNode;
    }
    // drop every delimiter at or above `bottom` from the stack (after a bracket span
    // has consumed the nodes they pointed at)
    function pruneDelimiters (bottom) {
      let d = delimiters;
      while (d !== null && d !== bottom) {
        let p = d.delimPrev;
        removeDelimiter(d);
        d = p;
      }
    }

    function processEmphasis (stackBottom) {
      let openersBottom = {
        '_': [stackBottom, stackBottom, stackBottom],
        '*': [stackBottom, stackBottom, stackBottom]
      };

      let closer = delimiters;
      while (closer !== null && closer.delimPrev !== null && closer.delimPrev !== stackBottom) {
        closer = closer.delimPrev;
      }
      if (closer === stackBottom) { closer = (stackBottom === null) ? closer : stackBottom.delimNext; }

      while (closer !== null) {
        if (!closer.canClose) { closer = closer.delimNext; continue; }
        let opener = closer.delimPrev,
            openerFound = false,
            oddMatch = false;
        while (opener !== null && opener !== stackBottom && opener !== openersBottom[closer.cc][closer.origdelims % 3]) {
          oddMatch = (closer.canOpen || opener.canClose) &&
                     (closer.origdelims % 3 !== 0) &&
                     ((opener.origdelims + closer.origdelims) % 3 === 0);
          if (opener.cc === closer.cc && opener.canOpen && !oddMatch) { openerFound = true; break; }
          opener = opener.delimPrev;
        }
        let oldCloser = closer;

        if (openerFound) {
          let use = (opener.numdelims >= 2 && closer.numdelims >= 2) ? 2 : 1,
              tagOpen = (use === 2) ? '<strong>' : '<em>',
              tagClose = (use === 2) ? '</strong>' : '</em>';

          opener.literal = opener.literal.slice(0, opener.literal.length - use);
          opener.numdelims -= use;
          closer.literal = closer.literal.slice(use);
          closer.numdelims -= use;

          let inner = renderNodes(opener.next, closer);
          inner = showdown.subParser('makehtml.hardLineBreaks')(inner, options, globals);
          let wrapped = hashSpan(tagOpen + inner + tagClose);

          let n2 = opener.next;
          while (n2 !== null && n2 !== closer) {
            let nx = n2.next;
            if (n2.type === 'delim') { removeDelimiter(n2); }
            n2 = nx;
          }
          let wrapNode = {type: 'text', literal: wrapped, raw: true};
          insertAfter(opener, wrapNode);
          wrapNode.next = closer;
          closer.prev = wrapNode;

          if (opener.numdelims === 0) { opener.literal = ''; removeDelimiter(opener); }
          if (closer.numdelims === 0) {
            closer.literal = '';
            let tmp = closer.delimNext;
            removeDelimiter(closer);
            closer = tmp;
          }
        } else {
          openersBottom[oldCloser.cc][oldCloser.origdelims % 3] = oldCloser.delimPrev;
          if (!oldCloser.canOpen) { removeDelimiter(oldCloser); }
          closer = oldCloser.delimNext;
        }
      }
    }
  }

  // ---- token recognizers (return {html, end} or null) ----------------------------

  function skipRun (str, i, ch) {
    let j = i;
    while (j < str.length && str.charAt(j) === ch) { j++; }
    return j;
  }

  function parseBacktick (str, i, noCloser) {
    let openEnd = skipRun(str, i, '`'),
        runLen = openEnd - i,
        n = str.length,
        j = openEnd;
    if (noCloser[runLen]) { return null; }
    // find a closing run of backticks of exactly runLen (not part of a longer run)
    while (j < n) {
      if (str.charAt(j) === '`') {
        let runStart = j,
            runEnd = skipRun(str, j, '`');
        if (runEnd - runStart === runLen) {
          let content = str.slice(openEnd, runStart).replace(/\n/g, ' ');
          // strip exactly one leading and trailing space if the content is not all spaces
          if (content.length >= 2 && content.charAt(0) === ' ' && content.charAt(content.length - 1) === ' ' && /[^ ]/.test(content)) {
            content = content.slice(1, -1);
          }
          let encoded = showdown.subParser('makehtml.encodeCode')(content, options, globals);
          return {html: showdown.helper._hashHTMLSpan('<code>' + encoded + '</code>', globals), end: runEnd};
        }
        j = runEnd;
      } else {
        j++;
      }
    }
    noCloser[runLen] = true; // no closer of this length anywhere after here
    return null;
  }

  function parseAutolink (str, i) {
    if (!options.cmSpec) { return null; }
    reAutoUri.lastIndex = i;
    let uri = reAutoUri.exec(str);
    if (uri) {
      let raw = uri[0].slice(1, -1),
          href = showdown.helper.cmEncodeURI(raw).replace(/&/g, '&amp;');
      return {html: showdown.helper._hashHTMLSpan('<a href="' + href + '">' + escapeAngles(raw) + '</a>', globals), end: i + uri[0].length};
    }
    reAutoEmail.lastIndex = i;
    let email = reAutoEmail.exec(str);
    if (email) {
      let raw = email[0].slice(1, -1);
      return {html: showdown.helper._hashHTMLSpan('<a href="mailto:' + escapeAngles(raw) + '">' + escapeAngles(raw) + '</a>', globals), end: i + email[0].length};
    }
    return null;
  }

  function escapeAngles (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function parseRawHTML (str, i) {
    if (!options.cmSpec) { return null; }
    reRawHtml.lastIndex = i;
    let m = reRawHtml.exec(str);
    if (!m) { return null; }
    return {html: showdown.helper._hashHTMLSpan(m[0], globals), end: i + m[0].length};
  }

  // find the closing `]` of a reference label, honoring backslash escapes
  function findRefClose (str, j) {
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
});
