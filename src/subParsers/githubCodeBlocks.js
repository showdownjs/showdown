/**
 * Handle github codeblocks prior to running HashHTML so that
 * HTML contained within the codeblock gets escaped properly
 * Example:
 * ```ruby
 *     def hello_world(x)
 *       puts "Hello, #{x}"
 *     end
 * ```
 */
showdown.subParser('githubCodeBlocks', function (text, options, globals) {
  'use strict';

  text += '~0';

  text = text.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g, function (wholeMatch, m1, m2) {
    var language = m1,
        codeblock = m2,
        end = '\n';

    if (options.omitExtraWLInCodeBlocks) {
      end = '';
    }

    codeblock = showdown.subParser('encodeCode')(codeblock);
    codeblock = showdown.subParser('detab')(codeblock);
    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

    codeblock = '<pre><code' + (language ? ' class="' + language + '"' : '') + '>' + codeblock + end + '</code></pre>';

    return showdown.subParser('hashBlock')(codeblock, options, globals);
  });

  // attacklab: strip sentinel
  text = text.replace(/~0/, '');

  return text;

});
