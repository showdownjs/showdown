////
// makehtml/codeBlocks.js
// Copyright (c) 2022 ShowdownJS
//
// Process Markdown `<pre><code>` blocks.
//
// ***Author:***
// - Estevão Soares dos Santos (Tivie) <https://github.com/tivie>
////

/**
 * Process Markdown `<pre><code>` blocks.
 */
showdown.subParser('makehtml.codeBlocks', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.helper.Event('makehtml.codeBlocks.before', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  text = globals.converter.dispatch(startEvent).output;

  // sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  let pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
  text = text.replace(pattern, function (wholeMatch, m1, m2) {
    let codeblock = m1,
        nextChar = m2,
        end = '\n';

    let captureStartEvent = new showdown.helper.Event('makehtml.codeBlocks.captureStart', codeblock);
    captureStartEvent
      .setOutput('')
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        codeblock: codeblock
      });
    codeblock = globals.converter.dispatch(captureStartEvent).matches.codeblock;

    codeblock = showdown.subParser('makehtml.outdent')(codeblock, options, globals);
    codeblock = showdown.subParser('makehtml.encodeCode')(codeblock, options, globals);
    codeblock = showdown.subParser('makehtml.detab')(codeblock, options, globals);
    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

    if (options.omitExtraWLInCodeBlocks) {
      end = '';
    }

    let captureEndEvent = new showdown.helper.Event('makehtml.codeBlocks.captureEnd', codeblock);
    captureEndEvent
      .setOutput(codeblock)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        codeblock: codeblock
      })
      .setAttributes({
        pre: {},
        code: {}
      });
    captureEndEvent = globals.converter.dispatch(captureEndEvent);
    codeblock = captureEndEvent.output;
    let attributes = captureEndEvent.attributes;
    let otp = '<pre><code>';
    if (!showdown.helper.isUndefined(attributes)) {

      otp = '<pre';
      if (!showdown.helper.isUndefined(attributes.pre)) {
        for (let preAttr in attributes.pre) {
          if (attributes.hasOwnProperty(preAttr)) {
            otp += ' ' + preAttr + '=' + attributes[preAttr];
          }
        }
      }

      otp += '><code';
      if (!showdown.helper.isUndefined(attributes.code)) {
        for (let codeAttr in attributes.code) {
          if (attributes.hasOwnProperty(codeAttr)) {
            otp += ' ' + codeAttr + '=' + attributes[codeAttr];
          }
        }
      }
      otp += '>';
    }

    otp += codeblock + end + '</code></pre>';

    let beforeHashEvent = new showdown.helper.Event('makehtml.codeBlocks.beforeHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);

    otp = beforeHashEvent.output;
    return showdown.subParser('makehtml.hashBlock')(otp, options, globals) + nextChar;
  });

  // strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = new showdown.helper.Event('makehtml.codeBlocks.after', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  return afterEvent.output;
});
