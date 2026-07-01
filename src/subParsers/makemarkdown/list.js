showdown.subParser('makeMarkdown.list', function (node, options, globals, type) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.list.onStart', node.outerHTML);
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
      let txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      let listItems       = node.childNodes,
          listItemsLenght = listItems.length,
          listNum = node.getAttribute('start') || 1;

      for (let i = 0; i < listItemsLenght; ++i) {
        if (typeof listItems[i].tagName === 'undefined' || listItems[i].tagName.toLowerCase() !== 'li') {
          continue;
        }

        // define the bullet to use in list
        let bullet;
        if (type === 'ol') {
          bullet = listNum.toString() + '. ';
        } else {
          bullet = '- ';
        }

        // parse list item
        txt += bullet + showdown.subParser('makeMarkdown.listItem')(listItems[i], options, globals);
        ++listNum;
      }

      return txt.trim();
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.list.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
