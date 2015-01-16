/**
 * Credits to Christopher (https://github.com/cwalker107)
 */

/**
 * If text is being pulled from indented HTML elements, i.e.
 * <body>
 *     <div>
 *         ## Content to be converted
 *     </div>
 * </body>
 */
showdown.subParser('allowBlockIndents', function (text, config, globals) {
    'use strict';

    if (!config.allowBlockIndents) {
        return text;
    }

    //Split the given array by it's new line characters
    var textSplitArr = text.split('\n');
    //We'll use this later to determine if there are leading whitespace characters
    var leadingWhiteChars = 0;
    var i;

    for(i=0; i<=textSplitArr.length;i++) {
        if(textSplitArr[i] !== undefined) {

            // Trim all trailing whitespaces from each line
            textSplitArr[i].replace(/[\s]*$/,'');

            // roots out empty array values
            if(textSplitArr[i].length > 0) {

                // Defines this single line's leading whitespace
                var lineLeadingWhiteChars = (textSplitArr[i].match(/^(\s)*/))[0].length;

                // Determine how much the text is indented
                // by. This fixes nesting issues and also
                // doesn't break MarkDown syntax if code is on
                // the first lines
                if(leadingWhiteChars === 0 || (lineLeadingWhiteChars < leadingWhiteChars)) {
                    if(textSplitArr[i].match(/[^\s]$/) !== null) {
                        leadingWhiteChars = lineLeadingWhiteChars;
                    }
                }
            }
        }
    }

    // Only a regex that will replace how much it is indented by
    var reg = '^\\s{'+leadingWhiteChars+'}';
    for(i=0; i<=textSplitArr.length;i++) {
        if(textSplitArr[i] !== undefined) {
            // Replace leading indents
            textSplitArr[i] = textSplitArr[i].replace(new RegExp(reg),'');
        }
    }
    text = textSplitArr.join('\n\n'); //Join it all back together

    return text;
});
