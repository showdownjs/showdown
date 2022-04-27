////
// makehtml/githubCodeBlock.js
// Copyright (c) 2018 ShowdownJS
//
// Handle github codeblocks prior to running HashHTML so that
// HTML contained within the codeblock gets escaped properly
// Example:
// ```ruby
// def hello_world(x)
//     puts "Hello, #{x}"
// end
// ```
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.githubCodeBlock', function (text, options, globals) {
  'use strict';

  // early exit if option is not enabled
  if (!options.ghCodeBlocks) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.githubCodeBlock.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output + '¨0';

  let pattern = /(?:^|\n) {0,3}(```+|~~~+) *([^\n\t`~]*)\n([\s\S]*?)\n {0,3}\1/g;

  text = text.replace(pattern, function (wholeMatch, delim, language, codeblock) {
    let end = (options.omitExtraWLInCodeBlocks) ? '' : '\n',
        otp,
        attributes = {
          pre: {},
          code: {},
        };

    let captureStartEvent = new showdown.Event('makehtml.githubCodeBlock.onCapture', codeblock);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _whoteMatch: wholeMatch,
        codeblock: codeblock,
        infostring: language
      })
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;

    } else {

      // First parse the github code block
      let infostring = captureStartEvent.matches.infostring;
      let lang = infostring.trim().split(' ')[0];
      codeblock = captureStartEvent.matches.codeblock;
      codeblock = showdown.subParser('makehtml.encodeCode')(codeblock, options, globals);
      codeblock = showdown.subParser('makehtml.detab')(codeblock, options, globals);
      codeblock = codeblock
        .replace(/^\n+/g, '')  // trim leading newlines
        .replace(/\n+$/g, ''); // trim trailing whitespace

      attributes = captureStartEvent.attributes;
      otp = '<pre><code>';
      if (!showdown.helper.isUndefined(attributes)) {
        otp = '<pre' + showdown.helper._populateAttributes(attributes.pre) + '>';

        // if the language has spaces followed by some other chars, according to the spec we should just ignore everything
        // after the first space
        if (infostring) {
          if (!attributes.code) {
            attributes.code = {};
          }
          if (!attributes.code.classes) {
            attributes.code.classes = [];
          }

          if (attributes.code.classes) {
            if (showdown.helper.isString(attributes.code.classes)) {
              attributes.code.classes += ' ' + lang + ' language-' + lang;
            } else if (showdown.helper.isArray(attributes.code.classes)) {
              attributes.code.classes.push(lang);
              attributes.code.classes.push('language-' + lang);
            }
          }
        }

        otp += '<code' + showdown.helper._populateAttributes(attributes.code) + '>';
      }
      if (options.omitExtraWLInCodeBlocks) {
        end = '';
      }
      otp += codeblock + end + '</code></pre>';
    }

    let beforeHashEvent = new showdown.Event('makehtml.githubCodeBlock.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    otp = showdown.subParser('makehtml.hashBlock')(otp, options, globals);

    // Since GHCodeblocks can be false positives, we need to
    // store the primitive text and the parsed text in a global var,
    // and then return a token
    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: otp}) - 1) + 'G\n\n';
  });

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = new showdown.Event('makehtml.githubCodeBlock.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
