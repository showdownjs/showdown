/**
 * Form HTML ordered (numbered) and unordered (bulleted) lists.
 */
showdown.subParser('lists', function (text, options, globals) {
  'use strict';

  /**
   * Process the contents of a single ordered or unordered list, splitting it
   * into individual list items.
   * @param {string} listStr
   * @returns {string|*}
   */
  var processListItems = function (listStr) {
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

    /*
     list_str = list_str.replace(/
     (\n)?							// leading line = $1
     (^[ \t]*)						// leading whitespace = $2
     ([*+-]|\d+[.]) [ \t]+			// list marker = $3
     ([^\r]+?						// list item text   = $4
     (\n{1,2}))
     (?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
     /gm, function(){...});
     */
    listStr = listStr.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
                              function (wholeMatch, m1, m2, m3, m4) {
                                var item = showdown.subParser('outdent')(m4, options, globals);
                                //m1 - LeadingLine

                                if (m1 || (item.search(/\n{2,}/) > -1)) {
                                  item = showdown.subParser('blockGamut')(item, options, globals);
                                } else {
                                  // Recursion for sub-lists:
                                  item = showdown.subParser('lists')(item, options, globals);
                                  item = item.replace(/\n$/, ''); // chomp(item)
                                  item = showdown.subParser('spanGamut')(item, options, globals);
                                }

                                return '<li>' + item + '</li>\n';
                              });

    // attacklab: strip sentinel
    listStr = listStr.replace(/~0/g, '');

    globals.gListLevel--;
    return listStr;
  };

  // attacklab: add sentinel to hack around khtml/safari bug:
  // http://bugs.webkit.org/show_bug.cgi?id=11231
  text += '~0';

  // Re-usable pattern to match any entirel ul or ol list:

  /*
   var whole_list = /
   (									// $1 = whole list
   (								// $2
   [ ]{0,3}					// attacklab: g_tab_width - 1
   ([*+-]|\d+[.])				// $3 = first list item marker
   [ \t]+
   )
   [^\r]+?
   (								// $4
   ~0							// sentinel for workaround; should be $
   |
   \n{2,}
   (?=\S)
   (?!							// Negative lookahead for another list item marker
   [ \t]*
   (?:[*+-]|\d+[.])[ \t]+
   )
   )
   )/g
   */
  var wholeList = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

  if (globals.gListLevel) {
    text = text.replace(wholeList, function (wholeMatch, m1, m2) {
      var list = m1,
          listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';

      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      list = list.replace(/\n{2,}/g, '\n\n\n');

      var result = processListItems(list);

      // Trim any trailing whitespace, to put the closing `</$list_type>`
      // up on the preceding line, to get it past the current stupid
      // HTML block parser. This is a hack to work around the terrible
      // hack that is the HTML block parser.
      result = result.replace(/\s+$/, '');
      result = '<' + listType + '>' + result + '</' + listType + '>\n';
      return result;
    });
  } else {
    wholeList = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;

    text = text.replace(wholeList, function (wholeMatch, m1, m2, m3) {

      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      var list = m2.replace(/\n{2,}/g, '\n\n\n'),
          listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol',
          result = processListItems(list);

      return m1 + '<' + listType + '>\n' + result + '</' + listType + '>\n';
    });
  }

  // attacklab: strip sentinel
  text = text.replace(/~0/, '');

  return text;
});
