/**
 * Created by Estevao on 31-05-2015.
 */

/**
 * Showdown Converter class
 * @class
 * @param {object} [converterOptions]
 * @returns {Converter}
 */
showdown.Converter = function (converterOptions) {
  'use strict';

  let
      /**
       * Options used by this converter
       * @private
       * @type {{}}
       */
      options = {},

      /**
       * Event listeners
       * @private
       * @type {{}}
       */
      listeners = {},

      /**
       * The flavor set in this converter
       */
      setConvFlavor = setFlavor,

      /**
       * Metadata of the document
       * @type {{parsed: {}, raw: string, format: string}}
       */
      metadata = {
        parsed: {},
        raw: '',
        format: ''
      };

  _constructor();

  /**
   * Converter constructor
   * @private
   */
  function _constructor () {
    converterOptions = converterOptions || {};

    for (let gOpt in globalOptions) {
      if (globalOptions.hasOwnProperty(gOpt)) {
        options[gOpt] = globalOptions[gOpt];
      }
    }

    // Merge options
    if (typeof converterOptions === 'object') {
      for (let opt in converterOptions) {
        if (converterOptions.hasOwnProperty(opt)) {
          options[opt] = converterOptions[opt];
        }
      }
    } else {
      throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
      ' was passed instead.');
    }

    if (options.extensions) {
      showdown.helper.forEach(options.extensions, _parseExtension);
    }

    options = showdown.helper.validateOptions(options);
  }

  /**
   * Parse extension
   * @param {*} ext
   * @param {string} [name='']
   * @private
   */
  function _parseExtension (ext, name) {

    name = name || null;
    // If it's a string, the extension was previously loaded
    if (showdown.helper.isString(ext)) {
      ext = showdown.helper.stdExtName(ext);
      name = ext;

      if (!showdown.helper.isUndefined(extensions[ext])) {
        ext = extensions[ext];

      } else {
        throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
      }
    }

    if (typeof ext === 'function') {
      ext = ext();
    }

    if (!showdown.helper.isArray(ext)) {
      ext = [ext];
    }

    var validExt = validate(ext, name);
    if (!validExt.valid) {
      throw Error(validExt.error);
    }

    for (var i = 0; i < ext.length; ++i) {
      // `lang` and `output` extensions are sugar over the event system: a `lang`
      // extension is a listener on `makehtml.onPreParse` (runs after escaping, before the
      // subparsers) and an `output` extension a listener on `makehtml.onEnd` (runs on the
      // final HTML). They are deprecated in favor of writing listener extensions directly.
      switch (ext[i].type) {

        case 'lang':
          console.warn('DEPRECATION WARNING: "lang" extensions are deprecated and will be removed in a future ' +
            'version. Use a "listener" extension on the "makehtml.onPreParse" event instead.');
          listen('makehtml.onPreParse', _wrapLegacyExtension(ext[i]));
          break;

        case 'output':
          console.warn('DEPRECATION WARNING: "output" extensions are deprecated and will be removed in a future ' +
            'version. Use a "listener" extension on the "makehtml.onEnd" event instead.');
          listen('makehtml.onEnd', _wrapLegacyExtension(ext[i]));
          break;
      }
      if (ext[i].hasOwnProperty('listeners')) {
        for (var ln in ext[i].listeners) {
          if (ext[i].listeners.hasOwnProperty(ln)) {
            listen(ln, ext[i].listeners[ln]);
          }
        }
      }
    }

  }

  /**
   * Adapt a legacy `lang`/`output` extension to an event listener.
   * Returning a string makes `dispatch` update both `event.input` and `event.output`, so
   * several legacy extensions on the same event chain exactly like the old forEach did.
   * @param {{}} ext
   * @returns {function(showdown.Event): string}
   */
  function _wrapLegacyExtension (ext) {
    return function (event) {
      return showdown.subParser('makehtml.runExtension')(ext, event.input, event.options, { converter: event.converter });
    };
  }

  /**
   * Listen to an event
   * @param {string} name
   * @param {function} callback
   */
  function listen (name, callback) {
    if (!showdown.helper.isString(name)) {
      throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
    }

    if (typeof callback !== 'function') {
      throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
    }
    name = name.toLowerCase();
    if (!listeners.hasOwnProperty(name)) {
      listeners[name] = [];
    }
    listeners[name].push(callback);
  }

  /**
   * Stop listening to an event
   * @param {string} name
   * @param {function} [callback] If omitted, removes every listener for the event
   */
  function unlisten (name, callback) {
    if (!showdown.helper.isString(name)) {
      throw Error('Invalid argument in converter.unlisten() method: name must be a string, but ' + typeof name + ' given');
    }
    name = name.toLowerCase();
    if (!listeners.hasOwnProperty(name)) {
      return;
    }
    // no callback given: remove every listener registered for this event
    if (typeof callback === 'undefined') {
      delete listeners[name];
      return;
    }
    if (typeof callback !== 'function') {
      throw Error('Invalid argument in converter.unlisten() method: callback must be a function, but ' + typeof callback + ' given');
    }
    var idx = listeners[name].indexOf(callback);
    while (idx > -1) {
      listeners[name].splice(idx, 1);
      idx = listeners[name].indexOf(callback);
    }
    if (listeners[name].length === 0) {
      delete listeners[name];
    }
  }

  function rTrimInputText (text) {
    let rsp = text.match(/^\s*/)[0].length,
        rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
    return text.replace(rgx, '');
  }

  /**
   *
   * @param {showdown.Event} event
   * @returns showdown.Event
   */
  this.dispatch = function (event) {
    if (!(event instanceof showdown.Event)) {
      throw new TypeError('dispatch only accepts showdown.Event objects as param, but ' + typeof event + ' given');
    }
    event.converter = this;
    if (listeners.hasOwnProperty(event.name)) {
      for (let i = 0; i < listeners[event.name].length; ++i) {
        let listRet = listeners[event.name][i](event);
        if (showdown.helper.isString(listRet)) {
          event.output = listRet;
          event.input = listRet;
        } else if (listRet instanceof showdown.Event && listRet.name === event.name) {
          event = listRet;
        }
      }
    }
    return event;
  };

  /**
   * Listen to an event
   * @param {string} name
   * @param {function} callback
   * @returns {showdown.Converter}
   */
  this.listen = function (name, callback) {
    listen(name, callback);
    return this;
  };

  /**
   * Stop listening to an event
   * @param {string} name
   * @param {function} [callback] If omitted, removes every listener for the event
   * @returns {showdown.Converter}
   */
  this.unlisten = function (name, callback) {
    unlisten(name, callback);
    return this;
  };

  /**
   * Converts a markdown string into HTML string
   * @param {string} text
   * @returns {*}
   */
  this.makeHtml = function (text) {
    //check if text is not falsy
    if (!text) {
      return text;
    }

    var globals = {
      gHtmlBlocks:     [],
      gHtmlRawBlocks:  [],
      gHtmlMdBlocks:   [],
      gHtmlSpans:      [],
      gUrls:           {},
      gTitles:         {},
      gDimensions:     {},
      gListLevel:      0,
      hashLinkCounts:  {},
      converter:       this,
      ghCodeBlocks:    [],
      metadata: {
        parsed: {},
        raw: '',
        format: ''
      }
    };

    // document level onStart event, emitted with the raw markdown before any escaping or
    // normalization. Listeners here see literal `$`/`¨` (unlike onPreParse, which runs after
    // escaping) and can rewrite the source wholesale.
    let startEvent = new showdown.Event('makehtml.onStart', text);
    startEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    startEvent = this.dispatch(startEvent);
    text = startEvent.output;

    // This lets us use ¨ trema as an escape char to avoid md5 hashes
    // The choice of character is arbitrary; anything that isn't
    // magic in Markdown will work.
    text = text.replace(/¨/g, '¨T');

    // Replace $ with ¨D
    // RegExp interprets $ as a special character
    // when it's in a replacement string
    text = text.replace(/\$/g, '¨D');

    // Standardize line endings
    text = text.replace(/\r\n/g, '\n'); // DOS to Unix
    text = text.replace(/\r/g, '\n'); // Mac to Unix

    // Stardardize line spaces
    //text = text.replace(/\u00A0/g, '&nbsp;');

    if (options.smartIndentationFix) {
      text = rTrimInputText(text);
    }

    // Make sure text begins and ends with a couple of newlines:
    text = '\n\n' + text + '\n\n';

    // detab
    //text = showdown.subParser('makehtml.detab')(text, options, globals);
    text = showdown.helper.normalizeLeadingTabs(text);

    /**
     * Strip any lines consisting only of spaces and tabs.
     * This makes subsequent regexs easier to write, because we can
     * match consecutive blank lines with /\n+/ instead of something
     * contorted like /[ \t]*\n+/
     */
    text = text.replace(/^[ \t]+$/mg, '');

    // document level onPreParse event, emitted after escaping/normalization and immediately
    // before the subparsers run. This is where `lang` extensions are invoked (as listeners).
    // Input here contains the `¨D`/`¨T` placeholders for escaped `$`/`¨`.
    let preParseEvent = new showdown.Event('makehtml.onPreParse', text);
    preParseEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    preParseEvent = this.dispatch(preParseEvent);
    text = preParseEvent.output;

    // run the sub parsers
    text = showdown.subParser('makehtml.metadata')(text, options, globals);
    text = showdown.subParser('makehtml.hashPreCodeTags')(text, options, globals);
    if (options.cmSpec) {
      // Container mode parses leaf blocks in document order: an open HTML block (e.g. a
      // `<div>` with no following blank line) absorbs a fence that follows it, so the
      // (fence-aware) HTML-block scan must run before githubCodeBlock. githubCodeBlock then
      // only claims fences at indent 0; indent 1-3 fences nested in list items / block
      // quotes are handled by the container parsers (and a later blockGamut pass for
      // genuinely top-level indented fences).
      if (options.cmSpec) {
        text = showdown.helper.expandCmTabs(text);
      }
      text = showdown.subParser('makehtml.hashHTMLBlocks')(text, options, globals, true);
      text = showdown.subParser('makehtml.githubCodeBlock')(text, options, globals, true);
    } else {
      text = showdown.subParser('makehtml.githubCodeBlock')(text, options, globals);
      // CommonMark tab expansion runs after fenced/pre code is hashed (so their content
      // tabs are protected) and before the block parsers, which key off indentation.
      if (options.cmSpec) {
        text = showdown.helper.expandCmTabs(text);
      }
      text = showdown.subParser('makehtml.hashHTMLBlocks')(text, options, globals, true);
    }
    text = showdown.subParser('makehtml.hashCodeTags')(text, options, globals);
    text = showdown.subParser('makehtml.stripLinkDefinitions')(text, options, globals);
    text = showdown.subParser('makehtml.blockGamut')(text, options, globals);
    text = showdown.subParser('makehtml.paragraphs')(text, options, globals);
    // decode character references (gated by the decodeEntities option) after inline parsing,
    // while code spans/blocks are still hashed, so decoded chars are not re-parsed
    text = showdown.subParser('makehtml.decodeEntities')(text, options, globals);
    // restore raw CommonMark HTML blocks now, after decodeEntities, so their verbatim
    // content (e.g. `<a href="&ouml;&ouml;.html">`) keeps its entities undecoded
    if (globals.gHtmlRawBlocks.length) {
      text = text.replace(/¨R(\d+)R/g, function (wm, n) {
        return globals.gHtmlRawBlocks[n];
      });
    }
    text = showdown.subParser('makehtml.unhashHTMLSpans')(text, options, globals);
    text = showdown.subParser('makehtml.unescapeSpecialChars')(text, options, globals);

    // attacklab: Restore dollar signs
    text = text.replace(/¨D/g, '$$');

    // attacklab: Restore tremas
    text = text.replace(/¨T/g, '¨');

    // render a complete html document instead of a partial if the option is enabled
    text = showdown.subParser('makehtml.completeHTMLDocument')(text, options, globals);

    // document level onEnd event, emitted with the final HTML. This is where `output`
    // extensions are invoked (as listeners) and where listeners can post-process the output.
    let endEvent = new showdown.Event('makehtml.onEnd', text);
    endEvent
      .setOutput(text)
      ._setGlobals(globals)
      ._setOptions(options);
    endEvent = this.dispatch(endEvent);
    text = endEvent.output;

    // update metadata
    metadata = globals.metadata;
    return text;
  };

  /**
   * Converts an HTML string into a markdown string
   * @param src
   * @returns {string}
   */
  this.makeMarkdown = function (src) {

    // replace \r\n with \n
    src = src.replace(/\r\n/g, '\n');
    src = src.replace(/\r/g, '\n'); // old macs

    // document level onStart event (lets listeners rewrite the raw html before parsing)
    let mdStartEvent = new showdown.Event('makeMarkdown.onStart', src);
    mdStartEvent
      .setOutput(src)
      ._setOptions(options);
    mdStartEvent = this.dispatch(mdStartEvent);
    src = mdStartEvent.output;

    // due to an edge case, we need to find this: > <
    // to prevent removing of non silent white spaces
    // ex: <em>this is</em> <strong>sparta</strong>
    src = src.replace(/>[ \t]+</, '>¨NBSP;<');

    var doc = showdown.helper.document.createElement('div');
    doc.innerHTML = src;

    var globals = {
      preList: substitutePreCodeTags(doc),
      converter: this
    };

    // remove all newlines and collapse spaces
    clean(doc);

    // some stuff, like accidental reference links must now be escaped
    // TODO
    // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

    var nodes = doc.childNodes,
        mdDoc = '';

    for (var i = 0; i < nodes.length; i++) {
      mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], options, globals);
    }

    function clean (node) {
      for (var n = 0; n < node.childNodes.length; ++n) {
        var child = node.childNodes[n];
        if (child.nodeType === 3) {
          if (!/\S/.test(child.nodeValue) && !/^[ ]+$/.test(child.nodeValue)) {
            node.removeChild(child);
            --n;
          } else {
            child.nodeValue = child.nodeValue.split('\n').join(' ');
            child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
          }
        } else if (child.nodeType === 1) {
          clean(child);
        }
      }
    }

    // find all pre tags and replace contents with placeholder
    // we need this so that we can remove all indentation from html
    // to ease up parsing
    function substitutePreCodeTags (doc) {

      var pres = doc.querySelectorAll('pre'),
          presPH = [];

      for (var i = 0; i < pres.length; ++i) {

        if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
          var content = pres[i].firstChild.innerHTML.trim(),
              language = pres[i].firstChild.getAttribute('data-language') || '';

          // if data-language attribute is not defined, then we look for class language-*
          if (language === '') {
            var classes = pres[i].firstChild.className.split(' ');
            for (var c = 0; c < classes.length; ++c) {
              var matches = classes[c].match(/^language-(.+)$/);
              if (matches !== null) {
                language = matches[1];
                break;
              }
            }
          }

          // unescape html entities in content
          content = showdown.helper.unescapeHTMLEntities(content);

          presPH.push(content);
          pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
        } else {
          presPH.push(pres[i].innerHTML);
          pres[i].innerHTML = '';
          pres[i].setAttribute('prenum', i.toString());
        }
      }
      return presPH;
    }

    // document level onEnd event (lets listeners post-process the generated markdown)
    let mdEndEvent = new showdown.Event('makeMarkdown.onEnd', mdDoc);
    mdEndEvent
      .setOutput(mdDoc)
      ._setGlobals(globals)
      ._setOptions(options);
    mdEndEvent = this.dispatch(mdEndEvent);
    mdDoc = mdEndEvent.output;

    return mdDoc;
  };

  /**
   * Set an option of this Converter instance
   * @param {string} key
   * @param {*} value
   */
  this.setOption = function (key, value) {
    options[key] = value;
  };

  /**
   * Get the option of this Converter instance
   * @param {string} key
   * @returns {*}
   */
  this.getOption = function (key) {
    return options[key];
  };

  /**
   * Get the options of this Converter instance
   * @returns {{}}
   */
  this.getOptions = function () {
    return options;
  };

  /**
   * Add extension to THIS converter
   * @param {{}} extension
   * @param {string} [name=null]
   */
  this.addExtension = function (extension, name) {
    name = name || null;
    _parseExtension(extension, name);
  };

  /**
   * Use a global registered extension with THIS converter
   * @param {string} extensionName Name of the previously registered extension
   */
  this.useExtension = function (extensionName) {
    _parseExtension(extensionName);
  };

  /**
   * Set the flavor THIS converter should use
   * @param {string} name
   */
  this.setFlavor = function (name) {
    if (!flavor.hasOwnProperty(name)) {
      throw Error(name + ' flavor was not found');
    }
    var preset = flavor[name];
    setConvFlavor = name;
    for (var option in preset) {
      if (preset.hasOwnProperty(option)) {
        options[option] = preset[option];
      }
    }
  };

  /**
   * Get the currently set flavor of this converter
   * @returns {string}
   */
  this.getFlavor = function () {
    return setConvFlavor;
  };

  /**
   * Get the metadata of the previously parsed document
   * @param raw
   * @returns {string|{}}
   */
  this.getMetadata = function (raw) {
    if (raw) {
      return metadata.raw;
    } else {
      return metadata.parsed;
    }
  };

  /**
   * Get the metadata format of the previously parsed document
   * @returns {string}
   */
  this.getMetadataFormat = function () {
    return metadata.format;
  };

  /**
   * Private: set a single key, value metadata pair
   * @param {string} key
   * @param {string} value
   */
  this._setMetadataPair = function (key, value) {
    metadata.parsed[key] = value;
  };

  /**
   * Private: set metadata format
   * @param {string} format
   */
  this._setMetadataFormat = function (format) {
    metadata.format = format;
  };

  /**
   * Private: set metadata raw text
   * @param {string} raw
   */
  this._setMetadataRaw = function (raw) {
    metadata.raw = raw;
  };
};
