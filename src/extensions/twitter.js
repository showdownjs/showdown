//
//  Twitter Extension
//  @username   ->  <a href="http://twitter.com/username">@username</a>
//  #hashtag    ->  <a href="http://twitter.com/search/%23hashtag">#hashtag</a>
//  https://twitter.com/jack/status/20 -> <blockquote class="twitter-tweet">
//                                          <a href="https://twitter.com/jack/status/20">Tweet from @jack</a>
//                                        </blockquote>
//                                        <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
//

(function(){

    var twitter = function(converter) {
        return [

            // @username syntax
            { type: 'lang', regex: '\\B(\\\\)?@([\\S]+)\\b', replace: function(match, leadingSlash, username) {
                // Check if we matched the leading \ and return nothing changed if so
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    return '<a href="http://twitter.com/' + username + '">@' + username + '</a>';
                }
            }},

            // #hashtag syntax
            { type: 'lang', regex: '\\B(\\\\)?#([\\S]+)\\b', replace: function(match, leadingSlash, tag) {
                // Check if we matched the leading \ and return nothing changed if so
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    return '<a href="http://twitter.com/search/%23' + tag + '">#' + tag + '</a>';
                }
            }},

            // Escaped @'s
            { type: 'lang', regex: '\\\\@', replace: '@' },
            
            // New line with a twitter url => embedded tweet
            {
                type    : 'lang',
                regex   : '\n(https?:\/\/twitter\.com\/([^\/]{1,15})\/status(es)?\/[0-9]{1,100})',
                replace : function (match, permalink, username) {
                    return '<blockquote class="twitter-tweet"><a href="'+permalink+'">Tweet from @'+username+'</a></blockquote><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.twitter = twitter; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = twitter;

}());
