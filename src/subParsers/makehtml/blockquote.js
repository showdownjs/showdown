/**
 * @file      makehtml/blockquote.js
 * @summary   Converts `>`-prefixed Markdown blockquotes into `<blockquote>` blocks.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes email-style blockquote syntax, recursing through `blockGamut` for inner content, and
 * has a separate cmSpec container parser (`parseCmBlockquotes`); guards against pathological nesting
 * (bails past depth 25). Emits the `makehtml.blockquote.*` event family.
 */


showdown.subParser('makehtml.blockquote', function (text, options, globals) {
  'use strict';

  // Pathologically nested block quotes (e.g. `> > > …` thousands deep) recurse once per
  // level through blockGamut, which exhausts the call stack in the default path and blows
  // up super-linearly under cmSpec. Refuse to descend past a sane nesting depth; beyond it
  // the surplus `>` markers simply render as literal text. The deepest nesting in the whole
  // test corpus is 3, so this bound never affects real documents.
  const maxNestingDepth = 25;
  if ((globals.blockquoteDepth || 0) >= maxNestingDepth) {
    return text;
  }

  let startEvent = showdown.Event.dispatchStart('makehtml.blockquote.onStart', text, options, globals);
  text = startEvent.output;

  text = parseBlockquotes(text);

  let afterEvent = showdown.Event.dispatchEnd('makehtml.blockquote.onEnd', text, options, globals);
  return afterEvent.output;

  /**
   * Render one block quote's already-stripped content into a hashed
   * `<blockquote>` element, dispatching the capture/hash lifecycle events.
   * @param {string} bq the block-quote content with markers already removed
   * @param {string} wholeMatch the original matched text (for the capture event)
   * @param {RegExp|null} pattern the matching pattern (event metadata only)
   * @returns {string}
   */
  function renderBlockquote (bq, wholeMatch, pattern) {
    let otp,
        attributes;

    let captureStartEvent = showdown.Event.dispatchCapture('makehtml.blockquote.onCapture', bq, {
      regexp: pattern || null,
      matches: {
        _wholeMatch: wholeMatch,
        text: bq
      },
      attributes: {}
    }, options, globals);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;

    } else {
      bq = captureStartEvent.matches.text;
      bq = showdown.subParser('makehtml.githubCodeBlock')(bq, options, globals);
      // Run the source-level leaf-block passes on the quote's own (marker-stripped)
      // content, mirroring the converter pipeline, so an HTML block or a link reference
      // definition nested inside the block quote is recognized in the quote's context
      // instead of only at the top level (spec-silent → CommonMark, so this runs for
      // every flavor).
      bq = showdown.subParser('makehtml.htmlBlock')(bq, options, globals);
      bq = showdown.subParser('makehtml.stripLinkDefinitions')(bq, options, globals);
      globals.blockquoteDepth = (globals.blockquoteDepth || 0) + 1;
      bq = showdown.subParser('makehtml.blockEngine')(bq, options, globals); // recurse
      bq = showdown.subParser('makehtml.paragraphs')(bq, options, globals);
      globals.blockquoteDepth--;
      bq = bq.replace(/(^|\n)/g, '$1  ');
      // These leading spaces screw with <pre> content, so we need to fix that:
      bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wm, m1) {
        return m1.replace(/^ {2}/mg, '');
      });
      attributes = captureStartEvent.attributes;
      otp = '<blockquote' + showdown.helper._populateAttributes(attributes) + '>\n' +  bq + '\n</blockquote>';
    }

    let beforeHashEvent = showdown.Event.dispatchHash('makehtml.blockquote.onHash', otp, options, globals);
    otp = beforeHashEvent.output;
    return showdown.helper.hashBlock(otp, options, globals);
  }

  /**
   * The one block-quote container scanner for every flavor (based on CommonMark spec
   * section 5.1). Scans line by line: a block quote begins on a `^ {0,3}>` line (an
   * optional single space after `>` is stripped) and consumes consecutive `>`-marked
   * lines plus lazy continuation lines. Two flavor divergences are documented in the
   * specs and derived here, not forked into a second engine:
   *
   *   - **laziness** — CommonMark (`cmSpec`) allows only *paragraph* continuation lines
   *     to lazily continue (a markerless heading/fence/list/thematic-break ends the
   *     quote); Original/Showdown use *full* laziness — every markerless non-blank line
   *     continues the quote (original.md §"Blockquotes" / showdown.md §"Block quotes").
   *   - **splitting** — a blank line separates two adjacent block quotes when
   *     `cmSpec || splitAdjacentBlockquotes`; otherwise (Original/Showdown default) a
   *     blank line that is followed by another `>` block is absorbed, merging them into
   *     one quote (original.md's email-style merge-across-blank-lines).
   *
   * @param {string} str
   * @returns {string}
   */
  function parseBlockquotes (str) {
    let marker  = /^ {0,3}>/,
        isBlank = /^[ \t]*$/,
        lines   = str.split('\n'),
        out     = [],
        i       = 0,
        n       = lines.length,
        // Original/Showdown use full laziness; CommonMark only paragraph laziness
        fullLazy = !options.cmSpec,
        // CommonMark and the vanilla option both split adjacent quotes on a blank line
        split    = options.cmSpec || options.splitAdjacentBlockquotes;

    // a markerless line that can lazily continue a paragraph (paragraph-laziness only):
    // non-blank text that does not itself begin a block which would interrupt the paragraph
    function isLazyParagraph (line) {
      if (line.trim() === '') { return false; }
      return !(
        marker.test(line) ||                                // block quote
        /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line) ||             // ATX heading
        /^ {0,3}(?:```|~~~)/.test(line) ||                   // fenced code
        /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/.test(line) ||// thematic break
        /^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]/.test(line)       // list item
      );
    }

    // true if, after peeling nested block-quote/list markers, the innermost block
    // on this line is an open paragraph - so a following markerless line may lazily
    // continue it (laziness propagates through container nesting)
    function isParagraphLine (stripped) {
      let s = stripped,
          indentedCode = /^ {4}/.test(stripped),
          m;
      while ((m = s.match(/^ {0,3}>[ \t]?/) || s.match(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]/))) {
        s = s.slice(m[0].length);
        indentedCode = false; // leading spaces after a marker are container indent
      }
      if (s.trim() === '' || indentedCode) { return false; }
      return !(
        /^ {0,3}(?:```|~~~)/.test(s) ||
        /^ {0,3}#{1,6}(?:[ \t]|$)/.test(s) ||
        /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/.test(s)
      );
    }

    while (i < n) {
      if (!marker.test(lines[i])) {
        out.push(lines[i]);
        i++;
        continue;
      }
      let bqLines = [],
          prevParagraph = false;
      while (i < n) {
        let line = lines[i];
        if (marker.test(line)) {
          let stripped = line.replace(/^ {0,3}>[ \t]?/, '');
          bqLines.push(stripped);
          prevParagraph = fullLazy ? false : isParagraphLine(stripped);
          i++;
        } else if (isBlank.test(line)) {
          if (split) {
            break; // a blank line ends the quote
          }
          // merge mode: absorb a blank run only when another `>` block follows it
          let k = i;
          while (k < n && isBlank.test(lines[k])) { k++; }
          if (k < n && marker.test(lines[k])) {
            for (; i < k; i++) { bqLines.push(''); }
            prevParagraph = false;
          } else {
            break;
          }
        } else if (fullLazy || (prevParagraph && isLazyParagraph(line))) {
          // paragraph-laziness only (CommonMark): a setext underline may not be a lazy
          // continuation line. Escape the leading marker so the recursive setext parser
          // can't claim it as an underline; encodeBackslashEscapes restores the literal
          // `=`/`-` downstream. Under full laziness the underline is ordinary quote content.
          if (!fullLazy && /^ {0,3}(?:=+|-+)[ \t]*$/.test(line)) {
            line = line.replace(/^( {0,3})([=-])/, '$1\\$2');
          }
          bqLines.push(line);
          prevParagraph = fullLazy ? false : isParagraphLine(line);
          i++;
        } else {
          break; // non-continuing line ends the block quote
        }
      }
      // trailing newline so the recursive block parsers see a complete final line
      let content = bqLines.join('\n') + '\n';
      out.push(renderBlockquote(content, content, null));
    }
    return out.join('\n');
  }
});
