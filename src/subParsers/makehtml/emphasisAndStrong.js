////
// makehtml/emphasisAndStrong.js
// Copyright (c) 2022 ShowdownJS
//
// Transforms MD emphasis and strong into `<em>` and `<strong>` html entities
//
// Markdown treats asterisks (*) and underscores (_) as indicators of emphasis.
// Text wrapped with one * or _ will be wrapped with an HTML <em> tag;
// double *’s or _’s will be wrapped with an HTML <strong> tag
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////

/* jshint esnext: false, esversion: 9 */
// (esversion 9 enables the \p{...} Unicode property escapes used for CommonMark flanking rules)

showdown.subParser('makehtml.emphasisAndStrong', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makehtml.emphasisAndStrong.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  /**
   * @param {string} txt
   * @param {string} tags
   * @param {string} wholeMatch
   * @param {RegExp} pattern
   * @returns {string}
   */
  function parseInside (txt, tags, wholeMatch, pattern) {
    let otp = 'ERROR',
        attributes,
        subEventName;

    switch (tags) {
      case '<em>':
        attributes = {
          em: {}
        };
        subEventName = 'emphasis';
        break;
      case '<strong>':
        attributes = {
          strong: {}
        };
        subEventName = 'strong';
        break;
      case '<strong><em>':
        attributes = {
          em: {},
          strong: {}
        };
        subEventName = 'emphasisAndStrong';
        break;
      default:
        attributes = {};
        subEventName = 'emphasisAndStrong';
        break;
    }

    let captureStartEvent = new showdown.Event('makehtml.emphasisAndStrong.' + subEventName + '.onCapture', txt);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        text: txt
      })
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);
    // if something was passed as output, it takes precedence
    // and will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      if (showdown.helper.isUndefined(attributes.em)) {
        attributes.em = {};
      }
      if (showdown.helper.isUndefined(attributes.strong)) {
        attributes.strong = {};
      }

      switch (tags) {
        case '<em>':
          otp = '<em' + showdown.helper._populateAttributes(attributes.em) + '>' +
                showdown.subParser('makehtml.hardLineBreaks')(txt, options, globals) +
                '</em>';
          break;
        case '<strong>':
          otp = '<strong' + showdown.helper._populateAttributes(attributes.strong) + '>' +
                showdown.subParser('makehtml.hardLineBreaks')(txt, options, globals) +
                '</strong>';
          break;
        case '<strong><em>':
          otp = '<strong' + showdown.helper._populateAttributes(attributes.strong) + '>' +
                '<em' + showdown.helper._populateAttributes(attributes.em) + '>' +
                showdown.subParser('makehtml.hardLineBreaks')(txt, options, globals) +
                '</em>' +
                '</strong>';
          break;
      }
    }

    let beforeHashEvent = new showdown.Event('makehtml.emphasisAndStrong.' + subEventName + '.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    otp = showdown.subParser('makehtml.hashHTMLSpans')(otp, options, globals);
    return otp;
  }

  // CommonMark-compliant emphasis/strong parsing (delimiter-run algorithm).
  // Gated behind the `commonmarkEmphasis` option (enabled by the commonmark flavor) because
  // it diverges from Showdown's default behavior (e.g. intraword underscores, flanking rules).
  if (options.cmSpec) {
    text = parseCommonmarkEmphasis(text);

    let cmAfterEvent = new showdown.Event('makehtml.emphasisAndStrong.onEnd', text);
    cmAfterEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    cmAfterEvent = globals.converter.dispatch(cmAfterEvent);
    return cmAfterEvent.output;
  }

  /**
   * Parse emphasis and strong emphasis using the CommonMark delimiter-run algorithm.
   * @param {string} str
   * @returns {string}
   */
  function parseCommonmarkEmphasis (str) {
    // CommonMark punctuation = ASCII punctuation + Unicode P categories
    const asciiPunct = /[!-/:-@[-`{-~]/;
    function isPunct (ch) {
      return ch !== undefined && (asciiPunct.test(ch) || /\p{P}/u.test(ch));
    }
    function isWhitespace (ch) {
      return ch === undefined || /\s/.test(ch) || /\p{Z}/u.test(ch);
    }

    // 1. Tokenize into a doubly-linked list of nodes; collect a delimiter stack.
    let head = null,
        tail = null,
        delimiters = null; // tail of delimiter stack

    function appendNode (node) {
      node.prev = tail;
      node.next = null;
      if (tail) {
        tail.next = node;
      } else {
        head = node;
      }
      tail = node;
      return node;
    }

    const len = str.length;
    let i = 0;
    while (i < len) {
      let ch = str.charAt(i);
      if (ch === '*' || ch === '_') {
        let start = i;
        while (i < len && str.charAt(i) === ch) {
          ++i;
        }
        let run = str.slice(start, i),
            before = (start === 0) ? undefined : str.charAt(start - 1),
            after = (i >= len) ? undefined : str.charAt(i),
            beforeWs = isWhitespace(before),
            afterWs = isWhitespace(after),
            beforePt = isPunct(before),
            afterPt = isPunct(after),
            leftFlanking = !afterWs && (!afterPt || beforeWs || beforePt),
            rightFlanking = !beforeWs && (!beforePt || afterWs || afterPt),
            canOpen, canClose;
        if (ch === '_') {
          canOpen = leftFlanking && (!rightFlanking || beforePt);
          canClose = rightFlanking && (!leftFlanking || afterPt);
        } else {
          canOpen = leftFlanking;
          canClose = rightFlanking;
        }
        let node = appendNode({type: 'delim', cc: ch, literal: run, numdelims: run.length, origdelims: run.length, canOpen: canOpen, canClose: canClose});
        node.delimPrev = delimiters;
        node.delimNext = null;
        if (delimiters) {
          delimiters.delimNext = node;
        }
        delimiters = node;
      } else {
        // accumulate a literal text run up to the next delimiter
        let start = i;
        while (i < len && str.charAt(i) !== '*' && str.charAt(i) !== '_') {
          ++i;
        }
        appendNode({type: 'text', literal: str.slice(start, i)});
      }
    }

    // 2. Process emphasis (CommonMark reference algorithm).
    processEmphasis();

    // 3. Render remaining nodes back to a string.
    let out = '';
    for (let n = head; n !== null; n = n.next) {
      out += n.literal;
    }
    return out;

    function removeDelimiter (d) {
      if (d.delimPrev) {
        d.delimPrev.delimNext = d.delimNext;
      }
      if (d.delimNext) {
        d.delimNext.delimPrev = d.delimPrev;
      } else {
        delimiters = d.delimPrev; // top of stack
      }
    }

    function insertAfter (node, newNode) {
      newNode.prev = node;
      newNode.next = node.next;
      if (node.next) {
        node.next.prev = newNode;
      } else {
        tail = newNode;
      }
      node.next = newNode;
    }

    function processEmphasis () {
      // one lower-bound per delimiter char, bucketed by (origdelims % 3) per the spec
      let openersBottom = {'_': [null, null, null], '*': [null, null, null]};

      // start from the bottom-most delimiter on the stack
      let closer = delimiters;
      while (closer !== null && closer.delimPrev !== null) {
        closer = closer.delimPrev;
      }

      while (closer !== null) {
        if (!closer.canClose) {
          closer = closer.delimNext;
          continue;
        }
        // look back for a matching opener
        let opener = closer.delimPrev,
            openerFound = false,
            oddMatch = false;
        while (opener !== null && opener !== openersBottom[closer.cc][closer.origdelims % 3]) {
          oddMatch = (closer.canOpen || opener.canClose) &&
                     (closer.origdelims % 3 !== 0) &&
                     ((opener.origdelims + closer.origdelims) % 3 === 0);
          if (opener.cc === closer.cc && opener.canOpen && !oddMatch) {
            openerFound = true;
            break;
          }
          opener = opener.delimPrev;
        }
        let oldCloser = closer;

        if (openerFound) {
          let use = (opener.numdelims >= 2 && closer.numdelims >= 2) ? 2 : 1,
              tagOpen = (use === 2) ? '<strong>' : '<em>',
              tagClose = (use === 2) ? '</strong>' : '</em>';

          // trim consumed delimiters from the opener (end) and closer (start) literals
          opener.literal = opener.literal.slice(0, opener.literal.length - use);
          opener.numdelims -= use;
          closer.literal = closer.literal.slice(use);
          closer.numdelims -= use;

          // collect inner nodes (between opener and closer), render and hash them
          let inner = '';
          for (let n = opener.next; n !== null && n !== closer; n = n.next) {
            inner += n.literal;
          }
          // emphasis content is hashed here, before the rest of the span gamut runs, so apply
          // hard line breaks and encode double quotes now (CommonMark renders quotes as &quot;)
          inner = showdown.subParser('makehtml.hardLineBreaks')(inner, options, globals);
          inner = inner.replace(/"/g, '&quot;');
          let wrapped = showdown.subParser('makehtml.hashHTMLSpans')(tagOpen + inner + tagClose, options, globals);

          // remove inner nodes and their delimiters from the lists
          let n2 = opener.next;
          while (n2 !== null && n2 !== closer) {
            let nx = n2.next;
            if (n2.type === 'delim') {
              removeDelimiter(n2);
            }
            n2 = nx;
          }
          // splice in a single text node holding the wrapped (hashed) result
          let wrapNode = {type: 'text', literal: wrapped};
          insertAfter(opener, wrapNode);
          // relink opener.next directly to closer (drop the removed inner nodes)
          wrapNode.next = closer;
          closer.prev = wrapNode;

          // drop fully-consumed delimiters
          if (opener.numdelims === 0) {
            opener.literal = '';
            removeDelimiter(opener);
          }
          if (closer.numdelims === 0) {
            closer.literal = '';
            let tmp = closer.delimNext;
            removeDelimiter(closer);
            closer = tmp;
          }
        } else {
          openersBottom[oldCloser.cc][oldCloser.origdelims % 3] = oldCloser.delimPrev;
          if (!oldCloser.canOpen) {
            removeDelimiter(oldCloser);
          }
          closer = oldCloser.delimNext;
        }
      }
    }
  }

  // it's faster to have separate regexes for each case than have just one
  // because of backtracking, in some cases, it could lead to an exponential effect
  // called "catastrophic backtrace". Ominous!
  const lmwuStrongEmRegex         = /\b___(\S[\s\S]*?)___\b/g,
      lmwuStrongRegex             = /\b__(\S[\s\S]*?)__\b/g,
      lmwuEmRegex                 = /\b_(\S[\s\S]*?)_\b/g,
      underscoreStrongEmRegex     = /___(\S[\s\S]*?)___/g,
      unserscoreStrongRegex       = /__(\S[\s\S]*?)__/g,
      unserscoreEmRegex           = /_([^\s_][\s\S]*?)_/g,

      asteriskStrongEm            = /\*\*\*(\S[\s\S]*?)\*\*\*/g,
      asteriskStrong              = /\*\*(\S[\s\S]*?)\*\*/g,
      asteriskEm                  = /\*([^\s*][\s\S]*?)\*/g;


  // Parse underscores
  if (options.literalMidWordUnderscores) {
    text = text.replace(lmwuStrongEmRegex, function (wm, txt) {
      return parseInside (txt, '<strong><em>', wm, lmwuStrongEmRegex);
    });
    text = text.replace(lmwuStrongRegex, function (wm, txt) {
      return parseInside (txt, '<strong>', wm, lmwuStrongRegex);
    });
    text = text.replace(lmwuEmRegex, function (wm, txt) {
      return parseInside (txt, '<em>', wm, lmwuEmRegex);
    });
  } else {
    text = text.replace(underscoreStrongEmRegex, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', wm, underscoreStrongEmRegex) : wm;
    });
    text = text.replace(unserscoreStrongRegex, function (wm, m) {
      return (/\S$/.test(m)) ? parseInside (m, '<strong>', wm, unserscoreStrongRegex) : wm;
    });
    text = text.replace(unserscoreEmRegex, function (wm, m) {
      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
      return (/\S$/.test(m)) ? parseInside (m, '<em>', wm, unserscoreEmRegex) : wm;
    });
  }

  // Now parse asterisks
  text = text.replace(asteriskStrongEm, function (wm, m) {
    return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', wm, asteriskStrongEm) : wm;
  });
  text = text.replace(asteriskStrong, function (wm, m) {
    return (/\S$/.test(m)) ? parseInside (m, '<strong>', wm, asteriskStrong) : wm;
  });
  text = text.replace(asteriskEm, function (wm, m) {
    // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
    return (/\S$/.test(m)) ? parseInside (m, '<em>', wm, asteriskEm) : wm;
  });
  //}
  let afterEvent = new showdown.Event('makehtml.emphasisAndStrong.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
