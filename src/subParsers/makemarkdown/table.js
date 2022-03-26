
showdown.subParser('makeMarkdown.table',
  /**
   *
   * @param {DocumentFragment} node
   * @param {{}} globals
   * @returns {string}
   */
  function (node, globals) {
    'use strict';

    var txt = '',
        tableArray = [[], []],
        headings,
        rows = [],
        colCount,
        i,
        ii;

    /**
     * @param {Element} tr
     */
    function iterateRow (tr) {
      var children = tr.childNodes,
          cols = [];
      // we need to iterate by order, since td and th can be used interchangeably and in any order
      // we will ignore malformed stuff, comments and floating text.
      for (var i = 0; i < children.length; ++i) {
        var childName = children[i].nodeName.toUpperCase();
        if (childName === 'TD' || childName === 'TH') {
          cols.push(children[i]);
        }
      }
      return cols;
    }


    // first lets look for <thead>
    // we will ignore thead without <tr> children
    // also, since markdown doesn't support tables with multiple heading rows, only the first one will be transformed
    // the rest will count as regular rows
    if (node.querySelectorAll(':scope>thead').length !== 0 && node.querySelectorAll(':scope>thead>tr').length !== 0) {
      var thead = node.querySelectorAll(':scope>thead>tr');

      // thead>tr can have td and th children
      for (i = 0; i < thead.length; ++i) {
        rows.push(iterateRow(thead[i]));
      }
    }

    // now let's look for tbody
    // we will ignore tbody without <tr> children
    if (node.querySelectorAll(':scope>tbody').length !== 0 && node.querySelectorAll(':scope>tbody>tr').length !== 0) {
      var tbody = node.querySelectorAll(':scope>tbody>tr');
      // tbody>tr can have td and th children, although th are not very screen reader friendly
      for (i = 0; i < tbody.length; ++i) {
        rows.push(iterateRow(tbody[i]));
      }
    }

    // now look for tfoot
    if (node.querySelectorAll(':scope>tfoot').length !== 0 && node.querySelectorAll(':scope>tfoot>tr').length !== 0) {
      var tfoot = node.querySelectorAll(':scope>tfoot>tr');
      // tfoot>tr can have td and th children, although th are not very screen reader friendly
      for (i = 0; i < tfoot.length; ++i) {
        rows.push(iterateRow(tfoot[i]));
      }
    }

    // lastly look for naked tr
    if (node.querySelectorAll(':scope>tr').length !== 0) {

      var tr = node.querySelectorAll(':scope>tr');
      // tfoot>tr can have td and th children, although th are not very screen reader friendly
      for (i = 0; i < tr.length; ++i) {
        rows.push(iterateRow(tr[i]));
      }
    }

    // TODO: implement <caption> in tables https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/caption
    // note: <colgroup> is ignored, since they are basically styling

    // we need now to account for cases of completely empty tables, like <table></table> or equivalent
    if (rows.length === 0) {
      // table is empty, return empty text
      return txt;
    }

    // count the first row. We need it to trim the table (if table rows have inconsistent number of columns)
    colCount = rows[0].length;

    // let's shift the first row as a heading
    headings = rows.shift();

    for (i = 0; i < headings.length; ++i) {
      var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
          align = '---';

      if (headings[i].hasAttribute('style')) {
        var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
        switch (style) {
          case 'text-align:left;':
            align = ':---';
            break;
          case 'text-align:right;':
            align = '---:';
            break;
          case 'text-align:center;':
            align = ':---:';
            break;
        }
      }
      tableArray[0][i] = headContent.trim();
      tableArray[1][i] = align;
    }

    // now iterate through the rows and create the pseudo output (not pretty yet)
    for (i = 0; i < rows.length; ++i) {
      var r = tableArray.push([]) - 1;

      for (ii = 0; ii < colCount; ++ii) {
        var cellContent = ' ';
        if (typeof rows[i][ii] !== 'undefined') {
          // Note: if rows[i][ii] is undefined, it means the row has fewer elements than the header,
          // and empty content will be added
          cellContent = showdown.subParser('makeMarkdown.tableCell')(rows[i][ii], globals);
        }
        tableArray[r].push(cellContent);
      }
    }

    // now tidy up the output, aligning cells and stuff
    var cellSpacesCount = 3;
    for (i = 0; i < tableArray.length; ++i) {
      for (ii = 0; ii < tableArray[i].length; ++ii) {
        var strLen = tableArray[i][ii].length;
        if (strLen > cellSpacesCount) {
          cellSpacesCount = strLen;
        }
      }
    }

    for (i = 0; i < tableArray.length; ++i) {
      for (ii = 0; ii < tableArray[i].length; ++ii) {
        if (i === 1) {
          if (tableArray[i][ii].slice(-1) === ':') {
            tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(0, -1), cellSpacesCount - 1, '-') + ':';
          } else {
            tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, '-');
          }

        } else {
          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
        }
      }
      txt += '| ' + tableArray[i].join(' | ') + ' |\n';
    }

    return txt.trim();
  }
);
