/**
 * Created by Tivie on 21/12/2016.
 */
'use strict';
var fs = require('fs'),
    showdown = require('../../.build/showdown.js'),
    converter = new showdown.Converter(),
    pkg = require('../../package.json'),
    performance = require('./lib/performance.lib.js');

performance.setLibraryName(pkg.name);
performance.setVersion(pkg.version);
performance.setGithubLink('https://github.com/showdownjs/showdown/tree/');

var globals = {
      gHtmlBlocks:     [],
      gHtmlMdBlocks:   [],
      gHtmlSpans:      [],
      gUrls:           {},
      gTitles:         {},
      gDimensions:     {},
      hashLinkCounts:  {},
      converter:       converter,
      ghCodeBlocks:    []
    },
    options = showdown.getOptions();

function runTests () {
  var testMDFile = fs.readFileSync('test/performance.testfile.md', 'utf8');
  new performance.Suite('Basic')
    .setOption('cycles', 50)
    .add('Simple "Hello World"', function () {
      converter.makeHtml('*Hello* **World**!');
    })
    .add('performance.testfile.md', {
      prepare: function () {
        return testMDFile;
      },
      test: function (mdText) {
        converter.makeHtml(mdText);
      }
    });
  new performance.Suite('subParsers')
    .setOption('cycles', 20)
    .add('hashHTMLBlocks', function () {
      showdown.helper.hashHTMLBlocks(testMDFile, options, globals);
    })
    .add('blockQuotes', function () {
      showdown.subParser('makehtml.blockquote')(testMDFile, options, globals);
    })
    .add('codeBlocks', function () {
      showdown.subParser('makehtml.codeBlock')(testMDFile, options, globals);
    })
    .add('codeSpans', function () {
      showdown.subParser('makehtml.codeSpan')(testMDFile, options, globals);
    })
    .add('encodeCode', function () {
      showdown.helper.encodeCode(testMDFile);
    })
    .add('githubCodeBlocks', function () {
      showdown.subParser('makehtml.githubCodeBlock')(testMDFile, options, globals);
    })
    .add('hashBlock', function () {
      showdown.helper.hashBlock(testMDFile, options, globals);
    })
    .add('headers', function () {
      let t = showdown.subParser('makehtml.heading.setext')(testMDFile, options, globals);
      showdown.subParser('makehtml.heading.atx')(t, options, globals);
    })
    .add('horizontalRule', function () {
      showdown.subParser('makehtml.horizontalRule')(testMDFile, options, globals);
    })
    .add('lists', function () {
      showdown.subParser('makehtml.list')(testMDFile, options, globals);
    })
    .add('paragraphs', function () {
      showdown.subParser('makehtml.paragraphs')(testMDFile, options, globals);
    })
    .add('inlineEngine', function () {
      showdown.subParser('makehtml.inlineEngine')(testMDFile, options, globals);
    })
    .add('stripLinkDefinitions', function () {
      showdown.subParser('makehtml.stripLinkDefinitions')(testMDFile, options, globals);
    })
    .add('tables', function () {
      showdown.subParser('makehtml.table')(testMDFile, options, globals);
    })
    .add('unescapeSpecialChars', function () {
      showdown.helper.unescapePlaceholders(testMDFile);
    });
}

function generateLogs () {
  performance.generateLog(null, null, true);
}

module.exports = {
  runTests: runTests,
  generateLogs: generateLogs
};
