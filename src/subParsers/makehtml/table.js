/**
 * @file      makehtml/table.js
 * @summary   Converts GFM pipe tables into `<table>`, gated by `tables`.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes header + delimiter + body rows, breaking the table at the first line that starts
 * another block construct (returning the tail for reprocessing) and handling alignment and escaped
 * pipes. The header regex is written to avoid quadratic backtracking (ReDoS). Emits `makehtml.table.*`
 * plus `.header`/`.cell` captures.
 */

showdown.subParser('makehtml.table', function (text, options, globals) {
  'use strict';

  if (!options.tables) {
    return text;
  }

  //
  // parser starts here
  //
  let startEvent = showdown.Event.dispatchStart('makehtml.table.onStart', text, options, globals);
  text = startEvent.output;

  // GFM §4.10: a table is broken at the first line that begins another
  // block-level construct (blockquote, ATX heading, fenced code, thematic
  // break). Such a line is not a table row, so we split it — and everything
  // after it — off the match. Because `table` runs immediately before
  // `blockquote` (and the rest of blockGamut) in the pipeline, the returned
  // tail is reprocessed and converted normally.
  const blockStartRgx = /^ {0,3}(?:>|#{1,6}(?:[ \t]|$)|```|~~~|(?:\*[ \t]*){3,}$|(?:-[ \t]*){3,}$|(?:_[ \t]*){3,}$)/;

  // parse multi column tables.
  // The header row is matched as `(?=[^\n]*\|)[^\n]+\n` (a whole line that contains at least one
  // pipe) instead of `\|?.+\|.+\n`. The old form had two greedy `.+` around a `\|`, so when the
  // following delimiter row failed to match it backtracked over every pipe position in the header
  // — quadratic on a long pipe-heavy line like `'|a'.repeat(n)`. The lookahead + single greedy
  // `[^\n]+` matches the same set of header lines without that backtracking.
  const tableRgx = /^ {0,3}(?=[^\n]*\|)[^\n]+\n {0,3}\|?[ \t]*:?[ \t]*[-=]+[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*[-=]+[\s\S]+?(?:\n\n|¨0)/gm;
  text = text.replace(tableRgx, function (wholeMatch) {
    let split = breakOnBlock(wholeMatch);
    // Neutralize escaped pipes only within the actual table text (not the trailing block
    // or any non-table content) so `\|` inside code spans elsewhere is left for the normal
    // backslash-escape / code-span passes to handle.
    let table = split.table.replace(/\\(\|)/g, showdown.helper.escapePlaceholder);
    return parse(tableRgx, table) + split.tail;
  });

  const singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|?[ \t]*:?[ \t]*[-=]+[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;
  text = text.replace(singeColTblRgx, function (wholeMatch) {
    let table = wholeMatch.replace(/\\(\|)/g, showdown.helper.escapePlaceholder);
    return parse(singeColTblRgx, table);
  });

  let afterEvent = showdown.Event.dispatchEnd('makehtml.table.onEnd', text, options, globals);
  return afterEvent.output;



  /**
   * Split a greedily-matched table block at the first body line that begins
   * another block-level construct. The header (line 0) and delimiter (line 1)
   * are never terminators; scanning starts at the first body row.
   * @param {string} wholeMatch
   * @returns {{table: string, tail: string}}
   */
  function breakOnBlock (wholeMatch) {
    let lines = wholeMatch.split('\n');
    for (let i = 2; i < lines.length; ++i) {
      if (blockStartRgx.test(lines[i])) {
        return {
          table: lines.slice(0, i).join('\n') + '\n',
          tail: lines.slice(i).join('\n')
        };
      }
    }
    return { table: wholeMatch, tail: '' };
  }

  /**
   *
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @returns {string}
   */
  function parse (pattern, wholeMatch) {
    let tab = preParse(wholeMatch);

    // if parseTable returns null then it's a malformed table so we return what we caught
    if (!tab) {
      return wholeMatch;
    }

    // only now we consider it to be a markdown table and start doing stuff
    let headers = tab.rawHeaders;
    let styles = tab.rawStyles;
    let cells = tab.rawCells;

    let otp;
    let captureStartEvent = showdown.Event.dispatchCapture('makehtml.table.onCapture', wholeMatch, {
      regexp: pattern,
      matches: {
        _wholeMatch: wholeMatch,
        text: wholeMatch
      },
      attributes: {}
    }, options, globals);
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      // user provided an otp, so we use it
      otp = captureStartEvent.output;
    } else {
      // user changed matches.text, so we need to generate headers, styles, and cells again
      if (captureStartEvent.matches.text !== wholeMatch) {
        tab = preParse(captureStartEvent.matches.text);
        // user passed a malformed table, so we bail
        if (!tab) {
          return wholeMatch;
        }
        headers = tab.rawHeaders;
        styles = tab.rawStyles;
        cells = tab.rawCells;
      }
      let parsedTab = parseTable (headers, styles, cells);
      let attributes = captureStartEvent.attributes;
      otp = buildTableOtp(parsedTab.headers, parsedTab.cells, attributes);
    }

    let beforeHashEvent = showdown.Event.dispatchHash('makehtml.table.onHash', otp, options, globals);
    otp = beforeHashEvent.output;
    return otp;
  }

  /**
   *
   * @param {string[]} headers
   * @param {string[]} cells
   * @param {{}} attributes
   * @returns {string}
   */
  function buildTableOtp (headers, cells, attributes) {
    let otp;
    const colCount = headers.length,
        rowCount = cells.length;

    otp = '<table' + showdown.helper._populateAttributes(attributes) + '>\n<thead>\n<tr>\n';
    for (let i = 0; i < colCount; ++i) {
      otp += headers[i];
    }
    otp += '</tr>\n</thead>\n<tbody>\n';

    for (let i = 0; i < rowCount; ++i) {
      otp += '<tr>\n';
      for (let ii = 0; ii < colCount; ++ii) {
        otp += cells[i][ii];
      }
      otp += '</tr>\n';
    }
    otp += '</tbody>\n</table>\n';
    return otp;
  }

  /**
   * @param {string} rawTable
   * @returns {{rawHeaders: string[], rawStyles: string[], rawCells: *[]}|null}
   */
  function preParse (rawTable) {
    let tableLines = rawTable.split('\n');

    for (let i = 0; i < tableLines.length; ++i) {
      // strip wrong first and last column if wrapped tables are used
      if (/^ {0,3}\|/.test(tableLines[i])) {
        tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
      }
      if (/\|[ \t]*$/.test(tableLines[i])) {
        tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
      }
      // parse code spans first, but we only support one line code spans
      tableLines[i] = showdown.subParser('makehtml.codeSpan')(tableLines[i], options, globals);
    }

    let rawHeaders = tableLines[0].split('|').map(function (s) { return s.trim();}),
        rawStyles = tableLines[1].split('|').map(function (s) { return s.trim();}),
        rawCells = [];

    tableLines.shift();
    tableLines.shift();

    for (let i = 0; i < tableLines.length; ++i) {
      if (tableLines[i].trim() === '') {
        continue;
      }
      rawCells.push(
        tableLines[i]
          .split('|')
          .map(function (s) {
            return s.trim();
          })
      );
    }

    if (rawHeaders.length !== rawStyles.length) {
      return null;
    }

    return {
      rawHeaders: rawHeaders,
      rawStyles: rawStyles,
      rawCells: rawCells
    };
  }

  /**
   *
   * @param {string[]} rawHeaders
   * @param {string[]} rawStyles
   * @param {string[]} rawCells
   * @returns {{headers: *, cells: *}}
   */
  function parseTable (rawHeaders, rawStyles, rawCells) {
    const headers = [],
        cells = [],
        styles = [],
        colCount = rawHeaders.length,
        rowCount = rawCells.length;

    for (let i = 0; i < colCount; ++i) {
      styles.push(parseStyle(rawStyles[i]));
    }

    for (let i = 0; i < colCount; ++i) {
      let header;
      let captureStartEvent = showdown.Event.dispatchCapture('makehtml.table.header.onCapture', rawHeaders[i], {
        regexp: null,
        matches: {
          _wholeMatch: rawHeaders[i],
          text: rawHeaders[i]
        },
        attributes: styles[i]
      }, options, globals);
      if (captureStartEvent.output && captureStartEvent.output !== '') {
        // user provided an otp, so we use it
        header = captureStartEvent.output;
      } else {
        header = parseHeader(captureStartEvent.matches.text, styles[i]);
      }
      let beforeHashEvent = showdown.Event.dispatchHash('makehtml.table.header.onHash', header, options, globals);
      header = beforeHashEvent.output;

      headers.push(header);
    }

    for (let i = 0; i < rowCount; ++i) {
      let row = [];
      for (let ii = 0; ii < colCount; ++ii) {
        let cell = (!showdown.helper.isUndefined(rawCells[i][ii])) ? rawCells[i][ii] : '',
            attributes = (!showdown.helper.isUndefined(styles[ii])) ? styles[ii] : {};

        // since we're reusing attributes, we might need to remove the id that we previously set for headers
        if (attributes.id) {
          attributes.classes = [attributes.id] + '_col';
          delete attributes.id;
        }


        let captureStartEvent = showdown.Event.dispatchCapture('makehtml.table.cell.onCapture', cell, {
          regexp: null,
          matches: {
            _wholeMatch: cell,
            text: cell
          },
          attributes: attributes
        }, options, globals);
        if (captureStartEvent.output && captureStartEvent.output !== '') {
          // user provided an otp, so we use it
          cell = captureStartEvent.output;
        } else {
          attributes = captureStartEvent.attributes;
          cell = parseCell(captureStartEvent.matches.text, attributes);
        }
        let beforeHashEvent = showdown.Event.dispatchHash('makehtml.table.cell.onHash', cell, options, globals);
        cell = beforeHashEvent.output;

        row.push(cell);
      }
      cells.push(row);
    }

    return {headers: headers, cells: cells};
  }

  /**
   * @param {string} sLine
   * @returns {{}|{style: string}}
   */
  function parseStyle (sLine) {
    if (/^:[ \t]*-+$/.test(sLine)) {
      return { style: 'text-align:left;' };
    } else if (/^-+[ \t]*:[ \t]*$/.test(sLine)) {
      return { style: 'text-align:right;' };
    } else if (/^:[ \t]*-+[ \t]*:$/.test(sLine)) {
      return { style: 'text-align:center;' };
    } else {
      return {};
    }
  }

  /**
   *
   * @param {string} headerText
   * @param {{id: string}} attributes
   * @returns {string}
   */
  function parseHeader (headerText, attributes) {
    headerText = headerText.trim();

    // Derive the id from the raw header text *before* the inline engine runs. The engine hashes any
    // inline HTML/code into ¨-prefixed placeholders; lowercasing one for the id (¨C0C -> ¨c0c)
    // stops unhashHTMLSpans from ever restoring it, so the placeholder would otherwise leak
    // verbatim into the id (and the derived `_col` cell class). This mirrors the pre-refactor
    // ordering where the id came off the untouched header text.
    if (options.tablesHeaderId) {
      attributes.id = headerText.replace(/ /g, '_').toLowerCase();
    }

    headerText = showdown.subParser('makehtml.inlineEngine')(headerText, options, globals);
    return '<th' + showdown.helper._populateAttributes(attributes) + '>' + headerText + '</th>\n';
  }

  /**
   *
   * @param {string} cellText
   * @param {{}} attributes
   * @returns {string}
   */
  function parseCell (cellText, attributes) {
    cellText = showdown.subParser('makehtml.inlineEngine')(cellText, options, globals);
    return '<td' + showdown.helper._populateAttributes(attributes) + '>' + cellText + '</td>\n';
  }
});
