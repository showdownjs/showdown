/**
 * Created by Tivie on 21/12/2016.
 */
'use strict';
var now = require('performance-now'),
    fs = require('fs'),
    semverSort = require('semver-sort'),
    performance = {
      version: '',
      libraryName: '',
      MDFile: 'performance.log.md',
      logFile: 'performance.json',
      testSuites: [],
      silent: false,
      githubLink: ''
    };

performance.setVersion = function (version) {
  performance.version = version;
};

performance.setLibraryName = function (name) {
  performance.libraryName = name;
};

performance.setGithubLink = function (url) {
  performance.githubLink = url;
};

performance.generateLog = function (filename, MDFilename, asTable) {
  filename = filename || performance.logFile;
  MDFilename = MDFilename || performance.MDFile;
  asTable = !!asTable;

  fs.closeSync(fs.openSync(filename, 'a'));

  var json = fs.readFileSync(filename),
      jsonParsed;

  try {
    jsonParsed = JSON.parse(json);
  }
  catch (err) {
    jsonParsed = {};
  }

  var jData = [];

  for (var i = 0; i < performance.testSuites.length; ++i) {
    // Suite
    var suiteName = performance.testSuites[i].getSuiteName(),
        cycles = performance.testSuites[i].getOption('cycles'),
        subJData = {
          suiteName: suiteName,
          cycles: cycles,
          tests: []
        },
        testSuite = performance.testSuites[i].getTests();
    //make sure tests have ran first
    if (!performance.testSuites[i].hasRun()) {
      performance.testSuites[i].run();
    }

    // loop through tests
    for (var ii = 0; ii < testSuite.length; ++ii) {
      // Test
      var test = testSuite[ii];
      subJData.tests.push({
        name: test.name,
        time: test.time,
        maxTime: test.maxTime,
        minTime: test.minTime
      });
    }
    jData.push(subJData);
  }
  jsonParsed[performance.version] = jData;

  //Sort jsonParsed
  var versions = [];
  for (var version in jsonParsed) {
    if (jsonParsed.hasOwnProperty(version)) {
      versions.push(version);
    }
  }

  semverSort.desc(versions);

  var finalJsonObj = {};

  for (i = 0; i < versions.length; ++i) {
    if (jsonParsed.hasOwnProperty(versions[i])) {
      finalJsonObj[versions[i]] = jsonParsed[versions[i]];
    }
  }

  fs.writeFileSync(filename, JSON.stringify(finalJsonObj));

  generateMD(MDFilename, finalJsonObj, asTable);
};

function generateMD(filename, obj, asTable) {
  fs.closeSync(fs.openSync(filename, 'w'));
  asTable = !!asTable;

  // generate MD
  var otp = '# Performance Tests for ' + performance.libraryName + '\n\n\n';

  for (var version in obj) {
    if (obj.hasOwnProperty(version)) {
      otp += '## [version ' + version + '](' + performance.githubLink + version + ')\n\n';
      var testSuite = obj[version];
      for (var i = 0; i < testSuite.length; ++i) {
        otp += '### Test Suite: ' + testSuite[i].suiteName + ' (' + testSuite[i].cycles + ' cycles)\n';
        var tests = testSuite[i].tests;
        if (asTable) {
          otp += '| test | avgTime | max | min |\n';
          otp += '|:-----|--------:|----:|----:|\n';
        }
        for (var ii = 0; ii < tests.length; ++ii) {
          var time = parseFloat(tests[ii].time).toFixed(3),
              maxTime = parseFloat(tests[ii].maxTime).toFixed(3),
              minTime = parseFloat(tests[ii].minTime).toFixed(3);
          if (asTable) {
            otp += '|' + tests[ii].name + '|' + time + '|' + maxTime + '|' + minTime + '|\n';
          } else {
            otp += ' - **' + tests[ii].name + ':** took ' + time + 'ms (*max: ' + maxTime + 'ms; min: ' + minTime + 'ms*)\n';
          }
        }
        otp += '\n';
      }
      otp += '\n';
    }
  }
  fs.writeFileSync(filename, otp);
}

performance.Suite = function (name) {
  var suiteName = name || '',
    tests = [],
    hasRunFlag = false,
    options = {
      cycles: 20
    };

  this.setOption = function (key, val) {
    options[key] = val;
    return this;
  };

  this.getOption = function (key) {
    return options[key];
  };

  this.add = function (name, obj) {
    if (typeof obj === 'function') {
      obj = {
        prepare: function () {},
        test: obj,
        teardown: function () {}
      };
    }

    if (!obj.hasOwnProperty('test')) {
      throw 'obj must have a property called test';
    }

    if (typeof obj.test !== 'function') {
      throw 'obj test property must be a function';
    }

    if (!obj.hasOwnProperty('prepare')) {
      obj.prepare = function () {};
    }

    if (!obj.hasOwnProperty('teardown')) {
      obj.teardown = function () {};
    }

    if (typeof obj.prepare !== 'function') {
      throw 'obj prepare property must be a function';
    }

    if (typeof obj.teardown !== 'function') {
      throw 'obj teardown property must be a function';
    }

    tests.push({
      name: name,
      obj: obj,
      time: 0,
      maxTime: 0,
      minTime: 0
    });
    return this;
  };

  this.run = function run () {
    var nn = options.cycles;
    console.log('running tests: ' + nn + ' cycles each.');
    for (var i = 0; i < tests.length; ++i) {
      var times = [],
        passVar = tests[i].obj.prepare();
      for (var ii = 0; ii < nn; ++ii) {
        var before = now();
        tests[i].obj.test(passVar);
        var after = now();
        times.push(after - before);
      }
      var total = times.reduce(function (a, b) {return a + b;}, 0);
      tests[i].time = total / options.cycles;
      tests[i].minTime = Math.min.apply(null, times);
      tests[i].maxTime = Math.max.apply(null, times);
      if (!options.silent) {
        console.log(tests[i].name + ' took an average of ' + tests[i].time + 'ms (min: ' + tests[i].minTime + 'ms; max: ' + tests[i].maxTime + 'ms');
      }
    }
    hasRunFlag = true;
    return this;
  };

  this.hasRun = function () {
    return hasRunFlag;
  };

  this.getSuiteName = function () {
    return suiteName;
  };

  this.getTests = function () {
    return tests;
  };

  performance.testSuites.push(this);
};

module.exports = performance;
