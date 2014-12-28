/*global module:true*/
/*
 * Basic table support with re-entrant parsing, where cell content
 * can also specify markdown.
 *
 * Tables
 * ======
 *
 * | Col 1   | Col 2                                              |
 * |======== |====================================================|
 * |**bold** | ![Valid XHTML] (http://w3.org/Icons/valid-xhtml10) |
 * | Plain   | Value                                              |
 *
 *
 *
 * |   Col 1  |                                               Col 2|
 * |:========:|===================================================:|
 * |   col 1  |                                   is center aligned|
 * |   col 2  |                                    is right aligned|
 *
 */

(function(){
  var table = function(converter) {
    var tables = {}, filter; 
    tables.th = function(header, style) {
      if (header.trim() === "") { return "";}
      var id = header.trim().replace(/ /g, '_').toLowerCase();
      return '<th id="' + id + '" style="' + style + '">' + header + '</th>';
    };
    tables.td = function(cell, style) {
      return '<td style="' + style + '">' + converter.makeHtml(cell) + '</td>';
    };
    tables.ths = function() {
      var out = "", i = 0, hs = [].slice.apply(arguments[0]), style = [].slice.apply(arguments[1]);
      for (i;i<hs.length;i+=1) {
        out += tables.th(hs[i], style[i]) + '\n';
      }
      return out;
    };
    tables.tds = function() {
      var out = "", i = 0, ds = [].slice.apply(arguments[0]), style = [].slice.apply(arguments[1]);
      for (i;i<ds.length;i+=1) {
        out += tables.td(ds[i], style[i]) + '\n';
      }
      return out;
    };
    tables.thead = function() {
      var out, i = 0, hs = [].slice.apply(arguments[0]), style = [].slice.apply(arguments[1]);
      out = "<thead>\n";
      out += "<tr>\n";
      out += tables.ths.apply(this, [hs, style]);
      out += "</tr>\n";
      out += "</thead>\n";
      return out;
    };
    tables.tr = function() {
      var out, i = 0, cs = [].slice.apply(arguments[0]), style = [].slice.apply(arguments[1]);
      out = "<tr>\n";
      out += tables.tds.apply(this, [cs, style]);
      out += "</tr>\n";
      return out;
    };
    filter = function(text) { 
      var i=0, lines = text.split('\n'), line, hs, rows, out = [];
      for (i;i<lines.length;i+=1) {
        line = lines[i];
        // looks like a table heading
        if (line.trim().match(/^[|]{1}.*[|]{1}$/)) {
          line = line.trim();
          var tbl = [];
          var align = lines[i+1];
          align = align.trim();
          var styles = [];
          if (align.match(/^[|]{1}[-=|: ]+[|]{1}$/)) {
            styles = align.substring(1, align.length -1).split('|');
            var j=0;
            for (j;j<styles.length;j+=1) {
			  styles[j] = styles[j].trim();
              if (styles[j].match(/^[:]{1}[-=| ]+[:]{1}$/)) {
                styles[j] = 'text-align:center;';
              }
              else if (styles[j].match(/^[-=| ]+[:]{1}$/)) {
                styles[j] = 'text-align:right;';
              }
              else {
                styles[j] = 'text-align:left;';
              }
            }
          }
          tbl.push('<table>');
          hs = line.substring(1, line.length -1).split('|');
          if (styles.length === 0) {
            var j=0;
            for (j;j<hs.length;j+=1) {
              styles.push('text-align:left');
            }
          }
          tbl.push(tables.thead.apply(this, [hs, styles]));
          line = lines[++i];
          if (!line.trim().match(/^[|]{1}[-=|: ]+[|]{1}$/)) {
            // not a table rolling back
            line = lines[--i];
          }
          else {
            line = lines[++i];
            tbl.push('<tbody>');
            while (line.trim().match(/^[|]{1}.*[|]{1}$/)) {
              line = line.trim();
              tbl.push(tables.tr.apply(this, [line.substring(1, line.length -1).split('|'), styles]));
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
    return [
    { 
      type: 'lang', 
      filter: filter
    }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.table = table; }
  // Server-side export
  if (typeof module !== 'undefined') {
    module.exports = table;
  }
}());
