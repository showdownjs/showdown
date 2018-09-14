/**
 * Process Markdown `<pre><code>` blocks.
 */
showdown.subParser('makehtml.codeBlocks', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.codeBlocks.before', text, options, globals).getText();

  // sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
  text = text.replace(pattern, function (wholeMatch, m1, m2) {
    var codeblock = m1,
        nextChar = m2,
        end = '\n';

    codeblock = showdown.subParser('makehtml.outdent')(codeblock, options, globals);
    codeblock = showdown.subParser('makehtml.encodeCode')(codeblock, options, globals);
    codeblock = showdown.subParser('makehtml.detab')(codeblock, options, globals);
    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

    if (options.omitExtraWLInCodeBlocks) {
      end = '';
    }

    codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

    return showdown.subParser('makehtml.hashBlock')(codeblock, options, globals) + nextChar;
  });

  // strip sentinel
  text = text.replace(/¨0/, '');

  text = globals.converter._dispatch('makehtml.codeBlocks.after', text, options, globals).getText();
  return text;
});
