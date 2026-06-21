////
// makehtml/hashHTMLBlocks.js
// Copyright (c) 2018 ShowdownJS
//
// Hash HTML blocks
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.hashHTMLBlocks', function (text, options, globals, sourceMode) {
  'use strict';
  let startEvent = new showdown.Event('makehtml.hashHTMLBlocks.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  let blockTags = [
        'pre',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'table',
        'dl',
        'ol',
        'ul',
        'script',
        'noscript',
        'form',
        'fieldset',
        'iframe',
        'math',
        'style',
        'section',
        'header',
        'footer',
        'nav',
        'article',
        'aside',
        'address',
        'audio',
        'canvas',
        'figure',
        'hgroup',
        'output',
        'video',
        'details',
        'p'
      ],
      repFunc = function (wholeMatch, match, left, right) {
        let txt = wholeMatch;
        // check if this html element is marked as markdown
        // if so, it's contents should be parsed as markdown
        if (left.search(/\bmarkdown\b/) !== -1) {
          txt = left + globals.converter.makeHtml(match) + right;
        }
        return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
      };

  if (options.backslashEscapesHTMLTags) {
    // encode backslash escaped HTML tags
    text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
      return '&lt;' + inside + '&gt;';
    });
  }

  // The CommonMark block scanner only applies to the original Markdown source
  // (the converter-level pass). blockGamut re-invokes this subparser on the markup
  // it has just generated to prevent <p>-wrapping; there the existing balanced-tag
  // hashing is correct (and must not over-consume generated block tags).
  if (options.cmSpec && sourceMode) {
    text = parseCmHTMLBlocks(text);

    let cmAfterEvent = new showdown.Event('makehtml.hashHTMLBlocks.onEnd', text);
    cmAfterEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    cmAfterEvent = globals.converter.dispatch(cmAfterEvent);
    return cmAfterEvent.output;
  }

  // hash HTML Blocks
  for (let i = 0; i < blockTags.length; ++i) {

    let opTagPos,
        rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
        patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
        patRight = '</' + blockTags[i] + '>';
    // 1. Look for the first position of the first opening HTML tag in the text
    while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {

      // if the HTML tag is \ escaped, we need to escape it and break


      //2. Split the text in that position
      let subTexts = showdown.helper.splitAtIndex(text, opTagPos),
          //3. Match recursively
          newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');

      // prevent an infinite loop
      if (newSubText1 === subTexts[1]) {
        break;
      }
      text = subTexts[0].concat(newSubText1);
    }
  }
  // HR SPECIAL CASE
  text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
    showdown.subParser('makehtml.hashElement')(text, options, globals));

  // Special case for standalone HTML comments
  // A comment is terminated by either `-->` or `--!>` (the HTML "comment end
  // bang" state). Matching only `-->` lets content an author believes is
  // commented-out leak through to the browser as live HTML (js/bad-tag-filter).
  text = showdown.helper.replaceRecursiveRegExp(text, function (txt) {
    return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
  }, '^ {0,3}<!--', '--!?>', 'gm');

  // PHP and ASP-style processor instructions (<?...?> and <%...%>)
  text = text.replace(/\n\n( {0,3}<([?%])[^\r]*?\2>[ \t]*(?=\n{2,}))/g,
    showdown.subParser('makehtml.hashElement')(text, options, globals));

  let afterEvent = new showdown.Event('makehtml.hashHTMLBlocks.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;

  /**
   * CommonMark HTML blocks (spec section 4.6): a line-based scanner implementing the
   * 7 block types, each with its own start and end condition. Block content is hashed
   * verbatim (not parsed as Markdown). Types 1-6 may interrupt a paragraph; type 7
   * may only start at a block boundary (document start or after a blank line).
   * @param {string} str
   * @returns {string}
   */
  function parseCmHTMLBlocks (str) {
    const blockNames = 'address|article|aside|base|basefont|blockquote|body|caption|' +
      'center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|' +
      'footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|' +
      'li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|' +
      'summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul';

    let type1Start = /^ {0,3}<(?:script|pre|style|textarea)(?:[ \t>]|$)/i,
        type1End   = /<\/(?:script|pre|style|textarea)>/i,
        type2Start = /^ {0,3}<!--/,
        type2End   = /-->/,
        type3Start = /^ {0,3}<\?/,
        type3End   = /\?>/,
        type4Start = /^ {0,3}<![A-Za-z]/,
        type4End   = />/,
        type5Start = /^ {0,3}<!\[CDATA\[/,
        type5End   = /]]>/,
        type6Start = new RegExp('^ {0,3}</?(?:' + blockNames + ')(?:[ \\t/>]|$)', 'i'),
        type7Start = new RegExp('^ {0,3}(?:' + showdown.helper.regexes.cmOpenTagSource + '|' +
                      showdown.helper.regexes.cmCloseTagSource + ')[ \\t]*$'),
        isBlank    = /^[ \t]*$/;

    function startType (line, prevBlank) {
      if (type1Start.test(line)) { return 1; }
      if (type2Start.test(line)) { return 2; }
      if (type3Start.test(line)) { return 3; }
      if (type5Start.test(line)) { return 5; }
      if (type4Start.test(line)) { return 4; }
      if (type6Start.test(line)) { return 6; }
      // type 7 cannot interrupt a paragraph
      if (prevBlank && type7Start.test(line)) { return 7; }
      return 0;
    }

    // a fenced-code opener (mirrors githubCodeBlock: an info string carries no backtick,
    // tilde or tab). A fenced code block takes precedence over an HTML block start, so its
    // interior lines must not be scanned for HTML block starts.
    let fenceOpen = /^ {0,3}(```+|~~~+) *[^`~\t]*$/;

    let lines = str.split('\n'),
        out = [],
        i = 0,
        prevBlank = true; // document start behaves like "after a blank line"

    while (i < lines.length) {
      let type = startType(lines[i], prevBlank);
      if (type === 0) {
        let fence = lines[i].match(fenceOpen);
        if (fence) {
          // consume the whole fenced region verbatim (closing fence inclusive, or EOF) so
          // an HTML-block-like line inside the fence cannot open an HTML block. The fence
          // itself is hashed later by githubCodeBlock.
          let closeRe = new RegExp('^ {0,3}[' + fence[1][0] + ']{' + fence[1].length + ',}[ \\t]*$');
          out.push(lines[i]);
          i++;
          while (i < lines.length) {
            out.push(lines[i]);
            if (closeRe.test(lines[i])) { i++; break; }
            i++;
          }
          prevBlank = false;
          continue;
        }
        out.push(lines[i]);
        prevBlank = isBlank.test(lines[i]);
        i++;
        continue;
      }

      let blockLines = [];
      if (type >= 1 && type <= 5) {
        // ends on (and includes) the line matching the end condition; may be the
        // start line itself
        let endRe = [null, type1End, type2End, type3End, type4End, type5End][type];
        while (i < lines.length) {
          let l = lines[i];
          blockLines.push(l);
          i++;
          if (endRe.test(l)) { break; }
        }
      } else {
        // types 6 and 7 end before the first following blank line (or at EOF)
        while (i < lines.length && !isBlank.test(lines[i])) {
          blockLines.push(lines[i]);
          i++;
        }
      }

      // wrap the placeholder in blank lines so later block parsing treats it as its
      // own block. A CommonMark HTML block is raw verbatim source: its content (including
      // any entities) must NOT be decoded, so it gets a distinct `¨R` marker and a separate
      // store, and is restored late - after decodeEntities - rather than being unhashed in
      // paragraphs like generated `¨K`/`¨G` blocks (which legitimately decode).
      out.push('\n¨R' + (globals.gHtmlRawBlocks.push(blockLines.join('\n')) - 1) + 'R\n');
      prevBlank = false;
    }

    return out.join('\n');
  }
});
