/**
 * @file      makehtml/htmlBlock.js
 * @summary   Recognizes raw HTML blocks in the Markdown source and shields them from Markdown parsing.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * The subparser that owns HTML-block *syntax* (specs: original.md / showdown.md "HTML blocks",
 * CommonMark §4.6). Two recognition strategies are gated on the one documented divergence, but both
 * feed the SAME role-based placeholder stores and both run at the same point in the pipeline (this
 * subparser runs before githubCodeBlock for every flavor — U-8c):
 *  - `cmSpec` — CommonMark's seven typed HTML blocks (line-based scanner); each block is raw source,
 *    stored verbatim under a `¨R` placeholder (`gHtmlRawBlocks`), restored late so its entities are
 *    not decoded.
 *  - otherwise — Original/Showdown's balanced-tag model plus the `markdown="1"` attribute and the
 *    standalone HR / comment / processor-instruction cases. Raw (non-markdown) blocks go to `¨R`
 *    (`gHtmlRawBlocks`, late / entity-verbatim restore, exactly like `cmSpec`); `markdown="1"`
 *    blocks — whose stored content is GENERATED HTML (their interior parsed as markdown), not raw
 *    source — go to `¨M` (`gHtmlMdBlocks`, early restore in `paragraphs`).
 *
 * Placeholder stores, unified by ROLE across both strategies:
 *  - `¨R` / `gHtmlRawBlocks` — raw source blocks; restored LATE (after decodeEntities) so entities
 *    stay verbatim.
 *  - `¨M` / `gHtmlMdBlocks` — `markdown="1"`-processed blocks; generated HTML, restored EARLY in
 *    `paragraphs`.
 *  - `¨K` / `gHtmlBlocks` — NOT written here. It is the store for block-level markup the block
 *    parsers *GENERATE*, owned by the `showdown.helper.hashHTMLBlocks`/`hashBlock` mechanism (see
 *    below), restored early in `paragraphs`.
 *
 * The complementary MECHANISM — hashing the block-level markup the block parsers *generate* (to keep
 * `paragraphs` from wrapping it in `<p>`) — is `showdown.helper.hashHTMLBlocks`, a plain helper with
 * no source-recognition role and no events; it (and `hashBlock`) own the `¨K`/`gHtmlBlocks` store.
 *
 * Emits the `makehtml.htmlBlock.*` event family: `onStart`/`onEnd` lifecycle plus, per recognized
 * block, `onCapture` (`matches.text` = the raw block source; a listener may rewrite it or set
 * `output` to replace/suppress the block) and `onHash`.
 *
 * After the block strategies, a linear pass hashes span-level tags whose closing `>` sits at
 * blockquote position on a later line (`\n {0,3}>`) so the blockquote parser cannot split them
 * (issue #842). Sticky open/close regexes are built from the shared CommonMark HTML-tag grammar.
 */
const reMultilineHtmlOpen = new RegExp(showdown.helper.regexes.cmOpenTagSource, 'y');
const reMultilineHtmlClose = new RegExp(showdown.helper.regexes.cmCloseTagSource, 'y');

showdown.subParser('makehtml.htmlBlock', function (text, options, globals) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.htmlBlock.onStart', text, options, globals);
  text = startEvent.output;

  if (options.backslashEscapesHTMLTags) {
    // encode backslash escaped HTML tags
    text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
      return '&lt;' + inside + '&gt;';
    });
  }

  if (options.cmSpec) {
    text = parseCmHTMLBlocks(text);
  } else {
    text = hashLegacyHTMLBlocks(text);
  }

  text = hashMultilineHtmlTags(text);

  let afterEvent = showdown.Event.dispatchEnd('makehtml.htmlBlock.onEnd', text, options, globals);
  return afterEvent.output;

  /**
   * Dispatch the per-block capture/hash lifecycle for one recognized source block and return
   * what should replace it in the text (a placeholder, or a listener-provided override).
   * @param {string} rawBlock the raw HTML block source (the capture's `matches.text`)
   * @param {function(string): string} buildPlaceholder given the (possibly listener-rewritten)
   *        raw block, returns the placeholder that stores it
   * @param {boolean} [processed] true when the stored content is generated (markdown-attribute
   *        blocks) rather than the raw block, so a `matches.text` rewrite is not re-applied
   * @param {string} [processedPlaceholder] the placeholder to use when `processed` and no rewrite
   * @returns {string}
   */
  function captureBlock (rawBlock, buildPlaceholder, processed, processedPlaceholder) {
    let captureEvent = showdown.Event.dispatchCapture('makehtml.htmlBlock.onCapture', rawBlock, {
      regexp: null,
      matches: {
        _wholeMatch: rawBlock,
        text: rawBlock
      },
      attributes: {}
    }, options, globals);

    let otp;
    // a listener may replace or suppress the whole block via output precedence
    if (captureEvent.output && captureEvent.output !== '') {
      otp = captureEvent.output;
    } else if (processed) {
      otp = processedPlaceholder;
    } else {
      // honor a listener that rewrote the raw block text
      otp = buildPlaceholder(captureEvent.matches.text);
    }

    let hashEvent = showdown.Event.dispatchHash('makehtml.htmlBlock.onHash', otp, options, globals);
    return hashEvent.output;
  }

  /**
   * Store a raw HTML block under a `¨R` placeholder (`gHtmlRawBlocks`); restored LATE (after
   * decodeEntities) so the verbatim source keeps its entities undecoded.
   *
   * NOTE: double-newline wrapper, unlike `parseCmHTMLBlocks`' single-newline `\n¨R…R\n`. The
   * legacy scanner replaces matches INLINE inside a larger string, so — exactly as the old `¨K`
   * did — it must inject blank lines on both sides to make the placeholder its own block for
   * `paragraphs` (without them, trailing inline text on the block's line would not be `<p>`-
   * wrapped). `parseCmHTMLBlocks` gets that isolation for free from its line-scanner join, so it
   * can use a single newline; the two `¨R` shapes coexist because every reader (`paragraphs`
   * skip, `hardLineBreaks`/`heading` sniffs, the converter restore) matches `¨R\d+R` regardless
   * of surrounding newlines.
   * @param {string} content
   * @returns {string}
   */
  function hashR (content) {
    return '\n\n¨R' + (globals.gHtmlRawBlocks.push(content) - 1) + 'R\n\n';
  }

  /**
   * Store a `markdown="1"`-processed block under a `¨M` placeholder (`gHtmlMdBlocks`). Its stored
   * content is GENERATED HTML (its interior parsed as markdown), so it restores EARLY in
   * `paragraphs` (double-newline wrapper), like the generated `¨K` markup does. Distinct from the
   * metadata subparser's bare `¨M` sentinel, which runs (and fully self-cleans) before this
   * subparser, so the two never coexist.
   * @param {string} content
   * @returns {string}
   */
  function hashM (content) {
    return '\n\n¨M' + (globals.gHtmlMdBlocks.push(content) - 1) + 'M\n\n';
  }

  /**
   * Hash a CommonMark open/close tag that spans lines with its `>` at blockquote
   * position (`^ {0,3}>`). The blockquote parser would otherwise split the tag
   * (issue #842). Single-line tags and tags whose `>` is not at column 0-3 are
   * left for the inline raw-HTML scanner. Fenced regions are protected first so
   * a pretty-printed tag inside a fence is not claimed. Linear: one forward
   * cursor; no-ops when the document has no `\n {0,3}>`.
   * @param {string} str
   * @returns {string}
   */
  function hashMultilineHtmlTags (str) {
    // a tag we would claim must contain both `<` and a later line whose `>` is at
    // blockquote position; without that shape this pass is a no-op (and must stay
    // O(1) on the ReDoS corpus of huge `<a>`/`</a>`/declaration runs with no newline)
    if (str.indexOf('<') === -1 || !/\n {0,3}>/.test(str)) {
      return str;
    }
    let fenceStore = [];
    if (options.ghCodeBlocks) {
      str = protectFencesForTags(str);
    }
    let parts = [],
        i = 0;
    while (i < str.length) {
      let lt = str.indexOf('<', i);
      if (lt === -1) {
        parts.push(str.slice(i));
        break;
      }
      if (lt > i) {
        parts.push(str.slice(i, lt));
      }
      i = lt;
      // indented code (4+ leading spaces): leave the `<` for codeBlock
      let ls = i;
      while (ls > 0 && str.charAt(ls - 1) !== '\n') {
        ls--;
      }
      if (str.charAt(ls) === ' ' && str.charAt(ls + 1) === ' ' &&
          str.charAt(ls + 2) === ' ' && str.charAt(ls + 3) === ' ') {
        parts.push('<');
        i++;
        continue;
      }
      reMultilineHtmlOpen.lastIndex = i;
      let m = reMultilineHtmlOpen.exec(str);
      if (!m) {
        reMultilineHtmlClose.lastIndex = i;
        m = reMultilineHtmlClose.exec(str);
      }
      if (m && /\n {0,3}>/.test(m[0])) {
        parts.push(showdown.helper._hashHTMLSpan(m[0], globals));
        i += m[0].length;
        continue;
      }
      parts.push('<');
      i++;
    }
    let out = parts.join('');
    if (fenceStore.length) {
      out = restoreFencesForTags(out);
    }
    return out;

    function protectFencesForTags (s) {
      if (s.indexOf('```') === -1 && s.indexOf('~~~') === -1) {
        return s;
      }
      let lines = s.split('\n'),
          buf = [],
          p = 0;
      while (p < lines.length) {
        let fm = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[p]);
        if (fm && !(fm[1].charAt(0) === '`' && fm[2].indexOf('`') !== -1)) {
          let ch = fm[1].charAt(0),
              closeRe = new RegExp('^ {0,3}[' + ch + ']{' + fm[1].length + ',}[ \\t]*$'),
              region = [lines[p]];
          p++;
          while (p < lines.length) {
            region.push(lines[p]);
            if (closeRe.test(lines[p])) { p++; break; }
            p++;
          }
          buf.push('¨F' + (fenceStore.push(region.join('\n')) - 1) + 'F');
          continue;
        }
        buf.push(lines[p]);
        p++;
      }
      return buf.join('\n');
    }

    function restoreFencesForTags (s) {
      return s.replace(/¨F(\d+)F/g, function (wholeMatch, num) {
        return fenceStore[Number(num)];
      });
    }
  }

  /**
   * Original/Showdown HTML-block recognition: balanced open/close tag matching over a fixed set
   * of block-level tag names, the `markdown="1"` attribute, and the standalone HR / comment /
   * processor-instruction cases. Blocks are split by ROLE across `gHtmlRawBlocks` (`¨R`, raw
   * source, late/entity-verbatim restore) and `gHtmlMdBlocks` (`¨M`, `markdown="1"`-processed,
   * generated HTML, early restore). It never writes the generated-markup `¨K`/`gHtmlBlocks` store.
   * @param {string} str
   * @returns {string}
   */
  function hashLegacyHTMLBlocks (str) {
    // Fence-awareness. This scanner runs BEFORE githubCodeBlock (the one block-stage order for
    // every flavor — U-8c), so literal ``` / ~~~ fenced regions are still present in `str`; protect
    // every region githubCodeBlock would claim behind a `¨F` placeholder so the balanced-tag scan
    // below cannot mis-claim block tags that live inside a fence body. Only active when ghCodeBlocks
    // is on — with the option off, fences are not code and are scanned as HTML. The protected
    // regions are restored to their literal source at the end of this function (in the returned text
    // and in any raw-block store entry a balanced-tag block absorbed them into), so the later
    // githubCodeBlock pass converts them exactly.
    let fenceStore = [];
    if (options.ghCodeBlocks) {
      str = protectFences(str);
    }

    let blockTags = [
          'pre', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'dl', 'ol',
          'ul', 'script', 'noscript', 'form', 'fieldset', 'iframe', 'math', 'style', 'section',
          'header', 'footer', 'nav', 'article', 'aside', 'address', 'audio', 'canvas', 'figure',
          'hgroup', 'output', 'video', 'details', 'p'
        ],
        repFunc = function (wholeMatch, match, left, right) {
          let markdownAttr = left.search(/\bmarkdown\b/) !== -1;
          // an element marked as markdown has its contents parsed as markdown
          if (markdownAttr) {
            // markdown="1": stored content is generated HTML -> `¨M` (early restore). Restore any
            // protected fence in the interior first so the nested makeHtml sees the real fenced
            // source (githubCodeBlock has not run yet).
            let inner = fenceStore.length ? restoreFences(match) : match;
            let txt = left + globals.converter.makeHtml(inner) + right;
            return captureBlock(wholeMatch, hashM, true, hashM(txt));
          }
          // raw (non-markdown) balanced block: verbatim source -> `¨R` (late, entity-verbatim).
          return captureBlock(wholeMatch, hashR, false, null);
        };

    // hash HTML Blocks
    for (let i = 0; i < blockTags.length; ++i) {
      let opTagPos,
          rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
          patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
          patRight = '</' + blockTags[i] + '>',
          closeRe  = new RegExp(patRight, 'im');
      // 1. Look for the first position of the first opening HTML tag in the text
      while ((opTagPos = showdown.helper.regexIndexOf(str, rgx1)) !== -1) {
        //2. Split the text in that position
        let subTexts = showdown.helper.splitAtIndex(str, opTagPos);
        // Absent-close-tag guard (ReDoS). replaceRecursiveRegExp -> rgxFindMatchPos restarts its
        // scan once per unbalanced opener, so a run of openers with no matching closer ahead is
        // O(n^2) (e.g. `'<div>\n'.repeat(n)` cost ~12s at scale). If no closing tag follows the
        // opener no balanced block can form, so skip the recursive scan — its result would be the
        // text unchanged, which is exactly the `break` below, so this is byte-identical.
        if (!closeRe.test(subTexts[1])) {
          break;
        }
        //3. Match recursively
        let newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');
        // prevent an infinite loop
        if (newSubText1 === subTexts[1]) {
          break;
        }
        str = subTexts[0].concat(newSubText1);
      }
    }
    // HR SPECIAL CASE
    str = str.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashHrOrPi);

    // Special case for standalone HTML comments
    // A comment is terminated by either `-->` or `--!>` (the HTML "comment end
    // bang" state). Matching only `-->` lets content an author believes is
    // commented-out leak through to the browser as live HTML (js/bad-tag-filter).
    str = showdown.helper.replaceRecursiveRegExp(str, function (txt) {
      return captureBlock(txt, hashR, false, null);
    }, '^ {0,3}<!--', '--!?>', 'gm');

    // PHP and ASP-style processor instructions (<?...?> and <%...%>)
    str = showdown.helper.replaceProcessorInstructions(str, hashHrOrPi);

    // Restore the protected fenced-code regions to their literal source, both in the returned
    // text and in any raw-block store entry a balanced-tag block absorbed a fence into (only
    // entries added by this pass can contain a `¨F` marker). The subsequent githubCodeBlock pass
    // then converts them exactly.
    if (fenceStore.length) {
      str = restoreFences(str);
      // Restore any fence a balanced-tag block absorbed: raw blocks land in `¨R`/gHtmlRawBlocks (a
      // `markdown="1"` interior already had its fences restored before its nested makeHtml, so
      // gHtmlMdBlocks holds no `¨F`).
      let fenceScanStore = globals.gHtmlRawBlocks;
      for (let j = 0; j < fenceScanStore.length; ++j) {
        if (typeof fenceScanStore[j] === 'string' && fenceScanStore[j].indexOf('¨F') !== -1) {
          fenceScanStore[j] = restoreFences(fenceScanStore[j]);
        }
      }
    }

    return str;

    // wraps the (cleaned) standalone-element text in the capture/hash lifecycle before hashing
    function hashHrOrPi (wholeMatch, m1) {
      let blockText = m1;
      blockText = blockText.replace(/\n\n/g, '\n');
      blockText = blockText.replace(/^\n/, '');
      blockText = blockText.replace(/\n+$/g, '');
      // standalone HR / processor-instruction is raw HTML -> `¨R` (late, entity-verbatim)
      return captureBlock(wholeMatch, hashR, true, hashR(blockText));
    }

    // Replace each githubCodeBlock-claimable fenced region with a `¨F<n>F` placeholder (line
    // based, linear). Fence recognition mirrors githubCodeBlock for the SAME options: an opening
    // fence is 3+ backticks/tildes at indent 0-3; a backtick fence whose info string carries a
    // backtick is NOT a code block (githubCodeBlock rejects it) and is left for the HTML scan; a
    // tilde fence's info may contain anything. The region runs through the first line that closes
    // the fence (same char, >= opening length, nothing but trailing whitespace) inclusive, or to
    // EOF for an unclosed fence — matching githubCodeBlock's closed/empty/unclosed passes.
    function protectFences (s) {
      // fast path / true no-op guarantee: no fence delimiter present
      if (s.indexOf('```') === -1 && s.indexOf('~~~') === -1) {
        return s;
      }
      let lines = s.split('\n'),
          out = [],
          i = 0;
      while (i < lines.length) {
        let m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[i]);
        if (m && !(m[1].charAt(0) === '`' && m[2].indexOf('`') !== -1)) {
          let ch = m[1].charAt(0),
              closeRe = new RegExp('^ {0,3}[' + ch + ']{' + m[1].length + ',}[ \\t]*$'),
              region = [lines[i]];
          i++;
          while (i < lines.length) {
            region.push(lines[i]);
            if (closeRe.test(lines[i])) { i++; break; }
            i++;
          }
          out.push('¨F' + (fenceStore.push(region.join('\n')) - 1) + 'F');
          continue;
        }
        out.push(lines[i]);
        i++;
      }
      return out.join('\n');
    }

    // Restore every `¨F<n>F` placeholder produced by protectFences to its literal fenced source.
    function restoreFences (s) {
      return s.replace(/¨F(\d+)F/g, function (wholeMatch, n) {
        return fenceStore[Number(n)];
      });
    }
  }

  /**
   * CommonMark HTML blocks (spec section 4.6): a line-based scanner implementing the
   * 7 block types, each with its own start and end condition. Block content is hashed
   * verbatim (not parsed as Markdown) under a `¨R` placeholder. Types 1-6 may interrupt
   * a paragraph; type 7 may only start at a block boundary (document start or after a
   * blank line).
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
        // Deliberate deviation from CommonMark (which recognizes only `-->`): `--!>` — the
        // HTML "comment end bang" state — also terminates a comment, matching what browsers
        // do with the output. Recognizing only `-->` lets content the parser believes is
        // commented out leak through as live HTML (js/bad-tag-filter). Documented in
        // specs/showdown.md and specs/comparison.md.
        type2End   = /--!?>/,
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

      // wrap the placeholder in blank lines so later block parsing treats it as its own
      // block. A CommonMark HTML block is raw verbatim source: its content (including any
      // entities) must NOT be decoded, so it gets a distinct `¨R` marker and a separate
      // store, restored late (after decodeEntities) rather than unhashed in paragraphs like
      // generated `¨K`/`¨G` blocks (which legitimately decode).
      let raw = blockLines.join('\n');
      out.push(captureBlock(raw, function (content) {
        return '\n¨R' + (globals.gHtmlRawBlocks.push(content) - 1) + 'R\n';
      }, false, null));
      prevBlank = false;
    }

    return out.join('\n');
  }
});
