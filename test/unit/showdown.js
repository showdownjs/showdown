require('source-map-support').install();
require('chai').should();
require('sinon');
var expect = require('chai').expect,
    showdown = require('../../.build/showdown.js');


describe('showdown.options', function () {
  'use strict';

  describe('setOption() and getOption()', function () {
    it('should set option foo=bar', function () {
      showdown.setOption('foo', 'bar');
      showdown.getOption('foo').should.equal('bar');
      showdown.resetOptions();
      (typeof showdown.getOption('foo')).should.equal('undefined');
    });
  });

  describe('getDefaultOptions()', function () {
    it('should get default options', function () {
      var opts = require('./optionswp.js').getDefaultOpts(true);
      expect(showdown.getDefaultOptions()).to.be.eql(opts);
    });
  });
});

describe('showdown.extension()', function () {
  'use strict';

  var extObjMock = {
        type: 'lang',
        filter: function () {}
      },
      extObjFunc = function () {
        return extObjMock;
      };

  describe('file loading', function () {

    beforeEach(function () {
      this.extension = require('../mocks/mock-extension');
    });

    it('should register an extension from a file', function () {
      showdown.extension('mockextension').should.be.an('array');
      showdown.extension('mockextension').should.eql([this.extension]);
    });

    afterEach(function () {
      showdown.resetExtensions();
    });

  });


  describe('objects', function () {
    it('should register an extension object', function () {
      showdown.extension('foo', extObjMock);
      showdown.extension('foo').should.eql([extObjMock]);
    });

    it('should register an extension function', function () {
      showdown.extension('bar', extObjFunc);
      showdown.extension('bar').should.eql([extObjMock]);
    });

    it('should register a listener extension', function () {
      showdown.extension('baz', {
        type: 'listener',
        listeners: {
          foo: function (name, txt) {
            return txt;
          }
        }
      });
    });

    it('should refuse to register a generic object', function () {
      var fn = function () {
        showdown.extension('foo', {});
      };
      expect(fn).to.throw();
    });

    it('should refuse to register an extension with invalid type', function () {
      var fn = function () {
        showdown.extension('foo', {
          type: 'foo'
        });
      };
      expect(fn).to.throw(/type .+? is not recognized\. Valid values: "lang\/language", "output\/html" or "listener"/);
    });

    it('should refuse to register an extension without regex or filter', function () {
      var fn = function () {
        showdown.extension('foo', {
          type: 'lang'
        });
      };
      expect(fn).to.throw(/extensions must define either a "regex" property or a "filter" method/);
    });

    it('should refuse to register a listener extension without a listeners property', function () {
      var fn = function () {
        showdown.extension('foo', {
          type: 'listener'
        });
      };
      expect(fn).to.throw(/Extensions of type "listener" must have a property called "listeners"/);
    });

    afterEach(function () {
      showdown.resetExtensions();
    });

  });

});

describe('showdown.getAllExtensions()', function () {
  'use strict';
  var extObjMock = {
    type: 'lang',
    filter: function () {}
  };

  it('should return all extensions', function () {
    showdown.extension('bar', extObjMock);
    showdown.getAllExtensions().should.eql({bar: [extObjMock]});
  });
});

describe('showdown.setFlavor()', function () {
  'use strict';
  it('should set flavor to github', function () {
    showdown.setFlavor('github');
    showdown.getFlavor().should.equal('github');
    showdown.setFlavor('vanilla');
  });

  it('should set options correctly', function () {
    showdown.setFlavor('github');
    var ghOpts = showdown.getFlavorOptions('github'),
        shOpts = showdown.getOptions();
    for (var opt in ghOpts) {
      if (ghOpts.hasOwnProperty(opt)) {
        shOpts.should.have.property(opt);
        shOpts[opt].should.equal(ghOpts[opt]);
      }
    }
    showdown.setFlavor('vanilla');
  });

  it('should switch between flavors correctly', function () {
    showdown.setFlavor('github');
    var ghOpts = showdown.getFlavorOptions('github'),
        shOpts = showdown.getOptions(),
        dfOpts = showdown.getDefaultOptions();
    for (var opt in dfOpts) {
      if (ghOpts.hasOwnProperty(opt)) {
        shOpts[opt].should.equal(ghOpts[opt]);
      } else {
        shOpts[opt].should.equal(dfOpts[opt]);
      }
    }
    showdown.setFlavor('original');
    var orOpts = showdown.getFlavorOptions('original');
    shOpts = showdown.getOptions();
    for (opt in dfOpts) {
      if (orOpts.hasOwnProperty(opt)) {
        shOpts[opt].should.equal(orOpts[opt]);
      } else {
        shOpts[opt].should.equal(dfOpts[opt]);
      }
    }
    showdown.setFlavor('vanilla');
  });
});
