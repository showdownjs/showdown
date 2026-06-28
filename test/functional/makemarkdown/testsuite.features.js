/**
 * Created by Estevao on 08-06-2015.
 */
var bootstrap = require('./makemarkdown.bootstrap.js'),
    showdown = bootstrap.showdown,
    assertion = bootstrap.assertion,
    issues = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/issues/'),
    ghMentions = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/ghMentions/'),
    emoji = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/emoji/'),
    ellipsis = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/ellipsis/'),
    fallback = bootstrap.getTestSuite('test/functional/makemarkdown/cases/features/fallback/');

describe('makeMarkdown() features testsuite', function () {
  'use strict';

  describe('issues', function () {
    // issue fixtures assert full markdown emission, so run with the reverse features enabled
    var converter = new showdown.Converter({
      strikethrough: true, tables: true, tasklists: true, underline: true, parseImgDimensions: true
    });
    for (var i = 0; i < issues.length; ++i) {
      it(issues[i].name.replace(/-/g, ' '), assertion(issues[i], converter));
    }
  });

  describe('ghMentions', function () {
    var converter = new showdown.Converter({ ghMentions: true });
    for (var i = 0; i < ghMentions.length; ++i) {
      it(ghMentions[i].name.replace(/-/g, ' '), assertion(ghMentions[i], converter));
    }
  });

  describe('emoji', function () {
    var converter = new showdown.Converter({ emoji: true });
    for (var i = 0; i < emoji.length; ++i) {
      it(emoji[i].name.replace(/-/g, ' '), assertion(emoji[i], converter));
    }
  });

  describe('ellipsis', function () {
    var converter = new showdown.Converter({ ellipsis: true });
    for (var i = 0; i < ellipsis.length; ++i) {
      it(ellipsis[i].name.replace(/-/g, ' '), assertion(ellipsis[i], converter));
    }
  });

  describe('raw HTML fallback (feature disabled)', function () {
    // every non-standard feature is turned off, so each construct falls back to raw HTML
    // (or, for emoji/ellipsis, to literal pass-through)
    var converter = new showdown.Converter({
      strikethrough: false, tables: false, tasklists: false,
      underline: false, parseImgDimensions: false, ghCodeBlocks: false,
      emoji: false, ellipsis: false
    });
    for (var i = 0; i < fallback.length; ++i) {
      it(fallback[i].name.replace(/-/g, ' '), assertion(fallback[i], converter));
    }
  });
});
