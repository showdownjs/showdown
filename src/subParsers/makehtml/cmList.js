////
// makehtml/cmList.js
// Copyright (c) 2024 ShowdownJS
//
// CommonMark list container-block parser (spec section 5.2/5.3).
//
// This is a separate, line-based parser invoked only when the `commonmarkLists`
// option is enabled (it is part of the `commonmark` flavor). Showdown's default
// regex list parser (`makehtml.list`) is left untouched; `makehtml.list` simply
// delegates here when the flag is on.
//
// It differs from the regex parser in the ways CommonMark requires: a change of
// bullet character or ordered delimiter starts a new list, ordered lists keep
// their start number and the `)` delimiter, loose/tight is decided per list (not
// per item), and items nest by content indentation.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.cmList', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.list.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  text = parseCmList(text);

  let afterEvent = new showdown.Event('makehtml.list.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

  /** @param {string} line @returns {number} count of leading spaces */
  function leadingSpaces (line) {
    let m = line.match(/^ */);
    return m[0].length;
  }

  /** @param {string} line @returns {boolean} */
  function isBlank (line) {
    return /^[ \t]*$/.test(line);
  }

  // a markerless line that can lazily continue an open paragraph: non-blank text
  // that does not itself begin an interrupting block
  function isLazyParagraph (line) {
    if (isBlank(line)) { return false; }
    return !(
      /^ {0,3}>/.test(line) ||                               // block quote
      /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line) ||               // ATX heading
      /^ {0,3}(?:```|~~~)/.test(line) ||                     // fenced code
      /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/.test(line) ||  // thematic break
      /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?:[ \t]|$)/.test(line)   // list item
    );
  }

  /**
   * Match a list-item marker at the start of a line.
   * @param {string} line
   * @returns {{type:string, bullet:(string|null), delim:(string|null),
   *   num:(number|null), markerIndent:number, contentIndent:number,
   *   firstContent:string}|null}
   */
  function matchMarker (line) {
    let m = line.match(/^( {0,3})([-+*]|\d{1,9}[.)])( *)([\s\S]*)$/);
    if (!m) { return null; }
    let indent = m[1].length,
        markerTxt = m[2],
        spaces = m[3].length,
        rest = m[4];
    // the marker must be followed by at least one space (or end the line); `-one`
    // is a paragraph, not a list
    if (rest !== '' && spaces === 0) { return null; }

    let k = markerTxt.length,
        type = /[-+*]/.test(markerTxt) ? 'ul' : 'ol',
        contentIndent,
        firstContent;
    if (rest === '') {
      contentIndent = indent + k + 1;
      firstContent = '';
    } else if (spaces >= 5) {
      // 5+ spaces: one space is the marker gap, the rest is indented code
      contentIndent = indent + k + 1;
      firstContent = new Array(spaces).join(' ') + rest;
    } else {
      contentIndent = indent + k + spaces;
      firstContent = rest;
    }
    return {
      type: type,
      bullet: type === 'ul' ? markerTxt : null,
      delim: type === 'ol' ? markerTxt.slice(-1) : null,
      num: type === 'ol' ? parseInt(markerTxt, 10) : null,
      markerIndent: indent,
      contentIndent: contentIndent,
      firstContent: firstContent
    };
  }

  /**
   * Gather one list item starting at line index `i`. Consumes the marker line and
   * subsequent lines indented to the item's content column, plus lazy paragraph
   * continuations. Blank lines that are followed by more item content are kept
   * (internal); trailing blank lines are left for the caller.
   * @returns {{content:string[], end:number, blanksFollow:number, internalBlank:boolean}}
   */
  function gatherItem (lines, i, m) {
    let n = lines.length,
        w = m.contentIndent,
        content = [m.firstContent],
        internalBlank = false;
    i++;
    // a list item may begin with at most one blank line: an empty marker followed
    // by a blank line is an empty item; later indented content is not part of it
    if (m.firstContent === '' && i < n && isBlank(lines[i])) {
      let j = i;
      while (j < n && isBlank(lines[j])) { j++; }
      return {content: [''], end: i, blanksFollow: j - i, internalBlank: false};
    }
    while (i < n) {
      let line = lines[i];
      if (isBlank(line)) {
        // look ahead: blanks are internal only if the item continues afterwards
        let j = i;
        while (j < n && isBlank(lines[j])) { j++; }
        if (j < n && leadingSpaces(lines[j]) >= w && !isBlank(lines[j])) {
          for (let b = i; b < j; ++b) { content.push(''); }
          if (content.some(function (c) { return c.trim() !== ''; })) { internalBlank = true; }
          i = j;
          continue;
        }
        return {content: content, end: i, blanksFollow: j - i, internalBlank: internalBlank};
      }
      if (leadingSpaces(line) >= w) {
        content.push(line.slice(w));
        i++;
      } else if (isLazyParagraph(line) && lastIsParagraph(content)) {
        content.push(line);
        i++;
      } else {
        return {content: content, end: i, blanksFollow: 0, internalBlank: internalBlank};
      }
    }
    return {content: content, end: i, blanksFollow: 0, internalBlank: internalBlank};
  }

  // whether the last non-stripped content line is an open paragraph (so a lazy
  // continuation line may be appended)
  function lastIsParagraph (content) {
    let last = content[content.length - 1];
    if (last === undefined || last.trim() === '' || /^ {4}/.test(last)) { return false; }
    return !(
      /^ {0,3}(?:```|~~~)/.test(last) ||
      /^ {0,3}#{1,6}(?:[ \t]|$)/.test(last) ||
      /^ {0,3}>/.test(last)
    );
  }

  /**
   * Render one list item's content into `<li>…</li>`. In a tight list the item's
   * direct paragraphs are not wrapped in `<p>`; in a loose list they are. Nested
   * blocks (sub-lists, block quotes, code) are produced by blockGamut.
   */
  function renderItem (content, loose) {
    // trailing newline so the recursive block parsers (esp. indented code, which
    // requires each line to end in \n) see a complete final line
    let str = content.join('\n') + '\n';
    str = showdown.subParser('makehtml.githubCodeBlock')(str, options, globals);
    str = showdown.subParser('makehtml.blockGamut')(str, options, globals);
    str = str.replace(/^\n+/, '').replace(/\n+$/, '');

    let grafs = str.split(/\n{2,}/g),
        out = [];
    for (let i = 0; i < grafs.length; ++i) {
      let g = grafs[i];
      if (/¨([KG])(\d+)\1/.test(g)) {
        out.push(g);
      } else if (/\S/.test(g)) {
        g = showdown.subParser('makehtml.spanGamut')(g, options, globals);
        if (loose) {
          g = g.replace(/^[ \t]*/, '<p>') + '</p>';
        }
        out.push(g);
      }
    }
    let body = out.join('\n');
    // an empty item is always `<li></li>`, regardless of loose/tight
    if (body.trim() === '') {
      return '<li></li>\n';
    }
    // CommonMark serialization: a loose item, or a tight item whose content begins
    // with a block-level child (e.g. a nested list), opens its content on a new
    // line; a tight item with a trailing block closes `</li>` on a new line.
    if (loose || /^¨[KG]\d+[KG]/.test(body)) {
      return '<li>\n' + body + '\n</li>\n';
    }
    if (/¨[KG]\d+[KG]/.test(body)) {
      return '<li>' + body + '\n</li>\n';
    }
    return '<li>' + body + '</li>\n';
  }

  // a line that is open paragraph text (so a following list marker would have to
  // "interrupt a paragraph" - which empty items and non-1 ordered lists may not do)
  function isParaText (line) {
    if (isBlank(line) || /¨[A-Za-z]?\d+[A-Za-z]/.test(line)) { return false; }
    return isLazyParagraph(line) || matchMarker(line) !== null;
  }

  /**
   * CommonMark list parsing. Scans line by line, leaving non-list lines untouched
   * and converting each run of list items of the same type into a hashed list.
   * @param {string} str
   * @returns {string}
   */
  function parseCmList (str) {
    let lines = str.split('\n'),
        out = [],
        i = 0,
        n = lines.length,
        prevParagraph = false;

    while (i < n) {
      let m = matchMarker(lines[i]);
      if (!m) {
        out.push(lines[i]);
        prevParagraph = isParaText(lines[i]);
        i++;
        continue;
      }

      // a list item may interrupt a paragraph only if it is non-empty and (for
      // ordered lists) starts with 1; otherwise the marker line is paragraph text
      if (prevParagraph && (m.firstContent.trim() === '' || (m.type === 'ol' && m.num !== 1))) {
        out.push(lines[i]);
        prevParagraph = true;
        i++;
        continue;
      }

      // collect a run of items that form a single list
      let type = m.type,
          bullet = m.bullet,
          delim = m.delim,
          startNum = m.num,
          items = [],
          loose = false;

      while (i < n) {
        let mm = matchMarker(lines[i]);
        if (!mm || mm.type !== type) { break; }
        if (type === 'ul' && mm.bullet !== bullet) { break; }
        if (type === 'ol' && mm.delim !== delim) { break; }

        let item = gatherItem(lines, i, mm);
        if (item.internalBlank) { loose = true; }
        items.push(item.content);
        i = item.end;

        if (item.blanksFollow > 0) {
          let j = i + item.blanksFollow,
              next = (j < n) ? matchMarker(lines[j]) : null,
              continues = next && next.type === type &&
                (type === 'ul' ? next.bullet === bullet : next.delim === delim);
          if (continues) {
            loose = true; // blank line between items
            i = j;
            continue;
          }
          break; // blanks end the list (left in place for the outer loop)
        }
      }

      let start = (type === 'ol' && startNum !== 1) ? startNum : null,
          body = '';
      for (let k = 0; k < items.length; ++k) {
        body += renderItem(items[k], loose);
      }
      let otp = '\n\n<' + type + (start !== null ? ' start="' + start + '"' : '') + '>\n' + body + '</' + type + '>\n';
      out.push(showdown.subParser('makehtml.hashBlock')(otp, options, globals));
      prevParagraph = false;
    }

    return out.join('\n');
  }
});
