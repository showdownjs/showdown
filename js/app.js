var converter = new showdown.Converter({
  metadata: true,
  tables: true,
  strikethrough: true,
  ellipsis: true,
  headerLevelStart: 3
});

/** ROUTING **/
var router = new Navigo('http://showdownjs.com/', true, '#!');
/** BLOG POSTS **/
var blogPosts = {};

$(document).ready(function() {
  blogPosts = new BlogPosts();

  function BlogPosts () {
    var posts = [];
    var indexedList = {};

    var getList = this.getList = function() {
      var dfd = jQuery.Deferred();
      if (posts.length !== 0) {
        dfd.resolve(posts);
      } else {
        $.getJSON('blog/posts.json', function(data) {
          for (var i = 0; i < data.length; ++i) {
            data[i].metadata.summary = converter.makeHtml(data[i].metadata.summary);
          }
          dfd.resolve(data);
        });
      }
      return dfd.promise();
    };

    this.getPostByCanonical = function(canonical) {
      var dfd = jQuery.Deferred();
      var idx = null;

      if (typeof indexedList[canonical] !== 'undefined') {
        idx = indexedList[canonical];
      }

      $.when(getList()).then(function(list) {
        if (idx !== null) {
          
          dfd.resolve(list[idx]);
        } else {
          for (var i = 0; i < list.length; ++i) {
            console.log(idx, list[i]);
            if (list[i].canonical === canonical) {
              var promise = $.ajax({
                url: list[i].url,
                dataType: "text"
              });
              promise.done((function (index, listItem) {
                return function (md) {
                  listItem.post = converter.makeHtml(md);
                  posts[index] = listItem;
                  
                  indexedList[canonical] = index;
                  dfd.resolve(listItem);
                };
              })(i, list[i]));
              return;
            }
          }
          dfd.resolve(null);
        }
      });
      return dfd.promise();
    };
  }

  $(document).ajaxStart(function(){
    $.LoadingOverlay('show', {
      image: '',
      //color: 'rgba(166, 200, 157, 0.7)',
      color: '#fff',
      fontawesome: 'fa fa-spinner fa-spin'
    });
  });
  $(document).ajaxStop(function(){
    $.LoadingOverlay("hide");
  });

  function getLatestVersion() {
    var dfd = jQuery.Deferred();

    if (typeof Cookies.get('version') === 'undefined' || typeof Cookies.get('zipball') === 'undefined') {
      $.getJSON('https://api.github.com/repos/showdownjs/showdown/releases/latest', function (data) {
        var version = data.tag_name;
        var zipball = data.zipball_url;
        Cookies.set('version', version, { expires: 0.1 });
        Cookies.set('zipball', zipball, { expires: 0.1 });
        dfd.resolve({version: version, zipball: zipball});
      });
    } else {
      dfd.resolve({
        version: Cookies.get('version'),
        zipball: Cookies.get('zipball')
      });
    }
    return dfd.promise();
  }

  function loadPage(url) {
    var $page = $('#page');
    return $page.load(url, function () {
      $page.find('pre>code').each(function(i, block) {
        hljs.highlightBlock(block);
        hljs.lineNumbersBlock(block);
        router.updatePageLinks();
      });
    });
  }

  function injectParams(params) {
    if (typeof params !== 'undefined') {
      // pass params to page
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          var $pageParams = $('#page-params');
          $pageParams.html();
          $pageParams.append('<data id="param-' + param + '" value="'+ params[param] +'" hidden style="display: none;"></data>');
        }
      }
    }
  }

  function changeActiveLink(name) {
    $('.internal-navigation').removeClass('active');
    $('#navlink-' + name).addClass('active');
  }

  $.when(getLatestVersion()).then(
    function(data) {
      $('#lt-version-num').html('v' + data.version);
      $('#lt-version-lnk').attr('href', data.zipball);
    }
  );

  router
    .on('/releases', function () {
      changeActiveLink('releases');
      return loadPage('html/releases.html');
    })
    .on('/documentation', function () {
      changeActiveLink('documentation');
      return loadPage('html/documentation.html');
    })
    .on('/blog/:canonical', function (params) {
      changeActiveLink('blog');
      injectParams(params);
      return loadPage('html/blog-article.html', params);
    })
    .on('/blog', function () {
      changeActiveLink('blog');
      return loadPage('html/blog.html');
    })
    .on('*', function () {
      changeActiveLink('home');
      return loadPage('html/main.html');
    })
    .resolve();


  $('.internal-navigation').click(function() {
    // smooth scroll to page
    $('html, body').animate({
      scrollTop: $('#page').offset().top
    }, 500);
  })

});
