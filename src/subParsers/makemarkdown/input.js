showdown.subParser('makeMarkdown.input', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.input.onStart', node.outerHTML);
  startEvent
    .setOutput(null)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  startEvent = globals.converter.dispatch(startEvent);

  let result;
  if (startEvent.output && startEvent.output !== '') {
    result = startEvent.output;
  } else {
    result = (function () {
      // A checkbox input maps to a `[ ]`/`[x]` task marker only when the `tasklists` option
      // is enabled AND the checkbox lives inside a list item. The list-item context matters:
      // in Markdown a `[ ]`/`[x]` marker is only a task when it leads a list item, so a naked
      // checkbox (top level, or inside a `<p>`/`<div>`) would degrade into meaningless literal
      // bracket text that no longer round-trips back to a checkbox. Detection deliberately
      // keys on the `<li>` ancestry rather than the `task-list-item` class (which `makeHtml`
      // only emits under `moreStyling`), so checkboxes in hand-written or unstyled list HTML
      // are still recognised. Anything that fails these checks passes through as raw HTML.
      // A `checked` attribute (any value, including empty) marks it done; its absence open.
      if (node.getAttribute('type') !== 'checkbox' || !options.tasklists || !isInsideListItem(node)) {
        return node.outerHTML;
      }
      return (node.getAttribute('checked') !== null) ? '[x]' : '[ ]';
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.input.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;

  // Walks up the ancestor chain looking for an enclosing `<li>` (covers both tight
  // `<li><input>` items and loose `<li><p><input>` ones).
  function isInsideListItem (n) {
    let parent = n.parentNode;
    while (parent && typeof parent.tagName !== 'undefined') {
      if (parent.tagName.toLowerCase() === 'li') {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
});
