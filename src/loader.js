/**
 * Created by Estevao on 15-01-2015.
 */

var root = this;

// CommonJS/nodeJS Loader
if (typeof module !== 'undefined' && module.exports) {
  module.exports = showdown;
}
// AMD Loader
else if (typeof define === 'function' && define.amd) {
  define('showdown', function () {
    return showdown;
  });
}
// Regular Browser loader
else {
  root.showdown = showdown;
}
