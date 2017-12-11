latestVersion = 0;

$(document).ready(function() {

  getLatestVersion();

  function loadPage(url) {
    $('#page')
      .load(url, function () {
        console.log('navigate to ' + url);
        $('#page').find('pre>code').each(function(i, block) {
          hljs.highlightBlock(block);
          hljs.lineNumbersBlock(block);
        });
      })
  }

  function getCurrentUrl (router) {
    var uriSplit = window.location.href.split('#!');
    var defaultShebang = '#!/home';
    var shebang = '';
    var currentUrl = '';
    if (typeof uriSplit[1] === 'undefined') {
      shebang = defaultShebang;
    } else {
      shebang = '#!' + uriSplit[1];
    }
    if (router.hasOwnProperty(shebang)) {
      currentUrl = router[shebang];
    } else {
      currentUrl = router[defaultShebang];
    }
    return currentUrl;
  }

  function getLatestVersion() {
    $.getJSON('https://api.github.com/repos/showdownjs/showdown/releases/latest', function (data) {
      $('#lt-version-num').html('v' + data.tag_name);
      $('#lt-version-lnk').attr('href', data.zipball_url);
      latestVersion = data.tag_name;
    });
  }



  $('.internal-navigation').click(function(evt) {
    $('.internal-navigation').removeClass('active');
    $(this).addClass('active');

    var url = $(this).attr('data-href');
    //load page
    loadPage(url);

    // smooth scroll to page
    $('html, body').animate({
      scrollTop: $('#page').offset().top
    }, 500);
  });


  var router = {};


  $('.internal-navigation').each(function () {
    var shebang = $(this).attr('href');
    router[shebang] = $(this).attr('data-href');
  });

  // load page on startup
  loadPage(getCurrentUrl(router));
});
