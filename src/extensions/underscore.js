/* jshint node:true, browser:true */

// Part of Ghost GFM

(function () {
    var underscore = function () {
        return [
            // Multiple underscores
            // keep 4 or more inline underscores e.g. Ghost rocks my _____!
            // Lang extension = happens BEFORE showdown
            {
                type: 'lang',
                extract: 'url',
                filter: function (text) {
                    return text.replace(/([^_\n\r])(_{4,})/g, function (match, prefix, underscores) {
                        return prefix + underscores.replace(/_/g, '\\_');
                    });
                }
            },
            // GFM Underscore rules
            // Prevent foo_bar and foo_bar_baz from ending up with an italic word in the middle
            // Lang extension = happens BEFORE showdown
            {
                type: 'lang',
                filter: function (text) {
                    // Prevent double-escaping
                    text = text.replace(/\\_/g, '~U');

                    text = text.replace(/[^_\n\s]([^\s]+?_)+[^\s_]+?[^_]/gm, function (fullmatch) {
                        return fullmatch.replace(/_/g, '\\_');
                    });

                    text = text.replace(/~U/g, '\\_');

                    return text;
                }
            },
            // Handle escaped underscores
            // HTML extension = happens AFTER showdown
            {
                type: 'html',
                regex: '\\\\(_)',
                replace: function (match, content) {
                    return content;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.underscore = underscore;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = underscore;
    }
}());
