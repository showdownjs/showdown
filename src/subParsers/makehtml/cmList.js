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

  // Whether an item's content has a blank line separating two of its *top-level*
  // blocks (which makes the list loose). A blank line inside a nested list/block
  // quote does not count - it makes the nested list loose, not this one. We track
  // the content-indent of the deepest open nested container and ignore lines (and
  // blanks) inside it.
  function itemLoose (content) {
    let containerIndent = -1, // content indent of the open nested container (-1 = none)
        topBlockSeen = false,
        blank = false;
    for (let li = 0; li < content.length; ++li) {
      let line = content[li];
      if (line.trim() === '') { blank = true; continue; }
      let ind = leadingSpaces(line);
      if (containerIndent >= 0 && ind >= containerIndent) {
        continue; // inside the nested container - not a top-level line of this item
      }
      if (blank && topBlockSeen) { return true; } // blank between two top-level blocks
      blank = false;
      topBlockSeen = true;
      let mk = matchMarker(line);
      if (mk) {
        containerIndent = mk.contentIndent;
      } else if (/^ {0,3}>/.test(line)) {
        containerIndent = ind + 1;
      } else {
        containerIndent = -1; // a plain top-level block (paragraph / indented code)
        // a fenced code block is a single block: skip its interior (including blank
        // lines) so blanks inside the fence are not counted as separators between two
        // top-level blocks (which would wrongly make the list loose)
        let fence = line.match(/^ {0,3}(```+|~~~+)/);
        if (fence) {
          let closeRe = new RegExp('^ {0,3}[' + fence[1][0] + ']{' + fence[1].length + ',}[ \\t]*$');
          while (li + 1 < content.length && !closeRe.test(content[li + 1])) { li++; }
          if (li + 1 < content.length) { li++; } // consume the closing fence line
        }
      }
    }
    return false;
  }

  // whether the last content line is an open paragraph (so a lazy continuation line
  // may be appended). Nested block-quote / list markers are peeled first, so lazy
  // continuation propagates through container nesting (e.g. `1. > Blockquote`
  // followed by a markerless line continues the inner block quote's paragraph).
  function lastIsParagraph (content) {
    let last = content[content.length - 1];
    if (last === undefined) { return false; }
    let s = last,
        indentedCode = /^ {4}/.test(last),
        m;
    while ((m = s.match(/^ {0,3}>[ \t]?/) || s.match(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]/))) {
      s = s.slice(m[0].length);
      indentedCode = false;
    }
    if (s.trim() === '' || indentedCode) { return false; }
    return !(
      /^ {0,3}(?:```|~~~)/.test(s) ||
      /^ {0,3}#{1,6}(?:[ \t]|$)/.test(s)
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
    // drop the empty leading line that an empty marker (`-` with content on the next
    // line) contributes, so an indented-code first block sees a clean block start
    // (codeBlock keys off `^`/a preceding blank line) instead of a lone leading newline
    str = str.replace(/^\n+/, '');

    // The item's raw source — the payload for the per-item capture event below (matches
    // makehtml.list, which emits the item's raw markdown).
    let rawItem = content.join('\n');

    // GFM task detection on the (leading-newline-stripped) raw line: it selects the event
    // name and the <li> attributes. The marker must be followed by whitespace (see
    // makehtml.list.taskListItem.checkbox); a bare `[ ]` is not a task.
    let taskMatch = options.tasklists ? /^[ \t]*\[([xX ])](?=[ \t])/.exec(str) : null,
        checked = !!taskMatch && taskMatch[1].trim() !== '',
        eventName = taskMatch ? 'makehtml.list.taskListItem' : 'makehtml.list.listItem',
        attributes = {},
        matches = { _wholeMatch: rawItem, listItem: rawItem };

    if (taskMatch) {
      matches._taskListButton = '[' + taskMatch[1] + ']';
      matches._taskListButtonChecked = taskMatch[1];
      // Bare `<li>` per the GFM spec; the legacy bullet styling/classes are only added
      // when `moreStyling` is enabled.
      if (options.moreStyling) {
        attributes.classes = ['task-list-item'];
        attributes.style = 'list-style-type: none;';
        if (checked) {
          attributes.classes.push('task-list-item-complete');
        }
      }
    }

    let captureStartEvent = new showdown.Event(eventName + '.onCapture', rawItem);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setMatches(matches)
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    let rendered;
    // A listener may pass output, which takes precedence and is used verbatim as the item
    // markup (mirrors makehtml.list); otherwise we render the (possibly edited) item.
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      rendered = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      let liAttrs = showdown.helper._populateAttributes(attributes);

      // honor a listener that rewrote the item's raw markdown via matches.listItem
      if (captureStartEvent.matches.listItem !== rawItem) {
        str = (captureStartEvent.matches.listItem + '\n').replace(/^\n+/, '');
      }

      // Render the checkbox on the raw line, before any block/span parsing, so the
      // injected <input> flows through blockGamut/spanGamut just like any other inline HTML.
      if (taskMatch) {
        str = showdown.subParser('makehtml.list.taskListItem.checkbox')(str, options, globals);
      }
      str = showdown.subParser('makehtml.githubCodeBlock')(str, options, globals);
      str = showdown.subParser('makehtml.blockGamut')(str, options, globals);
      str = str.replace(/^\n+/, '').replace(/\n+$/, '');

      let grafs = str.split(/\n{2,}/g),
          out = [];
      for (let gi = 0; gi < grafs.length; ++gi) {
        let g = grafs[gi];
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
        rendered = '<li' + liAttrs + '></li>\n';
      } else {
        // CommonMark serialization: a loose item opens/closes on its own lines; a tight
        // item opens on a new line only when its content begins with a block child, and
        // closes on a new line only when its content ends with a block child (so trailing
        // inline text hugs `</li>`).
        let open = (loose || /^¨[KG]\d+[KG]/.test(body)) ? '<li' + liAttrs + '>\n' : '<li' + liAttrs + '>',
            close = (loose || /¨[KG]\d+[KG]\s*$/.test(body)) ? '\n</li>\n' : '</li>\n';
        rendered = open + body + close;
      }
    }

    let beforeHashEvent = new showdown.Event(eventName + '.onHash', rendered);
    beforeHashEvent
      .setOutput(rendered)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
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
          listStart = i,
          items = [],
          loose = false;

      while (i < n) {
        let mm = matchMarker(lines[i]);
        if (!mm || mm.type !== type) { break; }
        if (type === 'ul' && mm.bullet !== bullet) { break; }
        if (type === 'ol' && mm.delim !== delim) { break; }

        let item = gatherItem(lines, i, mm);
        if (itemLoose(item.content)) { loose = true; }
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

      // the raw source of this whole list block — payload for the list-level capture event
      let rawList = lines.slice(listStart, i).join('\n');
      let listCapture = new showdown.Event('makehtml.list.onCapture', rawList);
      listCapture
        .setOutput(null)
        ._setGlobals(globals)
        ._setOptions(options)
        .setMatches({ _wholeMatch: rawList, list: rawList })
        .setAttributes({});
      listCapture = globals.converter.dispatch(listCapture);

      let otp;
      // a listener may pass output, which takes precedence over rendering the items
      if (listCapture.output && listCapture.output !== '') {
        otp = listCapture.output;
      } else {
        let attrs = listCapture.attributes || {};
        if (type === 'ol' && startNum !== 1) {
          attrs.start = startNum;
        }
        let body = '';
        for (let k = 0; k < items.length; ++k) {
          body += renderItem(items[k], loose);
        }
        otp = '\n\n<' + type + showdown.helper._populateAttributes(attrs) + '>\n' + body + '</' + type + '>\n';
      }

      let listHash = new showdown.Event('makehtml.list.onHash', otp);
      listHash
        .setOutput(otp)
        ._setGlobals(globals)
        ._setOptions(options);
      listHash = globals.converter.dispatch(listHash);
      otp = listHash.output;

      out.push(showdown.subParser('makehtml.hashBlock')(otp, options, globals));
      prevParagraph = false;
    }

    return out.join('\n');
  }
});
