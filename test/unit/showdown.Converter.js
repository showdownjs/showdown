/**
 * Created by Estevao on 31-05-2015.
 */
//let showdown = require('../../.build/showdown.js') || require('showdown');
chai.should();


describe('showdown.Converter', function () {
  'use strict';

  describe('option methods', function () {
    let converter = new showdown.Converter();

    it('setOption() should set option foo=baz', function () {
      converter.setOption('foo', 'baz');
    });

    it('getOption() should get option foo to equal baz', function () {
      converter.getOption('foo').should.equal('baz');
    });

    it('getOptions() should contain foo=baz', function () {
      let options = converter.getOptions();
      options.should.have.ownProperty('foo');
      options.foo.should.equal('baz');
    });
  });

  describe('metadata methods', function () {
    let converter = new showdown.Converter();

    it('_setMetadataPair() should set foo to bar', function () {
      converter._setMetadataPair('foo', 'bar');
      converter.getMetadata().should.eql({foo: 'bar'});
    });

    it('_setMetadata should set metadata to {baz: bazinga}', function () {
      converter._setMetadataRaw('{baz: bazinga}');
      converter.getMetadata(true).should.eql('{baz: bazinga}');
    });
  });

  describe('converter.setFlavor()', function () {

    /**
     * Test setFlavor('github')
     */
    describe('github', function () {
      let converter = new showdown.Converter(),
          ghOpts = showdown.getFlavorOptions('github');

      converter.setFlavor('github');

      for (let opt in ghOpts) {
        if (ghOpts.hasOwnProperty(opt)) {
          check(opt, ghOpts[opt]);
        }
      }
      function check (key, val) {
        it('should set ' + key + ' to ' + val, function () {
          converter.getOption(key).should.equal(val);
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
        converter.getFlavor().should.equal('vanilla');
      });

      it('should be changed if global option is changed', function () {
        showdown.setFlavor('github');
        let converter = new showdown.Converter();
        converter.getFlavor().should.equal('github');
        showdown.setFlavor('vanilla');
      });

      it('should not be changed if converter is initialized before global change', function () {
        let converter = new showdown.Converter();
        showdown.setFlavor('github');
        converter.getFlavor().should.equal('vanilla');
        showdown.setFlavor('vanilla');
      });
    });
  });

  describe('extension methods', function () {
    let extObjMock = {
          type: 'lang',
          filter: function () {}
        },
        extObjFunc = function () {
          return extObjMock;
        };

    it('addExtension() should add an extension Object', function () {
      let converter = new showdown.Converter();
      converter.addExtension(extObjMock);
      converter.getAllExtensions().language.should.contain(extObjMock);
    });

    it('addExtension() should unwrap an extension wrapped in a function', function () {
      let converter = new showdown.Converter();

      converter.addExtension(extObjFunc);
      converter.getAllExtensions().language.should.contain(extObjMock);
    });

    it('useExtension() should use a previous registered extension in showdown', function () {
      showdown.extension('foo', extObjMock);
      let converter = new showdown.Converter();

      converter.useExtension('foo');
      converter.getAllExtensions().language.should.contain(extObjMock);
      showdown.resetExtensions();
    });

    it('removeExtension() should remove an added extension', function () {
      let converter = new showdown.Converter();
      converter.addExtension(extObjMock);

      converter.removeExtension(extObjMock);
      converter.getAllExtensions().language.should.not.contain(extObjMock);
    });
  });

  describe('events', function () {
    let events = [
      'makehtml.anchors',
      'makehtml.autoLinks',
      'makehtml.blockGamut',
      'makehtml.blockQuotes',
      'makehtml.codeBlocks',
      'makehtml.codeSpans',
      'makehtml.githubCodeBlocks',
      'makehtml.headers',
      'makehtml.images',
      'makehtml.italicsAndBold',
      'makehtml.lists',
      'makehtml.paragraph',
      'makehtml.spanGamut'
      //'strikeThrough',
      //'tables'
    ];

    for (let i = 0; i < events.length; ++i) {
      runListener(events[i] + '.before');
      runListener(events[i] + '.after');
    }

    function runListener (name) {
      it('should listen to ' + name, function () {
        let converter = new showdown.Converter();
        converter.listen(name, function (event) {
          let evtName = event.getName();
          let text = event.getCapturedText();
          evtName.should.equal(name.toLowerCase());
          text.should.match(/^[\s\S]*foo[\s\S]*$/);
          return text;
        })
          .makeHtml('foo');
      });
    }
  });
});
