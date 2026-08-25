/**
 * @file      makehtml/inline/backslash.js
 * @summary   Backslash escapes (CommonMark spec §2.4).
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes a `\`-escape at the scan cursor: `\`+`¨D` is an escaped `$`, and any escapable
 * punctuation becomes an HTML-special literal or a Showdown escape placeholder. `\`+newline is NOT
 * an escape — it is the backslash spelling of a hard line break, owned by inline/hardLineBreak.js
 * (maintainer ruling): this handler deliberately declines it, the literal `\` lands in the text
 * node, and the newline's own trigger hands it to that construct's backward-looking arm. One owner,
 * one event family (`makehtml.hardLineBreak.*`) for every break spelling — and deletability holds
 * both ways (deleting THIS file keeps `\`+newline breaking; deleting hardLineBreak.js keeps
 * escapes working while `\`+newline degrades to literal text).
 *
 * Emits capture/hash per consumed escape (`makehtml.backslash.onCapture` / `.onHash`); the
 * onStart/onEnd lifecycle belongs to the inline engine. The event payload always presents the
 * user-facing source (`\$` / `$`), never an internal sentinel; a declined `\` emits nothing.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and
 * entity.js for the fuller scan-convention explanation). Deleting this file removes backslash
 * escaping and nothing else — every `\` becomes ordinary literal text.
 */

/* jshint esnext: false, esversion: 9 */

// Backslash-escapable set for the Showdown flavors (vanilla/original): the historic large
// escape set (the char class the retired encodeBackslashEscapes pass used). CommonMark
// (cmSpec) uses the wider isAsciiPunct instead (see inlineBackslashIsEscapable). File-level
// const; it is only tested (no lastIndex state), so reuse across invocations is safe.
const inlineBackslashEscapableRegex = /[!#%'()*+,\-./:;=?@[\]\\^_`{|}~]/;

// Gate 1 (backslash escapes, 2-way). CommonMark escapes all ASCII punctuation; the Showdown
// flavors escape the historic large set plus the shared HTML-special chars (& < > ") that the
// `\`-branch entity arm handles. The two sets coincide except for those special chars and `$`
// (pre-hashed to ¨D before inline parsing), so cmSpec output is byte-identical either way.
function inlineBackslashIsEscapable (ch, options) {
  if (ch === undefined) { return false; }
  if (options.cmSpec) { return showdown.helper.isAsciiPunct(ch); }
  return inlineBackslashEscapableRegex.test(ch) || ch === '&' || ch === '<' || ch === '>' || ch === '"';
}

showdown.subParser('makehtml.inline.backslash', {

  // Sole owner of `\` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: '\\',
  priority: 10,

  // Always on: cmSpec gates WHICH set of characters is escapable (see
  // inlineBackslashIsEscapable), not whether the construct participates, so it is an internal
  // gate of the handler below.
  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;
    let next = str.charAt(i + 1);

    // `\`+newline is the backslash spelling of a HARD LINE BREAK and is handled by the other
    // parser — inline/hardLineBreak.js's backward-looking arm (maintainer ruling; see the file
    // docblock). Decline it here: the literal `\` flows into the text node, and the newline's own
    // trigger dispatch strips it and emits the break.
    if (next === '\n') { return null; }

    // Classify the arm: wholeMatch/text are the event payload (always the user-facing source,
    // never an internal sentinel), otp is the default commit.
    let wholeMatch, text, otp, end;
    if (next === '¨' && str.charAt(i + 2) === 'D') {
      // escaped `$` (the converter hashes `$` to the `¨D` placeholder early)
      wholeMatch = '\\$'; text = '$'; otp = '¨D'; end = i + 3;
    } else if (inlineBackslashIsEscapable(next, options)) {
      // Emit ordinary escaped punctuation as a Showdown escape placeholder (¨E<code>E)
      // so the later passes (ghMentions, simplifiedAutoLink, emoji, strikethrough,
      // ellipsis, ...) don't treat the char as markup - e.g. `\@user` must not become a
      // mention. unescapeSpecialChars restores the literal char at the end of the
      // pipeline. HTML-special chars stay literal so the render-time escape
      // (showdown.helper.escapeHTMLEntities) turns them into entities
      // (&amp; &lt; &gt; &quot;); placeholders would otherwise round-trip to raw `<`/`&`.
      wholeMatch = '\\' + next; text = next; end = i + 2;
      otp = (next === '&' || next === '<' || next === '>' || next === '"') ? next : showdown.helper.escapePlaceholder(next);
    } else {
      // Decline: the char after `\` is not escapable. The engine falls through to its literal
      // handling — the `\` renders as ordinary text. A declined `\` emits nothing.
      return null;
    }

    let capture = showdown.Event.dispatchCapture('makehtml.backslash.onCapture', wholeMatch, {
      regexp: null,
      matches: {
        _wholeMatch: wholeMatch,
        text: text
      },
      attributes: {}
    }, options, globals);
    let raw = false;
    if (capture.output && capture.output !== '') {
      // listener-produced output takes precedence and flows raw to the later passes
      otp = capture.output; raw = true;
    } else if (capture.matches.text !== text) {
      // render the listener-edited text per the arm's rules: a single edited character is
      // re-classified — HTML-specials stay literal (escaped at render), anything else becomes
      // an escape placeholder. A multi-char edit has no single character to classify, so the
      // edit replaces the output directly.
      let c = capture.matches.text;
      if (c.length !== 1) {
        otp = c;
      } else {
        otp = (c === '&' || c === '<' || c === '>' || c === '"') ? c : showdown.helper.escapePlaceholder(c);
      }
    }
    let hash = showdown.Event.dispatchHash('makehtml.backslash.onHash', otp, options, globals);
    if (raw) {
      scan.appendRaw(hash.output);
    } else {
      scan.appendText(hash.output);
    }
    return end;
  }
});
