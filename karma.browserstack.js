module.exports = function (config) {
  config.set({
    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESSKEY,
      project: 'showdown',
      build: require('./package.json').version
    },

    // define browsers
    customLaunchers: {
      bstack_chrome_windows: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: '72.0',
        os: 'Windows',
        os_version: '10'
      },
      bstack_firefox_windows: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '98.0',
        os: 'Windows',
        os_version: '10'
      },
      //dropped support for IE 10
      bstack_ie10_windows: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '10',
        os: 'Windows',
        os_version: '7'
      },
      //dropped support for IE 10
      bstack_ie11_windows: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '10'
      },
      bstack_iphoneX: {
        base: 'BrowserStack',
        browser: 'safari',
        device: 'iPhone X',
        os: 'ios',
        real_mobile: true,
        os_version: '11.0'
      }
    },

    browsers: ['bstack_chrome_windows', 'bstack_firefox_windows', 'bstack_ie11_windows', 'bstack_iphoneX'],
    frameworks: ['mocha', 'chai'],
    reporters: ['dots', 'BrowserStack'],
    files: [
      { pattern: '.build/showdown.js'},
      { pattern: 'src/options.js'},
      // tests
      { pattern: 'test/unit/showdown*.js' },
      { pattern: 'test/functional/showdown*.js' },
    ],
    singleRun: true,
    concurrency: Infinity
  });
};
