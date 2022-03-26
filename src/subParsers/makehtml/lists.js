/**
 * Form HTML ordered (numbered) and unordered (bulleted) lists.
 */
showdown.subParser('makehtml.lists', function (text, options, globals) {
  'use strict';

  /**
   * Process the contents of a single ordered or unordered list, splitting it
   * into individual list items.
   * @param {string} listStr
   * @param {boolean} trimTrailing
   * @returns {string}
   */
  function processListItems (listStr, trimTrailing) {
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
    listStr += '¨0';

    var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[([xX ])])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
        isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

    // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
    // which is a syntax breaking change
    // activating this option reverts to old behavior
    // This will be removed in version 2.0
    if (options.disableForced4SpacesIndentedSublists) {
      rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[([xX ])])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
    }

    listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
      checked = (checked && checked.trim() !== '');

      var item = showdown.subParser('makehtml.outdent')(m4, options, globals),
          bulletStyle = '';

      // Support for github tasklists
      if (taskbtn && options.tasklists) {

        // Style used for tasklist bullets
        bulletStyle = ' class="task-list-item';
        if (options.moreStyling) {bulletStyle +=  checked ? ' task-list-item-complete' : '';}
        bulletStyle += '" style="list-style-type: none;"';

        item = item.replace(/^[ \t]*\[([xX ])?]/m, function () {
          var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
          if (checked) {
            otp += ' checked';
          }
          otp += '>';
          return otp;
        });
      }

      // ISSUE #312
      // This input: - - - a
      // causes trouble to the parser, since it interprets it as:
      // <ul><li><li><li>a</li></li></li></ul>
      // instead of:
      // <ul><li>- - a</li></ul>
      // So, to prevent it, we will put a marker (¨A)in the beginning of the line
      // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
      item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
        return '¨A' + wm2;
      });

      // SPECIAL CASE: a heading followed by a paragraph of text that is not separated by a double newline
      // or/nor indented. ex:
      //
      // - # foo
      // bar is great
      //
      // While this does now follow the spec per se, not allowing for this might cause confusion since
      // header blocks don't need double-newlines after
      if (/^#+.+\n.+/.test(item)) {
        item = item.replace(/^(#+.+)$/m, '$1\n');
      }

      // m1 - Leading line or
      // Has a double return (multi paragraph)
      if (m1 || (item.search(/\n{2,}/) > -1)) {
        item = showdown.subParser('makehtml.githubCodeBlocks')(item, options, globals);
        item = showdown.subParser('makehtml.blockQuotes')(item, options, globals);
        item = showdown.subParser('makehtml.headers')(item, options, globals);
        item = showdown.subParser('makehtml.lists')(item, options, globals);
        item = showdown.subParser('makehtml.codeBlocks')(item, options, globals);
        item = showdown.subParser('makehtml.tables')(item, options, globals);
        item = showdown.subParser('makehtml.hashHTMLBlocks')(item, options, globals);
        //item = showdown.subParser('makehtml.paragraphs')(item, options, globals);

        // TODO: This is a copy of the paragraph parser
        // This is a provisory fix for issue #494
        // For a permanente fix we need to rewrite the paragraph parser, passing the unhashify logic outside
        // so that we can call the paragraph parser without accidently unashifying previously parsed blocks

        // Strip leading and trailing lines:
        item = item.replace(/^\n+/g, '');
        item = item.replace(/\n+$/g, '');

        var grafs = item.split(/\n{2,}/g),
            grafsOut = [],
            end = grafs.length; // Wrap <p> tags

        for (var i = 0; i < end; i++) {
          var str = grafs[i];
          // if this is an HTML marker, copy it
          if (str.search(/¨([KG])(\d+)\1/g) >= 0) {
            grafsOut.push(str);

            // test for presence of characters to prevent empty lines being parsed
            // as paragraphs (resulting in undesired extra empty paragraphs)
          } else if (str.search(/\S/) >= 0) {
            str = showdown.subParser('makehtml.spanGamut')(str, options, globals);
            str = str.replace(/^([ \t]*)/g, '<p>');
            str += '</p>';
            grafsOut.push(str);
          }
        }
        item = grafsOut.join('\n');
        // Strip leading and trailing lines:
        item = item.replace(/^\n+/g, '');
        item = item.replace(/\n+$/g, '');

      } else {

        // Recursion for sub-lists:
        item = showdown.subParser('makehtml.lists')(item, options, globals);
        item = item.replace(/\n$/, ''); // chomp(item)
        item = showdown.subParser('makehtml.hashHTMLBlocks')(item, options, globals);

        // Colapse double linebreaks
        item = item.replace(/\n\n+/g, '\n\n');

        if (isParagraphed) {
          item = showdown.subParser('makehtml.paragraphs')(item, options, globals);
        } else {
          item = showdown.subParser('makehtml.spanGamut')(item, options, globals);
        }
      }

      // now we need to remove the marker (¨A)
      item = item.replace('¨A', '');
      // we can finally wrap the line in list item tags
      item =  '<li' + bulletStyle + '>' + item + '</li>\n';

      return item;
    });

    // attacklab: strip sentinel
    listStr = listStr.replace(/¨0/g, '');

    globals.gListLevel--;

    if (trimTrailing) {
      listStr = listStr.replace(/\s+$/, '');
    }

    return listStr;
  }

  function styleStartNumber (list, listType) {
    // check if ol and starts by a number different than 1
    if (listType === 'ol') {
      var res = list.match(/^ *(\d+)\./);
      if (res && res[1] !== '1') {
        return ' start="' + res[1] + '"';
      }
    }
    return '';
  }

  /**
   * Check and parse consecutive lists (better fix for issue #142)
   * @param {string} list
   * @param {string} listType
   * @param {boolean} trimTrailing
   * @returns {string}
   */
  function parseConsecutiveLists (list, listType, trimTrailing) {
    // check if we caught 2 or more consecutive lists by mistake
    // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
    var olRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
        ulRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
        counterRxg = (listType === 'ul') ? olRgx : ulRgx,
        result = '';

    if (list.search(counterRxg) !== -1) {
      (function parseCL (txt) {
        var pos = txt.search(counterRxg),
            style = styleStartNumber(list, listType);
        if (pos !== -1) {
          // slice
          result += '\n\n<' + listType + style + '>\n' + processListItems(txt.slice(0, pos), !!trimTrailing) + '</' + listType + '>\n';

          // invert counterType and listType
          listType = (listType === 'ul') ? 'ol' : 'ul';
          counterRxg = (listType === 'ul') ? olRgx : ulRgx;

          //recurse
          parseCL(txt.slice(pos));
        } else {
          result += '\n\n<' + listType + style + '>\n' + processListItems(txt, !!trimTrailing) + '</' + listType + '>\n';
        }
      })(list);
    } else {
      var style = styleStartNumber(list, listType);
      result = '\n\n<' + listType + style + '>\n' + processListItems(list, !!trimTrailing) + '</' + listType + '>\n';
    }

    return result;
  }

  // Start of list parsing
  var subListRgx = /^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
  var mainListRgx = /(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

  text = globals.converter._dispatch('lists.before', text, options, globals).getText();
  // add sentinel to hack around khtml/safari bug:
  // http://bugs.webkit.org/show_bug.cgi?id=11231
  text += '¨0';

  if (globals.gListLevel) {
    text = text.replace(subListRgx, function (wholeMatch, list, m2) {
      var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
      return parseConsecutiveLists(list, listType, true);
    });
  } else {
    text = text.replace(mainListRgx, function (wholeMatch, m1, list, m3) {
      var listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
      return parseConsecutiveLists(list, listType, false);
    });
  }

  // strip sentinel
  text = text.replace(/¨0/, '');
  text = globals.converter._dispatch('makehtml.lists.after', text, options, globals).getText();
  return text;
});
