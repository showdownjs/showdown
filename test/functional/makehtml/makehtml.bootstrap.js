/**
 * Created by Estevao on 08-06-2015.
 */

//jscs:disable requireCamelCaseOrUpperCaseIdentifiers
(function () {
  'use strict';

  require('source-map-support').install();
  require('chai').should();
  //const htmlPrettify = require('html-prettify');
  const htmlPrettify = require('diffable-html');

  let fs = require('fs');

  function getTestSuite (dir) {
    return fs.readdirSync(dir)
      .filter(filter())
      .map(map(dir));
  }

  function getJsonTestSuite (file) {
    let json = JSON.parse(fs.readFileSync(file, 'utf8').toString());
    return mapJson(json, file);
  }

  function filter () {
    return function (file) {
      let ext = file.slice(-3);
      return (ext === '.md');
    };
  }

  function map (dir) {
    return function (file) {
      let oFile = 'file://' + process.cwd().replace(/\\/g, '/') + dir + file,
          name = file.replace('.md', ''),
          htmlPath = dir + name + '.html',
          html = fs.readFileSync(htmlPath, 'utf8'),
          mdPath = dir + name + '.md',
          md = fs.readFileSync(mdPath, 'utf8');

      return {
        name:     name,
        input:    md,
        expected: html,
        file: oFile
      };
    };
  }

  function mapJson (jsonArray, file) {
    let tcObj = {};
    for (let i = 0; i < jsonArray.length; ++i) {
      let section = jsonArray[i].section;
      let name = jsonArray[i].section + '_' + (jsonArray[i].example || jsonArray[i].number);
      let md = jsonArray[i].markdown;
      // transformations
      md = md.replace(/→/g, '\t'); // replace → with tabs

      let html = jsonArray[i].html;
      // transformations
      html = html.replace(/→/g, '\t'); // replace → with tabs

      if (!tcObj.hasOwnProperty(section)) {
        tcObj[section] = [];
      }
      tcObj[section].push({
        name: name,
        input: md,
        expected: html,
        file: process.cwd().replace(/\\/g, '/') + file
      });
    }
    return tcObj;
  }


  function assertion (testCase, converter, prettify) {
    prettify = prettify || false;
    return function () {
      testCase.actual = converter.makeHtml(testCase.input);
      // transformations for readability
      //testCase.expected = testCase.expected.replace(/\t/g, '→');
      //testCase.actual = testCase.actual.replace(/\t/g, '→');

      testCase = normalize(testCase, prettify);

      // Compare
      testCase.actual.should.equal(testCase.expected, testCase.file);
    };
  }

  //Normalize input/output
  function normalize (testCase, prettify) {

    // Normalize line returns
    testCase.expected = testCase.expected.replace(/(\r\n)|\n|\r/g, '\n');
    testCase.actual = testCase.actual.replace(/(\r\n)|\n|\r/g, '\n');

    // Ignore all leading/trailing whitespace
    testCase.expected = testCase.expected.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');
    testCase.actual = testCase.actual.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');

    // Remove extra lines
    testCase.expected = testCase.expected.trim();
    testCase.actual = testCase.actual.trim();

    //prettify
    if (prettify) {
      testCase.expected = htmlPrettify(testCase.expected);
      testCase.actual = htmlPrettify(testCase.actual);
    }


    // Normalize line returns
    testCase.expected = testCase.expected.replace(/(\r\n)|\n|\r/g, '\n');
    testCase.actual = testCase.actual.replace(/(\r\n)|\n|\r/g, '\n');

    return testCase;
  }

  module.exports = {
    getTestSuite: getTestSuite,
    getJsonTestSuite: getJsonTestSuite,
    assertion: assertion,
    showdown: require('../../../.build/showdown.js')
  };
})();

