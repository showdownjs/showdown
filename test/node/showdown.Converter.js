/**
 * Created by Estevao on 31-05-2015.
 */
require('source-map-support').install();
require('chai').should();
require('sinon');
var showdown = require('../../dist/showdown.js');

describe('showdown.Converter', function () {
  'use strict';

  describe('option methods', function () {
    var converter = new showdown.Converter();

    it('setOption() should set option foo=baz', function () {
      converter.setOption('foo', 'baz');
    });

    it('getOption() should get option foo to equal baz', function () {
      converter.getOption('foo').should.equal('baz');
    });

    it('getOptions() should contain foo=baz', function () {
      var options = converter.getOptions();
      options.should.have.ownProperty('foo');
      options.foo.should.equal('baz');
    });
  });

  describe('extension methods', function () {
    var extObjMock = {
          type: 'lang',
          filter: function () {}
        },
        extObjFunc = function () {
          return extObjMock;
        };

    it('addExtension() should add an extension Object', function () {
      var converter = new showdown.Converter();
      converter.addExtension(extObjMock);
      converter.getAllExtensions().language.should.contain(extObjMock);
    });

    it('addExtension() should unwrap an extension wrapped in a function', function () {
      var converter = new showdown.Converter();

      converter.addExtension(extObjFunc);
      converter.getAllExtensions().language.should.contain(extObjMock);
    });

    it('addExtension() should add a previous registered extension in showdown', function () {
      showdown.extension('foo', extObjMock);
      var converter = new showdown.Converter();

      converter.addExtension('foo');
      converter.getAllExtensions().language.should.contain(extObjMock);
      showdown.resetExtensions();
    });
  });
});
