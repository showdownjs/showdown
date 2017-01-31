/**
 * Created by Tivie on 21/12/2016.
 */
'use strict';
var fs = require('fs'),
    showdown = require('../bootstrap').showdown,
    converter = new showdown.Converter(),
    pkg = require('../../package.json'),
    performance = require('../performance/performance.js');

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
      showdown.subParser('hashHTMLBlocks')(testMDFile, options, globals);
    })
    .add('anchors', function () {
      showdown.subParser('anchors')(testMDFile, options, globals);
    })
    .add('autoLinks', function () {
      showdown.subParser('autoLinks')(testMDFile, options, globals);
    })
    /*
    .add('blockGamut', function () {
      showdown.subParser('blockGamut')(testMDFile, options, globals);
    })
    */
    .add('blockQuotes', function () {
      showdown.subParser('blockQuotes')(testMDFile, options, globals);
    })
    .add('codeBlocks', function () {
      showdown.subParser('codeBlocks')(testMDFile, options, globals);
    })
    .add('codeSpans', function () {
      showdown.subParser('codeSpans')(testMDFile, options, globals);
    })
    .add('detab', function () {
      showdown.subParser('detab')(testMDFile, options, globals);
    })
    .add('encodeAmpsAndAngles', function () {
      showdown.subParser('encodeAmpsAndAngles')(testMDFile, options, globals);
    })
    .add('encodeBackslashEscapes', function () {
      showdown.subParser('encodeBackslashEscapes')(testMDFile, options, globals);
    })
    .add('encodeCode', function () {
      showdown.subParser('encodeCode')(testMDFile, options, globals);
    })
    .add('escapeSpecialCharsWithinTagAttributes', function () {
      showdown.subParser('escapeSpecialCharsWithinTagAttributes')(testMDFile, options, globals);
    })
    .add('githubCodeBlocks', function () {
      showdown.subParser('githubCodeBlocks')(testMDFile, options, globals);
    })
    .add('hashBlock', function () {
      showdown.subParser('hashBlock')(testMDFile, options, globals);
    })
    .add('hashElement', function () {
      showdown.subParser('hashElement')(testMDFile, options, globals);
    })
    .add('hashHTMLSpans', function () {
      showdown.subParser('hashHTMLSpans')(testMDFile, options, globals);
    })
    .add('hashPreCodeTags', function () {
      showdown.subParser('hashPreCodeTags')(testMDFile, options, globals);
    })
    .add('headers', function () {
      showdown.subParser('headers')(testMDFile, options, globals);
    })
    .add('horizontalRule', function () {
      showdown.subParser('horizontalRule')(testMDFile, options, globals);
    })
    .add('images', function () {
      showdown.subParser('images')(testMDFile, options, globals);
    })
    .add('italicsAndBold', function () {
      showdown.subParser('italicsAndBold')(testMDFile, options, globals);
    })
    .add('lists', function () {
      showdown.subParser('lists')(testMDFile, options, globals);
    })
    .add('outdent', function () {
      showdown.subParser('outdent')(testMDFile, options, globals);
    })
    .add('paragraphs', function () {
      showdown.subParser('paragraphs')(testMDFile, options, globals);
    })
    .add('spanGamut', function () {
      showdown.subParser('spanGamut')(testMDFile, options, globals);
    })
    .add('strikethrough', function () {
      showdown.subParser('strikethrough')(testMDFile, options, globals);
    })
    .add('stripLinkDefinitions', function () {
      showdown.subParser('stripLinkDefinitions')(testMDFile, options, globals);
    })
    .add('tables', function () {
      showdown.subParser('tables')(testMDFile, options, globals);
    })
    .add('unescapeSpecialChars', function () {
      showdown.subParser('unescapeSpecialChars')(testMDFile, options, globals);
    });
}

function generateLogs () {
  performance.generateLog(null, null, true);
}

module.exports = {
  runTests: runTests,
  generateLogs: generateLogs
};
