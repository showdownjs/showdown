//  vimeo Extension
//  changes http://vimeo.com/12345678
//  into an embedded iframe

(function(){

  var vimeoTemplate = ['<iframe sandbox="allow-same-origin allow-scripts allow-popups" id="foo" width="100%" height="90%" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" src="http://player.vimeo.com/video/','?api=1"> </iframe>'];
  var vimeo = function(converter) {
    return [
      { type: 'lang', regex: 'http:\/\/(www\.)?vimeo.com\/(\\\d{8})', replace: vimeoTemplate[0]+"$2"+vimeoTemplate[1] }
    ];
  }
  
  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.vimeo = vimeo; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = vimeo;

}());
