/**
 * Created by Tivie on 06-01-2015.
 */

// Private properties
var showdown = {},
    parsers = {},
    extensions = {},
    globalOptions = {
      omitExtraWLInCodeBlocks: false,
      prefixHeaderId:          false
    };

/**
 * helper namespace
 * @type {{}}
 */
showdown.helper = {};

// Public properties
showdown.extensions = {};

/**
 * Set a global option
 * @static
 * @param {string} key
 * @param {*} value
 * @returns {showdown}
 */
showdown.setOption = function (key, value) {
  'use strict';
  globalOptions[key] = value;
  return this;
};

/**
 * Get a global option
 * @static
 * @param {string} key
 * @returns {*}
 */
showdown.getOption = function (key) {
  'use strict';
  return globalOptions[key];
};

/**
 * Get the global options
 * @static
 * @returns {{omitExtraWLInCodeBlocks: boolean, prefixHeaderId: boolean}}
 */
showdown.getOptions = function () {
  'use strict';
  return globalOptions;
};

/**
 * Get or set a subParser
 *
 * subParser(name)       - Get a registered subParser
 * subParser(name, func) - Register a subParser
 * @static
 * @param {string} name
 * @param {function} [func]
 * @returns {*}
 */
showdown.subParser = function (name, func) {
  'use strict';
  if (showdown.helper.isString(name)) {
    if (typeof func !== 'undefined') {
      parsers[name] = func;
    } else {
      if (parsers.hasOwnProperty(name)) {
        return parsers[name];
      } else {
        throw Error('SubParser named ' + name + ' not registered!');
      }
    }
  }
};

showdown.extension = function (name, ext) {
  'use strict';

  if (!showdown.helper.isString(name)) {
    throw Error('Extension \'name\' must be a string');
  }

  name = showdown.helper.stdExtName(name);

  if (showdown.helper.isUndefined(ext)) {
    return getExtension();
  } else {
    return setExtension();
  }
};

function getExtension(name) {
  'use strict';

  if (!extensions.hasOwnProperty(name)) {
    throw Error('Extension named ' + name + ' is not registered!');
  }
  return extensions[name];
}

function setExtension(name, ext) {
  'use strict';

  if (typeof ext !== 'object') {
    throw Error('A Showdown Extension must be an object, ' + typeof ext + ' given');
  }

  if (!showdown.helper.isString(ext.type)) {
    throw Error('When registering a showdown extension, "type" must be a string, ' + typeof ext.type + ' given');
  }

  ext.type = ext.type.toLowerCase();

  extensions[name] = ext;
}

/**
 * Showdown Converter class
 *
 * @param {object} [converterOptions]
 * @returns {{makeHtml: Function}}
 */
showdown.Converter = function (converterOptions) {
  'use strict';

  converterOptions = converterOptions || {};

  var options = {},
      langExtensions = [],
      outputModifiers = [],
      parserOrder = [
        'githubCodeBlocks',
        'hashHTMLBlocks',
        'stripLinkDefinitions',
        'blockGamut',
        'unescapeSpecialChars'
      ];

  for (var gOpt in globalOptions) {
    if (globalOptions.hasOwnProperty(gOpt)) {
      options[gOpt] = globalOptions[gOpt];
    }
  }

  // Merge options
  if (typeof converterOptions === 'object') {
    for (var opt in converterOptions) {
      if (converterOptions.hasOwnProperty(opt)) {
        options[opt] = converterOptions[opt];
      }
    }
  }

  // This is a dirty workaround to maintain backwards extension compatibility
  // We define a self var (which is a copy of this) and inject the makeHtml function
  // directly to it. This ensures a full converter object is available when iterating over extensions
  // We should rewrite the extension loading mechanism and use some kind of interface or decorator pattern
  // and inject the object reference there instead.
  var self = this;
  self.makeHtml = makeHtml;

  // Parse options
  if (options.extensions) {

    // Iterate over each plugin
    showdown.helper.forEach(options.extensions, function (plugin) {
      var pluginName = plugin;

      // Assume it's a bundled plugin if a string is given
      if (typeof plugin === 'string') {
        var tPluginName = showdown.helper.stdExtName(plugin);

        if (!showdown.helper.isUndefined(showdown.extensions[tPluginName]) && showdown.extensions[tPluginName]) {
          //Trigger some kind of deprecated alert
          plugin = showdown.extensions[tPluginName];

        } else if (!showdown.helper.isUndefined(extensions[tPluginName])) {
          plugin = extensions[tPluginName];
        }
      }

      if (typeof plugin === 'function') {
        // Iterate over each extension within that plugin
        showdown.helper.forEach(plugin(self), function (ext) {
          // Sort extensions by type
          if (ext.type) {
            if (ext.type === 'language' || ext.type === 'lang') {
              langExtensions.push(ext);
            } else if (ext.type === 'output' || ext.type === 'html') {
              outputModifiers.push(ext);
            }
          } else {
            // Assume language extension
            outputModifiers.push(ext);
          }
        });
      } else {
        var errMsg = 'An extension could not be loaded. It was either not found or is not a valid extension.';
        if (typeof pluginName === 'string') {
          errMsg = 'Extension "' + pluginName + '" could not be loaded.  It was either not found or is not a valid extension.';
        }
        throw errMsg;
      }
    });
  }

  /**
   * Converts a markdown string into HTML
   * @param {string} text
   * @returns {*}
   */
  function makeHtml(text) {

    //check if text is not falsy
    if (!text) {
      return text;
    }

    var globals = {
      gHtmlBlocks:     [],
      gUrls:           {},
      gTitles:         {},
      gListLevel:      0,
      hashLinkCounts:  {},
      langExtensions:  langExtensions,
      outputModifiers: outputModifiers
    };

    // attacklab: Replace ~ with ~T
    // This lets us use tilde as an escape char to avoid md5 hashes
    // The choice of character is arbitrary; anything that isn't
    // magic in Markdown will work.
    text = text.replace(/~/g, '~T');

    // attacklab: Replace $ with ~D
    // RegExp interprets $ as a special character
    // when it's in a replacement string
    text = text.replace(/\$/g, '~D');

    // Standardize line endings
    text = text.replace(/\r\n/g, '\n'); // DOS to Unix
    text = text.replace(/\r/g, '\n'); // Mac to Unix

    // Make sure text begins and ends with a couple of newlines:
    text = '\n\n' + text + '\n\n';

    // detab
    text = parsers.detab(text, options, globals);

    // stripBlankLines
    text = parsers.stripBlankLines(text, options, globals);

    //run languageExtensions
    text = parsers.languageExtensions(text, options, globals);

    // Run all registered parsers
    for (var i = 0; i < parserOrder.length; ++i) {
      var name = parserOrder[i];
      text = parsers[name](text, options, globals);
    }

    // attacklab: Restore dollar signs
    text = text.replace(/~D/g, '$$');

    // attacklab: Restore tildes
    text = text.replace(/~T/g, '~');

    // Run output modifiers
    showdown.helper.forEach(globals.outputModifiers, function (ext) {
      text = showdown.subParser('runExtension')(ext, text);
    });
    text = parsers.outputModifiers(text, options, globals);

    return text;
  }

  /**
   * Set an option of this Converter instance
   * @param {string} key
   * @param {*} value
   */
  function setOption (key, value) {
    options[key] = value;
  }

  /**
   * Get the option of this Converter instance
   * @param {string} key
   * @returns {*}
   */
  function getOption(key) {
    return options[key];
  }

  /**
   * Get the options of this Converter instance
   * @returns {{}}
   */
  function getOptions() {
    return options;
  }

  return {
    makeHtml: makeHtml,
    setOption: setOption,
    getOption: getOption,
    getOptions: getOptions
  };
};
