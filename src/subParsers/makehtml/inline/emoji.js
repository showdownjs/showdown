/**
 * @file      makehtml/inline/emoji.js
 * @summary   Emoji shortcodes: `:code:` becomes the emoji glyph (or image), gated by the `emoji` option.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes a `:shortcode:` at the scan cursor and looks it up in `showdown.helper.emojis`, leaving
 * unknown codes untouched. See https://github.com/showdownjs/showdown/wiki/Emojis for the supported
 * set.
 *
 * Emits capture/hash per substituted shortcode (`makehtml.emoji.onCapture` / `.onHash`); the
 * onStart/onEnd lifecycle belongs to the inline engine (`makehtml.inlineEngine.onStart/onEnd`), per
 * the event contract's two phase-set classes. A declined `:` emits nothing. Because the scan resolves
 * `:name:` before link/image bracket resolution and before emphasis/strikethrough pairing, the
 * substitution applies inside resolving link/image labels and spans for every flavor (the former
 * cmSpec literal-label behavior was a pipeline artifact of running after link hashing, not a rule).
 * `:name:` inside a code span is already protected — the backtick construct consumes it first.
 *
 * This is an inline construct: it registers a definition object under the `makehtml.inline.*`
 * namespace and the inline engine dispatches it (see inlineEngine.js for the contract, and entity.js
 * for the fuller scan-convention explanation). Deleting this file removes emoji shortcodes and
 * nothing else — every `:` becomes ordinary literal text.
 */

/* jshint esnext: false, esversion: 9 */

// Stateless testers (no /g, no /y, so no lastIndex to carry between calls): reuse is safe.
const inlineEmojiWhitespaceRegex = /\s/,
    // an image-based emoji (e.g. :octocat:) renders as an `<img>` tag rather than a glyph
    inlineEmojiImageRegex = /^\s*</;

// Recognize a known `:name:` emoji shortcode at `i`. Matches the historical `:(\S+?):` semantics
// (shortest run of non-whitespace between two colons) and only fires for a code registered in
// showdown.helper.emojis, so a non-emoji `:...:` is left to normal parsing. Returns
// {text, name, end} or null.
function inlineEmojiConsume (str, i) {
  let close = str.indexOf(':', i + 1);
  if (close <= i + 1) { return null; }
  let name = str.slice(i + 1, close);
  if (inlineEmojiWhitespaceRegex.test(name)) { return null; }
  if (!Object.prototype.hasOwnProperty.call(showdown.helper.emojis, name)) { return null; }
  return {text: str.slice(i, close + 1), name: name, end: close + 1};
}

// The index one past the `:…:` span a global `/:(\S+?):/g` regex would match starting at the colon
// `i` (i.e. its lastIndex after that match), or -1 if it would find no match there. `\S+?` needs at
// least one non-whitespace char, so a colon immediately after `i` is part of the NAME rather than a
// closer (this is why `::smile:` matches as one invalid `:…:` with code `:smile`, shadowing the
// inner `:smile:`); whitespace before any closing colon makes the regex fail at `i`. Used only by
// the shadow bookkeeping below, to reproduce that left-to-right shadowing.
function inlineEmojiRegexClose (str, i) {
  let n = str.length;
  for (let k = i + 1; k < n; k++) {
    let c = str.charAt(k);
    if (inlineEmojiWhitespaceRegex.test(c)) { return -1; }  // `\S+?` cannot cross whitespace
    if (c === ':' && k >= i + 2) { return k + 1; }          // name is str[i+1..k-1] (length >= 1)
  }
  return -1;
}

showdown.subParser('makehtml.inline.emoji', {

  // Sole owner of `:` — no other construct registers it, so the priority only has to exist
  // (the engine requires it to be explicit), not to win against anyone.
  triggers: ':',
  priority: 10,

  // Option-gated: when `emoji` is off the construct never enters the dispatch table, so `:` is not
  // a trigger character at all and flows into plain-text runs at full speed. Not `!cmSpec`-gated —
  // like ellipsis/strikethrough the substitution is flavor-independent.
  enabled: function (options) {
    return !!options.emoji;
  },

  // Performs the emoji SUBSTITUTION inline: on a known `:name:` it appends the glyph (or the
  // hash-protected image) and returns the new cursor; otherwise it declines (returns null) and the
  // engine falls through to its plain-text handling, so `_`/`*` inside an emoji name never reach the
  // emphasis stack while a non-emoji `:...:` still parses normally.
  //
  // It reproduces a global regex's left-to-right SHADOWING so output stays stable: a single global
  // `/:(\S+?):/g` consuming a `:…:` span (valid OR invalid) moves its lastIndex past it, so a valid
  // emoji NESTED inside an already-consumed span is never re-matched (e.g. `::smile::` -> the invalid
  // `::smile:` is consumed and the inner `:smile:` stays literal). `scan.memos.emojiShadowEnd` is a
  // raw-index high-water mark of that lastIndex (colons are never added/removed/reordered by the
  // surrounding inline processing, so raw indices track the shadowing faithfully).
  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos,
        shadowEnd = scan.memos.emojiShadowEnd || 0,
        e = inlineEmojiConsume(str, i);

    if (!e || i < shadowEnd) {
      // No unshadowed emoji here. If this `:` opens a `:…:` span the regex would have consumed
      // (valid shadowed, or an invalid code), advance the shadow boundary so a valid emoji nested
      // inside it is not re-substituted. Then decline (emitting nothing): the engine's plain-text
      // handling / emphasis processes the `:` and its interior, so e.g. the `_` in an invalid
      // `:not_a_code:` still becomes emphasis.
      if (i >= shadowEnd) {
        let close = inlineEmojiRegexClose(str, i);
        if (close !== -1) { scan.memos.emojiShadowEnd = close; }
      }
      return null;
    }

    // an unshadowed known emoji: substitute and advance the shadow boundary past it
    scan.memos.emojiShadowEnd = e.end;

    // matches.text is the emoji CODE (the shortcode without its colons); _wholeMatch is the source
    // span. regexp is null: this is a scan construct, with no whole-text regex driving it.
    let capture = showdown.Event.dispatchCapture('makehtml.emoji.onCapture', e.name, {
      regexp: null,
      matches: {
        _wholeMatch: e.text,
        text: e.name
      },
      attributes: {}
    }, options, globals);

    let otp;
    if (capture.output && capture.output !== '') {
      // listener-produced output takes precedence and flows raw to the later passes
      otp = capture.output;
    } else {
      // honor a listener that rewrote matches.text: the lookup is performed on the (possibly
      // edited) captured CODE, which is how a listener redirects one shortcode to another.
      otp = showdown.helper.emojis[capture.matches.text];
    }

    let hash = showdown.Event.dispatchHash('makehtml.emoji.onHash', otp, options, globals);
    otp = hash.output;

    // Image-based emoji (e.g. :octocat:) render as an `<img>` tag: hash it so the later
    // encodeAmpsAndAngles pass doesn't turn its `<`/`>` into entities. Unicode emoji contain no
    // HTML-special chars, so appending them raw is byte-identical to appending them as escaped text.
    if (inlineEmojiImageRegex.test(otp)) {
      scan.appendRaw(scan.hashSpan(otp));
    } else {
      scan.appendRaw(otp);
    }
    return e.end;
  }
});
