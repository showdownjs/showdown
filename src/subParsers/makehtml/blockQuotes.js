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

  let startEvent = new showdown.helper.Event('makehtml.blockQuotes.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  startEvent = globals.converter.dispatch(startEvent);

  text = startEvent.output;

  // add a couple extra lines after the text and endtext mark
  text = text + '\n\n';

  let pattern = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

  if (options.splitAdjacentBlockquotes) {
    pattern = /^ {0,3}>[\s\S]*?\n\n/gm;
  }

  text = text.replace(pattern, function (bq) {
    let otp,
        attributes = {};
    // attacklab: hack around Konqueror 3.5.4 bug:
    // "----------bug".replace(/^-/g,"") == "bug"
    bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting
    // attacklab: clean up hack
    bq = bq.replace(/¨0/g, '');
    bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines

    let captureStartEvent = new showdown.helper.Event('makehtml.blockQuotes.onCapture', bq);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        blockquote: bq
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;

    } else {
      bq = captureStartEvent.matches.blockquote;
      bq = showdown.subParser('makehtml.githubCodeBlocks')(bq, options, globals);
      bq = showdown.subParser('makehtml.blockGamut')(bq, options, globals); // recurse
      bq = bq.replace(/(^|\n)/g, '$1  ');
      // These leading spaces screw with <pre> content, so we need to fix that:
      bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
        let pre = m1;
        // attacklab: hack around Konqueror 3.5.4 bug:
        pre = pre.replace(/^ {2}/mg, '¨0');
        pre = pre.replace(/¨0/g, '');
        return pre;
      });
      attributes = captureStartEvent.attributes;
      otp = '<blockquote';
      for (let attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
          otp += ' ' + attr + '=' + attributes[attr];
        }
      }
      otp += '>\n' + bq + '\n</blockquote>';
    }

    let beforeHashEvent = new showdown.helper.Event('makehtml.blockQuotes.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);

    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);

    otp = beforeHashEvent.output;
    return showdown.subParser('makehtml.hashBlock')(otp, options, globals);
  });

  let afterEvent = new showdown.helper.Event('makehtml.blockQuotes.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  return afterEvent.output;
});
