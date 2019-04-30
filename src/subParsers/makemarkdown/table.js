showdown.subParser('makeMarkdown.table', function (node, globals) {
  'use strict';

  var txt = '',
      tableArray = [[], []],
      headings,
      rows = [],
      i, ii,
      allRows;

  if (node.querySelectorAll('thead').length !== 0 && node.querySelectorAll('tbody').length !== 0) {
    // thead and tbody exists
    headings = node.querySelectorAll('thead>tr>th');
    rows = node.querySelectorAll('tbody>tr');
  } else if (node.querySelectorAll('thead').length !== 0) {
    // only thead exists
    headings = node.querySelectorAll('thead>tr>th');
    if (headings.length === 0) {
      // try to find headlings with td inside
      headings = node.querySelectorAll('thead>tr>td');
    }
  } else if (node.querySelectorAll('tbody').length !== 0) {
    // only tbody exists
    allRows = node.querySelectorAll('tbody>tr');
    // first row becomes heading
    headings = allRows[0].querySelectorAll('td');
    for (i = 1; i < allRows.length; ++i) {
      rows.push(allRows[i]);
    }
  } else {
    // neither thead nor tbody exist
    allRows = node.querySelectorAll('tr');
    // first row becomes heading
    headings = allRows[0].querySelectorAll('td');
    for (i = 1; i < allRows.length; ++i) {
      rows.push(allRows[i]);
    }
  }

  for (i = 0; i < headings.length; ++i) {
    var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
        allign = '---';

    if (headings[i].hasAttribute('style')) {
      var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
      switch (style) {
        case 'text-align:left;':
          allign = ':---';
          break;
        case 'text-align:right;':
          allign = '---:';
          break;
        case 'text-align:center;':
          allign = ':---:';
          break;
      }
    }
    tableArray[0][i] = headContent.trim();
    tableArray[1][i] = allign;
  }

  for (i = 0; i < rows.length; ++i) {
    var r = tableArray.push([]) - 1,
        cols = rows[i].getElementsByTagName('td');

    for (ii = 0; ii < headings.length; ++ii) {
      var cellContent = ' ';
      if (typeof cols[ii] !== 'undefined') {
        cellContent = showdown.subParser('makeMarkdown.tableCell')(cols[ii], globals);
      }
      tableArray[r].push(cellContent);
    }
  }

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
          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, '-') + ':';
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
});
