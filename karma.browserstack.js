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

    // define browsers
    customLaunchers: {
      bstack_chrome_windows: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '49',
        os: 'Windows',
        os_version: '10'
      },
      bstack_firefox_old_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '45',
        os: 'Windows',
        os_version: '10'
      },
      bstack_firefox_latest_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '99',
        os: 'Windows',
        os_version: '10'
      },
      bstack_edge_windows: {
        base: 'BrowserStack',
        browser: 'edge',
        browser_version: '15',
        os: 'Windows',
        os_version: '10'
      },
      /*
      bstack_ie11_windows: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '10'
      },
      */
      bstack_macos_safari: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '10.1',
        os: 'OS X',
        os_version: 'Sierra'
      }
    },

    browsers: ['bstack_chrome_windows', 'bstack_firefox_old_windows', 'bstack_firefox_latest_windows', /*'bstack_ie11_windows',*/ 'bstack_edge_windows', 'bstack_macos_safari'],
    frameworks: ['mocha', 'chai'],
    reporters: ['dots', 'BrowserStack'],
    files: [
      { pattern: '.build/showdown.js'},
      { pattern: 'src/options.js'},
      // tests
      { pattern: 'test/unit/showdown*.js' }
      //{ pattern: 'test/functional/showdown*.js' },
    ],
    singleRun: true,
    concurrency: Infinity
  });
};
