/**
 * @file      makemarkdown/node.js
 * @summary   The recursive HTML→Markdown dispatcher that routes each DOM node to the right construct subparser.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * The reverse-direction analogue of the block and inline engines: handles text nodes, HTML comments and
 * unknown/raw elements itself, and dispatches known elements (headings, lists, links, tables, …) to
 * their subparser, falling back to `renderRawElement` when a feature-gated construct's option is off.
 * Emits `makeMarkdown.node.onStart`/`onCapture`/`onEnd` for every node — the one place to observe content without
 * a dedicated subparser.
 */
showdown.subParser('makeMarkdown.node', function (node, options, globals, spansOnly) {
  'use strict';

  spansOnly = spansOnly || false;

  let input = node.outerHTML || node.nodeValue || '';
  showdown.Event.dispatchStart('makeMarkdown.node.onStart', input, options, globals, {_node: node});

  // node is the recursive dispatcher (the makeMarkdown analogue of the block/inline engines) and
  // has no syntax of its own, but it IS the sole observation point for content with no
  // dedicated subparser — HTML comments and unknown/raw elements — so it emits a capture whose
  // output-override lets a listener replace the default dispatch. It has no inner content of
  // its own, so the capture carries no `text` key.
  let captureEvent = showdown.Event.dispatchCapture('makeMarkdown.node.onCapture', input, {
    regexp: null,
    matches: {_wholeMatch: input, _node: node},
    attributes: null
  }, options, globals);

  let result;
  if (captureEvent.output && captureEvent.output !== '') {
    result = captureEvent.output;
  } else {
    result = (function () {
      let txt = '';

      // edge case of text without wrapper paragraph
      if (node.nodeType === 3) {
        return showdown.subParser('makeMarkdown.txt')(node, options, globals);
      }

      // HTML comment
      if (node.nodeType === 8) {
        return '<!--' + node.data + '-->\n\n';
      }

      // process only node elements
      if (node.nodeType !== 1) {
        return '';
      }

      let tagName = node.tagName.toLowerCase();

      // Renders an element as raw HTML while still converting its children to markdown.
      // Used for unknown wrapper elements and for feature-gated constructs (strikethrough,
      // underline, tables, ...) when their option is disabled, so the reverse direction stays
      // symmetric with makeHtml: a construct makeHtml wouldn't parse isn't emitted as markdown
      // here either. Embedded/replaced-content and void/empty elements are emitted verbatim.
      function renderRawElement (n, tag) {
        let rawContentTags = ['script', 'style', 'canvas', 'audio', 'video', 'iframe', 'object', 'svg', 'math', 'noscript', 'template', 'picture'];
        let kids = n.childNodes;
        if (kids && kids.length > 0 && rawContentTags.indexOf(tag) === -1) {
          let inner = '';
          for (let k = 0; k < kids.length; ++k) {
            inner += showdown.subParser('makeMarkdown.node')(kids[k], options, globals, spansOnly);
          }
          // a block child terminates itself with a blank line; trim that trailing separator so
          // the wrapper's closing tag stays compact instead of dangling on its own line
          inner = inner.replace(/\n+$/, '');
          // derive the opening tag from outerHTML so attribute serialization is preserved
          // exactly (and is robust against ">" inside attribute values)
          let outer    = n.outerHTML,
              closeTag = '</' + tag + '>',
              openTag  = outer.substring(0, outer.length - n.innerHTML.length - closeTag.length);
          return openTag + inner + closeTag;
        }
        return n.outerHTML;
      }

      switch (tagName) {

        //
        // BLOCKS
        //
        case 'h1':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 1) + '\n\n'; }
          break;
        case 'h2':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 2) + '\n\n'; }
          break;
        case 'h3':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 3) + '\n\n'; }
          break;
        case 'h4':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 4) + '\n\n'; }
          break;
        case 'h5':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 5) + '\n\n'; }
          break;
        case 'h6':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, options, globals, 6) + '\n\n'; }
          break;

        case 'p':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.paragraph')(node, options, globals) + '\n\n'; }
          break;

        case 'blockquote':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.blockquote')(node, options, globals) + '\n\n'; }
          break;

        case 'hr':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.hr')(node, options, globals) + '\n\n'; }
          break;

        case 'ol':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, options, globals, 'ol') + '\n\n'; }
          break;

        case 'ul':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, options, globals, 'ul') + '\n\n'; }
          break;

        case 'precode':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.codeBlock')(node, options, globals) + '\n\n'; }
          break;

        case 'pre':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.pre')(node, options, globals) + '\n\n'; }
          break;

        case 'table':
          if (!spansOnly) {
            // when tables are disabled, emit the table verbatim: recursing into its block-level
            // cells would inject blank lines that break the raw HTML block on re-parse
            txt = (options.tables ?
              showdown.subParser('makeMarkdown.table')(node, options, globals) :
              node.outerHTML) + '\n\n';
          }
          break;

        //
        // SPANS
        //
        case 'code':
          txt = showdown.subParser('makeMarkdown.codeSpan')(node, options, globals);
          break;

        case 'em':
        case 'i':
          txt = showdown.subParser('makeMarkdown.emphasis')(node, options, globals);
          break;

        case 'strong':
        case 'b':
          txt = showdown.subParser('makeMarkdown.strong')(node, options, globals);
          break;

        case 'del':
        case 's':
        case 'strike':
          txt = options.strikethrough ?
            showdown.subParser('makeMarkdown.strikethrough')(node, options, globals) :
            renderRawElement(node, tagName);
          break;

        case 'u':
          txt = options.underline ?
            showdown.subParser('makeMarkdown.underline')(node, options, globals) :
            renderRawElement(node, tagName);
          break;

        case 'a':
          txt = showdown.subParser('makeMarkdown.links')(node, options, globals);
          break;

        case 'img':
          txt = showdown.subParser('makeMarkdown.image')(node, options, globals);
          break;

        case 'br':
          txt = showdown.subParser('makeMarkdown.break')(node, options, globals);
          break;

        case 'input':
          txt = showdown.subParser('makeMarkdown.input')(node, options, globals);
          break;

        case 'sup':
          // GFM footnote reference; otherwise an ordinary inline <sup> kept as raw HTML
          if (options.footnotes && /(?:^| )footnote-ref(?: |$)/.test(node.getAttribute('class') || '')) {
            txt = showdown.subParser('makeMarkdown.footnotes')(node, options, globals);
          } else {
            txt = renderRawElement(node, tagName);
            if (!spansOnly) { txt += '\n\n'; }
          }
          break;

        case 'section':
          // GFM footnotes section; otherwise an ordinary <section> kept as raw HTML
          if (!spansOnly && options.footnotes && /(?:^| )footnotes(?: |$)/.test(node.getAttribute('class') || '')) {
            txt = showdown.subParser('makeMarkdown.footnotes')(node, options, globals) + '\n\n';
          } else {
            txt = renderRawElement(node, tagName);
            if (!spansOnly) { txt += '\n\n'; }
          }
          break;

        default:
          // unknown tag: keep the wrapper as raw HTML but still convert its children
          txt = renderRawElement(node, tagName);
          if (!spansOnly) { txt += '\n\n'; }
      }

      // common normalization
      // TODO eventually

      return txt;
    })();
  }

  return showdown.Event.dispatchEnd('makeMarkdown.node.onEnd', result, options, globals, {_node: node}).output;
});
