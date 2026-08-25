/**
 * @file      makehtml/list.js
 * @summary   The container-block list parser converting Markdown lists into `<ul>`/`<ol>`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * One line-based scanner (based on the CommonMark spec §5.2/5.3) for every flavor. A change of
 * marker type starts a new list; ordered lists keep their start number and delimiter; loose/tight
 * is decided per list; items nest by indentation. The flavor divergences are derived, not forked:
 * bullet-char interchangeability (`*`/`+`/`-` are one list unless `cmSpec`) and the sub-list
 * nesting threshold (CommonMark's content indent under `cmSpec`; otherwise an absolute four-space
 * indent, or any extra indent when `disableForced4SpacesIndentedSublists` is set). Delegates
 * task-list checkboxes to `makehtml.list.taskListItem.checkbox` and emits the `makehtml.list.*`
 * family including `.listItem` and `.taskListItem`.
 */


showdown.subParser('makehtml.list', function (text, options, globals) {
  'use strict';

  // Pathologically nested lists (e.g. `- - - …` thousands deep, or a single line of repeated
  // `- ` markers) recurse once per level through renderItem → blockGamut → makehtml.list. Refuse
  // to descend past a sane nesting depth (mirrors the block-quote guard); beyond it the surplus
  // markers simply render as literal text. The deepest nesting in the whole test corpus is far
  // below this bound, so it never affects real documents.
  const maxNestingDepth = 25;
  if ((globals.listDepth || 0) >= maxNestingDepth) {
    return text;
  }

  let startEvent = showdown.Event.dispatchStart('makehtml.list.onStart', text, options, globals);
  text = startEvent.output;

  text = parseList(text);

  let afterEvent = showdown.Event.dispatchEnd('makehtml.list.onEnd', text, options, globals);
  return afterEvent.output;

  /** @param {string} line @returns {number} count of leading spaces */
  function leadingSpaces (line) {
    let m = line.match(/^ */);
    return m[0].length;
  }

  // Leading indentation width in columns, counting a tab as advancing to the next 4-column
  // tab stop (spec: "tabs are equivalent to four spaces where indentation matters"). Used by
  // the vanilla continuation/nesting thresholds so tab-indented continuations are gathered.
  function leadingWidth (line) {
    let m = line.match(/^[ \t]*/)[0],
        col = 0;
    for (let k = 0; k < m.length; ++k) {
      col += (m[k] === '\t') ? (4 - col % 4) : 1;
    }
    return col;
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

  // Escape a leading block marker (block quote, ATX heading, fenced code, thematic break /
  // setext underline) on a line that is being kept as a lazy paragraph continuation, so
  // blockGamut renders it as literal paragraph text instead of starting a new block.
  // encodeBackslashEscapes restores the literal character downstream. Plain text (and inline
  // constructs like `*em*`) is returned unchanged — only genuine block openers are escaped.
  function escapeLazyMarker (line) {
    if (/^ {0,3}>/.test(line)) { return line.replace(/^( {0,3})>/, '$1\\>'); }
    if (/^ {0,3}#{1,6}(?:[ \t]|$)/.test(line)) { return line.replace(/^( {0,3})#/, '$1\\#'); }
    if (/^ {0,3}(?:```|~~~)/.test(line)) { return line.replace(/^( {0,3})([`~])/, '$1\\$2'); }
    if (/^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/.test(line)) { return line.replace(/^( {0,3})([-*_])/, '$1\\$2'); }
    if (/^ {0,3}[-=]+[ \t]*$/.test(line)) { return line.replace(/^( {0,3})([-=])/, '$1\\$2'); }
    return line;
  }

  // A bare marker with nothing after it — not even a space (`-`, `*`, `1.`). Vanilla/original
  // require whitespace after the marker, so this is paragraph text, not an empty list item
  // (a marker followed by a space, `- `, IS an empty item). CommonMark keeps the empty-item form.
  function isBareMarker (line) {
    return /^ {0,3}(?:[-+*]|\d{1,9}[.)])$/.test(line);
  }

  // A line begins with a list marker at any indentation. matchMarker's `^ {0,3}` anchor only
  // recognizes markers indented 0-3 spaces, so a four-space (or deeper) sub-list marker is
  // invisible to it; the vanilla nesting decision (gatherItem) needs this broader test to see it.
  function looksLikeMarker (line) {
    return /^[ \t]*(?:[-+*]|\d{1,9}[.)])(?:[ \t]|$)/.test(line);
  }

  // Whether a line that begins with a list marker nests inside item `m` (only the non-cmSpec
  // path calls this — CommonMark nests purely by content indent). The default is the legacy
  // absolute four-space rule (equivalently: a marker legacy's `^ {0,3}` anchor would NOT have
  // matched at this level), with a leading tab counting as four columns. With
  // disableForced4SpacesIndentedSublists any extra indent past the marker nests (Original-Markdown).
  function marksNest (line, m) {
    if (options.disableForced4SpacesIndentedSublists) {
      return leadingSpaces(line) > m.markerIndent;
    }
    return /^ {0,3}\t/.test(line) || leadingSpaces(line) >= 4;
  }

  // Whether a non-blank line continues item `m` after a run of blank lines: a nested sub-list
  // marker (the nesting threshold) or a content-column continuation (the content indent).
  function continuesItem (line, m) {
    if (!options.cmSpec) {
      if (looksLikeMarker(line)) {
        return marksNest(line, m);
      }
      // vanilla continuation belongs at the minimal content column (one-space gap past the
      // marker), tab-aware — legacy re-based every item line with a single outdent, so a
      // multi-space or tab-indented marker still gathers its continuation
      return leadingWidth(line) >= m.markerIndent + m.markerWidth + 1;
    }
    return leadingSpaces(line) >= m.contentIndent;
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
      markerWidth: k,
      contentIndent: contentIndent,
      firstContent: firstContent
    };
  }

  /**
   * Gather one list item starting at line index `i`. Consumes the marker line and
   * subsequent lines that belong to the item, plus lazy paragraph continuations.
   * Blank lines that are followed by more item content are kept (internal); trailing
   * blank lines are left for the caller.
   *
   * Two independent thresholds decide membership:
   *   - a **non-marker** line (plain text) belongs at the *content column*
   *     (`leadingSpaces >= contentIndent`) and is sliced by contentIndent — this is the
   *     hanging/lazy continuation rule CommonMark and the legacy flavors share;
   *   - a line that begins with a **list marker** is a nesting decision. Under `cmSpec`
   *     it nests by content indent like any other line; otherwise `marksNest` gates it
   *     (absolute four-space / option) and, because the nested marker must stay
   *     recognizable to matchMarker's `^ {0,3}` anchor at the next parse level, it is
   *     re-based with outdent semantics (a fixed <=4-space / one-tab strip) rather than
   *     the variable contentIndent slice.
   *
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
        if (j < n && !isBlank(lines[j]) && continuesItem(lines[j], m)) {
          for (let b = i; b < j; ++b) { content.push(''); }
          if (content.some(function (c) { return c.trim() !== ''; })) { internalBlank = true; }
          i = j;
          continue;
        }
        return {content: content, end: i, blanksFollow: j - i, internalBlank: internalBlank};
      }
      if (options.cmSpec) {
        // CommonMark: nesting and continuation are both decided by the content indent
        if (leadingSpaces(line) >= w) {
          content.push(line.slice(w));
          i++;
        } else if (isLazyParagraph(line) && lastIsParagraph(content)) {
          content.push(line);
          i++;
        } else {
          return {content: content, end: i, blanksFollow: 0, internalBlank: internalBlank};
        }
      } else if (looksLikeMarker(line)) {
        // a sub-list marker: nest it (outdent-sliced) or end the item so the outer
        // collector picks the marker up as a sibling
        if (marksNest(line, m)) {
          content.push(showdown.helper.outdent(line));
          i++;
        } else {
          return {content: content, end: i, blanksFollow: 0, internalBlank: internalBlank};
        }
      } else if (leadingWidth(line) >= m.markerIndent + m.markerWidth + 1) {
        // vanilla non-marker continuation: belongs at the minimal content column (tab-aware),
        // re-based with a single outdent (the legacy slice), so multi-space markers and tab
        // indentation keep their continuation lines instead of dropping them into code
        content.push(showdown.helper.outdent(line));
        i++;
      } else if (lastIsParagraph(content)) {
        // full laziness (vanilla/original, mirroring makehtml.blockquote): any non-blank,
        // non-marker line continues the item's open paragraph — even one that looks like a
        // block opener (`>`, `#`, fence, thematic break), which is escaped to stay inline.
        // (CommonMark uses paragraph-only laziness — the cmSpec branch above.)
        content.push(escapeLazyMarker(line));
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
  // Under vanilla a leading list marker on the first content line is a literal collision
  // (`- - a`), never a nested container, so it is not peeled — the line stays open paragraph
  // text and a lazy continuation attaches to it.
  function lastIsParagraph (content) {
    let last = content[content.length - 1];
    if (last === undefined) { return false; }
    let s = last,
        indentedCode = /^ {4}/.test(last),
        listMarkerRe = /^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]/,
        m;
    while ((m = s.match(/^ {0,3}>[ \t]?/) || (options.cmSpec && s.match(listMarkerRe)))) {
      s = s.slice(m[0].length);
      indentedCode = false;
    }
    if (s.trim() === '' || indentedCode) { return false; }
    // A CommonMark ATX heading may be empty (`#` alone); the legacy flavors require heading
    // text, so a bare `#` there is ordinary paragraph text that a lazy line can continue.
    let headingRe = options.cmSpec ? /^ {0,3}#{1,6}(?:[ \t]|$)/ : /^ {0,3}#{1,6}[ \t]/;
    return !(
      /^ {0,3}(?:```|~~~)/.test(s) ||
      headingRe.test(s)
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
        matches = { _wholeMatch: rawItem, text: rawItem };

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

    let captureStartEvent = showdown.Event.dispatchCapture(eventName + '.onCapture', rawItem, {
      regexp: null,
      matches: matches,
      attributes: attributes
    }, options, globals);

    let rendered;
    // A listener may pass output, which takes precedence and is used verbatim as the item
    // markup (mirrors makehtml.list); otherwise we render the (possibly edited) item.
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      rendered = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      let liAttrs = showdown.helper._populateAttributes(attributes);

      // honor a listener that rewrote the item's raw markdown via matches.text
      if (captureStartEvent.matches.text !== rawItem) {
        str = (captureStartEvent.matches.text + '\n').replace(/^\n+/, '');
      }

      // Marker collision on the item's own first line (e.g. `- - a`, `1. 2. 3.`): under
      // vanilla/original a sub-list nests only when indented, so a marker sitting in the
      // item's inline text is literal — but the recursive list scan below would re-list it.
      // Escape its leading marker (the bullet char, or an ordered marker's delimiter) so the
      // scan skips it; encodeBackslashEscapes restores the literal marker downstream. This is
      // the same escape makehtml.blockquote uses for a lazily-continued setext underline, and
      // it replaces the legacy ¨A sentinel. A genuine nested sub-list is always on a later
      // (outdented) line — never firstContent — so `content[0]` distinguishes the two.
      if (!options.cmSpec && /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?=[ \t]|$)/.test(content[0])) {
        str = str.replace(/^( {0,3})(?:([-+*])|(\d{1,9})([.)]))/, function (wm, sp, bullet, num, delim) {
          return bullet ? (sp + '\\' + bullet) : (sp + num + '\\' + delim);
        });
      }

      // Vanilla special case: an ATX heading on the item's first line directly followed by
      // more text (no blank line) — e.g. `- # foo` then `  bar`. A heading block doesn't need a
      // trailing blank line, so split them into two blocks (the following text becomes its own
      // paragraph). CommonMark already treats the heading as a single-line block, so this is
      // only needed for the legacy flavors' rendering.
      if (!options.cmSpec && /^ {0,3}#{1,6}[ \t].*\n.+/.test(str)) {
        str = str.replace(/^( {0,3}#{1,6}[ \t].*)$/m, '$1\n');
      }

      // Legacy multi-block detection, measured on the source (before block parsing): an item
      // whose content is split by a blank line into two or more blocks wraps its direct
      // paragraphs in <p> even in a tight list (the `item has a blank line` half of the legacy
      // rule; the heading split above can introduce that blank line). Measured here so the
      // blank lines the block parsers generate around hashed blocks are not miscounted.
      let vanillaMultiBlock = !options.cmSpec && /\n[ \t]*\n/.test(str);

      // Render the checkbox on the raw line, before any block/span parsing, so the
      // injected <input> flows through the block/inline engines just like any other inline HTML.
      if (taskMatch) {
        str = showdown.subParser('makehtml.list.taskListItem.checkbox')(str, options, globals);
      }
      str = showdown.subParser('makehtml.githubCodeBlock')(str, options, globals);
      globals.listDepth = (globals.listDepth || 0) + 1;
      str = showdown.subParser('makehtml.blockEngine')(str, options, globals);
      globals.listDepth--;
      str = str.replace(/^\n+/, '').replace(/\n+$/, '');

      let grafs = str.split(/\n{2,}/g),
          out = [];
      // In a loose list every direct paragraph is wrapped in <p>. In a tight list CommonMark
      // leaves them bare, but the legacy flavors additionally wrap the paragraphs of a
      // multi-block item (one whose source is split by a blank line) — so e.g. a heading
      // followed by a paragraph in a tight item still emits <p> around the text.
      let wrapParagraphs = loose || vanillaMultiBlock;
      for (let gi = 0; gi < grafs.length; ++gi) {
        let g = grafs[gi];
        if (/¨([KG])(\d+)\1/.test(g)) {
          out.push(g);
        } else if (/\S/.test(g)) {
          g = showdown.subParser('makehtml.inlineEngine')(g, options, globals);
          if (wrapParagraphs) {
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

    let beforeHashEvent = showdown.Event.dispatchHash(eventName + '.onHash', rendered, options, globals);
    return beforeHashEvent.output;
  }

  // a line that is open paragraph text (so a following list marker would have to
  // "interrupt a paragraph" - which empty items and non-1 ordered lists may not do)
  function isParaText (line) {
    if (isBlank(line) || /¨[A-Za-z]?\d+[A-Za-z]/.test(line)) { return false; }
    return isLazyParagraph(line) || matchMarker(line) !== null;
  }

  /**
   * List parsing. Scans line by line, leaving non-list lines untouched and converting each
   * run of list items of the same type into a hashed list.
   * @param {string} str
   * @returns {string}
   */
  function parseList (str) {
    let lines = str.split('\n'),
        out = [],
        i = 0,
        n = lines.length,
        prevParagraph = false;

    while (i < n) {
      let m = matchMarker(lines[i]);
      // vanilla/original: a bare marker with nothing after it is paragraph text, not a list
      if (!m || (!options.cmSpec && isBareMarker(lines[i]))) {
        out.push(lines[i]);
        prevParagraph = m ? true : isParaText(lines[i]);
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
        // a bare marker (nothing after it) doesn't extend a vanilla/original list either
        if (!options.cmSpec && isBareMarker(lines[i])) { break; }
        // Bullet-char interchangeability: vanilla/original treat `*`/`+`/`-` as one list, so
        // only CommonMark splits a `ul` on a bullet-char change. (The marker-TYPE split above
        // is unconditional for every flavor; ordered lists always split on delimiter change.)
        if (options.cmSpec && type === 'ul' && mm.bullet !== bullet) { break; }
        if (type === 'ol' && mm.delim !== delim) { break; }

        let item = gatherItem(lines, i, mm);
        if (itemLoose(item.content)) { loose = true; }
        items.push(item.content);
        i = item.end;

        if (item.blanksFollow > 0) {
          let j = i + item.blanksFollow,
              next = (j < n) ? matchMarker(lines[j]) : null,
              // a following item continues the same list when its marker matches: same type,
              // and (for ul) the same bullet char only under cmSpec, else any bullet; (for ol)
              // the same delimiter
              sameMarker = next && next.type === type && ((type === 'ul') ?
                (options.cmSpec ? next.bullet === bullet : true) :
                (next.delim === delim)),
              continues = sameMarker;
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
      let listCapture = showdown.Event.dispatchCapture('makehtml.list.onCapture', rawList, {
        regexp: null,
        matches: { _wholeMatch: rawList, text: rawList },
        attributes: {}
      }, options, globals);

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

      let listHash = showdown.Event.dispatchHash('makehtml.list.onHash', otp, options, globals);
      otp = listHash.output;

      out.push(showdown.helper.hashBlock(otp, options, globals));
      prevParagraph = false;
    }

    return out.join('\n');
  }
});
