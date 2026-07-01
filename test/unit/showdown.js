/**
 * Created by Tivie on 27/01/2017.
 */

describe('showdown.options', function () {
  'use strict';

  describe('setOption() and getOption()', function () {
    it('should set option foo=bar', function () {
      showdown.setOption('foo', 'bar');
      expect(showdown.getOption('foo')).toBe('bar');
      showdown.resetOptions();
      expect((typeof showdown.getOption('foo'))).toBe('undefined');
    });
  });

  describe('getDefaultOptions()', function () {
    it('should get default options', function () {
      let opts = showdown.getDefaultOptions(true);
      expect(showdown.getDefaultOptions()).toEqual(opts);
    });
  });
});

describe('showdown.extension()', function () {
  'use strict';

  let extObjMock = {
        type: 'lang',
        filter: function () {}
      },
      extObjFunc = function () {
        return extObjMock;
      };

  /*
  // very flimsy test
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
  */

  describe('objects', function () {
    it('should register an extension object', function () {
      showdown.extension('foo', extObjMock);
      expect(showdown.extension('foo')).toEqual([extObjMock]);
    });

    it('should register an extension function', function () {
      showdown.extension('bar', extObjFunc);
      expect(showdown.extension('bar')).toEqual([extObjMock]);
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
      let fn = function () {
        showdown.extension('foo', {});
      };
      expect(fn).toThrow();
    });

    it('should refuse to register an extension with invalid type', function () {
      let fn = function () {
        showdown.extension('foo', {
          type: 'foo'
        });
      };
      expect(fn).toThrow(/type .+? is not recognized\. Valid values: "lang\/language", "output\/html" or "listener"/);
    });

    it('should refuse to register an extension without regex or filter', function () {
      let fn = function () {
        showdown.extension('foo', {
          type: 'lang'
        });
      };
      expect(fn).toThrow(/extensions must define either a "regex" property or a "filter" method/);
    });

    it('should refuse to register a listener extension without a listeners property', function () {
      let fn = function () {
        showdown.extension('foo', {
          type: 'listener'
        });
      };
      expect(fn).toThrow(/Extensions of type "listener" must have a property called "listeners"/);
    });

    afterEach(function () {
      showdown.resetExtensions();
    });

  });

});

describe('showdown.getAllExtensions()', function () {
  'use strict';
  let extObjMock = {
    type: 'lang',
    filter: function () {}
  };

  it('should return all extensions', function () {
    showdown.extension('bar', extObjMock);
    expect(showdown.getAllExtensions()).toEqual({bar: [extObjMock]});
  });
});

describe('showdown.setFlavor()', function () {
  'use strict';
  it('should set flavor to gfm', function () {
    showdown.setFlavor('gfm');
    expect(showdown.getFlavor()).toBe('gfm');
    showdown.setFlavor('vanilla');
  });

  it('should set options correctly', function () {
    showdown.setFlavor('gfm');
    let ghOpts = showdown.getFlavorOptions('gfm'),
        shOpts = showdown.getOptions();
    for (let opt in ghOpts) {
      if (Object.prototype.hasOwnProperty.call(ghOpts, opt)) {
        expect(shOpts).toHaveProperty(opt);
        expect(shOpts[opt]).toBe(ghOpts[opt]);
      }
    }
    showdown.setFlavor('vanilla');
  });

  it('should switch between flavors correctly', function () {
    showdown.setFlavor('gfm');
    let ghOpts = showdown.getFlavorOptions('gfm'),
        shOpts = showdown.getOptions(),
        dfOpts = showdown.getDefaultOptions();
    for (let opt in dfOpts) {
      if (Object.prototype.hasOwnProperty.call(ghOpts, opt)) {
        expect(shOpts[opt]).toBe(ghOpts[opt]);
      } else {
        expect(shOpts[opt]).toBe(dfOpts[opt]);
      }
    }
    showdown.setFlavor('original');
    let orOpts = showdown.getFlavorOptions('original');
    shOpts = showdown.getOptions();
    for (let opt in dfOpts) {
      if (Object.prototype.hasOwnProperty.call(orOpts, opt)) {
        expect(shOpts[opt]).toBe(orOpts[opt]);
      } else {
        expect(shOpts[opt]).toBe(dfOpts[opt]);
      }
    }
    showdown.setFlavor('vanilla');
  });
});
