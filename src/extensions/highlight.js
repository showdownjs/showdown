/* jshint node:true, browser:true, -W044 */

// Adds highlight syntax as per RedCarpet:
//
// https://github.com/vmg/redcarpet
//
// This is ==highlighted==. It looks like this: <mark>highlighted</mark>

(function () {
    var highlight = function () {
        return [
            {
                type: 'html',
                extract: 'all',
                filter: function (text) {
                    var highlightRegex = /(=){2}([\s\S]+?)(=){2}/gim;

                    text = text.replace(highlightRegex, function (match, n, content) {
                        // Check the content isn't just an `=`
                        if (!/^=+$/.test(content)) {
                            return '<mark>' + content + '</mark>';
                        }

                        return match;
                    });

                    return text;
                }
            },
            {
                // Escaped equals
                type: 'html',
                regex: '\\\\(=)',
                replace: function (match, content) {
                    return content;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.highlight = highlight;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = highlight;
    }
}());
