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
    var getList = this.getList = function() {
      var dfd = jQuery.Deferred();
      $.getJSON('blog/posts.json', function(data) {
        for (var i = 0; i < data.length; ++i) {
          data[i].metadata.summary = converter.makeHtml(data[i].metadata.summary);
        }
        dfd.resolve(data);
      });
      return dfd.promise();
    };

    this.getPostByCanonical = function(canonical) {
      var dfd = jQuery.Deferred();
      $.when(getList()).then(function(list) {
        for (var i = 0; i < list.length; ++i) {
          if (list[i].canonical === canonical) {
            var promise = $.ajax({
              url: list[i].url,
              dataType: "text"
            });
            promise.done((function (index, listItem) {
              return function (md) {
                listItem.post = converter.makeHtml(md);
                dfd.resolve(listItem);
              };
            })(i, list[i]));
            return;
          }
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

  function loadPage(url, params) {
    var $page = $('#page');
    return $page.load(url, function () {
      if (params && params.page === 'blog-article') {
        $.when(blogPosts.getPostByCanonical(params.canonical)).then(function(post) {
          var article = Mustache.render($('#blog-article-tpl').html(), post);
          $('#blog-post-container').html(article);

          $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
            hljs.lineNumbersBlock(block);
          });
          router.updatePageLinks();
        });
      }
      
      $page.find('pre>code').each(function(i, block) {
        hljs.highlightBlock(block);
        hljs.lineNumbersBlock(block);
        router.updatePageLinks();
      });
    });
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
    .on('/releases', function (params) {
      changeActiveLink('releases');
      return loadPage('html/releases.html', params);
    })
    .on('/documentation', function (params) {
      changeActiveLink('documentation');
      return loadPage('html/documentation.html', params);
    })
    .on('/blog/:canonical', function (params) {
      params.page = 'blog-article';
      changeActiveLink('blog');
      return loadPage('html/blog-article.html', params);
    })
    .on('/blog', function (params) {
      changeActiveLink('blog');
      return loadPage('html/blog.html', params);
    })
    .on('*', function (params) {
      changeActiveLink('home');
      return loadPage('html/main.html', params);
    })
    .resolve();


  $('.internal-navigation').click(function() {
    // smooth scroll to page
    $('html, body').animate({
      scrollTop: $('#page').offset().top
    }, 500);
  })

});
