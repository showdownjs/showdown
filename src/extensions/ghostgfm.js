/* jshint node:true, browser:true */

// Ghost GFM
// Taken and extended from the Showdown Github Extension (WIP)
// Makes a number of pre and post-processing changes to the way markdown is handled
//
//  ~~strike-through~~   ->  <del>strike-through</del>
//  GFM underscores
//  + 4 or more underscores
//  GFM newlines
//  GFM autolinking
//  Ghost custom image handling

(function () {
    var ghostgfm = function () {
        return [
            // -----------------------
            // Strike-through
            //
            // Convert double-tildes to Strike-through
            // Lang extension = happens BEFORE showdown
            // NOTE: showdown already replaced "~" with "~T", so we need to adjust accordingly.
            {
                type: 'lang',
                extract: 'all',
                regex: '(~T){2}([^~]+)(~T){2}',
                replace: function (match, prefix, content) {
                    return '<del>' + content + '</del>';
                }
            },
            // Handle escaped tildes
            // HTML extension = happens AFTER showdown
            // NOTE: showdown replaces "~" with "~T", and this char doesn't get escaped properly.
            {
                type: 'html',
                regex: '\\\\(~)',
                replace: function (match, content) {
                    return content;
                }
            },

            // -----------------------
            // Multiple underscores
            // keep 4 or more inline underscores e.g. Ghost rocks my _____!
            // Lang extension = happens BEFORE showdown
            {
                type: 'lang',
                extract: ['url'],
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
            },

            // -----------------------
            // GFM newline modifications
            //
            // In very clear cases, let newlines become <br /> tags
            // Lang extension = happens BEFORE showdown
            {
                type: 'lang',
                extract: ['code'],
                filter: function (text) {

                    text = text.replace(/(?!\d+\.)(^[\w'\"][^\n]*)\n(?!(\n|-{3,}|={3,}))/gm, function (match) {
                        return match.trim() + '  \n';
                    });

                    return text;
                }
            },

            // -----------------------
            // GFM autolinking
            //
            // Handles autolinking URLs
            // HTML extension = happens AFTER showdown
            {
                type: 'html',
                extract: ['code', 'def'],
                filter: function (text) {
                    // match a URL
                    // adapted from https://gist.github.com/jorilallo/1283095#L158
                    // and http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
                    /*jshint -W049 */
                    text = text.replace(/(\]\(|\]|\[|<a[^\>]*?\>)?https?\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!]/gmi,
                        function (wholeMatch, lookBehind, matchIndex) {
                            // Check we are not inside an HTML tag
                            var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
                            if ((left.match(/<[^>]+$/) && right.match(/^[^>]*>/)) || lookBehind) {
                                return wholeMatch;
                            }
                            // If we have a matching lookBehind, this is a failure, else wrap the match in <a> tag
                            return lookBehind ? wholeMatch : '<a href="' + wholeMatch + '">' + wholeMatch + '</a>';
                        });
                    /*jshint +W049 */

                    return text;
                }
            },

            // Ghost image replacement
            //
            // Has better URL support, but no title support
            // Lang extension = happens BEFORE showdown
            // TODO: make this even better
            {
                type: 'lang',
                extract: ['code'],
                filter: function (text) {
                    var imageMarkdownRegex = /^(?:\{(.*?)\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim;

                    text = text.replace(imageMarkdownRegex, function (match, key, alt, src) {
                        if (src) {
                            return '<img src="' + src + '" alt="' + alt + '" />';
                        }

                        return '';
                    });

                    return text;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.ghostgfm = ghostgfm;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = ghostgfm;
    }
}());
