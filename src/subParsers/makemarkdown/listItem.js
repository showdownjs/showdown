/**
 * @file      makemarkdown/listItem.js
 * @summary   Renders a single `<li>` back to a Markdown list item, indenting nested lists onto their own lines.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * A `makeMarkdown.*` DOM-node subparser (HTML→Markdown). Emits `makeMarkdown.listItem.onStart`/`onCapture`/`onEnd`.
 */
showdown.subParser('makeMarkdown.listItem', function (node, options, globals) {
  'use strict';

  let input = node.outerHTML;
  showdown.Event.dispatchStart('makeMarkdown.listItem.onStart', input, options, globals, {_node: node});

  let text = (function () {
    let listItemTxt = '';

    let children = node.childNodes,
        childrenLenght = children.length;

    for (let i = 0; i < childrenLenght; ++i) {
      let child = children[i];
      // A nested list or following block element must begin on its own line,
      // otherwise the indentation step below glues it to the preceding inline
      // text (e.g. `a<ul>…` would render as `- a- b`, and `Step one<p>…`
      // would render as `- Step oneDetails here.`).
      if (child.nodeType === 1 && listItemTxt !== '' && !/\n$/.test(listItemTxt)) {
        if (/^[ou]l$/i.test(child.tagName)) {
          listItemTxt += '\n';
        } else if (/^(?:p|pre|blockquote)$/i.test(child.tagName)) {
          listItemTxt += '\n\n';
        }
      }
      listItemTxt += showdown.subParser('makeMarkdown.node')(child, options, globals);
    }
    // if it's only one liner, we need to add a newline at the end
    if (!/\n$/.test(listItemTxt)) {
      listItemTxt += '\n';
    }
    // A trailing newline alone is still a single line. Internal newlines mean
    // a nested list or a following block that must be indented to stay in the item.
    if (listItemTxt.indexOf('\n') !== listItemTxt.length - 1) {
      listItemTxt = listItemTxt
        .split('\n')
        .join('\n    ')
        .replace(/^ {4}$/gm, '')
        .replace(/\n\n+/g, '\n\n');
    }

    return listItemTxt;
  })();

  let captureEvent = showdown.Event.dispatchCapture('makeMarkdown.listItem.onCapture', input, {
    regexp: null,
    matches: {_wholeMatch: input, _node: node, text: text},
    attributes: null
  }, options, globals);

  let result;
  if (captureEvent.output && captureEvent.output !== '') {
    result = captureEvent.output;
  } else {
    result = captureEvent.matches.text;
  }

  return showdown.Event.dispatchEnd('makeMarkdown.listItem.onEnd', result, options, globals, {_node: node}).output;
});
