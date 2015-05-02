/* jshint node:true, browser:true */

// Part of Ghost GFM

(function () {
    var strikethrough = function () {
        return [
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
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.strikethrough = strikethrough;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = strikethrough;
    }
}());
