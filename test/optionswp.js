/* jshint ignore:start */
let fs = require('fs'),
    filedata;
filedata = fs.readFileSync('src/options.js', 'utf8');
eval(filedata);
module.exports = {
  getDefaultOpts: getDefaultOpts
};
/* jshint ignore:end */
