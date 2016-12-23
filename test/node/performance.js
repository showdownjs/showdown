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

function runTests() {
  var readmeMD = fs.readFileSync('README.md', 'utf8');
  new performance.Suite('Basic')
    .setOption('cycles', 100)
    .add('Simple "Hello World"', function () {
      converter.makeHtml('*Hello* **World**!');
    })
    .add('readme.md', {
      prepare: function () {
        return readmeMD;
      },
      test: function (mdText) {
        converter.makeHtml(mdText);
      }
    });
  new performance.Suite('subParsers')
    .setOption('cycles', 1000)
    .add('hashHTMLBlocks', function () {
      showdown.subParser('hashHTMLBlocks')(readmeMD, options, globals);
    })
    .add('anchors', function () {
      showdown.subParser('anchors')(readmeMD, options, globals);
    })
    .add('autoLinks', function () {
      showdown.subParser('autoLinks')(readmeMD, options, globals);
    })
    .add('blockGamut', function () {
      showdown.subParser('blockGamut')(readmeMD, options, globals);
    })
    .add('blockQuotes', function () {
      showdown.subParser('blockQuotes')(readmeMD, options, globals);
    })
    .add('codeBlocks', function () {
      showdown.subParser('codeBlocks')(readmeMD, options, globals);
    })
    .add('codeSpans', function () {
      showdown.subParser('codeSpans')(readmeMD, options, globals);
    })
    .add('detab', function () {
      showdown.subParser('detab')(readmeMD, options, globals);
    })
    .add('encodeAmpsAndAngles', function () {
      showdown.subParser('encodeAmpsAndAngles')(readmeMD, options, globals);
    })
    .add('encodeBackslashEscapes', function () {
      showdown.subParser('encodeBackslashEscapes')(readmeMD, options, globals);
    })
    .add('encodeCode', function () {
      showdown.subParser('encodeCode')(readmeMD, options, globals);
    })
    .add('encodeEmailAddress', function () {
      showdown.subParser('encodeEmailAddress')(readmeMD, options, globals);
    })
    .add('escapeSpecialCharsWithinTagAttributes', function () {
      showdown.subParser('escapeSpecialCharsWithinTagAttributes')(readmeMD, options, globals);
    })
    .add('githubCodeBlocks', function () {
      showdown.subParser('githubCodeBlocks')(readmeMD, options, globals);
    })
    .add('hashBlock', function () {
      showdown.subParser('hashBlock')(readmeMD, options, globals);
    })
    .add('hashElement', function () {
      showdown.subParser('hashElement')(readmeMD, options, globals);
    })
    .add('hashHTMLSpans', function () {
      showdown.subParser('hashHTMLSpans')(readmeMD, options, globals);
    })
    .add('hashPreCodeTags', function () {
      showdown.subParser('hashPreCodeTags')(readmeMD, options, globals);
    })
    .add('headers', function () {
      showdown.subParser('headers')(readmeMD, options, globals);
    })
    .add('images', function () {
      showdown.subParser('images')(readmeMD, options, globals);
    })
    .add('italicsAndBold', function () {
      showdown.subParser('italicsAndBold')(readmeMD, options, globals);
    })
    .add('lists', function () {
      showdown.subParser('lists')(readmeMD, options, globals);
    })
    .add('outdent', function () {
      showdown.subParser('outdent')(readmeMD, options, globals);
    })
    .add('paragraphs', function () {
      showdown.subParser('paragraphs')(readmeMD, options, globals);
    })
    .add('spanGamut', function () {
      showdown.subParser('spanGamut')(readmeMD, options, globals);
    })
    .add('strikethrough', function () {
      showdown.subParser('strikethrough')(readmeMD, options, globals);
    })
    .add('stripBlankLines', function () {
      showdown.subParser('stripBlankLines')(readmeMD, options, globals);
    })
    .add('stripLinkDefinitions', function () {
      showdown.subParser('stripLinkDefinitions')(readmeMD, options, globals);
    })
    .add('tables', function () {
      showdown.subParser('tables')(readmeMD, options, globals);
    })
    .add('unescapeSpecialChars', function () {
      showdown.subParser('unescapeSpecialChars')(readmeMD, options, globals);
    });
}

function generateLogs () {
  performance.generateLog(null, null, true);
}

module.exports = {
  runTests: runTests,
  generateLogs: generateLogs
};
