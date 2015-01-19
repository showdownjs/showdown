/**
 * Created by Tivie on 06-01-2015.
 */

// Private properties
var showdown = {},
    parsers = {},
    globalOptions = {
      omitExtraWLInCodeBlocks: false,
      prefixHeaderId: false
    };

///////////////////////////////////////////////////////////////////////////
// Public API
//
/**
 * helper namespace
 * @type {{}}
 */
showdown.helper = {};

///////////////////////////////////////////////////////////////////////////
// API
//

// Public properties
showdown.extensions = {};

//Public methods

/**
 * Set a global option
 *
 * @param {string} key
 * @param {string} value
 * @returns {showdown}
 */
showdown.setOption = function (key, value) {
  'use strict';
  globalOptions[key] = value;
  return this;
};

/**
 * Get a global option
 *
 * @param {string} key
 * @returns {*}
 */
showdown.getOption = function (key) {
  'use strict';
  return globalOptions[key];
};

/**
 * Get the global options
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

/**
 * Showdown Converter class
 *
 * @param {object} [converterOptions]
 * @returns {{makeHtml: Function}}
 */
showdown.Converter = function (converterOptions) {
  'use strict';

  converterOptions = converterOptions || {};

  var options = globalOptions,
      parserOrder = [
        'detab',
        'stripBlankLines',
        //runLanguageExtensions,
        'githubCodeBlocks',
        'hashHTMLBlocks',
        'stripLinkDefinitions',
        'blockGamut',
        'unescapeSpecialChars'
      ];

  // Merge options
  if (typeof converterOptions === 'object') {
    for (var opt in converterOptions) {
      if (converterOptions.hasOwnProperty(opt)) {
        options[opt] = converterOptions[opt];
      }
    }
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
      gHtmlBlocks:    [],
      gUrls:          {},
      gTitles:        {},
      gListLevel:     0,
      hashLinkCounts: {}
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
    //showdown.forEach(g_output_modifiers, function (x) {
    //    text = _ExecuteExtension(x, text);
    //});

    return text;
  }

  return {
    makeHtml: makeHtml
  };
};
