showdown.subParser('tables', function (text, options, globals) {
  'use strict';

  var table = function () {

    var tables = {},
        style = 'text-align:left;',
        filter;

    tables.th = function (header) {
      if (header.trim() === '') {
        return '';
      }
      var id = header.trim().replace(/ /g, '_').toLowerCase();
      return '<th id="' + id + '" style="' + style + '">' + header + '</th>';
    };

    tables.td = function (cell) {
      var subText = showdown.subParser('blockGamut')(cell, options, globals);
      return '<td style="' + style + '">' + subText + '</td>';
    };

    tables.ths = function () {
      var out = '',
        i = 0,
        hs = [].slice.apply(arguments);
      for (i; i < hs.length; i += 1) {
        out += tables.th(hs[i]) + '\n';
      }
      return out;
    };

    tables.tds = function () {
      var out = '', i = 0, ds = [].slice.apply(arguments);
      for (i; i < ds.length; i += 1) {
        out += tables.td(ds[i]) + '\n';
      }
      return out;
    };

    tables.thead = function () {
      var out,
        hs = [].slice.apply(arguments);
      out = '<thead>\n';
      out += '<tr>\n';
      out += tables.ths.apply(this, hs);
      out += '</tr>\n';
      out += '</thead>\n';
      return out;
    };

    tables.tr = function () {
      var out,
        cs = [].slice.apply(arguments);
      out = '<tr>\n';
      out += tables.tds.apply(this, cs);
      out += '</tr>\n';
      return out;
    };

    filter = function (text) {
      var i = 0,
        lines = text.split('\n'),
        line,
        hs,
        out = [];
      for (i; i < lines.length; i += 1) {
        line = lines[i];
        // looks like a table heading
        if (line.trim().match(/^[|].*[|]$/)) {
          line = line.trim();
          var tbl = [];
          tbl.push('<table>');
          hs = line.substring(1, line.length - 1).split('|');
          tbl.push(tables.thead.apply(this, hs));
          line = lines[++i];
          if (!line.trim().match(/^[|][-=|: ]+[|]$/)) {
            // not a table rolling back
            line = lines[--i];
          } else {
            line = lines[++i];
            tbl.push('<tbody>');
            while (line.trim().match(/^[|].*[|]$/)) {
              line = line.trim();
              tbl.push(tables.tr.apply(this, line.substring(1, line.length - 1).split('|')));
              line = lines[++i];
            }
            tbl.push('</tbody>');
            tbl.push('</table>');
            // we are done with this table and we move along
            out.push(tbl.join('\n'));
            continue;
          }
        }
        out.push(line);
      }
      return out.join('\n');
    };
    return {parse: filter};
  };

  if (options.tables) {
    var tableParser = table();
    return tableParser.parse(text);
  } else {
    return text;
  }
});
