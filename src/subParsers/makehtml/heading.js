/**
 * @file      makehtml/heading.js
 * @summary   Converts ATX (`#`) and Setext (`===`/`---`) headings into `<h1>`–`<h6>`, generating id attributes.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * An IIFE registering the heading subparser; a shared `parseHeader` handles both styles, namespacing
 * events per style (`.atx`/`.setext`), each with its own lifecycle and capture. The heading-id
 * generator emits the capture-only `makehtml.heading.id.onCapture` hook so listeners can supply
 * custom slugs. The setext regex is the documented ReDoS-sensitive spot.
 */
(function () {

  // Unicode whitespace class used by the trimEnd polyfill. Built via string concatenation (rather
  // than a regex literal) so the single class definition lives in one place; ESLint cannot statically
  // flag `no-control-regex` on a computed RegExp pattern. File-local to heading.js (its trimEnd is
  // the sole user).
  const CM_WS = '\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF';
  const CM_WS_END = new RegExp('[' + CM_WS + ']+$');

  /**
   * Polyfill method for trimEnd. File-local to heading.js (its setext HR/prepend checks are the
   * sole callers).
   * @param {string} text
   * @returns {string}
   */
  function trimEnd (text) {
    return (!String.prototype.trimEnd) ? text.replace(CM_WS_END, '') : text.trimEnd();
  }

  /**
   *
   * @param {string} subEvtName Heading style ('atx' or 'setext'), used to namespace the dispatched events
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @param {string} headingText
   * @param {string} headingLevel
   * @param {string} headingId
   * @param {{}} options
   * @param {{}} globals
   * @returns {string}
   */
  function parseHeader (subEvtName, pattern, wholeMatch, headingText, headingLevel, headingId, options, globals) {
    let otp,
        captureStartEvent = showdown.Event.dispatchCapture('makehtml.heading.' + subEvtName + '.onCapture', headingText, {
          regexp: pattern,
          matches: {
            _wholeMatch: wholeMatch,
            text: headingText
          },
          attributes: {
            id: headingId
          }
        }, options, globals);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;

    } else {
      headingText = captureStartEvent.matches.text;
      let inlineHTML = showdown.subParser('makehtml.inlineEngine')(headingText, options, globals),
          attributes = captureStartEvent.attributes;
      otp = '<h' + headingLevel + showdown.helper._populateAttributes(attributes) + '>' + inlineHTML + '</h' + headingLevel + '>';
    }

    let beforeHashEvent = showdown.Event.dispatchHash('makehtml.heading.' + subEvtName + '.onHash', otp, options, globals);
    otp = beforeHashEvent.output;

    return showdown.helper.hashBlock(otp, options, globals);
  }


  // Normalize the `headerIds` option into {enabled, prefix, raw}. Accepts `false`
  // (no ids), an object `{prefix, raw}`, or `true`/undefined (github ids, no prefix).
  function resolveHeaderIds (opt) {
    if (opt === false) {
      return { enabled: false, prefix: '', raw: false };
    }
    if (showdown.helper.isObject(opt)) {
      return {
        enabled: true,
        prefix: showdown.helper.isString(opt.prefix) ? opt.prefix : '',
        raw: !!opt.raw
      };
    }
    // true / null / undefined / anything else: default github ids, no prefix
    return { enabled: true, prefix: '', raw: false };
  }

  // Generate a heading's `id` attribute from its text. A mechanism, not a construct, so it
  // is a showdown.helper rather than a registered subparser — but it keeps one event:
  // `makehtml.heading.id.onCapture`, whose `matches.text` is the generated id (mutable and
  // honored, so a listener can implement custom slug generation). It returns an id string
  // (or null when the headerIds option disables ids), not HTML, so there is no lifecycle or
  // onHash phase. File-local to heading.js (its atx/setext passes are the only callers).
  function headingId (m, options, globals) {
    let title;

    let cfg = resolveHeaderIds(options.headerIds);
    // when ids are disabled the caller omits the attribute entirely
    if (!cfg.enabled) {
      return null;
    }

    // Prefix id to prevent causing inadvertent pre-existing style matches.
    title = cfg.prefix + m;

    if (cfg.raw) {
      // minimal sanitization: only spaces, ', ", > and < become dashes (the prefix is
      // included, so it gets the same treatment). WARNING: may produce malformed ids.
      title = title
        // a space or an internal line break (multi-line setext heading text) becomes a
        // dash — per-char so a run of spaces still yields a run of dashes. ATX ids never
        // contain a newline (the m-flag `.+` capture never crosses lines).
        .replace(/[ \r\n]/g, '-')
        // replace previously escaped chars (&, ¨ and $)
        .replace(/&amp;/g, '&');
      // the sentinels must be restored in the inverse order of the producer (`¨D` before
      // `¨T`), or a literal `¨D` in the heading text collapses into a `$`
      title = showdown.helper.restoreDollarsAndTremas(title)
        // replace ", ', > and <
        .replace(/["'><]/g, '-')
        .toLowerCase();
    } else {
      // default: GitHub-compatible ids (spaces become dashes, non-alphanumeric chars
      // are stripped). Borrowed from github's redcarpet so results are similar.
      title = title
        // a space or an internal line break (multi-line setext heading text) becomes a
        // dash — per-char so a run of spaces still yields a run of dashes. ATX ids never
        // contain a newline (the m-flag `.+` capture never crosses lines).
        .replace(/[ \r\n]/g, '-')
        // replace previously escaped chars (&, ¨ and $)
        .replace(/&amp;/g, '')
        .replace(/¨T/g, '')
        .replace(/¨D/g, '')
        // replace rest of the chars (&~$ are repeated as they might have been escaped)
        .replace(/[&+$,/:;=?@"#{}|^¨¿？：~[\]`、゠＝…‥『』〝〟「」\\*()｛｝（）［］【】%.。，¡!！'<>]/g, '')
        .toLowerCase();
    }

    // capture hook: the generated id is exposed under matches.text (mutable + honored), so a
    // listener can supply a custom slug. The heading text is read-only context. No regexp and
    // no attributes apply (an id is a bare string, not an HTML fragment). Deduplication runs
    // after the hook so a listener-supplied slug is still made unique within the document.
    let captureEvent = showdown.Event.dispatchCapture('makehtml.heading.id.onCapture', title, {
      regexp: null,
      matches: {
        _wholeMatch: m,
        _headingText: m,
        text: title
      },
      attributes: {}
    }, options, globals);
    title = captureEvent.matches.text;

    if (globals.hashLinkCounts[title]) {
      title = title + '-' + (globals.hashLinkCounts[title]++);
    } else {
      globals.hashLinkCounts[title] = 1;
    }
    return title;
  }

  showdown.subParser('makehtml.heading.setext', function (text, options, globals) {

    let startEvent = showdown.Event.dispatchStart('makehtml.heading.setext.onStart', text, options, globals);
    text = startEvent.output;

    // NOTE: the first line is `[^ \t\n].*` (single leading non-space + rest) rather
    // than `[^ \t\n]+.*`. The latter has two overlapping greedy quantifiers that can
    // consume the same characters, causing O(n^2) backtracking on a long line with no
    // trailing underline (a DoS via any long whitespace-free input). The two forms
    // match the same set of lines and capture the same substring.
    const setextRegexH1 = /^( {0,3}([^ \t\n].*\n)(.+\n)?(.+\n)?)( {0,3}=+[ \t]*)$/gm,
        setextRegexH2 = /^( {0,3}([^ \t\n].*\n)(.+\n)?(.+\n)?)( {0,3}(-+)[ \t]*)$/gm;

    // CommonMark: a setext heading's text is a paragraph, so the line(s) before the
    // underline may not begin another kind of block. Since setext runs before the
    // list/block-quote parsers in blockGamut, a `-` underline would otherwise steal
    // list-item lines (e.g. `- foo\n-`). When commonmarkLists is enabled, skip the
    // match if the heading text starts a list item or block quote; the container
    // parsers then handle those lines (and any genuine underline inside an item).
    function cmSkipSetext (headingText) {
      let first = headingText.split('\n')[0];
      return /^ {0,3}(?:[-+*]|\d{1,9}[.)])(?:[ \t]|$)/.test(first) ||
             /^ {0,3}>/.test(first) ||
             // a fenced-code opener is a leaf block, not setext paragraph text. In container
             // mode the converter-level fence pass leaves indent 1-3 fences for the block
             // parsers, so they can reach setext here; let the fence (and any container
             // marker below it) be claimed by the block/container parsers instead.
             /^ {0,3}(?:```|~~~)/.test(first);
    }

    // H1 (`=` underline) and H2 (`-` underline) run the identical callback; only the
    // resulting heading level differs (H2 is one deeper). One closure, parameterized by
    // level, drives both passes. Note both pass `setextRegexH2` as the event regexp — a
    // long-standing quirk preserved here (the pattern is only surfaced in the capture event).
    function setextReplacer (level) {
      return function (wholeMatch, headingText, line1, line2, line3, line4) {
        if (options.cmSpec && cmSkipSetext(headingText)) { return wholeMatch; }
        return parseSetextHeading(setextRegexH2, level, wholeMatch, headingText, line1, line2, line3, line4);
      };
    }

    text = text.replace(setextRegexH1, setextReplacer(options.headerLevelStart));
    text = text.replace(setextRegexH2, setextReplacer(options.headerLevelStart + 1));

    let afterEvent = showdown.Event.dispatchEnd('makehtml.heading.setext.onEnd', text, options, globals);

    return showdown.helper.hashHTMLBlocks(afterEvent.output, options, globals);


    // The greedy 3-line capture (setextRegexH1/H2) over-matches: an underline can appear
    // directly under lines that are really a *different* block (a thematic break, a list
    // item, a block quote, or a leaf/container block), which the underline would wrongly
    // pull into "heading text". `parseSetextHeading` re-litigates those false positives.
    //
    // The two false-positive classes are disjoint by line-count and handled by one arm each:
    //   - a one-line capture  -> resolveOneLinerFalsePositive (HR edge / one-liner list /
    //                            one-liner block quote, each delegated to its own subparser)
    //   - a multi-line capture -> resolveMultilineFalsePositive (HR in line1/line2, then a
    //                            blockGamut reparse with ¨K/¨R sniffing)
    //
    // The list/block-quote delegations below are the `!cmSpec` half of the SAME question
    // that `cmSkipSetext` (above) answers on the `cmSpec` path: "is this underline stealing
    // a container's lines?". cmSpec skips the match up front and lets the container parsers
    // claim the lines; the legacy path lets the underline match, then hands the stolen lines
    // back to the container subparsers here. Merging the two is documented as a later step.
    function parseSetextHeading (pattern, headingLevel, wholeMatch, headingText, line1, line2, line3, line4) {

      const hrCheckRgx = /^ {0,3}[-_*]([-_*] ?){2,}$/;
      let count = headingText.trim().split('\n').length,
          prepend = '';

      if (count === 1) {
        let oneLiner = resolveOneLinerFalsePositive(line1, line4);
        // a non-null result means line1 was really an HR/list/block quote — return it verbatim
        if (oneLiner !== null) {
          return oneLiner;
        }
      } else {
        let resolved = resolveMultilineFalsePositive(headingText, line1, line2, line3);
        prepend = resolved.prepend;
        headingText = resolved.headingText;
      }

      // trim stuff
      headingText = headingText.trim();

      // let's check if heading is empty
      // after looking for blocks, heading text might be empty which is a false positive
      if (!headingText) {
        return prepend + line4;
      }

      // after this, we're pretty sure it's a heading so let's proceed
      // (the id helper returns null when the headerIds option disables ids)
      let id = headingId(headingText, options, globals);
      return prepend + parseHeader('setext', pattern, wholeMatch, headingText, headingLevel, id, options, globals);


      // One-line capture. Returns a finished replacement string when `line1` is really a
      // thematic break, a one-liner list item, or a one-liner block quote that the greedy
      // capture mis-swallowed; returns null when it is genuine heading text.
      function resolveOneLinerFalsePositive (line1, line4) {
        let prepend;

        // thematic-break edge case (`- - -`): let the horizontalRule parser confirm it
        if (trimEnd(line1).match(hrCheckRgx)) {
          prepend = showdown.subParser('makehtml.horizontalRule')(line1, options, globals);
          if (prepend !== line1) {
            return prepend.trim() + '\n' + line4;
          }
        }

        // one-liner unordered list (`- foo` above an `=` underline): delegate to the list parser
        if (line1.match(/^ {0,3}[-*+][ \t]/)) {
          if (line4.trim().match(/^=+/)) {
            line1 += line4;
          }
          prepend = showdown.subParser('makehtml.list')(line1, options, globals);
          if (prepend !== line1) {
            return prepend.trim() + '\n' + line4;
          }
        }

        // one-liner block quote (`> foo`): delegate to the block-quote parser
        if (line1.match(/^ {0,3}>[ \t]?[^ \t]/)) {
          if (line4.trim().match(/^=+/)) {
            line1 += line4;
          }
          prepend = showdown.subParser('makehtml.blockquote')(line1, options, globals);
          if (prepend !== line1) {
            return prepend.trim() + '\n' + line4;
          }
        }

        // no edge case: proceed as a real heading
        return null;
      }

      // Multi-line capture. Peels any block(s) that precede the true heading text out into
      // `prepend`, returning the (possibly reduced) heading text alongside. Never short-
      // circuits — always falls through to the common heading tail above.
      function resolveMultilineFalsePositive (headingText, line1, line2, line3) {
        let prepend = '',
            nPrepend;

        // first we must take care of the edge cases of:
        // case1: |  case2:
        // ---    |  ---
        // foo    |  foo
        // ---    |  bar
        //        |  ---
        //
        if (trimEnd(line1).match(hrCheckRgx)) {
          nPrepend  = showdown.subParser('makehtml.horizontalRule')(line1, options, globals);
          if (nPrepend !== line1) {
            line1 = '';
            // we add the parsed block to prepend
            prepend = nPrepend.trim();
            // and remove the line from the headingText, so it doesn't appear repeated
            headingText = line2 + ((line3) ? line3 : '');
          }
        }

        // now we take care of these cases:
        // case1: |  case2:
        // foo    |  foo
        // ***    |  ***
        // ---    |  bar
        //        |  ---
        //
        if (trimEnd(line2).match(hrCheckRgx)) {
          // This case sucks, because the first line could be anything!!!
          // first let's make sure it's a hr
          nPrepend  = showdown.subParser('makehtml.horizontalRule')(line2, options, globals);
          if (nPrepend !== line2) {
            line2 = nPrepend;
            // it is, so now we must parse line1 also
            if (line1) {
              line1 = showdown.subParser('makehtml.blockEngine')(line1, options, globals);
              line1 = showdown.subParser('makehtml.paragraphs')(line1, options, globals);
              line1 = line1.trim() + '\n';
              prepend = line1;
              // and clear line1
              line1 = '';
            }
            // we add the parsed blocks to prepend
            prepend += line2.trim() + '\n';
            line2 = '';
            // and remove the lines from the headingText, so it doesn't appear repeated
            headingText = (line3) ? line3 : '';
          }
        }

        // all edge cases should be treated now: reparse the assembled text and let any
        // block(s) found before the underline win (they take precedence over the heading)
        let multilineText = line1 + line2 + ((line3) ? line3 : '');

        nPrepend = showdown.subParser('makehtml.blockEngine')(multilineText, options, globals, 'makehtml.heading.setext');
        if (nPrepend !== multilineText) {
          // we found one or more blocks, so we need to reparse (blocks should take precendence though)
          nPrepend = trimEnd(nPrepend);
          // let's check if the last line is a parsed block
          let newLines = nPrepend.trim().split('\n');
          let nLastLine = newLines.pop().toString();

          if (/^¨(?:K\d+K|R\d+R|M\d+M)$/.test(nLastLine) || /^\s*$/gm.test(nLastLine)) {
            // everything before --- or === is a block (¨K hashed / ¨R raw HTML / ¨M markdown="1"
            // block) or empty line, so it's a false positive
            prepend += nPrepend + '\n\n';
            headingText = '';
          } else {
            // the last line is something else... so let's look at the line before that
            let toHeading = nLastLine;
            nLastLine = newLines.pop().toString();
            if (/^¨(?:K\d+K|R\d+R|M\d+M)$/.test(nLastLine) === false && /^\s*$/gm.test(nLastLine) === false) {
              toHeading = nLastLine + '\n' + toHeading;
            }
            headingText = toHeading;
            prepend = newLines.join('\n').trim();
          }
        }

        return { prepend: prepend, headingText: headingText };
      }
    }


  });

  // Strip a trailing ATX closing sequence — `[ \t]*#*[ \t]*` — from a heading's text, computed
  // right-to-left in linear time (a regex `/[ \t]*#*[ \t]*$/` would itself backtrack quadratically
  // while searching for the match position). If the whole text is strippable (e.g. `# ###`), the
  // legacy lazy regex kept the first character, so we do the same.
  function stripAtxClosingSequence (str) {
    let end = str.length;
    while (end > 0 && (str.charAt(end - 1) === ' ' || str.charAt(end - 1) === '\t')) { end--; }
    while (end > 0 && str.charAt(end - 1) === '#') { end--; }
    while (end > 0 && (str.charAt(end - 1) === ' ' || str.charAt(end - 1) === '\t')) { end--; }
    let stripped = str.slice(0, end);
    return stripped === '' ? str.charAt(0) : stripped;
  }

  showdown.subParser('makehtml.heading.atx', function (text, options, globals) {

    let startEvent = showdown.Event.dispatchStart('makehtml.heading.atx.onStart', text, options, globals);
    text = startEvent.output;

    // The default variant captures the heading text greedily (`(.+)$`) and strips the optional
    // trailing closing-hash sequence (of ANY length, per CommonMark) in code below. The old
    // `(.+?)[ \t]*#*[ \t]*$` form backtracked quadratically on a line of many `#` followed by
    // text (e.g. `'#'.repeat(n) + ' h'`), because the lazy text capture re-scanned the `#` run
    // at every position. The cmSpec variant already can't backtrack that way (its `[ \t]+`
    // after the opening hashes fails fast on a pure/`#`-prefixed line), so it is left unchanged.
    // cmSpec (CommonMark) requires a space between the opening `#`s and the heading text; the
    // legacy path does not.
    const atxRegex = (options.cmSpec) ? /^ {0,3}(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/gm : /^ {0,3}(#{1,6})[ \t]*(.+)$/gm;
    const stripClosing = !options.cmSpec;
    text = text.replace(atxRegex, function (wholeMatch, m1, m2) {
      let headingText = stripClosing ? stripAtxClosingSequence(m2) : m2,
          headingLevel = options.headerLevelStart - 1 + m1.length,
          // the id helper returns null when the headerIds option disables ids
          id = headingId(headingText, options, globals);
      return parseHeader('atx', atxRegex, wholeMatch, headingText, headingLevel, id, options, globals);
    });

    let afterEvent = showdown.Event.dispatchEnd('makehtml.heading.atx.onEnd', text, options, globals);

    return showdown.helper.hashHTMLBlocks(afterEvent.output, options, globals);

  });

})();
