////
// makehtml/links.js
// Copyright (c) 2018 ShowdownJS
//
// Transforms MD blockquotes into `<blockquote>` html entities
//
// Markdown uses email-style > characters for blockquoting.
// Markdown allows you to be lazy and only put the > before the first line of a hard-wrapped paragraph but
// it looks best if the text is hard wrapped with a > before every line.
//
// ***Author:***
// - Estevão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.blockQuotes', function (text, options, globals) {
  'use strict';

  //text = globals.converter._dispatch('makehtml.blockQuotes.before', text, options, globals).getText();
  text = globals.converter._dispatch('makehtml.blockQuotes.start', text, options, globals, {regexp: null, matches: null}).getText();

  // add a couple extra lines after the text and endtext mark
  text = text + '\n\n';

  var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

  if (options.splitAdjacentBlockquotes) {
    rgx = /^ {0,3}>[\s\S]*?\n\n/gm;
  }

  text = text.replace(rgx, function (bq) {
    // attacklab: hack around Konqueror 3.5.4 bug:
    // "----------bug".replace(/^-/g,"") == "bug"
    bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting
    // attacklab: clean up hack
    bq = bq.replace(/¨0/g, '');

    var params = {
      regexp: rgx,
      matches: {
        text: bq
      }
    };
    var captureStartEvent = globals.converter._dispatch('makehtml.blockQuotes.captureStart', text, options, globals, params);
    bq = captureStartEvent.getMatches().text;

    bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
    bq = showdown.subParser('makehtml.githubCodeBlocks')(bq, options, globals);
    bq = showdown.subParser('makehtml.blockGamut')(bq, options, globals); // recurse

    bq = bq.replace(/(^|\n)/g, '$1  ');
    // These leading spaces screw with <pre> content, so we need to fix that:
    bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
      var pre = m1;
      // attacklab: hack around Konqueror 3.5.4 bug:
      pre = pre.replace(/^ {2}/mg, '¨0');
      pre = pre.replace(/¨0/g, '');
      return pre;
    });



    return showdown.subParser('makehtml.hashBlock')('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
  });

  text = globals.converter._dispatch('makehtml.blockQuotes.after', text, options, globals).getText();
  return text;
});
