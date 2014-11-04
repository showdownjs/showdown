//
//  Twitter Extension
//  @username   ->  <a href="http://twitter.com/username">@username</a>
//  #hashtag    ->  <a href="http://twitter.com/search/%23hashtag">#hashtag</a>
//

(function(){

    var furigana = function(converter) {
        return [

            // @username syntax
            { type: 'lang', regex: '([\u4e00-\u9faf])（([\u3040-\u3096]+?)）', replace: function(match, kanji, furigana) {
                // Check if we matched the leading \ and return nothing changed if so
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    return '<ruby><rb>'+kanji + '</rb><rp>(</rp><rt>'+furigana+'</rt><rp>)</rp></ruby>';
                }
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.furigana = furigana; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = furigana;

}());
