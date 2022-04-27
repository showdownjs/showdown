//.webstorm.bootstrap.js
const chai = require('chai');
const fs = require('fs');
global.chai = chai;
global.expect = chai.expect;
global.showdown = require('../.build/showdown.js');
global.getDefaultOpts = require('./optionswp.js').getDefaultOpts;

// mock XMLHttpRequest for browser and node test
function XMLHttpRequest () {
  this.responseText = null;
  this.status = null;

  this.open = function (mode, file) {
    //mode is ignored, it's always sync
    this.responseText = fs.readFileSync(file);
    this.status = 200;
    return this;
  };
}

global.XMLHttpRequest = XMLHttpRequest;
