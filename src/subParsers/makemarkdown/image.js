showdown.subParser('makeMarkdown.image', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.image.onStart', node.outerHTML);
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

      // reverse the `emoji` option: "special" emoji render as an <img> whose src is known.
      // Map that back to its :code:. When emoji is off (or the src isn't an emoji) this falls
      // through to normal image handling, so a disabled feature degrades to plain image markdown.
      if (options.emoji && node.hasAttribute('src')) {
        let emojiImages = showdown.helper.emojiReverse().images,
            src = node.getAttribute('src');
        if (emojiImages.hasOwnProperty(src)) {
          return ':' + emojiImages[src] + ':';
        }
      }

      if (node.hasAttribute('src') && node.getAttribute('src') !== '') {
        let hasDimensions = node.hasAttribute('width') && node.hasAttribute('height');

        // image dimensions are a showdown-specific syntax; when the option is disabled but the
        // image carries dimensions, fall back to raw HTML so the size isn't silently lost
        if (hasDimensions && !options.parseImgDimensions) {
          return node.outerHTML;
        }

        txt += '![' + (node.getAttribute('alt') || '') + '](';
        txt += '<' + node.getAttribute('src') + '>';
        if (hasDimensions) {
          let width = node.getAttribute('width');
          let height = node.getAttribute('height');
          txt += ' =' + (width === 'auto' ? '*' : width) + 'x' + (height === 'auto' ? '*' : height);
        }

        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.image.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;
});
