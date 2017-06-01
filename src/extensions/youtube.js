/*  Youtube Extension
    ^http://www.youtube.com/watch?v=0mmx68VmTEo  ->
    <iframe  src=\"//www.youtube.com/embed/0mmx68VmTEo?rel=0\"\nframeborder=\"0\" allowfullscreen></iframe>
*/

(function() {
  var youtube = function(converter) {
    return [
      {
        type: 'lang',
        regex: '\\^\\^([\\S]+)',
        replace: function(match, url) {
          var m, video_id, youtube;
          youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          if (youtube.test(url)) {
            m = url.match(youtube);
            if (m && m[7].length === 11) {
              video_id = m[7];
              return "<iframe  src=\"//www.youtube.com/embed/" + video_id + "?rel=0\"\nframeborder=\"0\" allowfullscreen></iframe>";
            } else {
              return match;
            }
          } else {
            return match;
          }
        }
      }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.twitter = youtube; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = youtube;

}());
