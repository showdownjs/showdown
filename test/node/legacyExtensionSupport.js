/**
 * Created by Estevao on 06-06-2015.
 */
require('source-map-support').install();
var expect = require('chai').expect,
    showdown = require('../bootstrap').showdown;

describe('showdown legacy extension support', function () {
  'use strict';
  var extObjMock =
      {
        type: 'lang',
        filter: function () {}
      },
      extFunc = function () {
        return [extObjMock];
      };

  it('accept extensions loaded by the old mechanism', function () {
    showdown.extensions.bazinga = extFunc;
    var cnv = new showdown.Converter({extensions: ['bazinga']});
    expect(cnv.getAllExtensions().language).to.eql([extObjMock]);
  });
});
