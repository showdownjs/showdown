//.webstorm.bootstrap.js
var chai = require('chai');
global.chai = chai;
global.expect = chai.expect;
global.showdown = require('../.build/showdown.js');
global.getDefaultOpts = require('./optionswp.js').getDefaultOpts;
