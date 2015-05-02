/* jshint node:true, browser:true */

// Adds footnote syntax as per Markdown Extra:
//
// https://michelf.ca/projects/php-markdown/extra/#footnotes
//
// That's some text with a footnote.[^1]
//
// [^1]: And that's the footnote.
//
//     That's the second paragraph.
//
// Also supports [^n] if you don't want to worry about preserving
// the footnote order yourself.

function replaceInlineFootnotes(text) {
    // Inline footnotes e.g. "foo[^1]"
    var inlineRegex = /(?!^)\[\^(\d+|n)\]/gim,
        i = 0;

    return text.replace(inlineRegex, function (match, n) {
        // We allow both automatic and manual footnote numbering
        if (n === 'n') {
            n = i + 1;
        }

        var s = '<sup id="fnref:' + n + '">' +
            '<a href="#fn:' + n + '" rel="footnote">' + n + '</a>' +
            '</sup>';
        i += 1;
        return s;
    });
}

function replaceEndFootnotes(text, converter) {
    // Expanded footnotes at the end e.g. "[^1]: cool stuff"
    var endRegex = /\[\^(\d+|n)\]: ([\s\S]*?)$(?!    )/gim,
        m = text.match(endRegex),
        total = m ? m.length : 0,
        i = 0;

    return text.replace(endRegex, function (match, n, content) {
        if (n === 'n') {
            n = i + 1;
        }

        content = content.replace(/\n    /g, '<br>');
        content = converter.makeHtml(content);
        content = content.replace(/<\/p>$/, '');
        var s = '<li class="footnote" id="fn:' + n + '">' +
            content + ' <a href="#fnref:' + n +
            '" title="return to article">↩</a>' +
            '</p></li>';

        if (i === 0) {
            s = '<div class="footnotes"><ol>' + s;
        }

        if (i === total - 1) {
            s = s + '</ol></div>';
        }

        i += 1;
        return s;
    });
}

(function () {
    var footnotes = function (converter) {
        return [
            {
                type: 'lang',
                extract: ['code', 'url', 'a', 'image-html'],
                filter: function (text) {
                    // Note that footnotes cannot be used inside of an anchor
                    // we don't enforce this because it's relatively tricky and unnecessary because it's just wrong :)
                    text = replaceInlineFootnotes(text);
                    text = replaceEndFootnotes(text, converter);

                    return text;
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.footnotes = footnotes;
    }
    // Server-side export
    if (typeof module !== 'undefined') {
        module.exports = footnotes;
    }
}());
