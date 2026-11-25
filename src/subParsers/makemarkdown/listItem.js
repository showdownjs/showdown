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
      let childOutput = showdown.subParser('makeMarkdown.node')(child, options, globals);
      // A block child must begin on its own line, otherwise the indentation step below
      // glues it to the preceding inline text (e.g. `a<p>…` would render as `- aDetails`
      // instead of `- a` followed by an indented paragraph). Block subparser output ends
      // with a blank line, so the trailing newlines mark a block child. A non-list block
      // also needs a blank line before it to stay a separate block inside the item, the
      // same separation two `<p>` children get, while a nested list stays tight with one.
      if (child.nodeType === 1 && /\n\n$/.test(childOutput) &&
          listItemTxt !== '' && !/\n$/.test(listItemTxt)) {
        listItemTxt += /^[ou]l$/i.test(child.tagName) ? '\n' : '\n\n';
      }
      listItemTxt += childOutput;
    }
    // if it's only one liner, we need to add a newline at the end
    if (!/\n$/.test(listItemTxt)) {
      listItemTxt += '\n';
    } else {
      // it's multiparagraph, so we need to indent
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
