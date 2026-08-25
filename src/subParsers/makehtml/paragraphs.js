/**
 * @file      makehtml/paragraphs.js
 * @summary   Wraps blank-line-separated blocks of text in `<p>` tags and restores hashed HTML/code placeholders.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Splits on `\n{2,}`, passes non-hash grafs through the inline engine and re-emits hashed HTML block/span
 * placeholders untouched. Emits one `onCapture`/`onHash` per paragraph with `regexp: null` (a legal
 * value — paragraphs are found by split, not regex); `matches.text` is mutable and honored, and
 * `attributes` apply to the `<p>`.
 */
showdown.subParser('makehtml.paragraphs', function (text, options, globals) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.paragraphs.onStart', text, options, globals);
  text = startEvent.output;

  // Strip leading and trailing lines:
  text = text.replace(/^\n+/g, '');
  text = text.replace(/\n+$/g, '');

  let grafs = text.split(/\n{2,}/g),
      grafsOut = [],
      end = grafs.length; // Wrap <p> tags

  for (let i = 0; i < end; i++) {
    let str = grafs[i];
    // if this is an HTML marker, copy it verbatim (do not <p>-wrap): ¨K/¨G/¨M restore below,
    // in this pass; ¨R = a raw HTML block deferred past decodeEntities and restored later.
    // (¨K = generated block markup; ¨M = a markdown="1"-processed HTML block.)
    if (str.search(/¨([KGRM])(\d+)\1/g) >= 0) {
      grafsOut.push(str);

    // test for presence of characters to prevent empty lines being parsed
    // as paragraphs (resulting in undesired extra empty paragraphs)
    } else if (str.search(/\S/) >= 0) {
      // per-paragraph capture: the graf's Markdown is the main content (`text`, mutable +
      // honored); `attributes` are applied to the generated `<p>`. A line-based split, so
      // regexp is null (a legal value per the event contract). A listener may override output.
      let otp;
      let captureStartEvent = showdown.Event.dispatchCapture('makehtml.paragraphs.onCapture', str, {
        regexp: null,
        matches: {
          _wholeMatch: str,
          text: str
        },
        attributes: {}
      }, options, globals);
      if (captureStartEvent.output && captureStartEvent.output !== '') {
        otp = captureStartEvent.output;
      } else {
        let graf = showdown.subParser('makehtml.inlineEngine')(captureStartEvent.matches.text, options, globals);
        graf = graf.replace(/^([ \t]*)/g, '<p' + showdown.helper._populateAttributes(captureStartEvent.attributes) + '>');
        graf += '</p>';
        otp = graf;
      }
      let beforeHashEvent = showdown.Event.dispatchHash('makehtml.paragraphs.onHash', otp, options, globals);
      grafsOut.push(beforeHashEvent.output);
    }
  }

  /** Unhashify HTML blocks */
  end = grafsOut.length;
  for (let i = 0; i < end; i++) {
    let blockText,
        grafsOutIt = grafsOut[i],
        codeFlag = false;
    // if this is a marker for an html block...
    let blockMatch;
    // Restores the three early-restore stores: ¨K (generated block markup, hashHTMLBlocks/
    // hashBlock), ¨G (githubCodeBlock code) and ¨M (markdown="1"-processed HTML blocks, htmlBlock).
    // ¨R (raw source blocks) is deliberately NOT restored here — it is deferred past decodeEntities
    // and restored late in the converter so its entities stay verbatim.
    while ((blockMatch = /¨([KGM])(\d+)\1/.exec(grafsOutIt)) !== null) {
      let delim = blockMatch[1],
          num   = blockMatch[2];

      if (delim === 'K') {
        blockText = globals.gHtmlBlocks[num];
      } else if (delim === 'M') {
        // a markdown="1"-processed HTML block; restored early here like ¨K, but from its own
        // gHtmlMdBlocks store.
        blockText = globals.gHtmlMdBlocks[num];
      } else {
        // we need to check if ghBlock is a false positive
        if (codeFlag) {
          // use encoded version of all text
          blockText = showdown.helper.encodeCode(globals.ghCodeBlocks[num].text);
        } else {
          blockText = globals.ghCodeBlocks[num].codeblock;
        }
      }
      blockText = blockText.replace(/\$/g, '$$$$'); // Escape any dollar signs

      grafsOutIt = grafsOutIt.replace(/(\n\n)?¨([KGM])\d+\2(\n\n)?/, blockText);
      // Check if grafsOutIt is a pre->code
      if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
        codeFlag = true;
      }
    }
    grafsOut[i] = grafsOutIt;
  }
  text = grafsOut.join('\n');
  // Strip leading and trailing lines:
  text = text.replace(/^\n+/g, '');
  text = text.replace(/\n+$/g, '');

  let afterEvent = showdown.Event.dispatchEnd('makehtml.paragraphs.onEnd', text, options, globals);
  return afterEvent.output;
});
