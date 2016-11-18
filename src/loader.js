var root = this;

var _window = typeof window !== 'undefined' ? window : null;
var isElectron = _window && _window.process && _window.process.type === "renderer";
// CommonJS/nodeJS Loader
if (typeof module !== 'undefined' && module.exports && !isElectron) {
  module.exports = showdown;
// AMD Loader
} else if (typeof define === 'function' && define.amd) {
  define(function () {
    'use strict';
    return showdown;
  });

// Regular Browser loader
} else {
  root.showdown = showdown;
}
