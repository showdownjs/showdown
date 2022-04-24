showdown.subParser('makehtml.table', function (text, options, globals) {
  'use strict';

  if (!options.tables) {
    return text;
  }

  // find escaped pipe characters
  text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

  //
  // parser starts here
  //
  let startEvent = new showdown.Event('makehtml.table.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  // parse multi column tables
  const tableRgx = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*[-=]{2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*[-=]{2,}[\s\S]+?(?:\n\n|¨0)/gm;
  text = text.replace(tableRgx, function (wholeMatch) {
    return parse(tableRgx, wholeMatch);
  });

  const singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*[-=]{2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;
  text = text.replace(singeColTblRgx, function (wholeMatch) {
    return parse(singeColTblRgx, wholeMatch);
  });

  let afterEvent = new showdown.Event('makehtml.table.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;




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
    let captureStartEvent = new showdown.Event('makehtml.table.onCapture', wholeMatch);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        table: wholeMatch
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      // user provided an otp, so we use it
      otp = captureStartEvent.output;
    } else {
      // user changed matches.table, so we need to generate headers, styles, and cells again
      if (captureStartEvent.matches.table !== wholeMatch) {
        tab = preParse(captureStartEvent.matches.table);
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

    let beforeHashEvent = new showdown.Event('makehtml.table.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
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

    if (rawHeaders.length < rawStyles.length) {
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
      let header = rawHeaders[i];
      let captureStartEvent = new showdown.Event('makehtml.table.header.onCapture', rawHeaders[i]);
      captureStartEvent
        .setOutput(null)
        ._setGlobals(globals)
        ._setOptions(options)
        .setRegexp(null)
        .setMatches({
          _wholeMatch: rawHeaders[i],
          header: rawHeaders[i]
        })
        .setAttributes(styles[i]);
      captureStartEvent = globals.converter.dispatch(captureStartEvent);
      if (captureStartEvent.output && captureStartEvent.output !== '') {
        // user provided an otp, so we use it
        header = captureStartEvent.output;
      } else {
        header = parseHeader(captureStartEvent.matches.header, styles[i]);
      }
      let beforeHashEvent = new showdown.Event('makehtml.table.header.onHash', header);
      beforeHashEvent
        .setOutput(header)
        ._setGlobals(globals)
        ._setOptions(options);
      beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
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


        let captureStartEvent = new showdown.Event('makehtml.table.cell.onCapture', cell);
        captureStartEvent
          .setOutput(null)
          ._setGlobals(globals)
          ._setOptions(options)
          .setRegexp(null)
          .setMatches({
            _wholeMatch: cell,
            cell: cell
          })
          .setAttributes(attributes);
        captureStartEvent = globals.converter.dispatch(captureStartEvent);
        if (captureStartEvent.output && captureStartEvent.output !== '') {
          // user provided an otp, so we use it
          cell = captureStartEvent.output;
        } else {
          attributes = captureStartEvent.attributes;
          cell = parseCell(captureStartEvent.matches.cell, attributes);
        }
        let beforeHashEvent = new showdown.Event('makehtml.table.cell.onHash', cell);
        beforeHashEvent
          .setOutput(cell)
          ._setGlobals(globals)
          ._setOptions(options);
        beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
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
    headerText = showdown.subParser('makehtml.spanGamut')(headerText, options, globals);

    // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
    // TODO think about this option!!! and remove backwards compatibility
    if (options.tablesHeaderId || options.tableHeaderId) {
      attributes.id = headerText.replace(/ /g, '_').toLowerCase();
    }
    return '<th' + showdown.helper._populateAttributes(attributes) + '>' + headerText + '</th>\n';
  }

  /**
   *
   * @param {string} cellText
   * @param {{}} attributes
   * @returns {string}
   */
  function parseCell (cellText, attributes) {
    cellText = showdown.subParser('makehtml.spanGamut')(cellText, options, globals);
    return '<td' + showdown.helper._populateAttributes(attributes) + '>' + cellText + '</td>\n';
  }
});
