/* jshint node:true, browser:true */

// Part of Ghost GFM

(function () {
    var newline = function () {
        return [
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
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.newline = newline;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = newline;
    }
}());


// (^[^\n]+?)((\n[^\n]+$)+)