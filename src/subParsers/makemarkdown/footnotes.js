// Reverse direction (HTML -> Markdown) for GFM footnotes. Handles the two shapes the
// forward parser (and GitHub) produce:
//   <sup class="footnote-ref"><a href="#fn-ID" ...>N</a></sup>      -> [^ID]
//   <section class="footnotes"><ol><li id="fn-ID">...<a class="footnote-backref">...</a></li></ol></section>
//                                                                   -> [^ID]: ...body...
// Gated by the `footnotes` option in makeMarkdown.node, mirroring makeHtml.
showdown.subParser('makeMarkdown.footnotes', function (node, options, globals) {
  'use strict';

  let startEvent = new showdown.Event('makeMarkdown.footnotes.onStart', node.outerHTML);
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
      let tagName = node.tagName.toLowerCase();

      if (tagName === 'sup') {
        return renderReference(node);
      }
      if (tagName === 'section') {
        return renderSection(node);
      }
      return '';
    })();
  }

  let endEvent = new showdown.Event('makeMarkdown.footnotes.onEnd', result);
  endEvent
    .setOutput(result)
    ._setGlobals(globals)
    ._setOptions(options)
    .setMatches({node: node});
  endEvent = globals.converter.dispatch(endEvent);
  return endEvent.output;

  // the label lives in the `#fn-<label>` href (percent-encoded by makeHtml); recover it
  function decodeLabel (s) {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }

  function renderReference (sup) {
    let a = sup.querySelector('a');
    if (!a) { return ''; }
    let label = decodeLabel((a.getAttribute('href') || '').replace(/^#fn-/, ''));
    return '[^' + label + ']';
  }

  function renderSection (section) {
    let items = section.querySelectorAll('ol > li');
    if (!items.length) { items = section.querySelectorAll('li'); }
    let defs = [];
    for (let i = 0; i < items.length; ++i) {
      let li = items[i],
          label = decodeLabel((li.getAttribute('id') || '').replace(/^fn-/, ''));

      // drop the back-reference anchors (and the nested <sup> some carry)
      let backrefs = li.querySelectorAll('a.footnote-backref');
      for (let b = 0; b < backrefs.length; ++b) {
        backrefs[b].parentNode.removeChild(backrefs[b]);
      }

      // render the cleaned body
      let body = '';
      for (let c = 0; c < li.childNodes.length; ++c) {
        body += showdown.subParser('makeMarkdown.node')(li.childNodes[c], options, globals);
      }
      body = body
        .replace(/[ \t]+$/gm, '') // trailing space left by a removed backref
        .replace(/\n+$/, '');

      // `[^label]: ` on the first line; continuation lines indented by 4 spaces
      let lines = body.split('\n'),
          def = '[^' + label + ']: ' + (lines[0] || '');
      for (let l = 1; l < lines.length; ++l) {
        def += '\n' + (lines[l] === '' ? '' : '    ' + lines[l]);
      }
      defs.push(def);
    }
    return defs.join('\n\n');
  }
});
