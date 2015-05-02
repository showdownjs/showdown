/* jshint node:true, browser:true, -W049 */

// Part of Ghost GFM

(function () {
    var autolink = function () {
        return [
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

                    return text;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.autolink = autolink;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = autolink;
    }
}());
