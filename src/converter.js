/**
 * @file      converter.js
 * @summary   The `showdown.Converter` per-instance engine running the makeHtml/makeMarkdown pipelines and event loop.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Merges global and per-call options and holds the instance's listeners and extensions.
 * `makeHtml(text)` runs the ordered subparser pipeline over a shared mutable `globals` object
 * (emitting the document-level `makehtml.onStart`/`onPreParse`/`onEnd` events); `makeMarkdown(html)`
 * walks the DOM produced by `helper.parseHTML` through the `makeMarkdown.node` dispatcher. Also
 * provides `listen()`/`dispatch()` and reimplements the deprecated `lang`/`output` extensions as
 * listeners.
 */

/**
 * Module scope (shared across all converter instances): warn at most once per process per
 * deprecated extension type, rather than once per extension load.
 * @type {{}}
 */
let deprecatedExtTypeWarned = {};

/**
 * Emit a one-time deprecation warning for a legacy (`lang`/`output`) extension type
 * @param {string} type
 * @param {string} event
 */
function warnDeprecatedExtType (type, event) {
  'use strict';
  if (deprecatedExtTypeWarned[type]) {
    return;
  }
  deprecatedExtTypeWarned[type] = true;
  console.warn('DEPRECATION WARNING: "' + type + '" extensions are deprecated and will be ' +
    'removed in a future version. Use a "listener" extension on the "' + event + '" event instead.');
}

// --- makeHtml pipeline mechanisms (file-local; each has exactly one caller — the makeHtml
// pipeline below — so they live here rather than on showdown.helper). None emits events. ------

// `$` and `¨` are swapped for the two-char sentinels `¨D`/`¨T` at the very start of
// makeHtml so they survive the pipeline without being read as regex-replacement
// metacharacters or as showdown's `¨` escape marker; they are restored verbatim at the
// end by showdown.helper.restoreDollarsAndTremas (which reverses in the opposite order,
// and is also used by makehtml.metadata). The producer replaces `¨` first (so it doesn't
// double-hit the `¨` introduced for `$`).

/**
 * Hide literal `$` and `¨` behind the `¨D`/`¨T` sentinels.
 * @param {string} text
 * @returns {string}
 */
function hashDollarsAndTremas (text) {
  return text.replace(/¨/g, '¨T').replace(/\$/g, '¨D');
}

/**
 * CommonMark tab expansion: tabs are expanded to spaces using 4-column tab stops,
 * but only in the part of a line that defines block structure - the leading
 * whitespace plus an optional single list/block-quote marker and the whitespace
 * after it. Tabs in content (after that prefix) are preserved. Lines without a tab
 * in their prefix are returned unchanged.
 * @param {string} text
 * @returns {string}
 */
function expandCmTabs (text) {
  if (text.indexOf('\t') === -1) {
    return text;
  }
  const prefixRgx = /^[ \t]*(?:(?:[-+*]|\d{1,9}[.)]|>)[ \t]*)?/;
  const thematicBreakRgx = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
  return text.split('\n').map(function (line) {
    // a thematic break (e.g. `*\t*\t*`) is not a list item: do not let the marker
    // branch of the prefix expansion mangle it
    if (thematicBreakRgx.test(line)) {
      return line;
    }
    let prefix = prefixRgx.exec(line)[0];
    if (prefix.indexOf('\t') === -1) {
      return line;
    }
    let out = '',
        col = 0;
    for (let k = 0; k < prefix.length; ++k) {
      let ch = prefix.charAt(k);
      if (ch === '\t') {
        let adv = 4 - (col % 4);
        out += new Array(adv + 1).join(' ');
        col += adv;
      } else {
        out += ch;
        col++;
      }
    }
    return out + line.slice(prefix.length);
  }).join('\n');
}

function normalizeLeadingTabs (text) {
  // 1. (1 to 3 spaces followed by a tab at the start of the line) becomes (1 tab)
  text = text.replace(/^ {1,3}\t/gm, '\t');

  // 2.
  return text;
}

// Shared factory for the two "hash a raw code element" passes — hashCodeTags and its
// near-clone hashPreCodeTags. Both run the same recursive open/close scan plus encodeCode,
// differing only in the open/close tag patterns and how the hashed block is stored.
function makeHashCodeTagsHelper (openPattern, closePattern, store) {
  'use strict';
  return function (text, options, globals) {
    let repFunc = function (wholeMatch, match, left, right) {
      // encode html entities
      let codeblock = left + showdown.helper.encodeCode(match) + right;
      return store(wholeMatch, codeblock, globals);
    };
    return showdown.helper.replaceRecursiveRegExp(text, repFunc, openPattern, closePattern, 'gim');
  };
}

// Hash naked <code>
const hashCodeTags = makeHashCodeTagsHelper(
  '<code\\b[^>]*>',
  '</code>',
  function (wholeMatch, codeblock, globals) {
    return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
  }
);

// Hash raw <pre><code> blocks (stored in ghCodeBlocks, as githubCodeBlock does).
const hashPreCodeTags = makeHashCodeTagsHelper(
  '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>',
  '^ {0,3}</code>\\s*</pre>',
  function (wholeMatch, codeblock, globals) {
    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
  }
);

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
      if (Object.prototype.hasOwnProperty.call(globalOptions, gOpt)) {
        options[gOpt] = globalOptions[gOpt];
      }
    }

    // Merge options
    if (typeof converterOptions === 'object') {
      for (let opt in converterOptions) {
        if (Object.prototype.hasOwnProperty.call(converterOptions, opt)) {
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

    let validExt = validate(ext, name);
    if (!validExt.valid) {
      throw Error(validExt.error);
    }

    for (let i = 0; i < ext.length; ++i) {
      // `lang` and `output` extensions are sugar over the event system: a `lang`
      // extension is a listener on `makehtml.onPreParse` (runs after escaping, before the
      // subparsers) and an `output` extension a listener on `makehtml.onEnd` (runs on the
      // final HTML). They are deprecated in favor of writing listener extensions directly.
      switch (ext[i].type) {

        case 'lang':
          warnDeprecatedExtType('lang', 'makehtml.onPreParse');
          listen('makehtml.onPreParse', _wrapLegacyExtension(ext[i]));
          break;

        case 'output':
          warnDeprecatedExtType('output', 'makehtml.onEnd');
          listen('makehtml.onEnd', _wrapLegacyExtension(ext[i]));
          break;
      }
      if (Object.prototype.hasOwnProperty.call(ext[i], 'listeners')) {
        for (let ln in ext[i].listeners) {
          if (Object.prototype.hasOwnProperty.call(ext[i].listeners, ln)) {
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
      // Inlined former makehtml.runExtension: apply a legacy lang/output extension's
      // filter (or regex/replace) to the event's text.
      let text = event.input;
      if (ext.filter) {
        text = ext.filter(text, event.converter, event.options);

      } else if (ext.regex) {
        // TODO remove this when old extension loading mechanism is deprecated
        let re = ext.regex;
        if (!(re instanceof RegExp)) {
          re = new RegExp(re, 'g');
        }
        text = text.replace(re, ext.replace);
      }
      return text;
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
    if (!Object.prototype.hasOwnProperty.call(listeners, name)) {
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
    if (!Object.prototype.hasOwnProperty.call(listeners, name)) {
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
    let idx = listeners[name].indexOf(callback);
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
    if (Object.prototype.hasOwnProperty.call(listeners, event.name)) {
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

    let globals = {
      gHtmlBlocks:     [],
      gHtmlRawBlocks:  [],
      gHtmlMdBlocks:   [],
      gHtmlSpans:      [],
      gUrls:           {},
      gTitles:         {},
      gDimensions:     {},
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
    text = showdown.Event.dispatchStart('makehtml.onStart', text, options, globals).output;

    // Hide literal ¨ and $ behind the ¨T/¨D sentinels: ¨ is showdown's escape marker and
    // a bare $ is special in RegExp replacement strings. Restored at the end of makeHtml.
    text = hashDollarsAndTremas(text);

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
    text = normalizeLeadingTabs(text);

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
    text = showdown.Event.dispatchStart('makehtml.onPreParse', text, options, globals).output;

    // run the sub parsers
    text = showdown.subParser('makehtml.metadata')(text, options, globals);
    text = hashPreCodeTags(text, options, globals);
    // One block-stage ordering for every flavor: the HTML-block scan runs BEFORE githubCodeBlock.
    // Leaf blocks are recognized in document order, so an open HTML block (e.g. a `<div>` with no
    // following blank line) absorbs a fence that follows it; the (fence-aware) htmlBlock scan must
    // therefore see the literal fenced source first. githubCodeBlock then claims fenced code:
    // under cmSpec (`topLevelOnly`) only fences at indent 0 — indent 1-3 fences nested in list
    // items / block quotes are handled by the container parsers (and a later blockGamut pass for
    // genuinely top-level indented fences); the legacy flavors get its full {0,3}-indent +
    // unclosed-fence passes. Only `expandCmTabs` (a CommonMark tab-normalization rule) stays
    // cmSpec-gated; the ordering itself is unconditional (unified at U-8c).
    if (options.cmSpec) {
      text = expandCmTabs(text);
    }
    text = showdown.subParser('makehtml.htmlBlock')(text, options, globals);
    text = showdown.subParser('makehtml.githubCodeBlock')(text, options, globals, options.cmSpec);
    text = hashCodeTags(text, options, globals);
    // Footnotes (GFM): collect `[^id]: ...` definitions and replace `[^id]` references
    // before stripLinkDefinitions (whose scanner would otherwise claim `[^id]:` lines).
    text = showdown.subParser('makehtml.footnotes')(text, options, globals, 'strip');
    text = showdown.subParser('makehtml.stripLinkDefinitions')(text, options, globals);
    text = showdown.subParser('makehtml.blockEngine')(text, options, globals);
    text = showdown.subParser('makehtml.paragraphs')(text, options, globals);
    // Footnotes (GFM): render the referenced footnotes into a <section> and append it,
    // before unhashHTMLSpans so hashed spans inside the rendered footnotes are restored.
    text = showdown.subParser('makehtml.footnotes')(text, options, globals, 'build');
    // decode character references (gated by the decodeEntities option) after inline parsing,
    // while code spans/blocks are still hashed, so decoded chars are not re-parsed
    text = showdown.subParser('makehtml.decodeEntities')(text, options, globals);
    // restore raw HTML blocks now, after decodeEntities, so their verbatim content
    // (e.g. `<a href="&ouml;&ouml;.html">`) keeps its entities undecoded for every flavor. Raw
    // blocks can nest (the legacy balanced-tag scanner hashes an inner block-level tag before the
    // outer one absorbs it), so restore repeatedly until no ¨R remains — a single String.replace
    // pass would not re-scan the content it just inserted. cmSpec never nests, so this loops
    // exactly once there. The guard bounds iterations by the block count (max possible nesting
    // depth); the ¨ escape marker is already hidden as ¨T by this point, so stored content cannot
    // reintroduce a spurious ¨R placeholder.
    if (globals.gHtmlRawBlocks.length) {
      let rawGuard = 0;
      while (/¨R\d+R/.test(text) && rawGuard++ <= globals.gHtmlRawBlocks.length) {
        text = text.replace(/¨R(\d+)R/g, function (wm, n) {
          return globals.gHtmlRawBlocks[n];
        });
      }
    }
    text = showdown.helper.unhashHTMLSpans(text, options, globals);
    text = showdown.helper.unescapePlaceholders(text);
    // GFM disallowed-raw-html tagfilter (opt-in): neutralize a small HTML tag blacklist in
    // the now-restored raw HTML. Runs late so it sees the final tags, not placeholders.
    text = showdown.subParser('makehtml.disallowedHtmlTags')(text, options, globals);

    // Restore the ¨D/¨T sentinels back to literal $ and ¨
    text = showdown.helper.restoreDollarsAndTremas(text);

    // render a complete html document instead of a partial if the option is enabled
    text = showdown.subParser('makehtml.completeHTMLDocument')(text, options, globals);

    // document level onEnd event, emitted with the final HTML. This is where `output`
    // extensions are invoked (as listeners) and where listeners can post-process the output.
    text = showdown.Event.dispatchEnd('makehtml.onEnd', text, options, globals).output;

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

    // document level onStart event (lets listeners rewrite the raw html before parsing).
    // The per-document globals are not built yet, so a minimal `{converter: this}` is
    // passed to the lifecycle helper (it dispatches via globals.converter).
    src = showdown.Event.dispatchStart('makeMarkdown.onStart', src, options, { converter: this }).output;

    // due to an edge case, we need to find this: > <
    // to prevent removing of non silent white spaces
    // ex: <em>this is</em> <strong>sparta</strong>
    //
    // The `g` flag is load-bearing: without it only the FIRST such run per document is
    // protected and every later pair of adjacent inline elements gets jammed together
    // (`<em>a</em> <strong>b</strong> <em>c</em>` → `*a* **b***c*`). Guarded by the
    // inline-elements-adjacent-whitespace fixture in the makemarkdown standard suite.
    src = src.replace(/>[ \t]+</g, '>¨NBSP;<');

    let doc = showdown.helper.parseHTML(src);

    let globals = {
      preList: substitutePreCodeTags(doc),
      converter: this
    };

    // remove all newlines and collapse spaces
    clean(doc);

    // some stuff, like accidental reference links must now be escaped
    // TODO
    // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

    let nodes = doc.childNodes,
        mdDoc = '';

    for (let i = 0; i < nodes.length; i++) {
      mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], options, globals);
    }

    function clean (node) {
      for (let n = 0; n < node.childNodes.length; ++n) {
        let child = node.childNodes[n];
        if (child.nodeType === 3) {
          if (!/\S/.test(child.nodeValue) && !/^ +$/.test(child.nodeValue)) {
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

      let pres = doc.querySelectorAll('pre'),
          presPH = [];

      for (let i = 0; i < pres.length; ++i) {

        if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
          let content = pres[i].firstChild.innerHTML.trim(),
              language = pres[i].firstChild.getAttribute('data-language') || '';

          // if data-language attribute is not defined, then we look for class language-*
          if (language === '') {
            let classes = pres[i].firstChild.className.split(' ');
            for (let c = 0; c < classes.length; ++c) {
              let matches = classes[c].match(/^language-(.+)$/);
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
    mdDoc = showdown.Event.dispatchEnd('makeMarkdown.onEnd', mdDoc, options, globals).output;

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
    let preset = showdown.getFlavorOptions(name);
    if (!preset) {
      throw Error(name + ' flavor was not found');
    }
    setConvFlavor = name;
    showdown.helper.applyFlavor(preset, options);
    return this;
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
