/**
 * Created by Estevao on 12-01-2015.
 */

/**
 * Process Markdown `<pre><code>` blocks.
 */
showdown.subParser('codeBlocks', function (text, options, globals) {
    'use strict';

    /*
     text = text.replace(text,
     /(?:\n\n|^)
     (								// $1 = the code block -- one or more lines, starting with a space/tab
     (?:
     (?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
     .*\n+
     )+
     )
     (\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width
     /g,function(){...});
     */

    // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
    text += '~0';

    text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
        function (wholeMatch, m1, m2) {
            var codeblock = m1,
                nextChar = m2;

            codeblock = showdown.subParser('outdent')(codeblock);
            codeblock = showdown.subParser('encodeCode')(codeblock);
            codeblock = showdown.subParser('detab')(codeblock);
            codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
            codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

            codeblock = '<pre><code>' + codeblock + '\n</code></pre>';

            return showdown.subParser('hashBlock')(codeblock, options, globals) + nextChar;
        }
    );

    // attacklab: strip sentinel
    text = text.replace(/~0/, '');

    return text;
});
