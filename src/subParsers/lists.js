/**
 * Form HTML ordered (numbered) and unordered (bulleted) lists.
 */
showdown.subParser('lists', function (text, options, globals) {
  'use strict';

  var spl = '~1';

  /**
   * Process the contents of a single ordered or unordered list, splitting it
   * into individual list items.
   * @param {string} listStr
   * @returns {string}
   */
  function processListItems (listStr) {
    // The $g_list_level global keeps track of when we're inside a list.
    // Each time we enter a list, we increment it; when we leave a list,
    // we decrement. If it's zero, we're not in a list anymore.
    //
    // We do this because when we're not inside a list, we want to treat
    // something like this:
    //
    //    I recommend upgrading to version
    //    8. Oops, now this line is treated
    //    as a sub-list.
    //
    // As a single paragraph, despite the fact that the second line starts
    // with a digit-period-space sequence.
    //
    // Whereas when we're inside a list (or sub-list), that line will be
    // treated as the start of a sub-list. What a kludge, huh? This is
    // an aspect of Markdown's syntax that's hard to parse perfectly
    // without resorting to mind-reading. Perhaps the solution is to
    // change the syntax rules such that sub-lists must start with a
    // starting cardinal number; e.g. "1." or "a.".

    globals.gListLevel++;

    // trim trailing blank lines:
    listStr = listStr.replace(/\n{2,}$/, '\n');

    // attacklab: add sentinel to emulate \z
    listStr += '~0';

    var rgx = /(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+((\[(x| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm;

    listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
      checked = (checked && checked.trim() !== '');

      var item = showdown.subParser('outdent')(m4, options, globals);

      //m1 - LeadingLine
      if (m1 || (item.search(/\n{2,}/) > -1)) {
        item = showdown.subParser('blockGamut')(item, options, globals);
      } else {
        if (taskbtn && options.tasklists) {
          item = item.replace(taskbtn, function () {
            var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
            if (checked) {
              otp += ' checked';
            }
            otp += '>';
            return otp;
          });
        }

        // Recursion for sub-lists:
        item = showdown.subParser('lists')(item, options, globals);
        item = item.replace(/\n$/, ''); // chomp(item)
        item = showdown.subParser('spanGamut')(item, options, globals);
      }

      // this is a "hack" to differentiate between ordered and unordered lists
      // related to issue #142
      var tp = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol',
        bulletStyle = '';

      if (taskbtn) {
        bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
      }

      return spl + tp + '<li' + bulletStyle + '>' + item + '</li>\n';
    });

    // attacklab: strip sentinel
    listStr = listStr.replace(/~0/g, '');

    globals.gListLevel--;
    return listStr;
  }

  /**
   * Slit consecutive ol/ul lists (related to issue 142)
   * @param {Array} results
   * @param {string} listType
   * @returns {string|*}
   */
  function splitConsecutiveLists (results, listType) {
    // parsing html with regex...
    // This will surely fail if some extension decides to change paragraph markup directly
    var cthulhu = /(<p[^>]+?>|<p>|<\/p>)/img,
        holder = [[]],
        res = '',
        y = 0;

    // Initialize first sublist
    holder[0].type = listType;

    for (var i = 0; i < results.length; ++i) {
      var txt = results[i].slice(2),
          nListType = results[i].slice(0, 2);

      if (listType !== nListType) {
        y++;
        holder[y] = [];
        holder[y].type = nListType;
        listType = nListType;
      }
      holder[y].push(txt);
    }
    for (i = 0; i < holder.length; ++i) {
      res += '<' + holder[i].type + '>\n';
      for (var ii = 0; ii < holder[i].length; ++ii) {
        if (holder[i].length > 1 && ii === holder[i].length - 1 && !cthulhu.test(holder[i][ii - 1])) {
          //holder[i][ii] = holder[i][ii].replace(cthulhu, '');
        }
        res += holder[i][ii];
      }
      res += '</' + holder[i].type + '>\n';
    }
    return res;
  }

  // attacklab: add sentinel to hack around khtml/safari bug:
  // http://bugs.webkit.org/show_bug.cgi?id=11231
  text += '~0';

  // Re-usable pattern to match any entire ul or ol list:
  var wholeList = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

  if (globals.gListLevel) {
    text = text.replace(wholeList, function (wholeMatch, m1, m2) {
      var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol',
          result = processListItems(m1);

      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      //list = list.replace(/\n{2,}/g, '\n\n\n');
      //result = processListItems(list);

      // Trim any trailing whitespace, to put the closing `</$list_type>`
      // up on the preceding line, to get it past the current stupid
      // HTML block parser. This is a hack to work around the terrible
      // hack that is the HTML block parser.
      result = result.replace(/\s+$/, '');
      var splRes = result.split(spl);
      splRes.shift();
      result = splitConsecutiveLists(splRes, listType);
      return result;
    });
  } else {
    wholeList = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
    //wholeList = /(\n\n|^\n?)( {0,3}([*+-]|\d+\.)[ \t]+[\s\S]+?)(?=(~0)|(\n\n(?!\t| {2,}| {0,3}([*+-]|\d+\.)[ \t])))/g;

    text = text.replace(wholeList, function (wholeMatch, m1, m2, m3) {

      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      var list = m2.replace(/\n{2,}/g, '\n\n\n'),
      //var list = (m2.slice(-2) !== '~0') ? m2 + '\n' : m2, //add a newline after the list
          listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol',
          result = processListItems(list),
          splRes = result.split(spl);

      splRes.shift();
      return m1 + splitConsecutiveLists(splRes, listType) + '\n';
    });
  }

  // attacklab: strip sentinel
  text = text.replace(/~0/, '');

  return text;
});
