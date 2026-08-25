/**
 * Created by Estevao on 31-05-2015.
 */


describe('showdown.Converter', function () {
  'use strict';

  describe('option methods', function () {
    let converter = new showdown.Converter();

    it('setOption() should set option foo=baz', function () {
      converter.setOption('foo', 'baz');
    });

    it('getOption() should get option foo to equal baz', function () {
      expect(converter.getOption('foo')).toBe('baz');
    });

    it('getOptions() should contain foo=baz', function () {
      let options = converter.getOptions();
      expect(Object.prototype.hasOwnProperty.call(options, 'foo')).toBe(true);
      expect(options.foo).toBe('baz');
    });
  });

  describe('setOption() re-validation', function () {

    it('should apply a valid value to a declared option', function () {
      let converter = new showdown.Converter();
      converter.setOption('tables', true);
      expect(converter.getOption('tables')).toBe(true);
    });

    it('should throw a TypeError when a declared option is set to the wrong type', function () {
      let converter = new showdown.Converter();
      expect(function () {
        converter.setOption('ghMentionsLink', 123);
      }).toThrow(TypeError);
    });

    it('should throw a TypeError when a boolean option is set to a string', function () {
      let converter = new showdown.Converter();
      expect(function () {
        converter.setOption('tables', 'yes');
      }).toThrow(TypeError);
    });

    it('should name the option and the expected type in the error message', function () {
      let converter = new showdown.Converter();
      expect(function () {
        converter.setOption('ghMentionsLink', 123);
      }).toThrow(/Option ghMentionsLink must be of type string/);
    });

    it('should roll back to the previous value after a failed set', function () {
      let converter = new showdown.Converter();
      converter.setOption('ghMentionsLink', 'https://example.com/{u}');
      expect(function () {
        converter.setOption('ghMentionsLink', 123);
      }).toThrow(TypeError);
      expect(converter.getOption('ghMentionsLink')).toBe('https://example.com/{u}');
    });

    it('should keep converting correctly after a rolled-back failed set', function () {
      let converter = new showdown.Converter();
      try {
        converter.setOption('tables', 'yes');
      } catch (e) {
        // expected: swallow so we can assert the converter still works
      }
      expect(converter.makeHtml('hello')).toBe('<p>hello</p>');
    });

    it('should store an undeclared key as-is without throwing', function () {
      let converter = new showdown.Converter();
      converter.setOption('someUndeclaredOption', 123);
      expect(converter.getOption('someUndeclaredOption')).toBe(123);
    });

    it('should accept `false` for the special-cased headerIds option', function () {
      let converter = new showdown.Converter();
      converter.setOption('headerIds', false);
      expect(converter.getOption('headerIds')).toBe(false);
    });

    it('should accept a plain object for the special-cased headerIds option', function () {
      let converter = new showdown.Converter();
      converter.setOption('headerIds', {prefix: 'x-'});
      expect(converter.getOption('headerIds')).toEqual({prefix: 'x-'});
    });

    it('should throw and roll back when headerIds is set to a string', function () {
      let converter = new showdown.Converter();
      converter.setOption('headerIds', {prefix: 'x-'});
      expect(function () {
        converter.setOption('headerIds', 'nope');
      }).toThrow(TypeError);
      expect(converter.getOption('headerIds')).toEqual({prefix: 'x-'});
    });
  });

  describe('metadata methods', function () {
    let converter = new showdown.Converter();

    it('_setMetadataPair() should set foo to bar', function () {
      converter._setMetadataPair('foo', 'bar');
      expect(converter.getMetadata()).toEqual({foo: 'bar'});
    });

    it('_setMetadata should set metadata to {baz: bazinga}', function () {
      converter._setMetadataRaw('{baz: bazinga}');
      expect(converter.getMetadata(true)).toEqual('{baz: bazinga}');
    });
  });

  describe('converter.setFlavor()', function () {

    /**
     * Test setFlavor('gfm')
     */
    describe('gfm', function () {
      let converter = new showdown.Converter(),
          ghOpts = showdown.getFlavorOptions('gfm');

      converter.setFlavor('gfm');

      for (let opt in ghOpts) {
        if (Object.prototype.hasOwnProperty.call(ghOpts, opt)) {
          check(opt, ghOpts[opt]);
        }
      }
      function check (key, val) {
        it('should set ' + key + ' to ' + val, function () {
          expect(converter.getOption(key)).toBe(val);
        });
      }
    });
  });

  describe('getFlavor method', function () {

    // reset showdown
    showdown.setFlavor('vanilla');

    describe('flavor', function () {
      it('should be vanilla by default', function () {
        let converter = new showdown.Converter();
        expect(converter.getFlavor()).toBe('vanilla');
      });

      it('should be changed if global option is changed', function () {
        showdown.setFlavor('gfm');
        let converter = new showdown.Converter();
        expect(converter.getFlavor()).toBe('gfm');
        showdown.setFlavor('vanilla');
      });

      it('should not be changed if converter is initialized before global change', function () {
        let converter = new showdown.Converter();
        showdown.setFlavor('gfm');
        expect(converter.getFlavor()).toBe('vanilla');
        showdown.setFlavor('vanilla');
      });
    });
  });

  describe('extension methods', function () {
    // `lang`/`output` extensions are sugar over the event system, so they are asserted by
    // the effect they have on the converted output rather than by introspection.
    let extObjMock = {
          type: 'lang',
          regex: /markdown/g,
          replace: 'showdown'
        },
        extObjFunc = function () {
          return extObjMock;
        };

    it('addExtension() should add an extension Object', function () {
      let converter = new showdown.Converter();
      converter.addExtension(extObjMock);
      expect(converter.makeHtml('markdown')).toMatch(/showdown/);
    });

    it('addExtension() should unwrap an extension wrapped in a function', function () {
      let converter = new showdown.Converter();

      converter.addExtension(extObjFunc);
      expect(converter.makeHtml('markdown')).toMatch(/showdown/);
    });

    it('useExtension() should use a previous registered extension in showdown', function () {
      showdown.extension('foo', extObjMock);
      let converter = new showdown.Converter();

      converter.useExtension('foo');
      expect(converter.makeHtml('markdown')).toMatch(/showdown/);
      showdown.resetExtensions();
    });

    it('should warn at most once per process for a deprecated extension type', function () {
      // robust to global ordering: an earlier suite may already have tripped the per-process
      // flag, so we assert "at most once". The old per-load behavior would have warned twice.
      let orig = console.warn,
          count = 0;
      console.warn = function () { count++; };
      try {
        new showdown.Converter({extensions: [{type: 'lang', regex: /a/g, replace: 'b'}]});
        new showdown.Converter({extensions: [{type: 'lang', regex: /a/g, replace: 'b'}]});
      } finally {
        console.warn = orig;
      }
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  describe('events', function () {
    it('should fire a listener on a real event and let it modify the output', function () {
      let fired = false,
          converter = new showdown.Converter();
      converter.listen('makehtml.heading.atx.onCapture', function (event) {
        fired = true;
        event.attributes.class = 'x';
        return event;
      });
      let html = converter.makeHtml('# foo');
      expect(fired).toBe(true);
      expect(html).toMatch(/class="x"/);
    });

    it('should NOT fire the removed .before/.after special events', function () {
      let fired = false;
      new showdown.Converter()
        .listen('makehtml.heading.before', function (e) { fired = true; return e; })
        .makeHtml('# foo');
      expect(fired).toBe(false);
    });
  });
});
