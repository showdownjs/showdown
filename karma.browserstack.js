module.exports = function (config) {
  config.set({
    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESSKEY,
      project: process.env.BROWSERSTACK_PROJECT_NAME || 'showdown',
      build: process.env.BROWSERSTACK_BUILD_NAME || require('./package.json').version,
      name: process.env.COMMIT_MSG || 'Unit Testing'
    },

    // NOTE: The test runner (mocha >= 8) ships ES2018 syntax (object spread) in its
    // browser bundle, so the suite can only run on browsers that support ES2018+.
    // Pre-2018 engines (Chrome <60, Firefox <55, EdgeHTML/Edge 15, Safari <11.1, IE)
    // cannot parse mocha.js and were dropped. The matrix below pins the newest
    // browsers plus one previous version per engine for regression coverage, and a
    // modest older floor (Safari 13) that still supports ES2018.
    customLaunchers: {
      bstack_chrome_latest_windows: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bstack_chrome_prev_windows: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '11'
      },
      bstack_firefox_latest_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bstack_firefox_prev_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: 'latest-1',
        os: 'Windows',
        os_version: '11'
      },
      bstack_edge_latest_windows: {
        base: 'BrowserStack',
        browser: 'edge',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '11'
      },
      bstack_macos_safari_latest: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: 'latest',
        os: 'OS X',
        os_version: 'Sonoma'
      },
      bstack_macos_safari_old: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '13.1',
        os: 'OS X',
        os_version: 'Catalina'
      }
    },

    browsers: [
      'bstack_chrome_latest_windows',
      'bstack_chrome_prev_windows',
      'bstack_firefox_latest_windows',
      'bstack_firefox_prev_windows',
      'bstack_edge_latest_windows',
      'bstack_macos_safari_latest',
      'bstack_macos_safari_old'
    ],
    frameworks: ['mocha', 'chai'],
    reporters: ['dots', 'BrowserStack'],
    files: [
      { pattern: '.build/showdown.js'},
      { pattern: 'src/options.js'},
      // tests
      { pattern: 'test/unit/showdown*.js' },
      //{ pattern: 'test/functional/makehtml/testsuite.*.js' },
      //{ pattern: 'test/functional/makemarkdown/testsuite.*.js' }
    ],
    singleRun: true,
    concurrency: Infinity
  });
};
