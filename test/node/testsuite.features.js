/**
 * Created by Estevao on 08-06-2015.
 */
var bootstrap = require('../bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/features/'),
    tableSuite = bootstrap.getTestSuite('test/features/tables/');

describe('makeHtml() features testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {
    var converter;
    if (testsuite[i].name === '#143.support_image_dimensions') {
      converter = new showdown.Converter({parseImgDimensions: true});
    } else if (testsuite[i].name === '#69.header_level_start') {
      converter = new showdown.Converter({headerLevelStart: 3});
    } else if (testsuite[i].name === '#164.1.simple_autolink') {
      converter = new showdown.Converter({simplifiedAutoLink: true});
    } else if (testsuite[i].name === '#164.2.disallow_underscore_emphasis_mid_word') {
      converter = new showdown.Converter({literalMidWordUnderscores: true});
    } else if (testsuite[i].name === '#164.3.strikethrough') {
      converter = new showdown.Converter({strikethrough: true});
    } else if (testsuite[i].name === 'disable_gh_codeblocks') {
      converter = new showdown.Converter({ghCodeBlocks: false});
    } else if (testsuite[i].name === '#164.4.tasklists') {
      converter = new showdown.Converter({tasklists: true});
    } else {
      converter = new showdown.Converter();
    }
    it(testsuite[i].name, assertion(testsuite[i], converter));
  }

  describe('table support', function () {
    var converter;
    for (var i = 0; i < tableSuite.length; ++i) {
      if (tableSuite[i].name === 'basic_with_header_ids') {
        converter = new showdown.Converter({tables: true, tableHeaderId: true});
      } else if (tableSuite[i].name === '#179.parse_md_in_table_ths') {
        converter = new showdown.Converter({tables: true, strikethrough: true});
      } else {
        converter = new showdown.Converter({tables: true});
      }
      it(tableSuite[i].name, assertion(tableSuite[i], converter));
    }
  });

});
