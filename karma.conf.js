module.exports = function (config) {
  config.set({
    client: {
      captureConsole: true
    },
    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },
    logLevel: config.LOG_LOG,
    frameworks: ['mocha', 'chai'],
    files: [
      { pattern: '.build/showdown.js'},
      { pattern: 'src/options.js'},
      // tests
      { pattern: 'test/unit/showdown*.js' },
      { pattern: 'test/functional/showdown*.js' },
    ],
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    browsers: ['ChromeHeadless', 'FirefoxHeadless', 'jsdom'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    //concurrency: Infinity,
    customLaunchers: {
      'FirefoxHeadless': {
        base: 'Firefox',
        flags: [
          '-headless',
        ]
      }
    },
  });
};
