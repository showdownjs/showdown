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


showdown.subParser('makehtml.githubCodeBlock', function (text, options, globals, topLevelOnly) {
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

  // In CommonMark container mode the converter-level pass restricts the *opening* fence to
  // indent 0; indent 1-3 opening fences are owned by the container parsers (a list item's /
  // block quote's own fence) or handled by a later blockGamut pass for true top-level ones.
  // This stops an item's indented opening/closing fence from being mistaken for a new
  // top-level opening fence. The closing fence keeps its 0-3 indent allowance either way.
  const open = topLevelOnly ? '' : ' {0,3}';
  //const accentRegex = /(?:^|\n) {0,3}(```+|~~~+) *([^\n\t`~]*)\n([\s\S]*?)(?:(\n {0,3}\1[`~]*)|¨0)/g;
  // The info string is the rest of the opening line. CommonMark forbids backticks only in a
  // *backtick* fence's info string (a tilde fence may contain backticks and tildes); that
  // restriction is enforced in parse() since it needs to know the fence type. The `(?!`)` /
  // `(?!~)` lookaheads keep the opening fence maximal: without them the now-permissive info
  // class lets the delimiter backtrack (e.g. `~~~~~~` splitting into a `~~~` fence + `~~~`
  // info), inventing a spurious shorter fence.
  const fence = '(```+(?!`)|~~~+(?!~))';
  const closedBlockRegex   = new RegExp('^' + open + fence + ' *([^\\n]*)\\n([\\s\\S]*?)\\n {0,3}\\1[`~]*', 'gm');
  const unclosedBlockRegex = new RegExp('^' + open + fence + ' *([^\\n]*)\\n([\\s\\S]*?)¨0', 'gm');
  const emptyBlockRegex    = new RegExp('^' + open + fence + ' *([^\\n]*)\\n {0,3}\\1[`~]*', 'gm');

  text = text.replace(closedBlockRegex, function (wholeMatch, delim, language, codeblock) {
    return parse(closedBlockRegex, wholeMatch, delim, language, codeblock);
  });

  text = text.replace(emptyBlockRegex, function (wholeMatch, delim, language) {
    return parse(emptyBlockRegex, wholeMatch, delim, language, '');
  });

  // In topLevelOnly mode, skip the unclosed (run-to-EOF) pass: a genuine indent-0 opener
  // pairs via the closed/empty passes above, whereas a lone indent-0 *closing* fence of an
  // indent 1-3 top-level block would otherwise be mistaken for an opener and swallow the
  // rest of the document. Such an indented top-level fence (and any truly unclosed one) is
  // handled by the 0-3 blockGamut pass that runs after the container parsers.
  if (!topLevelOnly) {
    text = text.replace(unclosedBlockRegex, function (wholeMatch, delim, language, codeblock) {
      return parse(unclosedBlockRegex, wholeMatch, delim, language, codeblock);
    });
  }

  // attacklab: strip sentinel
  text = text.replace(/¨0/, '');

  let afterEvent = new showdown.Event('makehtml.githubCodeBlock.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;


  function parse (pattern, wholeMatch, delim, language, codeblock) {
    // CommonMark: a backtick info string may not contain backticks (tilde fences may). When it
    // does, this is not a code block, so leave the text for inline/paragraph parsing.
    if (delim.charAt(0) === '`' && language.indexOf('`') !== -1) {
      return wholeMatch;
    }
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
      // CommonMark resolves backslash escapes of ASCII punctuation in the info string
      if (options.decodeEntities) {
        lang = lang.replace(/\\([!-\/:-@\[-`{-~])/g, '$1');
      }
      codeblock = captureStartEvent.matches.codeblock;
      codeblock = showdown.subParser('makehtml.encodeCode')(codeblock, options, globals);
      //codeblock = showdown.subParser('makehtml.detab')(codeblock, options, globals);
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
  }


});
