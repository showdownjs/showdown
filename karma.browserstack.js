module.exports = function (config) {
  config.set({
    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESSKEY,
      project: 'showdown',
      build: require('./package.json').version,
      name: 'Unit Testing'
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
      bstack_firefox_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '44',
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
      bstack_ie11_windows: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '10'
      },
      bstack_macos_safari: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '10.1',
        os: 'OS X',
        os_version: 'Sierra'
      },
      bstack_iphoneX: {
        base: 'BrowserStack',
        browser: 'safari',
        os: 'ios',
        os_version: '11.0',
        device: 'iPhone X',
        real_mobile: true
      },
      bstack_android: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'android',
        os_version:'4.4',
        device: 'Samsung Galaxy Tab 4',
        realMobile: true
      }
    },

    browsers: ['bstack_chrome_windows', 'bstack_firefox_windows', 'bstack_ie11_windows', 'bstack_edge_windows', 'bstack_iphoneX', 'bstack_macos_safari', 'bstack_android'],
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
