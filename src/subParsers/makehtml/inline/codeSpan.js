/**
 * @file      makehtml/inline/codeSpan.js
 * @summary   Backtick-delimited inline code spans (`` `code` `` -> `<code>`).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes backtick code spans at the scan cursor, including multi-backtick delimiters and edge-space
 * trimming, and encodes the interior with `encodeCode` so its characters lose Markdown meaning.
 *
 * Emits capture/hash per resolved span (`makehtml.codeSpan.onCapture` / `.onHash`); for the scan form
 * the surrounding lifecycle belongs to the inline engine (`makehtml.inlineEngine.onStart/onEnd`), per
 * the event contract's two phase-set classes. The pass form below is a whole-text pass and therefore
 * emits its own `makehtml.codeSpan.onStart` / `.onEnd` around itself.
 *
 * This file owns BOTH entry points of the construct, one recognizer serving both:
 *   - `makehtml.inline.codeSpan` — the inline-engine definition object (the normal path), and
 *   - `makehtml.codeSpan`       — a classic whole-text pass, kept because table.js runs it over the
 *                                 raw table lines BEFORE splitting cells on `|`: a pipe inside a code
 *                                 span must not split a cell, so the spans have to be resolved (and
 *                                 hashed away) while the line is still one string. Routing both forms
 *                                 through the same matcher is what makes a table cell and a paragraph
 *                                 render a code span identically.
 *
 * The inline form registers a definition object under the `makehtml.inline.*` namespace and the inline
 * engine dispatches it (see inlineEngine.js for the contract, and entity.js for the fuller
 * scan-convention explanation). Deleting this file removes code spans and nothing else — every
 * backtick becomes ordinary literal text (and table cells would then split inside them).
 */

/* jshint esnext: false, esversion: 9 */

// Stateless testers / replacers used by the content-trimming gate below. `…NewlineRegex` carries the
// /g flag but is only ever handed to String.replace, which resets lastIndex, so reuse is safe.
const inlineCodeSpanNewlineRegex = /\n/g,
    inlineCodeSpanNonSpaceRegex = /[^ ]/,
    inlineCodeSpanLeadingSpaceRegex = /^[ \t]*/,
    inlineCodeSpanTrailingSpaceRegex = /[ \t]*$/;

// advance past a run of identical `ch` characters starting at `i`, returning the run end index
function inlineCodeSpanSkipRun (str, i, ch) {
  let j = i;
  while (j < str.length && str.charAt(j) === ch) { j++; }
  return j;
}

// The shared recognizer: try to resolve a code span whose opening backtick run starts at `i`.
// Returns {html, end} — html being the FINAL span HTML, which each caller hashes with its own
// hashing primitive — or null when this run length has no closer. `noCloser` is a per-invocation
// memo of run lengths already known to have no closer anywhere after here, so repeated opens of the
// same length fail immediately (a long unbroken backtick run would otherwise be quadratic).
function inlineCodeSpanParseBacktick (str, i, noCloser, options, globals) {
  let openEnd = inlineCodeSpanSkipRun(str, i, '`'),
      runLen = openEnd - i,
      n = str.length,
      j = openEnd;
  if (noCloser[runLen]) { return null; }
  // find a closing run of backticks of exactly runLen (not part of a longer run)
  while (j < n) {
    if (str.charAt(j) === '`') {
      let runStart = j,
          runEnd = inlineCodeSpanSkipRun(str, j, '`');
      if (runEnd - runStart === runLen) {
        let raw = str.slice(openEnd, runStart), content;
        // Gate 3 (code spans). cmSpec: collapse newlines to spaces, then strip exactly one
        // leading+trailing space (only when the content is not all spaces). Showdown flavors:
        // strip all leading/trailing spaces & tabs first (on the raw content, before collapsing
        // newlines), then collapse newlines. Both encode the interior with encodeCode (which
        // already encodes `"` -> `&quot;` for every flavor).
        if (options.cmSpec) {
          content = raw.replace(inlineCodeSpanNewlineRegex, ' ');
          if (content.length >= 2 && content.charAt(0) === ' ' && content.charAt(content.length - 1) === ' ' && inlineCodeSpanNonSpaceRegex.test(content)) {
            content = content.slice(1, -1);
          }
        } else {
          content = raw.replace(inlineCodeSpanLeadingSpaceRegex, '').replace(inlineCodeSpanTrailingSpaceRegex, '').replace(inlineCodeSpanNewlineRegex, ' ');
        }
        // matches.text is the trimmed span CONTENT; _wholeMatch is the source span including its
        // delimiters. regexp is null: one recognizer serves both forms, and no whole-text regex
        // drives either of them.
        let wholeMatch = str.slice(i, runEnd);
        let capture = showdown.Event.dispatchCapture('makehtml.codeSpan.onCapture', content, {
          regexp: null,
          matches: {_wholeMatch: wholeMatch, text: content},
          attributes: {}
        }, options, globals);
        let otp;
        if (capture.output && capture.output !== '') {
          // listener-produced output takes precedence and flows raw to the later passes
          otp = capture.output;
        } else {
          // honor a listener that rewrote matches.text: the (possibly edited) content is what gets
          // encoded and wrapped, so a rewrite still yields a well-formed, encoded code span.
          otp = '<code>' + showdown.helper.encodeCode(capture.matches.text) + '</code>';
        }
        let hash = showdown.Event.dispatchHash('makehtml.codeSpan.onHash', otp, options, globals);
        return {html: hash.output, end: runEnd};
      }
      j = runEnd;
    } else {
      j++;
    }
  }
  noCloser[runLen] = true; // no closer of this length anywhere after here
  return null;
}

showdown.subParser('makehtml.inline.codeSpan', {

  // Sole owner of `` ` `` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '`',
  priority: 10,

  // Always on: code spans are core Markdown syntax in every flavor. cmSpec gates HOW the interior is
  // trimmed (see the content gate above), not whether the construct participates.
  enabled: true,

  // Always consumes, never declines: the recognizer either builds the hashed `<code>` span, or — when
  // no closer exists — the whole backtick run is committed as literal text. The no-closer memo lives
  // on scan.memos so later opens of the same run length fail immediately.
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;
    let noCloser = scan.memos.backtickNoCloser || (scan.memos.backtickNoCloser = {});
    let res = inlineCodeSpanParseBacktick(str, i, noCloser, options, globals);
    if (res) {
      scan.appendRaw(scan.hashSpan(res.html));
      return res.end;
    }
    let e = inlineCodeSpanSkipRun(str, i, '`');
    scan.appendText(str.slice(i, e));
    return e;
  }
});

// The whole-text pass form (see the file header for why it exists). It walks the same recognizer with
// a cursor rather than a whole-text regex: the historical pattern
// (`(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)`) backtracked quadratically on a long unbroken backtick run,
// which table cells feed it straight from the document (~8s for 4k backticks in one cell).
showdown.subParser('makehtml.codeSpan', function (text, options, globals) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.codeSpan.onStart', text, options, globals);

  text = startEvent.output;

  if (showdown.helper.isUndefined((text))) {
    text = '';
  }

  let out = [],
      last = 0,
      i = 0,
      n = text.length,
      // per-invocation: table.js may run this pass twice over the same lines
      noCloser = {};

  while (i < n) {
    let ch = text.charAt(i);
    if (ch === '\\') {
      // an escaped character cannot open a span (what the old pattern's `[^\\]` lead-in guarded)
      i += 2;
      continue;
    }
    if (ch !== '`') {
      i++;
      continue;
    }
    let res = inlineCodeSpanParseBacktick(text, i, noCloser, options, globals);
    if (res) {
      out.push(text.slice(last, i), showdown.helper._hashHTMLSpan(res.html, globals));
      last = res.end;
      i = res.end;
    } else {
      // no closer for this run length: emit it literally and keep scanning
      i = inlineCodeSpanSkipRun(text, i, '`');
    }
  }
  out.push(text.slice(last));
  text = out.join('');

  let afterEvent = showdown.Event.dispatchEnd('makehtml.codeSpan.onEnd', text, options, globals);
  return afterEvent.output;
});
