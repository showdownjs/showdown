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
      gListLevel:      0,
      hashLinkCounts:  {},
      langExtensions:  [],
      outputModifiers: [],
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
      showdown.subParser('makehtml.hashHTMLBlocks')(testMDFile, options, globals);
    })
    .add('anchors', function () {
      showdown.subParser('makehtml.anchors')(testMDFile, options, globals);
    })
    .add('autoLinks', function () {
      showdown.subParser('makehtml.autoLinks')(testMDFile, options, globals);
    })
    .add('blockQuotes', function () {
      showdown.subParser('makehtml.blockQuotes')(testMDFile, options, globals);
    })
    .add('codeBlocks', function () {
      showdown.subParser('makehtml.codeBlocks')(testMDFile, options, globals);
    })
    .add('codeSpans', function () {
      showdown.subParser('makehtml.codeSpans')(testMDFile, options, globals);
    })
    .add('detab', function () {
      showdown.subParser('makehtml.detab')(testMDFile, options, globals);
    })
    .add('encodeAmpsAndAngles', function () {
      showdown.subParser('makehtml.encodeAmpsAndAngles')(testMDFile, options, globals);
    })
    .add('encodeBackslashEscapes', function () {
      showdown.subParser('makehtml.encodeBackslashEscapes')(testMDFile, options, globals);
    })
    .add('encodeCode', function () {
      showdown.subParser('makehtml.encodeCode')(testMDFile, options, globals);
    })
    .add('escapeSpecialCharsWithinTagAttributes', function () {
      showdown.subParser('makehtml.escapeSpecialCharsWithinTagAttributes')(testMDFile, options, globals);
    })
    .add('githubCodeBlocks', function () {
      showdown.subParser('makehtml.githubCodeBlocks')(testMDFile, options, globals);
    })
    .add('hashBlock', function () {
      showdown.subParser('makehtml.hashBlock')(testMDFile, options, globals);
    })
    .add('hashElement', function () {
      showdown.subParser('makehtml.hashElement')(testMDFile, options, globals);
    })
    .add('hashHTMLSpans', function () {
      showdown.subParser('makehtml.hashHTMLSpans')(testMDFile, options, globals);
    })
    .add('hashPreCodeTags', function () {
      showdown.subParser('makehtml.hashPreCodeTags')(testMDFile, options, globals);
    })
    .add('headers', function () {
      showdown.subParser('makehtml.headers')(testMDFile, options, globals);
    })
    .add('horizontalRule', function () {
      showdown.subParser('makehtml.horizontalRule')(testMDFile, options, globals);
    })
    .add('images', function () {
      showdown.subParser('makehtml.images')(testMDFile, options, globals);
    })
    .add('italicsAndBold', function () {
      showdown.subParser('makehtml.italicsAndBold')(testMDFile, options, globals);
    })
    .add('lists', function () {
      showdown.subParser('makehtml.lists')(testMDFile, options, globals);
    })
    .add('outdent', function () {
      showdown.subParser('makehtml.outdent')(testMDFile, options, globals);
    })
    .add('paragraphs', function () {
      showdown.subParser('makehtml.paragraphs')(testMDFile, options, globals);
    })
    .add('spanGamut', function () {
      showdown.subParser('makehtml.spanGamut')(testMDFile, options, globals);
    })
    .add('strikethrough', function () {
      showdown.subParser('makehtml.strikethrough')(testMDFile, options, globals);
    })
    .add('stripLinkDefinitions', function () {
      showdown.subParser('makehtml.stripLinkDefinitions')(testMDFile, options, globals);
    })
    .add('tables', function () {
      showdown.subParser('makehtml.tables')(testMDFile, options, globals);
    })
    .add('unescapeSpecialChars', function () {
      showdown.subParser('makehtml.unescapeSpecialChars')(testMDFile, options, globals);
    });
}

function generateLogs () {
  performance.generateLog(null, null, true);
}

module.exports = {
  runTests: runTests,
  generateLogs: generateLogs
};
