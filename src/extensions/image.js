/* jshint node:true, browser:true */

// Part of Ghost GFM

(function () {
    var image = function () {
        return [
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
        window.Showdown.extensions.image = image;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = image;
    }
}());
