/**
 * showdownjs helper functions
 */

if (!showdown.hasOwnProperty('helper')) {
  showdown.helper = {};
}

if (typeof this === 'undefined' && typeof window !== 'undefined') {
  showdown.helper.document = window.document;
} else {
  if (typeof this.document === 'undefined' && typeof this.window === 'undefined') {
    var jsdom = require('jsdom');
    this.window = new jsdom.JSDOM('', {}).window; // jshint ignore:line
  }
  showdown.helper.document = this.window.document;
}

/**
 * Check if var is string
 * @static
 * @param {string} a
 * @returns {boolean}
 */
showdown.helper.isString = function (a) {
  'use strict';
  return (typeof a === 'string' || a instanceof String);
};

/**
 * Check if var is a function
 * @static
 * @param {*} a
 * @returns {boolean}
 */
showdown.helper.isFunction = function (a) {
  'use strict';
  var getType = {};
  return a && getType.toString.call(a) === '[object Function]';
};

/**
 * isArray helper function
 * @static
 * @param {*} a
 * @returns {boolean}
 */
showdown.helper.isArray = function (a) {
  'use strict';
  return Array.isArray(a);
};

/**
 * Check if value is undefined
 * @static
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 */
showdown.helper.isUndefined = function (value) {
  'use strict';
  return typeof value === 'undefined';
};

/**
 * ForEach helper function
 * Iterates over Arrays and Objects (own properties only)
 * @static
 * @param {*} obj
 * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
 */
showdown.helper.forEach = function (obj, callback) {
  'use strict';
  // check if obj is defined
  if (showdown.helper.isUndefined(obj)) {
    throw new Error('obj param is required');
  }

  if (showdown.helper.isUndefined(callback)) {
    throw new Error('callback param is required');
  }

  if (!showdown.helper.isFunction(callback)) {
    throw new Error('callback param must be a function/closure');
  }

  if (typeof obj.forEach === 'function') {
    obj.forEach(callback);
  } else if (showdown.helper.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      callback(obj[i], i, obj);
    }
  } else if (typeof (obj) === 'object') {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        callback(obj[prop], prop, obj);
      }
    }
  } else {
    throw new Error('obj does not seem to be an array or an iterable object');
  }
};

/**
 * Standardidize extension name
 * @static
 * @param {string} s extension name
 * @returns {string}
 */
showdown.helper.stdExtName = function (s) {
  'use strict';
  return s.replace(/[_?*+\/\\.^-]/g, '').replace(/\s/g, '').toLowerCase();
};

function escapeCharactersCallback (wholeMatch, m1) {
  'use strict';
  var charCodeToEscape = m1.charCodeAt(0);
  return '¨E' + charCodeToEscape + 'E';
}

/**
 * Callback used to escape characters when passing through String.replace
 * @static
 * @param {string} wholeMatch
 * @param {string} m1
 * @returns {string}
 */
showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

/**
 * Escape characters in a string
 * @static
 * @param {string} text
 * @param {string} charsToEscape
 * @param {boolean} afterBackslash
 * @returns {string|void|*}
 */
showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
  'use strict';
  // First we have to escape the escape characters so that
  // we can build a character class out of them
  var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

  if (afterBackslash) {
    regexString = '\\\\' + regexString;
  }

  var regex = new RegExp(regexString, 'g');
  text = text.replace(regex, escapeCharactersCallback);

  return text;
};

var rgxFindMatchPos = function (str, left, right, flags) {
  'use strict';
  var f = flags || '',
      g = f.indexOf('g') > -1,
      x = new RegExp(left + '|' + right, 'g' + f.replace(/g/g, '')),
      l = new RegExp(left, f.replace(/g/g, '')),
      pos = [],
      t, s, m, start, end;

  do {
    t = 0;
    while ((m = x.exec(str))) {
      if (l.test(m[0])) {
        if (!(t++)) {
          s = x.lastIndex;
          start = s - m[0].length;
        }
      } else if (t) {
        if (!--t) {
          end = m.index + m[0].length;
          var obj = {
            left: {start: start, end: s},
            match: {start: s, end: m.index},
            right: {start: m.index, end: end},
            wholeMatch: {start: start, end: end}
          };
          pos.push(obj);
          if (!g) {
            return pos;
          }
        }
      }
    }
  } while (t && (x.lastIndex = s));

  return pos;
};

/**
 * matchRecursiveRegExp
 *
 * (c) 2007 Steven Levithan <stevenlevithan.com>
 * MIT License
 *
 * Accepts a string to search, a left and right format delimiter
 * as regex patterns, and optional regex flags. Returns an array
 * of matches, allowing nested instances of left/right delimiters.
 * Use the "g" flag to return all matches, otherwise only the
 * first is returned. Be careful to ensure that the left and
 * right format delimiters produce mutually exclusive matches.
 * Backreferences are not supported within the right delimiter
 * due to how it is internally combined with the left delimiter.
 * When matching strings whose format delimiters are unbalanced
 * to the left or right, the output is intentionally as a
 * conventional regex library with recursion support would
 * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
 * "<" and ">" as the delimiters (both strings contain a single,
 * balanced instance of "<x>").
 *
 * examples:
 * matchRecursiveRegExp("test", "\\(", "\\)")
 * returns: []
 * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
 * returns: ["t<<e>><s>", ""]
 * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
 * returns: ["test"]
 */
showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {
  'use strict';

  var matchPos = rgxFindMatchPos (str, left, right, flags),
      results = [];

  for (var i = 0; i < matchPos.length; ++i) {
    results.push([
      str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
      str.slice(matchPos[i].match.start, matchPos[i].match.end),
      str.slice(matchPos[i].left.start, matchPos[i].left.end),
      str.slice(matchPos[i].right.start, matchPos[i].right.end)
    ]);
  }
  return results;
};

/**
 *
 * @param {string} str
 * @param {string|function} replacement
 * @param {string} left
 * @param {string} right
 * @param {string} flags
 * @returns {string}
 */
showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {
  'use strict';

  if (!showdown.helper.isFunction(replacement)) {
    var repStr = replacement;
    replacement = function () {
      return repStr;
    };
  }

  var matchPos = rgxFindMatchPos(str, left, right, flags),
      finalStr = str,
      lng = matchPos.length;

  if (lng > 0) {
    var bits = [];
    if (matchPos[0].wholeMatch.start !== 0) {
      bits.push(str.slice(0, matchPos[0].wholeMatch.start));
    }
    for (var i = 0; i < lng; ++i) {
      bits.push(
        replacement(
          str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
          str.slice(matchPos[i].match.start, matchPos[i].match.end),
          str.slice(matchPos[i].left.start, matchPos[i].left.end),
          str.slice(matchPos[i].right.start, matchPos[i].right.end)
        )
      );
      if (i < lng - 1) {
        bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
      }
    }
    if (matchPos[lng - 1].wholeMatch.end < str.length) {
      bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
    }
    finalStr = bits.join('');
  }
  return finalStr;
};

/**
 * Returns the index within the passed String object of the first occurrence of the specified regex,
 * starting the search at fromIndex. Returns -1 if the value is not found.
 *
 * @param {string} str string to search
 * @param {RegExp} regex Regular expression to search
 * @param {int} [fromIndex = 0] Index to start the search
 * @returns {Number}
 * @throws InvalidArgumentError
 */
showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
  'use strict';
  if (!showdown.helper.isString(str)) {
    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
  }
  if (!(regex instanceof RegExp)) {
    throw 'InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp';
  }
  var indexOf = str.substring(fromIndex || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (fromIndex || 0)) : indexOf;
};

/**
 * Splits the passed string object at the defined index, and returns an array composed of the two substrings
 * @param {string} str string to split
 * @param {int} index index to split string at
 * @returns {[string,string]}
 * @throws InvalidArgumentError
 */
showdown.helper.splitAtIndex = function (str, index) {
  'use strict';
  if (!showdown.helper.isString(str)) {
    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
  }
  return [str.substring(0, index), str.substring(index)];
};

/**
 * Obfuscate an e-mail address through the use of Character Entities,
 * transforming ASCII characters into their equivalent decimal or hex entities.
 *
 * Since it has a random component, subsequent calls to this function produce different results
 *
 * @param {string} mail
 * @returns {string}
 */
showdown.helper.encodeEmailAddress = function (mail) {
  'use strict';
  var encode = [
    function (ch) {
      return '&#' + ch.charCodeAt(0) + ';';
    },
    function (ch) {
      return '&#x' + ch.charCodeAt(0).toString(16) + ';';
    },
    function (ch) {
      return ch;
    }
  ];

  mail = mail.replace(/./g, function (ch) {
    if (ch === '@') {
      // this *must* be encoded. I insist.
      ch = encode[Math.floor(Math.random() * 2)](ch);
    } else {
      var r = Math.random();
      // roughly 10% raw, 45% hex, 45% dec
      ch = (
        r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
      );
    }
    return ch;
  });

  return mail;
};

/**
 *
 * @param str
 * @param targetLength
 * @param padString
 * @returns {string}
 */
showdown.helper.padEnd = function padEnd (str, targetLength, padString) {
  'use strict';
  /*jshint bitwise: false*/
  // eslint-disable-next-line space-infix-ops
  targetLength = targetLength>>0; //floor if number or convert non-number to 0;
  /*jshint bitwise: true*/
  padString = String(padString || ' ');
  if (str.length > targetLength) {
    return String(str);
  } else {
    targetLength = targetLength - str.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
    }
    return String(str) + padString.slice(0,targetLength);
  }
};

/**
 * Unescape HTML entities
 * @param txt
 * @returns {string}
 */
showdown.helper.unescapeHTMLEntities = function (txt) {
  'use strict';

  return txt
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};

showdown.helper._hashHTMLSpan = function (html, globals) {
  return '¨C' + (globals.gHtmlSpans.push(html) - 1) + 'C';
};

/**
 * Prepends a base URL to relative paths.
 *
 * @param {string} baseUrl the base URL to prepend to a relative path
 * @param {string} url the path to modify, which may be relative
 * @returns {string} the full URL
 */
showdown.helper.applyBaseUrl = function (baseUrl, url) {
  // Only prepend if given a base URL and the path is not absolute.
  if (baseUrl && !this.isAbsolutePath(url)) {
    var urlResolve = require('url').resolve;
    url = urlResolve(baseUrl, url);
  }

  return url;
};

/**
 * Checks if the given path is absolute.
 *
 * @param {string} path the path to test for absolution
 * @returns {boolean} `true` if the given path is absolute, else `false`
 */
showdown.helper.isAbsolutePath = function (path) {
  // Absolute paths begin with '[protocol:]//' or '#' (anchors)
  return /(^([a-z]+:)?\/\/)|(^#)/i.test(path);
};

/**
 * Showdown's Event Object
 * @param {string} name Name of the event
 * @param {string} text Text
 * @param {{}} params optional. params of the event
 * @constructor
 */
showdown.helper.Event = function (name, text, params) {
  'use strict';

  var regexp = params.regexp || null;
  var matches = params.matches || {};
  var options = params.options || {};
  var converter = params.converter || null;
  var globals = params.globals || {};

  /**
   * Get the name of the event
   * @returns {string}
   */
  this.getName = function () {
    return name;
  };

  this.getEventName = function () {
    return name;
  };

  this._stopExecution = false;

  this.parsedText = params.parsedText || null;

  this.getRegexp = function () {
    return regexp;
  };

  this.getOptions = function () {
    return options;
  };

  this.getConverter = function () {
    return converter;
  };

  this.getGlobals = function () {
    return globals;
  };

  this.getCapturedText = function () {
    return text;
  };

  this.getText = function () {
    return text;
  };

  this.setText = function (newText) {
    text = newText;
  };

  this.getMatches = function () {
    return matches;
  };

  this.setMatches = function (newMatches) {
    matches = newMatches;
  };

  this.preventDefault = function (bool) {
    this._stopExecution = !bool;
  };
};

/**
 * POLYFILLS
 */
// use this instead of builtin is undefined for IE8 compatibility
if (typeof (console) === 'undefined') {
  console = {
    warn: function (msg) {
      'use strict';
      alert(msg);
    },
    log: function (msg) {
      'use strict';
      alert(msg);
    },
    error: function (msg) {
      'use strict';
      throw msg;
    }
  };
}

/**
 * Common regexes.
 * We declare some common regexes to improve performance
 */
showdown.helper.regexes = {
  asteriskDashTildeAndColon: /([*_:~])/g,
  asteriskDashAndTilde:      /([*_~])/g
};

/**
 * EMOJIS LIST
 */
showdown.helper.emojis = {
  '100': '\ud83d\udcaf',
  '1234': '\ud83d\udd22',
  '+1': '\ud83d\udc4d',
  '-1': '\ud83d\udc4e',
  '1st_place_medal': '\ud83e\udd47',
  '2nd_place_medal': '\ud83e\udd48',
  '3rd_place_medal': '\ud83e\udd49',
  '8ball': '\ud83c\udfb1',
  'a': '\ud83c\udd70\ufe0f',
  'ab': '\ud83c\udd8e',
  'abacus': '\ud83e\uddee',
  'abc': '\ud83d\udd24',
  'abcd': '\ud83d\udd21',
  'accept': '\ud83c\ude51',
  'adhesive_bandage': '\ud83e\ude79',
  'adult': '\ud83e\uddd1',
  'aerial_tramway': '\ud83d\udea1',
  'afghanistan': '\ud83c\udde6\ud83c\uddeb',
  'airplane': '\u2708\ufe0f',
  'aland_islands': '\ud83c\udde6\ud83c\uddfd',
  'alarm_clock': '\u23f0',
  'albania': '\ud83c\udde6\ud83c\uddf1',
  'alembic': '\u2697\ufe0f',
  'algeria': '\ud83c\udde9\ud83c\uddff',
  'alien': '\ud83d\udc7d',
  'ambulance': '\ud83d\ude91',
  'american_samoa': '\ud83c\udde6\ud83c\uddf8',
  'amphora': '\ud83c\udffa',
  'anchor': '\u2693',
  'andorra': '\ud83c\udde6\ud83c\udde9',
  'angel': '\ud83d\udc7c',
  'anger': '\ud83d\udca2',
  'angola': '\ud83c\udde6\ud83c\uddf4',
  'angry': '\ud83d\ude20',
  'anguilla': '\ud83c\udde6\ud83c\uddee',
  'anguished': '\ud83d\ude27',
  'ant': '\ud83d\udc1c',
  'antarctica': '\ud83c\udde6\ud83c\uddf6',
  'antigua_barbuda': '\ud83c\udde6\ud83c\uddec',
  'apple': '\ud83c\udf4e',
  'aquarius': '\u2652',
  'argentina': '\ud83c\udde6\ud83c\uddf7',
  'aries': '\u2648',
  'armenia': '\ud83c\udde6\ud83c\uddf2',
  'arrow_backward': '\u25c0\ufe0f',
  'arrow_double_down': '\u23ec',
  'arrow_double_up': '\u23eb',
  'arrow_down': '\u2b07\ufe0f',
  'arrow_down_small': '\ud83d\udd3d',
  'arrow_forward': '\u25b6\ufe0f',
  'arrow_heading_down': '\u2935\ufe0f',
  'arrow_heading_up': '\u2934\ufe0f',
  'arrow_left': '\u2b05\ufe0f',
  'arrow_lower_left': '\u2199\ufe0f',
  'arrow_lower_right': '\u2198\ufe0f',
  'arrow_right': '\u27a1\ufe0f',
  'arrow_right_hook': '\u21aa\ufe0f',
  'arrow_up': '\u2b06\ufe0f',
  'arrow_up_down': '\u2195\ufe0f',
  'arrow_up_small': '\ud83d\udd3c',
  'arrow_upper_left': '\u2196\ufe0f',
  'arrow_upper_right': '\u2197\ufe0f',
  'arrows_clockwise': '\ud83d\udd03',
  'arrows_counterclockwise': '\ud83d\udd04',
  'art': '\ud83c\udfa8',
  'articulated_lorry': '\ud83d\ude9b',
  'artificial_satellite': '\ud83d\udef0\ufe0f',
  'artist': '\ud83e\uddd1\u200d\ud83c\udfa8',
  'aruba': '\ud83c\udde6\ud83c\uddfc',
  'ascension_island': '\ud83c\udde6\ud83c\udde8',
  'asterisk': '*\ufe0f\u20e3',
  'astonished': '\ud83d\ude32',
  'astronaut': '\ud83e\uddd1\u200d\ud83d\ude80',
  'athletic_shoe': '\ud83d\udc5f',
  'atm': '\ud83c\udfe7',
  'atom_symbol': '\u269b\ufe0f',
  'australia': '\ud83c\udde6\ud83c\uddfa',
  'austria': '\ud83c\udde6\ud83c\uddf9',
  'auto_rickshaw': '\ud83d\udefa',
  'avocado': '\ud83e\udd51',
  'axe': '\ud83e\ude93',
  'azerbaijan': '\ud83c\udde6\ud83c\uddff',
  'b': '\ud83c\udd71\ufe0f',
  'baby': '\ud83d\udc76',
  'baby_bottle': '\ud83c\udf7c',
  'baby_chick': '\ud83d\udc24',
  'baby_symbol': '\ud83d\udebc',
  'back': '\ud83d\udd19',
  'bacon': '\ud83e\udd53',
  'badger': '\ud83e\udda1',
  'badminton': '\ud83c\udff8',
  'bagel': '\ud83e\udd6f',
  'baggage_claim': '\ud83d\udec4',
  'baguette_bread': '\ud83e\udd56',
  'bahamas': '\ud83c\udde7\ud83c\uddf8',
  'bahrain': '\ud83c\udde7\ud83c\udded',
  'balance_scale': '\u2696\ufe0f',
  'bald_man': '\ud83d\udc68\u200d\ud83e\uddb2',
  'bald_woman': '\ud83d\udc69\u200d\ud83e\uddb2',
  'ballet_shoes': '\ud83e\ude70',
  'balloon': '\ud83c\udf88',
  'ballot_box': '\ud83d\uddf3\ufe0f',
  'ballot_box_with_check': '\u2611\ufe0f',
  'bamboo': '\ud83c\udf8d',
  'banana': '\ud83c\udf4c',
  'bangbang': '\u203c\ufe0f',
  'bangladesh': '\ud83c\udde7\ud83c\udde9',
  'banjo': '\ud83e\ude95',
  'bank': '\ud83c\udfe6',
  'bar_chart': '\ud83d\udcca',
  'barbados': '\ud83c\udde7\ud83c\udde7',
  'barber': '\ud83d\udc88',
  'baseball': '\u26be',
  'basket': '\ud83e\uddfa',
  'basketball': '\ud83c\udfc0',
  'basketball_man': '\u26f9\ufe0f\u200d\u2642\ufe0f',
  'basketball_woman': '\u26f9\ufe0f\u200d\u2640\ufe0f',
  'bat': '\ud83e\udd87',
  'bath': '\ud83d\udec0',
  'bathtub': '\ud83d\udec1',
  'battery': '\ud83d\udd0b',
  'beach_umbrella': '\ud83c\udfd6\ufe0f',
  'bear': '\ud83d\udc3b',
  'bearded_person': '\ud83e\uddd4',
  'bed': '\ud83d\udecf\ufe0f',
  'bee': '\ud83d\udc1d',
  'beer': '\ud83c\udf7a',
  'beers': '\ud83c\udf7b',
  'beetle': '\ud83d\udc1e',
  'beginner': '\ud83d\udd30',
  'belarus': '\ud83c\udde7\ud83c\uddfe',
  'belgium': '\ud83c\udde7\ud83c\uddea',
  'belize': '\ud83c\udde7\ud83c\uddff',
  'bell': '\ud83d\udd14',
  'bellhop_bell': '\ud83d\udece\ufe0f',
  'benin': '\ud83c\udde7\ud83c\uddef',
  'bento': '\ud83c\udf71',
  'bermuda': '\ud83c\udde7\ud83c\uddf2',
  'beverage_box': '\ud83e\uddc3',
  'bhutan': '\ud83c\udde7\ud83c\uddf9',
  'bicyclist': '\ud83d\udeb4',
  'bike': '\ud83d\udeb2',
  'biking_man': '\ud83d\udeb4\u200d\u2642\ufe0f',
  'biking_woman': '\ud83d\udeb4\u200d\u2640\ufe0f',
  'bikini': '\ud83d\udc59',
  'billed_cap': '\ud83e\udde2',
  'biohazard': '\u2623\ufe0f',
  'bird': '\ud83d\udc26',
  'birthday': '\ud83c\udf82',
  'black_circle': '\u26ab',
  'black_flag': '\ud83c\udff4',
  'black_heart': '\ud83d\udda4',
  'black_joker': '\ud83c\udccf',
  'black_large_square': '\u2b1b',
  'black_medium_small_square': '\u25fe',
  'black_medium_square': '\u25fc\ufe0f',
  'black_nib': '\u2712\ufe0f',
  'black_small_square': '\u25aa\ufe0f',
  'black_square_button': '\ud83d\udd32',
  'blond_haired_man': '\ud83d\udc71\u200d\u2642\ufe0f',
  'blond_haired_person': '\ud83d\udc71',
  'blond_haired_woman': '\ud83d\udc71\u200d\u2640\ufe0f',
  'blonde_woman': '\ud83d\udc71\u200d\u2640\ufe0f',
  'blossom': '\ud83c\udf3c',
  'blowfish': '\ud83d\udc21',
  'blue_book': '\ud83d\udcd8',
  'blue_car': '\ud83d\ude99',
  'blue_heart': '\ud83d\udc99',
  'blue_square': '\ud83d\udfe6',
  'blush': '\ud83d\ude0a',
  'boar': '\ud83d\udc17',
  'boat': '\u26f5',
  'bolivia': '\ud83c\udde7\ud83c\uddf4',
  'bomb': '\ud83d\udca3',
  'bone': '\ud83e\uddb4',
  'book': '\ud83d\udcd6',
  'bookmark': '\ud83d\udd16',
  'bookmark_tabs': '\ud83d\udcd1',
  'books': '\ud83d\udcda',
  'boom': '\ud83d\udca5',
  'boot': '\ud83d\udc62',
  'bosnia_herzegovina': '\ud83c\udde7\ud83c\udde6',
  'botswana': '\ud83c\udde7\ud83c\uddfc',
  'bouncing_ball_man': '\u26f9\ufe0f\u200d\u2642\ufe0f',
  'bouncing_ball_person': '\u26f9\ufe0f',
  'bouncing_ball_woman': '\u26f9\ufe0f\u200d\u2640\ufe0f',
  'bouquet': '\ud83d\udc90',
  'bouvet_island': '\ud83c\udde7\ud83c\uddfb',
  'bow': '\ud83d\ude47',
  'bow_and_arrow': '\ud83c\udff9',
  'bowing_man': '\ud83d\ude47\u200d\u2642\ufe0f',
  'bowing_woman': '\ud83d\ude47\u200d\u2640\ufe0f',
  'bowl_with_spoon': '\ud83e\udd63',
  'bowling': '\ud83c\udfb3',
  'boxing_glove': '\ud83e\udd4a',
  'boy': '\ud83d\udc66',
  'brain': '\ud83e\udde0',
  'brazil': '\ud83c\udde7\ud83c\uddf7',
  'bread': '\ud83c\udf5e',
  'breast_feeding': '\ud83e\udd31',
  'bricks': '\ud83e\uddf1',
  'bride_with_veil': '\ud83d\udc70',
  'bridge_at_night': '\ud83c\udf09',
  'briefcase': '\ud83d\udcbc',
  'british_indian_ocean_territory': '\ud83c\uddee\ud83c\uddf4',
  'british_virgin_islands': '\ud83c\uddfb\ud83c\uddec',
  'broccoli': '\ud83e\udd66',
  'broken_heart': '\ud83d\udc94',
  'broom': '\ud83e\uddf9',
  'brown_circle': '\ud83d\udfe4',
  'brown_heart': '\ud83e\udd0e',
  'brown_square': '\ud83d\udfeb',
  'brunei': '\ud83c\udde7\ud83c\uddf3',
  'bug': '\ud83d\udc1b',
  'building_construction': '\ud83c\udfd7\ufe0f',
  'bulb': '\ud83d\udca1',
  'bulgaria': '\ud83c\udde7\ud83c\uddec',
  'bullettrain_front': '\ud83d\ude85',
  'bullettrain_side': '\ud83d\ude84',
  'burkina_faso': '\ud83c\udde7\ud83c\uddeb',
  'burrito': '\ud83c\udf2f',
  'burundi': '\ud83c\udde7\ud83c\uddee',
  'bus': '\ud83d\ude8c',
  'business_suit_levitating': '\ud83d\udd74\ufe0f',
  'busstop': '\ud83d\ude8f',
  'bust_in_silhouette': '\ud83d\udc64',
  'busts_in_silhouette': '\ud83d\udc65',
  'butter': '\ud83e\uddc8',
  'butterfly': '\ud83e\udd8b',
  'cactus': '\ud83c\udf35',
  'cake': '\ud83c\udf70',
  'calendar': '\ud83d\udcc6',
  'call_me_hand': '\ud83e\udd19',
  'calling': '\ud83d\udcf2',
  'cambodia': '\ud83c\uddf0\ud83c\udded',
  'camel': '\ud83d\udc2b',
  'camera': '\ud83d\udcf7',
  'camera_flash': '\ud83d\udcf8',
  'cameroon': '\ud83c\udde8\ud83c\uddf2',
  'camping': '\ud83c\udfd5\ufe0f',
  'canada': '\ud83c\udde8\ud83c\udde6',
  'canary_islands': '\ud83c\uddee\ud83c\udde8',
  'cancer': '\u264b',
  'candle': '\ud83d\udd6f\ufe0f',
  'candy': '\ud83c\udf6c',
  'canned_food': '\ud83e\udd6b',
  'canoe': '\ud83d\udef6',
  'cape_verde': '\ud83c\udde8\ud83c\uddfb',
  'capital_abcd': '\ud83d\udd20',
  'capricorn': '\u2651',
  'car': '\ud83d\ude97',
  'card_file_box': '\ud83d\uddc3\ufe0f',
  'card_index': '\ud83d\udcc7',
  'card_index_dividers': '\ud83d\uddc2\ufe0f',
  'caribbean_netherlands': '\ud83c\udde7\ud83c\uddf6',
  'carousel_horse': '\ud83c\udfa0',
  'carrot': '\ud83e\udd55',
  'cartwheeling': '\ud83e\udd38',
  'cat': '\ud83d\udc31',
  'cat2': '\ud83d\udc08',
  'cayman_islands': '\ud83c\uddf0\ud83c\uddfe',
  'cd': '\ud83d\udcbf',
  'central_african_republic': '\ud83c\udde8\ud83c\uddeb',
  'ceuta_melilla': '\ud83c\uddea\ud83c\udde6',
  'chad': '\ud83c\uddf9\ud83c\udde9',
  'chains': '\u26d3\ufe0f',
  'chair': '\ud83e\ude91',
  'champagne': '\ud83c\udf7e',
  'chart': '\ud83d\udcb9',
  'chart_with_downwards_trend': '\ud83d\udcc9',
  'chart_with_upwards_trend': '\ud83d\udcc8',
  'checkered_flag': '\ud83c\udfc1',
  'cheese': '\ud83e\uddc0',
  'cherries': '\ud83c\udf52',
  'cherry_blossom': '\ud83c\udf38',
  'chess_pawn': '\u265f\ufe0f',
  'chestnut': '\ud83c\udf30',
  'chicken': '\ud83d\udc14',
  'child': '\ud83e\uddd2',
  'children_crossing': '\ud83d\udeb8',
  'chile': '\ud83c\udde8\ud83c\uddf1',
  'chipmunk': '\ud83d\udc3f\ufe0f',
  'chocolate_bar': '\ud83c\udf6b',
  'chopsticks': '\ud83e\udd62',
  'christmas_island': '\ud83c\udde8\ud83c\uddfd',
  'christmas_tree': '\ud83c\udf84',
  'church': '\u26ea',
  'cinema': '\ud83c\udfa6',
  'circus_tent': '\ud83c\udfaa',
  'city_sunrise': '\ud83c\udf07',
  'city_sunset': '\ud83c\udf06',
  'cityscape': '\ud83c\udfd9\ufe0f',
  'cl': '\ud83c\udd91',
  'clamp': '\ud83d\udddc\ufe0f',
  'clap': '\ud83d\udc4f',
  'clapper': '\ud83c\udfac',
  'classical_building': '\ud83c\udfdb\ufe0f',
  'climbing': '\ud83e\uddd7',
  'climbing_man': '\ud83e\uddd7\u200d\u2642\ufe0f',
  'climbing_woman': '\ud83e\uddd7\u200d\u2640\ufe0f',
  'clinking_glasses': '\ud83e\udd42',
  'clipboard': '\ud83d\udccb',
  'clipperton_island': '\ud83c\udde8\ud83c\uddf5',
  'clock1': '\ud83d\udd50',
  'clock10': '\ud83d\udd59',
  'clock1030': '\ud83d\udd65',
  'clock11': '\ud83d\udd5a',
  'clock1130': '\ud83d\udd66',
  'clock12': '\ud83d\udd5b',
  'clock1230': '\ud83d\udd67',
  'clock130': '\ud83d\udd5c',
  'clock2': '\ud83d\udd51',
  'clock230': '\ud83d\udd5d',
  'clock3': '\ud83d\udd52',
  'clock330': '\ud83d\udd5e',
  'clock4': '\ud83d\udd53',
  'clock430': '\ud83d\udd5f',
  'clock5': '\ud83d\udd54',
  'clock530': '\ud83d\udd60',
  'clock6': '\ud83d\udd55',
  'clock630': '\ud83d\udd61',
  'clock7': '\ud83d\udd56',
  'clock730': '\ud83d\udd62',
  'clock8': '\ud83d\udd57',
  'clock830': '\ud83d\udd63',
  'clock9': '\ud83d\udd58',
  'clock930': '\ud83d\udd64',
  'closed_book': '\ud83d\udcd5',
  'closed_lock_with_key': '\ud83d\udd10',
  'closed_umbrella': '\ud83c\udf02',
  'cloud': '\u2601\ufe0f',
  'cloud_with_lightning': '\ud83c\udf29\ufe0f',
  'cloud_with_lightning_and_rain': '\u26c8\ufe0f',
  'cloud_with_rain': '\ud83c\udf27\ufe0f',
  'cloud_with_snow': '\ud83c\udf28\ufe0f',
  'clown_face': '\ud83e\udd21',
  'clubs': '\u2663\ufe0f',
  'cn': '\ud83c\udde8\ud83c\uddf3',
  'coat': '\ud83e\udde5',
  'cocktail': '\ud83c\udf78',
  'coconut': '\ud83e\udd65',
  'cocos_islands': '\ud83c\udde8\ud83c\udde8',
  'coffee': '\u2615',
  'coffin': '\u26b0\ufe0f',
  'cold_face': '\ud83e\udd76',
  'cold_sweat': '\ud83d\ude30',
  'collision': '\ud83d\udca5',
  'colombia': '\ud83c\udde8\ud83c\uddf4',
  'comet': '\u2604\ufe0f',
  'comoros': '\ud83c\uddf0\ud83c\uddf2',
  'compass': '\ud83e\udded',
  'computer': '\ud83d\udcbb',
  'computer_mouse': '\ud83d\uddb1\ufe0f',
  'confetti_ball': '\ud83c\udf8a',
  'confounded': '\ud83d\ude16',
  'confused': '\ud83d\ude15',
  'congo_brazzaville': '\ud83c\udde8\ud83c\uddec',
  'congo_kinshasa': '\ud83c\udde8\ud83c\udde9',
  'congratulations': '\u3297\ufe0f',
  'construction': '\ud83d\udea7',
  'construction_worker': '\ud83d\udc77',
  'construction_worker_man': '\ud83d\udc77\u200d\u2642\ufe0f',
  'construction_worker_woman': '\ud83d\udc77\u200d\u2640\ufe0f',
  'control_knobs': '\ud83c\udf9b\ufe0f',
  'convenience_store': '\ud83c\udfea',
  'cook': '\ud83e\uddd1\u200d\ud83c\udf73',
  'cook_islands': '\ud83c\udde8\ud83c\uddf0',
  'cookie': '\ud83c\udf6a',
  'cool': '\ud83c\udd92',
  'cop': '\ud83d\udc6e',
  'copyright': '\u00a9\ufe0f',
  'corn': '\ud83c\udf3d',
  'costa_rica': '\ud83c\udde8\ud83c\uddf7',
  'cote_divoire': '\ud83c\udde8\ud83c\uddee',
  'couch_and_lamp': '\ud83d\udecb\ufe0f',
  'couple': '\ud83d\udc6b',
  'couple_with_heart': '\ud83d\udc91',
  'couple_with_heart_man_man': '\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68',
  'couple_with_heart_woman_man': '\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc68',
  'couple_with_heart_woman_woman': '\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc69',
  'couplekiss': '\ud83d\udc8f',
  'couplekiss_man_man': '\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68',
  'couplekiss_man_woman': '\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68',
  'couplekiss_woman_woman': '\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69',
  'cow': '\ud83d\udc2e',
  'cow2': '\ud83d\udc04',
  'cowboy_hat_face': '\ud83e\udd20',
  'crab': '\ud83e\udd80',
  'crayon': '\ud83d\udd8d\ufe0f',
  'credit_card': '\ud83d\udcb3',
  'crescent_moon': '\ud83c\udf19',
  'cricket': '\ud83e\udd97',
  'cricket_game': '\ud83c\udfcf',
  'croatia': '\ud83c\udded\ud83c\uddf7',
  'crocodile': '\ud83d\udc0a',
  'croissant': '\ud83e\udd50',
  'crossed_fingers': '\ud83e\udd1e',
  'crossed_flags': '\ud83c\udf8c',
  'crossed_swords': '\u2694\ufe0f',
  'crown': '\ud83d\udc51',
  'cry': '\ud83d\ude22',
  'crying_cat_face': '\ud83d\ude3f',
  'crystal_ball': '\ud83d\udd2e',
  'cuba': '\ud83c\udde8\ud83c\uddfa',
  'cucumber': '\ud83e\udd52',
  'cup_with_straw': '\ud83e\udd64',
  'cupcake': '\ud83e\uddc1',
  'cupid': '\ud83d\udc98',
  'curacao': '\ud83c\udde8\ud83c\uddfc',
  'curling_stone': '\ud83e\udd4c',
  'curly_haired_man': '\ud83d\udc68\u200d\ud83e\uddb1',
  'curly_haired_woman': '\ud83d\udc69\u200d\ud83e\uddb1',
  'curly_loop': '\u27b0',
  'currency_exchange': '\ud83d\udcb1',
  'curry': '\ud83c\udf5b',
  'cursing_face': '\ud83e\udd2c',
  'custard': '\ud83c\udf6e',
  'customs': '\ud83d\udec3',
  'cut_of_meat': '\ud83e\udd69',
  'cyclone': '\ud83c\udf00',
  'cyprus': '\ud83c\udde8\ud83c\uddfe',
  'czech_republic': '\ud83c\udde8\ud83c\uddff',
  'dagger': '\ud83d\udde1\ufe0f',
  'dancer': '\ud83d\udc83',
  'dancers': '\ud83d\udc6f',
  'dancing_men': '\ud83d\udc6f\u200d\u2642\ufe0f',
  'dancing_women': '\ud83d\udc6f\u200d\u2640\ufe0f',
  'dango': '\ud83c\udf61',
  'dark_sunglasses': '\ud83d\udd76\ufe0f',
  'dart': '\ud83c\udfaf',
  'dash': '\ud83d\udca8',
  'date': '\ud83d\udcc5',
  'de': '\ud83c\udde9\ud83c\uddea',
  'deaf_man': '\ud83e\uddcf\u200d\u2642\ufe0f',
  'deaf_person': '\ud83e\uddcf',
  'deaf_woman': '\ud83e\uddcf\u200d\u2640\ufe0f',
  'deciduous_tree': '\ud83c\udf33',
  'deer': '\ud83e\udd8c',
  'denmark': '\ud83c\udde9\ud83c\uddf0',
  'department_store': '\ud83c\udfec',
  'derelict_house': '\ud83c\udfda\ufe0f',
  'desert': '\ud83c\udfdc\ufe0f',
  'desert_island': '\ud83c\udfdd\ufe0f',
  'desktop_computer': '\ud83d\udda5\ufe0f',
  'detective': '\ud83d\udd75\ufe0f',
  'diamond_shape_with_a_dot_inside': '\ud83d\udca0',
  'diamonds': '\u2666\ufe0f',
  'diego_garcia': '\ud83c\udde9\ud83c\uddec',
  'disappointed': '\ud83d\ude1e',
  'disappointed_relieved': '\ud83d\ude25',
  'diving_mask': '\ud83e\udd3f',
  'diya_lamp': '\ud83e\ude94',
  'dizzy': '\ud83d\udcab',
  'dizzy_face': '\ud83d\ude35',
  'djibouti': '\ud83c\udde9\ud83c\uddef',
  'dna': '\ud83e\uddec',
  'do_not_litter': '\ud83d\udeaf',
  'dog': '\ud83d\udc36',
  'dog2': '\ud83d\udc15',
  'dollar': '\ud83d\udcb5',
  'dolls': '\ud83c\udf8e',
  'dolphin': '\ud83d\udc2c',
  'dominica': '\ud83c\udde9\ud83c\uddf2',
  'dominican_republic': '\ud83c\udde9\ud83c\uddf4',
  'door': '\ud83d\udeaa',
  'doughnut': '\ud83c\udf69',
  'dove': '\ud83d\udd4a\ufe0f',
  'dragon': '\ud83d\udc09',
  'dragon_face': '\ud83d\udc32',
  'dress': '\ud83d\udc57',
  'dromedary_camel': '\ud83d\udc2a',
  'drooling_face': '\ud83e\udd24',
  'drop_of_blood': '\ud83e\ude78',
  'droplet': '\ud83d\udca7',
  'drum': '\ud83e\udd41',
  'duck': '\ud83e\udd86',
  'dumpling': '\ud83e\udd5f',
  'dvd': '\ud83d\udcc0',
  'e-mail': '\ud83d\udce7',
  'eagle': '\ud83e\udd85',
  'ear': '\ud83d\udc42',
  'ear_of_rice': '\ud83c\udf3e',
  'ear_with_hearing_aid': '\ud83e\uddbb',
  'earth_africa': '\ud83c\udf0d',
  'earth_americas': '\ud83c\udf0e',
  'earth_asia': '\ud83c\udf0f',
  'ecuador': '\ud83c\uddea\ud83c\udde8',
  'egg': '\ud83e\udd5a',
  'eggplant': '\ud83c\udf46',
  'egypt': '\ud83c\uddea\ud83c\uddec',
  'eight': '8\ufe0f\u20e3',
  'eight_pointed_black_star': '\u2734\ufe0f',
  'eight_spoked_asterisk': '\u2733\ufe0f',
  'eject_button': '\u23cf\ufe0f',
  'el_salvador': '\ud83c\uddf8\ud83c\uddfb',
  'electric_plug': '\ud83d\udd0c',
  'elephant': '\ud83d\udc18',
  'elf': '\ud83e\udddd',
  'elf_man': '\ud83e\udddd\u200d\u2642\ufe0f',
  'elf_woman': '\ud83e\udddd\u200d\u2640\ufe0f',
  'email': '\u2709\ufe0f',
  'end': '\ud83d\udd1a',
  'england': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f',
  'envelope': '\u2709\ufe0f',
  'envelope_with_arrow': '\ud83d\udce9',
  'equatorial_guinea': '\ud83c\uddec\ud83c\uddf6',
  'eritrea': '\ud83c\uddea\ud83c\uddf7',
  'es': '\ud83c\uddea\ud83c\uddf8',
  'estonia': '\ud83c\uddea\ud83c\uddea',
  'ethiopia': '\ud83c\uddea\ud83c\uddf9',
  'eu': '\ud83c\uddea\ud83c\uddfa',
  'euro': '\ud83d\udcb6',
  'european_castle': '\ud83c\udff0',
  'european_post_office': '\ud83c\udfe4',
  'european_union': '\ud83c\uddea\ud83c\uddfa',
  'evergreen_tree': '\ud83c\udf32',
  'exclamation': '\u2757',
  'exploding_head': '\ud83e\udd2f',
  'expressionless': '\ud83d\ude11',
  'eye': '\ud83d\udc41\ufe0f',
  'eye_speech_bubble': '\ud83d\udc41\ufe0f\u200d\ud83d\udde8\ufe0f',
  'eyeglasses': '\ud83d\udc53',
  'eyes': '\ud83d\udc40',
  'face_with_head_bandage': '\ud83e\udd15',
  'face_with_thermometer': '\ud83e\udd12',
  'facepalm': '\ud83e\udd26',
  'facepunch': '\ud83d\udc4a',
  'factory': '\ud83c\udfed',
  'factory_worker': '\ud83e\uddd1\u200d\ud83c\udfed',
  'fairy': '\ud83e\uddda',
  'fairy_man': '\ud83e\uddda\u200d\u2642\ufe0f',
  'fairy_woman': '\ud83e\uddda\u200d\u2640\ufe0f',
  'falafel': '\ud83e\uddc6',
  'falkland_islands': '\ud83c\uddeb\ud83c\uddf0',
  'fallen_leaf': '\ud83c\udf42',
  'family': '\ud83d\udc6a',
  'family_man_boy': '\ud83d\udc68\u200d\ud83d\udc66',
  'family_man_boy_boy': '\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66',
  'family_man_girl': '\ud83d\udc68\u200d\ud83d\udc67',
  'family_man_girl_boy': '\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66',
  'family_man_girl_girl': '\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67',
  'family_man_man_boy': '\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66',
  'family_man_man_boy_boy': '\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66',
  'family_man_man_girl': '\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67',
  'family_man_man_girl_boy': '\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66',
  'family_man_man_girl_girl': '\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67',
  'family_man_woman_boy': '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66',
  'family_man_woman_boy_boy': '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66',
  'family_man_woman_girl': '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67',
  'family_man_woman_girl_boy': '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',
  'family_man_woman_girl_girl': '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67',
  'family_woman_boy': '\ud83d\udc69\u200d\ud83d\udc66',
  'family_woman_boy_boy': '\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66',
  'family_woman_girl': '\ud83d\udc69\u200d\ud83d\udc67',
  'family_woman_girl_boy': '\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',
  'family_woman_girl_girl': '\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67',
  'family_woman_woman_boy': '\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66',
  'family_woman_woman_boy_boy': '\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66',
  'family_woman_woman_girl': '\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67',
  'family_woman_woman_girl_boy': '\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',
  'family_woman_woman_girl_girl': '\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67',
  'farmer': '\ud83e\uddd1\u200d\ud83c\udf3e',
  'faroe_islands': '\ud83c\uddeb\ud83c\uddf4',
  'fast_forward': '\u23e9',
  'fax': '\ud83d\udce0',
  'fearful': '\ud83d\ude28',
  'feet': '\ud83d\udc3e',
  'female_detective': '\ud83d\udd75\ufe0f\u200d\u2640\ufe0f',
  'female_sign': '\u2640\ufe0f',
  'ferris_wheel': '\ud83c\udfa1',
  'ferry': '\u26f4\ufe0f',
  'field_hockey': '\ud83c\udfd1',
  'fiji': '\ud83c\uddeb\ud83c\uddef',
  'file_cabinet': '\ud83d\uddc4\ufe0f',
  'file_folder': '\ud83d\udcc1',
  'film_projector': '\ud83d\udcfd\ufe0f',
  'film_strip': '\ud83c\udf9e\ufe0f',
  'finland': '\ud83c\uddeb\ud83c\uddee',
  'fire': '\ud83d\udd25',
  'fire_engine': '\ud83d\ude92',
  'fire_extinguisher': '\ud83e\uddef',
  'firecracker': '\ud83e\udde8',
  'firefighter': '\ud83e\uddd1\u200d\ud83d\ude92',
  'fireworks': '\ud83c\udf86',
  'first_quarter_moon': '\ud83c\udf13',
  'first_quarter_moon_with_face': '\ud83c\udf1b',
  'fish': '\ud83d\udc1f',
  'fish_cake': '\ud83c\udf65',
  'fishing_pole_and_fish': '\ud83c\udfa3',
  'fist': '\u270a',
  'fist_left': '\ud83e\udd1b',
  'fist_oncoming': '\ud83d\udc4a',
  'fist_raised': '\u270a',
  'fist_right': '\ud83e\udd1c',
  'five': '5\ufe0f\u20e3',
  'flags': '\ud83c\udf8f',
  'flamingo': '\ud83e\udda9',
  'flashlight': '\ud83d\udd26',
  'flat_shoe': '\ud83e\udd7f',
  'fleur_de_lis': '\u269c\ufe0f',
  'flight_arrival': '\ud83d\udeec',
  'flight_departure': '\ud83d\udeeb',
  'flipper': '\ud83d\udc2c',
  'floppy_disk': '\ud83d\udcbe',
  'flower_playing_cards': '\ud83c\udfb4',
  'flushed': '\ud83d\ude33',
  'flying_disc': '\ud83e\udd4f',
  'flying_saucer': '\ud83d\udef8',
  'fog': '\ud83c\udf2b\ufe0f',
  'foggy': '\ud83c\udf01',
  'foot': '\ud83e\uddb6',
  'football': '\ud83c\udfc8',
  'footprints': '\ud83d\udc63',
  'fork_and_knife': '\ud83c\udf74',
  'fortune_cookie': '\ud83e\udd60',
  'fountain': '\u26f2',
  'fountain_pen': '\ud83d\udd8b\ufe0f',
  'four': '4\ufe0f\u20e3',
  'four_leaf_clover': '\ud83c\udf40',
  'fox_face': '\ud83e\udd8a',
  'fr': '\ud83c\uddeb\ud83c\uddf7',
  'framed_picture': '\ud83d\uddbc\ufe0f',
  'free': '\ud83c\udd93',
  'french_guiana': '\ud83c\uddec\ud83c\uddeb',
  'french_polynesia': '\ud83c\uddf5\ud83c\uddeb',
  'french_southern_territories': '\ud83c\uddf9\ud83c\uddeb',
  'fried_egg': '\ud83c\udf73',
  'fried_shrimp': '\ud83c\udf64',
  'fries': '\ud83c\udf5f',
  'frog': '\ud83d\udc38',
  'frowning': '\ud83d\ude26',
  'frowning_face': '\u2639\ufe0f',
  'frowning_man': '\ud83d\ude4d\u200d\u2642\ufe0f',
  'frowning_person': '\ud83d\ude4d',
  'frowning_woman': '\ud83d\ude4d\u200d\u2640\ufe0f',
  'fu': '\ud83d\udd95',
  'fuelpump': '\u26fd',
  'full_moon': '\ud83c\udf15',
  'full_moon_with_face': '\ud83c\udf1d',
  'funeral_urn': '\u26b1\ufe0f',
  'gabon': '\ud83c\uddec\ud83c\udde6',
  'gambia': '\ud83c\uddec\ud83c\uddf2',
  'game_die': '\ud83c\udfb2',
  'garlic': '\ud83e\uddc4',
  'gb': '\ud83c\uddec\ud83c\udde7',
  'gear': '\u2699\ufe0f',
  'gem': '\ud83d\udc8e',
  'gemini': '\u264a',
  'genie': '\ud83e\uddde',
  'genie_man': '\ud83e\uddde\u200d\u2642\ufe0f',
  'genie_woman': '\ud83e\uddde\u200d\u2640\ufe0f',
  'georgia': '\ud83c\uddec\ud83c\uddea',
  'ghana': '\ud83c\uddec\ud83c\udded',
  'ghost': '\ud83d\udc7b',
  'gibraltar': '\ud83c\uddec\ud83c\uddee',
  'gift': '\ud83c\udf81',
  'gift_heart': '\ud83d\udc9d',
  'giraffe': '\ud83e\udd92',
  'girl': '\ud83d\udc67',
  'globe_with_meridians': '\ud83c\udf10',
  'gloves': '\ud83e\udde4',
  'goal_net': '\ud83e\udd45',
  'goat': '\ud83d\udc10',
  'goggles': '\ud83e\udd7d',
  'golf': '\u26f3',
  'golfing': '\ud83c\udfcc\ufe0f',
  'golfing_man': '\ud83c\udfcc\ufe0f\u200d\u2642\ufe0f',
  'golfing_woman': '\ud83c\udfcc\ufe0f\u200d\u2640\ufe0f',
  'gorilla': '\ud83e\udd8d',
  'grapes': '\ud83c\udf47',
  'greece': '\ud83c\uddec\ud83c\uddf7',
  'green_apple': '\ud83c\udf4f',
  'green_book': '\ud83d\udcd7',
  'green_circle': '\ud83d\udfe2',
  'green_heart': '\ud83d\udc9a',
  'green_salad': '\ud83e\udd57',
  'green_square': '\ud83d\udfe9',
  'greenland': '\ud83c\uddec\ud83c\uddf1',
  'grenada': '\ud83c\uddec\ud83c\udde9',
  'grey_exclamation': '\u2755',
  'grey_question': '\u2754',
  'grimacing': '\ud83d\ude2c',
  'grin': '\ud83d\ude01',
  'grinning': '\ud83d\ude00',
  'guadeloupe': '\ud83c\uddec\ud83c\uddf5',
  'guam': '\ud83c\uddec\ud83c\uddfa',
  'guard': '\ud83d\udc82',
  'guardsman': '\ud83d\udc82\u200d\u2642\ufe0f',
  'guardswoman': '\ud83d\udc82\u200d\u2640\ufe0f',
  'guatemala': '\ud83c\uddec\ud83c\uddf9',
  'guernsey': '\ud83c\uddec\ud83c\uddec',
  'guide_dog': '\ud83e\uddae',
  'guinea': '\ud83c\uddec\ud83c\uddf3',
  'guinea_bissau': '\ud83c\uddec\ud83c\uddfc',
  'guitar': '\ud83c\udfb8',
  'gun': '\ud83d\udd2b',
  'guyana': '\ud83c\uddec\ud83c\uddfe',
  'haircut': '\ud83d\udc87',
  'haircut_man': '\ud83d\udc87\u200d\u2642\ufe0f',
  'haircut_woman': '\ud83d\udc87\u200d\u2640\ufe0f',
  'haiti': '\ud83c\udded\ud83c\uddf9',
  'hamburger': '\ud83c\udf54',
  'hammer': '\ud83d\udd28',
  'hammer_and_pick': '\u2692\ufe0f',
  'hammer_and_wrench': '\ud83d\udee0\ufe0f',
  'hamster': '\ud83d\udc39',
  'hand': '\u270b',
  'hand_over_mouth': '\ud83e\udd2d',
  'handbag': '\ud83d\udc5c',
  'handball_person': '\ud83e\udd3e',
  'handshake': '\ud83e\udd1d',
  'hankey': '\ud83d\udca9',
  'hash': '#\ufe0f\u20e3',
  'hatched_chick': '\ud83d\udc25',
  'hatching_chick': '\ud83d\udc23',
  'headphones': '\ud83c\udfa7',
  'health_worker': '\ud83e\uddd1\u200d\u2695\ufe0f',
  'hear_no_evil': '\ud83d\ude49',
  'heard_mcdonald_islands': '\ud83c\udded\ud83c\uddf2',
  'heart': '\u2764\ufe0f',
  'heart_decoration': '\ud83d\udc9f',
  'heart_eyes': '\ud83d\ude0d',
  'heart_eyes_cat': '\ud83d\ude3b',
  'heartbeat': '\ud83d\udc93',
  'heartpulse': '\ud83d\udc97',
  'hearts': '\u2665\ufe0f',
  'heavy_check_mark': '\u2714\ufe0f',
  'heavy_division_sign': '\u2797',
  'heavy_dollar_sign': '\ud83d\udcb2',
  'heavy_exclamation_mark': '\u2757',
  'heavy_heart_exclamation': '\u2763\ufe0f',
  'heavy_minus_sign': '\u2796',
  'heavy_multiplication_x': '\u2716\ufe0f',
  'heavy_plus_sign': '\u2795',
  'hedgehog': '\ud83e\udd94',
  'helicopter': '\ud83d\ude81',
  'herb': '\ud83c\udf3f',
  'hibiscus': '\ud83c\udf3a',
  'high_brightness': '\ud83d\udd06',
  'high_heel': '\ud83d\udc60',
  'hiking_boot': '\ud83e\udd7e',
  'hindu_temple': '\ud83d\uded5',
  'hippopotamus': '\ud83e\udd9b',
  'hocho': '\ud83d\udd2a',
  'hole': '\ud83d\udd73\ufe0f',
  'honduras': '\ud83c\udded\ud83c\uddf3',
  'honey_pot': '\ud83c\udf6f',
  'honeybee': '\ud83d\udc1d',
  'hong_kong': '\ud83c\udded\ud83c\uddf0',
  'horse': '\ud83d\udc34',
  'horse_racing': '\ud83c\udfc7',
  'hospital': '\ud83c\udfe5',
  'hot_face': '\ud83e\udd75',
  'hot_pepper': '\ud83c\udf36\ufe0f',
  'hotdog': '\ud83c\udf2d',
  'hotel': '\ud83c\udfe8',
  'hotsprings': '\u2668\ufe0f',
  'hourglass': '\u231b',
  'hourglass_flowing_sand': '\u23f3',
  'house': '\ud83c\udfe0',
  'house_with_garden': '\ud83c\udfe1',
  'houses': '\ud83c\udfd8\ufe0f',
  'hugs': '\ud83e\udd17',
  'hungary': '\ud83c\udded\ud83c\uddfa',
  'hushed': '\ud83d\ude2f',
  'ice_cream': '\ud83c\udf68',
  'ice_cube': '\ud83e\uddca',
  'ice_hockey': '\ud83c\udfd2',
  'ice_skate': '\u26f8\ufe0f',
  'icecream': '\ud83c\udf66',
  'iceland': '\ud83c\uddee\ud83c\uddf8',
  'id': '\ud83c\udd94',
  'ideograph_advantage': '\ud83c\ude50',
  'imp': '\ud83d\udc7f',
  'inbox_tray': '\ud83d\udce5',
  'incoming_envelope': '\ud83d\udce8',
  'india': '\ud83c\uddee\ud83c\uddf3',
  'indonesia': '\ud83c\uddee\ud83c\udde9',
  'infinity': '\u267e\ufe0f',
  'information_desk_person': '\ud83d\udc81',
  'information_source': '\u2139\ufe0f',
  'innocent': '\ud83d\ude07',
  'interrobang': '\u2049\ufe0f',
  'iphone': '\ud83d\udcf1',
  'iran': '\ud83c\uddee\ud83c\uddf7',
  'iraq': '\ud83c\uddee\ud83c\uddf6',
  'ireland': '\ud83c\uddee\ud83c\uddea',
  'isle_of_man': '\ud83c\uddee\ud83c\uddf2',
  'israel': '\ud83c\uddee\ud83c\uddf1',
  'it': '\ud83c\uddee\ud83c\uddf9',
  'izakaya_lantern': '\ud83c\udfee',
  'jack_o_lantern': '\ud83c\udf83',
  'jamaica': '\ud83c\uddef\ud83c\uddf2',
  'japan': '\ud83d\uddfe',
  'japanese_castle': '\ud83c\udfef',
  'japanese_goblin': '\ud83d\udc7a',
  'japanese_ogre': '\ud83d\udc79',
  'jeans': '\ud83d\udc56',
  'jersey': '\ud83c\uddef\ud83c\uddea',
  'jigsaw': '\ud83e\udde9',
  'jordan': '\ud83c\uddef\ud83c\uddf4',
  'joy': '\ud83d\ude02',
  'joy_cat': '\ud83d\ude39',
  'joystick': '\ud83d\udd79\ufe0f',
  'jp': '\ud83c\uddef\ud83c\uddf5',
  'judge': '\ud83e\uddd1\u200d\u2696\ufe0f',
  'juggling_person': '\ud83e\udd39',
  'kaaba': '\ud83d\udd4b',
  'kangaroo': '\ud83e\udd98',
  'kazakhstan': '\ud83c\uddf0\ud83c\uddff',
  'kenya': '\ud83c\uddf0\ud83c\uddea',
  'key': '\ud83d\udd11',
  'keyboard': '\u2328\ufe0f',
  'keycap_ten': '\ud83d\udd1f',
  'kick_scooter': '\ud83d\udef4',
  'kimono': '\ud83d\udc58',
  'kiribati': '\ud83c\uddf0\ud83c\uddee',
  'kiss': '\ud83d\udc8b',
  'kissing': '\ud83d\ude17',
  'kissing_cat': '\ud83d\ude3d',
  'kissing_closed_eyes': '\ud83d\ude1a',
  'kissing_heart': '\ud83d\ude18',
  'kissing_smiling_eyes': '\ud83d\ude19',
  'kite': '\ud83e\ude81',
  'kiwi_fruit': '\ud83e\udd5d',
  'kneeling_man': '\ud83e\uddce\u200d\u2642\ufe0f',
  'kneeling_person': '\ud83e\uddce',
  'kneeling_woman': '\ud83e\uddce\u200d\u2640\ufe0f',
  'knife': '\ud83d\udd2a',
  'koala': '\ud83d\udc28',
  'koko': '\ud83c\ude01',
  'kosovo': '\ud83c\uddfd\ud83c\uddf0',
  'kr': '\ud83c\uddf0\ud83c\uddf7',
  'kuwait': '\ud83c\uddf0\ud83c\uddfc',
  'kyrgyzstan': '\ud83c\uddf0\ud83c\uddec',
  'lab_coat': '\ud83e\udd7c',
  'label': '\ud83c\udff7\ufe0f',
  'lacrosse': '\ud83e\udd4d',
  'lantern': '\ud83c\udfee',
  'laos': '\ud83c\uddf1\ud83c\udde6',
  'large_blue_circle': '\ud83d\udd35',
  'large_blue_diamond': '\ud83d\udd37',
  'large_orange_diamond': '\ud83d\udd36',
  'last_quarter_moon': '\ud83c\udf17',
  'last_quarter_moon_with_face': '\ud83c\udf1c',
  'latin_cross': '\u271d\ufe0f',
  'latvia': '\ud83c\uddf1\ud83c\uddfb',
  'laughing': '\ud83d\ude06',
  'leafy_green': '\ud83e\udd6c',
  'leaves': '\ud83c\udf43',
  'lebanon': '\ud83c\uddf1\ud83c\udde7',
  'ledger': '\ud83d\udcd2',
  'left_luggage': '\ud83d\udec5',
  'left_right_arrow': '\u2194\ufe0f',
  'left_speech_bubble': '\ud83d\udde8\ufe0f',
  'leftwards_arrow_with_hook': '\u21a9\ufe0f',
  'leg': '\ud83e\uddb5',
  'lemon': '\ud83c\udf4b',
  'leo': '\u264c',
  'leopard': '\ud83d\udc06',
  'lesotho': '\ud83c\uddf1\ud83c\uddf8',
  'level_slider': '\ud83c\udf9a\ufe0f',
  'liberia': '\ud83c\uddf1\ud83c\uddf7',
  'libra': '\u264e',
  'libya': '\ud83c\uddf1\ud83c\uddfe',
  'liechtenstein': '\ud83c\uddf1\ud83c\uddee',
  'light_rail': '\ud83d\ude88',
  'link': '\ud83d\udd17',
  'lion': '\ud83e\udd81',
  'lips': '\ud83d\udc44',
  'lipstick': '\ud83d\udc84',
  'lithuania': '\ud83c\uddf1\ud83c\uddf9',
  'lizard': '\ud83e\udd8e',
  'llama': '\ud83e\udd99',
  'lobster': '\ud83e\udd9e',
  'lock': '\ud83d\udd12',
  'lock_with_ink_pen': '\ud83d\udd0f',
  'lollipop': '\ud83c\udf6d',
  'loop': '\u27bf',
  'lotion_bottle': '\ud83e\uddf4',
  'lotus_position': '\ud83e\uddd8',
  'lotus_position_man': '\ud83e\uddd8\u200d\u2642\ufe0f',
  'lotus_position_woman': '\ud83e\uddd8\u200d\u2640\ufe0f',
  'loud_sound': '\ud83d\udd0a',
  'loudspeaker': '\ud83d\udce2',
  'love_hotel': '\ud83c\udfe9',
  'love_letter': '\ud83d\udc8c',
  'love_you_gesture': '\ud83e\udd1f',
  'low_brightness': '\ud83d\udd05',
  'luggage': '\ud83e\uddf3',
  'luxembourg': '\ud83c\uddf1\ud83c\uddfa',
  'lying_face': '\ud83e\udd25',
  'm': '\u24c2\ufe0f',
  'macau': '\ud83c\uddf2\ud83c\uddf4',
  'macedonia': '\ud83c\uddf2\ud83c\uddf0',
  'madagascar': '\ud83c\uddf2\ud83c\uddec',
  'mag': '\ud83d\udd0d',
  'mag_right': '\ud83d\udd0e',
  'mage': '\ud83e\uddd9',
  'mage_man': '\ud83e\uddd9\u200d\u2642\ufe0f',
  'mage_woman': '\ud83e\uddd9\u200d\u2640\ufe0f',
  'magnet': '\ud83e\uddf2',
  'mahjong': '\ud83c\udc04',
  'mailbox': '\ud83d\udceb',
  'mailbox_closed': '\ud83d\udcea',
  'mailbox_with_mail': '\ud83d\udcec',
  'mailbox_with_no_mail': '\ud83d\udced',
  'malawi': '\ud83c\uddf2\ud83c\uddfc',
  'malaysia': '\ud83c\uddf2\ud83c\uddfe',
  'maldives': '\ud83c\uddf2\ud83c\uddfb',
  'male_detective': '\ud83d\udd75\ufe0f\u200d\u2642\ufe0f',
  'male_sign': '\u2642\ufe0f',
  'mali': '\ud83c\uddf2\ud83c\uddf1',
  'malta': '\ud83c\uddf2\ud83c\uddf9',
  'man': '\ud83d\udc68',
  'man_artist': '\ud83d\udc68\u200d\ud83c\udfa8',
  'man_astronaut': '\ud83d\udc68\u200d\ud83d\ude80',
  'man_cartwheeling': '\ud83e\udd38\u200d\u2642\ufe0f',
  'man_cook': '\ud83d\udc68\u200d\ud83c\udf73',
  'man_dancing': '\ud83d\udd7a',
  'man_facepalming': '\ud83e\udd26\u200d\u2642\ufe0f',
  'man_factory_worker': '\ud83d\udc68\u200d\ud83c\udfed',
  'man_farmer': '\ud83d\udc68\u200d\ud83c\udf3e',
  'man_firefighter': '\ud83d\udc68\u200d\ud83d\ude92',
  'man_health_worker': '\ud83d\udc68\u200d\u2695\ufe0f',
  'man_in_manual_wheelchair': '\ud83d\udc68\u200d\ud83e\uddbd',
  'man_in_motorized_wheelchair': '\ud83d\udc68\u200d\ud83e\uddbc',
  'man_in_tuxedo': '\ud83e\udd35',
  'man_judge': '\ud83d\udc68\u200d\u2696\ufe0f',
  'man_juggling': '\ud83e\udd39\u200d\u2642\ufe0f',
  'man_mechanic': '\ud83d\udc68\u200d\ud83d\udd27',
  'man_office_worker': '\ud83d\udc68\u200d\ud83d\udcbc',
  'man_pilot': '\ud83d\udc68\u200d\u2708\ufe0f',
  'man_playing_handball': '\ud83e\udd3e\u200d\u2642\ufe0f',
  'man_playing_water_polo': '\ud83e\udd3d\u200d\u2642\ufe0f',
  'man_scientist': '\ud83d\udc68\u200d\ud83d\udd2c',
  'man_shrugging': '\ud83e\udd37\u200d\u2642\ufe0f',
  'man_singer': '\ud83d\udc68\u200d\ud83c\udfa4',
  'man_student': '\ud83d\udc68\u200d\ud83c\udf93',
  'man_teacher': '\ud83d\udc68\u200d\ud83c\udfeb',
  'man_technologist': '\ud83d\udc68\u200d\ud83d\udcbb',
  'man_with_gua_pi_mao': '\ud83d\udc72',
  'man_with_probing_cane': '\ud83d\udc68\u200d\ud83e\uddaf',
  'man_with_turban': '\ud83d\udc73\u200d\u2642\ufe0f',
  'mandarin': '\ud83c\udf4a',
  'mango': '\ud83e\udd6d',
  'mans_shoe': '\ud83d\udc5e',
  'mantelpiece_clock': '\ud83d\udd70\ufe0f',
  'manual_wheelchair': '\ud83e\uddbd',
  'maple_leaf': '\ud83c\udf41',
  'marshall_islands': '\ud83c\uddf2\ud83c\udded',
  'martial_arts_uniform': '\ud83e\udd4b',
  'martinique': '\ud83c\uddf2\ud83c\uddf6',
  'mask': '\ud83d\ude37',
  'massage': '\ud83d\udc86',
  'massage_man': '\ud83d\udc86\u200d\u2642\ufe0f',
  'massage_woman': '\ud83d\udc86\u200d\u2640\ufe0f',
  'mate': '\ud83e\uddc9',
  'mauritania': '\ud83c\uddf2\ud83c\uddf7',
  'mauritius': '\ud83c\uddf2\ud83c\uddfa',
  'mayotte': '\ud83c\uddfe\ud83c\uddf9',
  'meat_on_bone': '\ud83c\udf56',
  'mechanic': '\ud83e\uddd1\u200d\ud83d\udd27',
  'mechanical_arm': '\ud83e\uddbe',
  'mechanical_leg': '\ud83e\uddbf',
  'medal_military': '\ud83c\udf96\ufe0f',
  'medal_sports': '\ud83c\udfc5',
  'medical_symbol': '\u2695\ufe0f',
  'mega': '\ud83d\udce3',
  'melon': '\ud83c\udf48',
  'memo': '\ud83d\udcdd',
  'men_wrestling': '\ud83e\udd3c\u200d\u2642\ufe0f',
  'menorah': '\ud83d\udd4e',
  'mens': '\ud83d\udeb9',
  'mermaid': '\ud83e\udddc\u200d\u2640\ufe0f',
  'merman': '\ud83e\udddc\u200d\u2642\ufe0f',
  'merperson': '\ud83e\udddc',
  'metal': '\ud83e\udd18',
  'metro': '\ud83d\ude87',
  'mexico': '\ud83c\uddf2\ud83c\uddfd',
  'microbe': '\ud83e\udda0',
  'micronesia': '\ud83c\uddeb\ud83c\uddf2',
  'microphone': '\ud83c\udfa4',
  'microscope': '\ud83d\udd2c',
  'middle_finger': '\ud83d\udd95',
  'milk_glass': '\ud83e\udd5b',
  'milky_way': '\ud83c\udf0c',
  'minibus': '\ud83d\ude90',
  'minidisc': '\ud83d\udcbd',
  'mobile_phone_off': '\ud83d\udcf4',
  'moldova': '\ud83c\uddf2\ud83c\udde9',
  'monaco': '\ud83c\uddf2\ud83c\udde8',
  'money_mouth_face': '\ud83e\udd11',
  'money_with_wings': '\ud83d\udcb8',
  'moneybag': '\ud83d\udcb0',
  'mongolia': '\ud83c\uddf2\ud83c\uddf3',
  'monkey': '\ud83d\udc12',
  'monkey_face': '\ud83d\udc35',
  'monocle_face': '\ud83e\uddd0',
  'monorail': '\ud83d\ude9d',
  'montenegro': '\ud83c\uddf2\ud83c\uddea',
  'montserrat': '\ud83c\uddf2\ud83c\uddf8',
  'moon': '\ud83c\udf14',
  'moon_cake': '\ud83e\udd6e',
  'morocco': '\ud83c\uddf2\ud83c\udde6',
  'mortar_board': '\ud83c\udf93',
  'mosque': '\ud83d\udd4c',
  'mosquito': '\ud83e\udd9f',
  'motor_boat': '\ud83d\udee5\ufe0f',
  'motor_scooter': '\ud83d\udef5',
  'motorcycle': '\ud83c\udfcd\ufe0f',
  'motorized_wheelchair': '\ud83e\uddbc',
  'motorway': '\ud83d\udee3\ufe0f',
  'mount_fuji': '\ud83d\uddfb',
  'mountain': '\u26f0\ufe0f',
  'mountain_bicyclist': '\ud83d\udeb5',
  'mountain_biking_man': '\ud83d\udeb5\u200d\u2642\ufe0f',
  'mountain_biking_woman': '\ud83d\udeb5\u200d\u2640\ufe0f',
  'mountain_cableway': '\ud83d\udea0',
  'mountain_railway': '\ud83d\ude9e',
  'mountain_snow': '\ud83c\udfd4\ufe0f',
  'mouse': '\ud83d\udc2d',
  'mouse2': '\ud83d\udc01',
  'movie_camera': '\ud83c\udfa5',
  'moyai': '\ud83d\uddff',
  'mozambique': '\ud83c\uddf2\ud83c\uddff',
  'mrs_claus': '\ud83e\udd36',
  'muscle': '\ud83d\udcaa',
  'mushroom': '\ud83c\udf44',
  'musical_keyboard': '\ud83c\udfb9',
  'musical_note': '\ud83c\udfb5',
  'musical_score': '\ud83c\udfbc',
  'mute': '\ud83d\udd07',
  'myanmar': '\ud83c\uddf2\ud83c\uddf2',
  'nail_care': '\ud83d\udc85',
  'name_badge': '\ud83d\udcdb',
  'namibia': '\ud83c\uddf3\ud83c\udde6',
  'national_park': '\ud83c\udfde\ufe0f',
  'nauru': '\ud83c\uddf3\ud83c\uddf7',
  'nauseated_face': '\ud83e\udd22',
  'nazar_amulet': '\ud83e\uddff',
  'necktie': '\ud83d\udc54',
  'negative_squared_cross_mark': '\u274e',
  'nepal': '\ud83c\uddf3\ud83c\uddf5',
  'nerd_face': '\ud83e\udd13',
  'netherlands': '\ud83c\uddf3\ud83c\uddf1',
  'neutral_face': '\ud83d\ude10',
  'new': '\ud83c\udd95',
  'new_caledonia': '\ud83c\uddf3\ud83c\udde8',
  'new_moon': '\ud83c\udf11',
  'new_moon_with_face': '\ud83c\udf1a',
  'new_zealand': '\ud83c\uddf3\ud83c\uddff',
  'newspaper': '\ud83d\udcf0',
  'newspaper_roll': '\ud83d\uddde\ufe0f',
  'next_track_button': '\u23ed\ufe0f',
  'ng': '\ud83c\udd96',
  'ng_man': '\ud83d\ude45\u200d\u2642\ufe0f',
  'ng_woman': '\ud83d\ude45\u200d\u2640\ufe0f',
  'nicaragua': '\ud83c\uddf3\ud83c\uddee',
  'niger': '\ud83c\uddf3\ud83c\uddea',
  'nigeria': '\ud83c\uddf3\ud83c\uddec',
  'night_with_stars': '\ud83c\udf03',
  'nine': '9\ufe0f\u20e3',
  'niue': '\ud83c\uddf3\ud83c\uddfa',
  'no_bell': '\ud83d\udd15',
  'no_bicycles': '\ud83d\udeb3',
  'no_entry': '\u26d4',
  'no_entry_sign': '\ud83d\udeab',
  'no_good': '\ud83d\ude45',
  'no_good_man': '\ud83d\ude45\u200d\u2642\ufe0f',
  'no_good_woman': '\ud83d\ude45\u200d\u2640\ufe0f',
  'no_mobile_phones': '\ud83d\udcf5',
  'no_mouth': '\ud83d\ude36',
  'no_pedestrians': '\ud83d\udeb7',
  'no_smoking': '\ud83d\udead',
  'non-potable_water': '\ud83d\udeb1',
  'norfolk_island': '\ud83c\uddf3\ud83c\uddeb',
  'north_korea': '\ud83c\uddf0\ud83c\uddf5',
  'northern_mariana_islands': '\ud83c\uddf2\ud83c\uddf5',
  'norway': '\ud83c\uddf3\ud83c\uddf4',
  'nose': '\ud83d\udc43',
  'notebook': '\ud83d\udcd3',
  'notebook_with_decorative_cover': '\ud83d\udcd4',
  'notes': '\ud83c\udfb6',
  'nut_and_bolt': '\ud83d\udd29',
  'o': '\u2b55',
  'o2': '\ud83c\udd7e\ufe0f',
  'ocean': '\ud83c\udf0a',
  'octopus': '\ud83d\udc19',
  'oden': '\ud83c\udf62',
  'office': '\ud83c\udfe2',
  'office_worker': '\ud83e\uddd1\u200d\ud83d\udcbc',
  'oil_drum': '\ud83d\udee2\ufe0f',
  'ok': '\ud83c\udd97',
  'ok_hand': '\ud83d\udc4c',
  'ok_man': '\ud83d\ude46\u200d\u2642\ufe0f',
  'ok_person': '\ud83d\ude46',
  'ok_woman': '\ud83d\ude46\u200d\u2640\ufe0f',
  'old_key': '\ud83d\udddd\ufe0f',
  'older_adult': '\ud83e\uddd3',
  'older_man': '\ud83d\udc74',
  'older_woman': '\ud83d\udc75',
  'om': '\ud83d\udd49\ufe0f',
  'oman': '\ud83c\uddf4\ud83c\uddf2',
  'on': '\ud83d\udd1b',
  'oncoming_automobile': '\ud83d\ude98',
  'oncoming_bus': '\ud83d\ude8d',
  'oncoming_police_car': '\ud83d\ude94',
  'oncoming_taxi': '\ud83d\ude96',
  'one': '1\ufe0f\u20e3',
  'one_piece_swimsuit': '\ud83e\ude71',
  'onion': '\ud83e\uddc5',
  'open_book': '\ud83d\udcd6',
  'open_file_folder': '\ud83d\udcc2',
  'open_hands': '\ud83d\udc50',
  'open_mouth': '\ud83d\ude2e',
  'open_umbrella': '\u2602\ufe0f',
  'ophiuchus': '\u26ce',
  'orange': '\ud83c\udf4a',
  'orange_book': '\ud83d\udcd9',
  'orange_circle': '\ud83d\udfe0',
  'orange_heart': '\ud83e\udde1',
  'orange_square': '\ud83d\udfe7',
  'orangutan': '\ud83e\udda7',
  'orthodox_cross': '\u2626\ufe0f',
  'otter': '\ud83e\udda6',
  'outbox_tray': '\ud83d\udce4',
  'owl': '\ud83e\udd89',
  'ox': '\ud83d\udc02',
  'oyster': '\ud83e\uddaa',
  'package': '\ud83d\udce6',
  'page_facing_up': '\ud83d\udcc4',
  'page_with_curl': '\ud83d\udcc3',
  'pager': '\ud83d\udcdf',
  'paintbrush': '\ud83d\udd8c\ufe0f',
  'pakistan': '\ud83c\uddf5\ud83c\uddf0',
  'palau': '\ud83c\uddf5\ud83c\uddfc',
  'palestinian_territories': '\ud83c\uddf5\ud83c\uddf8',
  'palm_tree': '\ud83c\udf34',
  'palms_up_together': '\ud83e\udd32',
  'panama': '\ud83c\uddf5\ud83c\udde6',
  'pancakes': '\ud83e\udd5e',
  'panda_face': '\ud83d\udc3c',
  'paperclip': '\ud83d\udcce',
  'paperclips': '\ud83d\udd87\ufe0f',
  'papua_new_guinea': '\ud83c\uddf5\ud83c\uddec',
  'parachute': '\ud83e\ude82',
  'paraguay': '\ud83c\uddf5\ud83c\uddfe',
  'parasol_on_ground': '\u26f1\ufe0f',
  'parking': '\ud83c\udd7f\ufe0f',
  'parrot': '\ud83e\udd9c',
  'part_alternation_mark': '\u303d\ufe0f',
  'partly_sunny': '\u26c5',
  'partying_face': '\ud83e\udd73',
  'passenger_ship': '\ud83d\udef3\ufe0f',
  'passport_control': '\ud83d\udec2',
  'pause_button': '\u23f8\ufe0f',
  'paw_prints': '\ud83d\udc3e',
  'peace_symbol': '\u262e\ufe0f',
  'peach': '\ud83c\udf51',
  'peacock': '\ud83e\udd9a',
  'peanuts': '\ud83e\udd5c',
  'pear': '\ud83c\udf50',
  'pen': '\ud83d\udd8a\ufe0f',
  'pencil': '\ud83d\udcdd',
  'pencil2': '\u270f\ufe0f',
  'penguin': '\ud83d\udc27',
  'pensive': '\ud83d\ude14',
  'people_holding_hands': '\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1',
  'performing_arts': '\ud83c\udfad',
  'persevere': '\ud83d\ude23',
  'person_bald': '\ud83e\uddd1\u200d\ud83e\uddb2',
  'person_curly_hair': '\ud83e\uddd1\u200d\ud83e\uddb1',
  'person_fencing': '\ud83e\udd3a',
  'person_in_manual_wheelchair': '\ud83e\uddd1\u200d\ud83e\uddbd',
  'person_in_motorized_wheelchair': '\ud83e\uddd1\u200d\ud83e\uddbc',
  'person_red_hair': '\ud83e\uddd1\u200d\ud83e\uddb0',
  'person_white_hair': '\ud83e\uddd1\u200d\ud83e\uddb3',
  'person_with_probing_cane': '\ud83e\uddd1\u200d\ud83e\uddaf',
  'person_with_turban': '\ud83d\udc73',
  'peru': '\ud83c\uddf5\ud83c\uddea',
  'petri_dish': '\ud83e\uddeb',
  'philippines': '\ud83c\uddf5\ud83c\udded',
  'phone': '\u260e\ufe0f',
  'pick': '\u26cf\ufe0f',
  'pie': '\ud83e\udd67',
  'pig': '\ud83d\udc37',
  'pig2': '\ud83d\udc16',
  'pig_nose': '\ud83d\udc3d',
  'pill': '\ud83d\udc8a',
  'pilot': '\ud83e\uddd1\u200d\u2708\ufe0f',
  'pinching_hand': '\ud83e\udd0f',
  'pineapple': '\ud83c\udf4d',
  'ping_pong': '\ud83c\udfd3',
  'pirate_flag': '\ud83c\udff4\u200d\u2620\ufe0f',
  'pisces': '\u2653',
  'pitcairn_islands': '\ud83c\uddf5\ud83c\uddf3',
  'pizza': '\ud83c\udf55',
  'place_of_worship': '\ud83d\uded0',
  'plate_with_cutlery': '\ud83c\udf7d\ufe0f',
  'play_or_pause_button': '\u23ef\ufe0f',
  'pleading_face': '\ud83e\udd7a',
  'point_down': '\ud83d\udc47',
  'point_left': '\ud83d\udc48',
  'point_right': '\ud83d\udc49',
  'point_up': '\u261d\ufe0f',
  'point_up_2': '\ud83d\udc46',
  'poland': '\ud83c\uddf5\ud83c\uddf1',
  'police_car': '\ud83d\ude93',
  'police_officer': '\ud83d\udc6e',
  'policeman': '\ud83d\udc6e\u200d\u2642\ufe0f',
  'policewoman': '\ud83d\udc6e\u200d\u2640\ufe0f',
  'poodle': '\ud83d\udc29',
  'poop': '\ud83d\udca9',
  'popcorn': '\ud83c\udf7f',
  'portugal': '\ud83c\uddf5\ud83c\uddf9',
  'post_office': '\ud83c\udfe3',
  'postal_horn': '\ud83d\udcef',
  'postbox': '\ud83d\udcee',
  'potable_water': '\ud83d\udeb0',
  'potato': '\ud83e\udd54',
  'pouch': '\ud83d\udc5d',
  'poultry_leg': '\ud83c\udf57',
  'pound': '\ud83d\udcb7',
  'pout': '\ud83d\ude21',
  'pouting_cat': '\ud83d\ude3e',
  'pouting_face': '\ud83d\ude4e',
  'pouting_man': '\ud83d\ude4e\u200d\u2642\ufe0f',
  'pouting_woman': '\ud83d\ude4e\u200d\u2640\ufe0f',
  'pray': '\ud83d\ude4f',
  'prayer_beads': '\ud83d\udcff',
  'pregnant_woman': '\ud83e\udd30',
  'pretzel': '\ud83e\udd68',
  'previous_track_button': '\u23ee\ufe0f',
  'prince': '\ud83e\udd34',
  'princess': '\ud83d\udc78',
  'printer': '\ud83d\udda8\ufe0f',
  'probing_cane': '\ud83e\uddaf',
  'puerto_rico': '\ud83c\uddf5\ud83c\uddf7',
  'punch': '\ud83d\udc4a',
  'purple_circle': '\ud83d\udfe3',
  'purple_heart': '\ud83d\udc9c',
  'purple_square': '\ud83d\udfea',
  'purse': '\ud83d\udc5b',
  'pushpin': '\ud83d\udccc',
  'put_litter_in_its_place': '\ud83d\udeae',
  'qatar': '\ud83c\uddf6\ud83c\udde6',
  'question': '\u2753',
  'rabbit': '\ud83d\udc30',
  'rabbit2': '\ud83d\udc07',
  'raccoon': '\ud83e\udd9d',
  'racehorse': '\ud83d\udc0e',
  'racing_car': '\ud83c\udfce\ufe0f',
  'radio': '\ud83d\udcfb',
  'radio_button': '\ud83d\udd18',
  'radioactive': '\u2622\ufe0f',
  'rage': '\ud83d\ude21',
  'railway_car': '\ud83d\ude83',
  'railway_track': '\ud83d\udee4\ufe0f',
  'rainbow': '\ud83c\udf08',
  'rainbow_flag': '\ud83c\udff3\ufe0f\u200d\ud83c\udf08',
  'raised_back_of_hand': '\ud83e\udd1a',
  'raised_eyebrow': '\ud83e\udd28',
  'raised_hand': '\u270b',
  'raised_hand_with_fingers_splayed': '\ud83d\udd90\ufe0f',
  'raised_hands': '\ud83d\ude4c',
  'raising_hand': '\ud83d\ude4b',
  'raising_hand_man': '\ud83d\ude4b\u200d\u2642\ufe0f',
  'raising_hand_woman': '\ud83d\ude4b\u200d\u2640\ufe0f',
  'ram': '\ud83d\udc0f',
  'ramen': '\ud83c\udf5c',
  'rat': '\ud83d\udc00',
  'razor': '\ud83e\ude92',
  'receipt': '\ud83e\uddfe',
  'record_button': '\u23fa\ufe0f',
  'recycle': '\u267b\ufe0f',
  'red_car': '\ud83d\ude97',
  'red_circle': '\ud83d\udd34',
  'red_envelope': '\ud83e\udde7',
  'red_haired_man': '\ud83d\udc68\u200d\ud83e\uddb0',
  'red_haired_woman': '\ud83d\udc69\u200d\ud83e\uddb0',
  'red_square': '\ud83d\udfe5',
  'registered': '\u00ae\ufe0f',
  'relaxed': '\u263a\ufe0f',
  'relieved': '\ud83d\ude0c',
  'reminder_ribbon': '\ud83c\udf97\ufe0f',
  'repeat': '\ud83d\udd01',
  'repeat_one': '\ud83d\udd02',
  'rescue_worker_helmet': '\u26d1\ufe0f',
  'restroom': '\ud83d\udebb',
  'reunion': '\ud83c\uddf7\ud83c\uddea',
  'revolving_hearts': '\ud83d\udc9e',
  'rewind': '\u23ea',
  'rhinoceros': '\ud83e\udd8f',
  'ribbon': '\ud83c\udf80',
  'rice': '\ud83c\udf5a',
  'rice_ball': '\ud83c\udf59',
  'rice_cracker': '\ud83c\udf58',
  'rice_scene': '\ud83c\udf91',
  'right_anger_bubble': '\ud83d\uddef\ufe0f',
  'ring': '\ud83d\udc8d',
  'ringed_planet': '\ud83e\ude90',
  'robot': '\ud83e\udd16',
  'rocket': '\ud83d\ude80',
  'rofl': '\ud83e\udd23',
  'roll_eyes': '\ud83d\ude44',
  'roll_of_paper': '\ud83e\uddfb',
  'roller_coaster': '\ud83c\udfa2',
  'romania': '\ud83c\uddf7\ud83c\uddf4',
  'rooster': '\ud83d\udc13',
  'rose': '\ud83c\udf39',
  'rosette': '\ud83c\udff5\ufe0f',
  'rotating_light': '\ud83d\udea8',
  'round_pushpin': '\ud83d\udccd',
  'rowboat': '\ud83d\udea3',
  'rowing_man': '\ud83d\udea3\u200d\u2642\ufe0f',
  'rowing_woman': '\ud83d\udea3\u200d\u2640\ufe0f',
  'ru': '\ud83c\uddf7\ud83c\uddfa',
  'rugby_football': '\ud83c\udfc9',
  'runner': '\ud83c\udfc3',
  'running': '\ud83c\udfc3',
  'running_man': '\ud83c\udfc3\u200d\u2642\ufe0f',
  'running_shirt_with_sash': '\ud83c\udfbd',
  'running_woman': '\ud83c\udfc3\u200d\u2640\ufe0f',
  'rwanda': '\ud83c\uddf7\ud83c\uddfc',
  'sa': '\ud83c\ude02\ufe0f',
  'safety_pin': '\ud83e\uddf7',
  'safety_vest': '\ud83e\uddba',
  'sagittarius': '\u2650',
  'sailboat': '\u26f5',
  'sake': '\ud83c\udf76',
  'salt': '\ud83e\uddc2',
  'samoa': '\ud83c\uddfc\ud83c\uddf8',
  'san_marino': '\ud83c\uddf8\ud83c\uddf2',
  'sandal': '\ud83d\udc61',
  'sandwich': '\ud83e\udd6a',
  'santa': '\ud83c\udf85',
  'sao_tome_principe': '\ud83c\uddf8\ud83c\uddf9',
  'sari': '\ud83e\udd7b',
  'sassy_man': '\ud83d\udc81\u200d\u2642\ufe0f',
  'sassy_woman': '\ud83d\udc81\u200d\u2640\ufe0f',
  'satellite': '\ud83d\udce1',
  'satisfied': '\ud83d\ude06',
  'saudi_arabia': '\ud83c\uddf8\ud83c\udde6',
  'sauna_man': '\ud83e\uddd6\u200d\u2642\ufe0f',
  'sauna_person': '\ud83e\uddd6',
  'sauna_woman': '\ud83e\uddd6\u200d\u2640\ufe0f',
  'sauropod': '\ud83e\udd95',
  'saxophone': '\ud83c\udfb7',
  'scarf': '\ud83e\udde3',
  'school': '\ud83c\udfeb',
  'school_satchel': '\ud83c\udf92',
  'scientist': '\ud83e\uddd1\u200d\ud83d\udd2c',
  'scissors': '\u2702\ufe0f',
  'scorpion': '\ud83e\udd82',
  'scorpius': '\u264f',
  'scotland': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f',
  'scream': '\ud83d\ude31',
  'scream_cat': '\ud83d\ude40',
  'scroll': '\ud83d\udcdc',
  'seat': '\ud83d\udcba',
  'secret': '\u3299\ufe0f',
  'see_no_evil': '\ud83d\ude48',
  'seedling': '\ud83c\udf31',
  'selfie': '\ud83e\udd33',
  'senegal': '\ud83c\uddf8\ud83c\uddf3',
  'serbia': '\ud83c\uddf7\ud83c\uddf8',
  'service_dog': '\ud83d\udc15\u200d\ud83e\uddba',
  'seven': '7\ufe0f\u20e3',
  'seychelles': '\ud83c\uddf8\ud83c\udde8',
  'shallow_pan_of_food': '\ud83e\udd58',
  'shamrock': '\u2618\ufe0f',
  'shark': '\ud83e\udd88',
  'shaved_ice': '\ud83c\udf67',
  'sheep': '\ud83d\udc11',
  'shell': '\ud83d\udc1a',
  'shield': '\ud83d\udee1\ufe0f',
  'shinto_shrine': '\u26e9\ufe0f',
  'ship': '\ud83d\udea2',
  'shirt': '\ud83d\udc55',
  'shit': '\ud83d\udca9',
  'shoe': '\ud83d\udc5e',
  'shopping': '\ud83d\udecd\ufe0f',
  'shopping_cart': '\ud83d\uded2',
  'shorts': '\ud83e\ude73',
  'shower': '\ud83d\udebf',
  'shrimp': '\ud83e\udd90',
  'shrug': '\ud83e\udd37',
  'shushing_face': '\ud83e\udd2b',
  'sierra_leone': '\ud83c\uddf8\ud83c\uddf1',
  'signal_strength': '\ud83d\udcf6',
  'singapore': '\ud83c\uddf8\ud83c\uddec',
  'singer': '\ud83e\uddd1\u200d\ud83c\udfa4',
  'sint_maarten': '\ud83c\uddf8\ud83c\uddfd',
  'six': '6\ufe0f\u20e3',
  'six_pointed_star': '\ud83d\udd2f',
  'skateboard': '\ud83d\udef9',
  'ski': '\ud83c\udfbf',
  'skier': '\u26f7\ufe0f',
  'skull': '\ud83d\udc80',
  'skull_and_crossbones': '\u2620\ufe0f',
  'skunk': '\ud83e\udda8',
  'sled': '\ud83d\udef7',
  'sleeping': '\ud83d\ude34',
  'sleeping_bed': '\ud83d\udecc',
  'sleepy': '\ud83d\ude2a',
  'slightly_frowning_face': '\ud83d\ude41',
  'slightly_smiling_face': '\ud83d\ude42',
  'slot_machine': '\ud83c\udfb0',
  'sloth': '\ud83e\udda5',
  'slovakia': '\ud83c\uddf8\ud83c\uddf0',
  'slovenia': '\ud83c\uddf8\ud83c\uddee',
  'small_airplane': '\ud83d\udee9\ufe0f',
  'small_blue_diamond': '\ud83d\udd39',
  'small_orange_diamond': '\ud83d\udd38',
  'small_red_triangle': '\ud83d\udd3a',
  'small_red_triangle_down': '\ud83d\udd3b',
  'smile': '\ud83d\ude04',
  'smile_cat': '\ud83d\ude38',
  'smiley': '\ud83d\ude03',
  'smiley_cat': '\ud83d\ude3a',
  'smiling_face_with_three_hearts': '\ud83e\udd70',
  'smiling_imp': '\ud83d\ude08',
  'smirk': '\ud83d\ude0f',
  'smirk_cat': '\ud83d\ude3c',
  'smoking': '\ud83d\udeac',
  'snail': '\ud83d\udc0c',
  'snake': '\ud83d\udc0d',
  'sneezing_face': '\ud83e\udd27',
  'snowboarder': '\ud83c\udfc2',
  'snowflake': '\u2744\ufe0f',
  'snowman': '\u26c4',
  'snowman_with_snow': '\u2603\ufe0f',
  'soap': '\ud83e\uddfc',
  'sob': '\ud83d\ude2d',
  'soccer': '\u26bd',
  'socks': '\ud83e\udde6',
  'softball': '\ud83e\udd4e',
  'solomon_islands': '\ud83c\uddf8\ud83c\udde7',
  'somalia': '\ud83c\uddf8\ud83c\uddf4',
  'soon': '\ud83d\udd1c',
  'sos': '\ud83c\udd98',
  'sound': '\ud83d\udd09',
  'south_africa': '\ud83c\uddff\ud83c\udde6',
  'south_georgia_south_sandwich_islands': '\ud83c\uddec\ud83c\uddf8',
  'south_sudan': '\ud83c\uddf8\ud83c\uddf8',
  'space_invader': '\ud83d\udc7e',
  'spades': '\u2660\ufe0f',
  'spaghetti': '\ud83c\udf5d',
  'sparkle': '\u2747\ufe0f',
  'sparkler': '\ud83c\udf87',
  'sparkles': '\u2728',
  'sparkling_heart': '\ud83d\udc96',
  'speak_no_evil': '\ud83d\ude4a',
  'speaker': '\ud83d\udd08',
  'speaking_head': '\ud83d\udde3\ufe0f',
  'speech_balloon': '\ud83d\udcac',
  'speedboat': '\ud83d\udea4',
  'spider': '\ud83d\udd77\ufe0f',
  'spider_web': '\ud83d\udd78\ufe0f',
  'spiral_calendar': '\ud83d\uddd3\ufe0f',
  'spiral_notepad': '\ud83d\uddd2\ufe0f',
  'sponge': '\ud83e\uddfd',
  'spoon': '\ud83e\udd44',
  'squid': '\ud83e\udd91',
  'sri_lanka': '\ud83c\uddf1\ud83c\uddf0',
  'st_barthelemy': '\ud83c\udde7\ud83c\uddf1',
  'st_helena': '\ud83c\uddf8\ud83c\udded',
  'st_kitts_nevis': '\ud83c\uddf0\ud83c\uddf3',
  'st_lucia': '\ud83c\uddf1\ud83c\udde8',
  'st_martin': '\ud83c\uddf2\ud83c\uddeb',
  'st_pierre_miquelon': '\ud83c\uddf5\ud83c\uddf2',
  'st_vincent_grenadines': '\ud83c\uddfb\ud83c\udde8',
  'stadium': '\ud83c\udfdf\ufe0f',
  'standing_man': '\ud83e\uddcd\u200d\u2642\ufe0f',
  'standing_person': '\ud83e\uddcd',
  'standing_woman': '\ud83e\uddcd\u200d\u2640\ufe0f',
  'star': '\u2b50',
  'star2': '\ud83c\udf1f',
  'star_and_crescent': '\u262a\ufe0f',
  'star_of_david': '\u2721\ufe0f',
  'star_struck': '\ud83e\udd29',
  'stars': '\ud83c\udf20',
  'station': '\ud83d\ude89',
  'statue_of_liberty': '\ud83d\uddfd',
  'steam_locomotive': '\ud83d\ude82',
  'stethoscope': '\ud83e\ude7a',
  'stew': '\ud83c\udf72',
  'stop_button': '\u23f9\ufe0f',
  'stop_sign': '\ud83d\uded1',
  'stopwatch': '\u23f1\ufe0f',
  'straight_ruler': '\ud83d\udccf',
  'strawberry': '\ud83c\udf53',
  'stuck_out_tongue': '\ud83d\ude1b',
  'stuck_out_tongue_closed_eyes': '\ud83d\ude1d',
  'stuck_out_tongue_winking_eye': '\ud83d\ude1c',
  'student': '\ud83e\uddd1\u200d\ud83c\udf93',
  'studio_microphone': '\ud83c\udf99\ufe0f',
  'stuffed_flatbread': '\ud83e\udd59',
  'sudan': '\ud83c\uddf8\ud83c\udde9',
  'sun_behind_large_cloud': '\ud83c\udf25\ufe0f',
  'sun_behind_rain_cloud': '\ud83c\udf26\ufe0f',
  'sun_behind_small_cloud': '\ud83c\udf24\ufe0f',
  'sun_with_face': '\ud83c\udf1e',
  'sunflower': '\ud83c\udf3b',
  'sunglasses': '\ud83d\ude0e',
  'sunny': '\u2600\ufe0f',
  'sunrise': '\ud83c\udf05',
  'sunrise_over_mountains': '\ud83c\udf04',
  'superhero': '\ud83e\uddb8',
  'superhero_man': '\ud83e\uddb8\u200d\u2642\ufe0f',
  'superhero_woman': '\ud83e\uddb8\u200d\u2640\ufe0f',
  'supervillain': '\ud83e\uddb9',
  'supervillain_man': '\ud83e\uddb9\u200d\u2642\ufe0f',
  'supervillain_woman': '\ud83e\uddb9\u200d\u2640\ufe0f',
  'surfer': '\ud83c\udfc4',
  'surfing_man': '\ud83c\udfc4\u200d\u2642\ufe0f',
  'surfing_woman': '\ud83c\udfc4\u200d\u2640\ufe0f',
  'suriname': '\ud83c\uddf8\ud83c\uddf7',
  'sushi': '\ud83c\udf63',
  'suspension_railway': '\ud83d\ude9f',
  'svalbard_jan_mayen': '\ud83c\uddf8\ud83c\uddef',
  'swan': '\ud83e\udda2',
  'swaziland': '\ud83c\uddf8\ud83c\uddff',
  'sweat': '\ud83d\ude13',
  'sweat_drops': '\ud83d\udca6',
  'sweat_smile': '\ud83d\ude05',
  'sweden': '\ud83c\uddf8\ud83c\uddea',
  'sweet_potato': '\ud83c\udf60',
  'swim_brief': '\ud83e\ude72',
  'swimmer': '\ud83c\udfca',
  'swimming_man': '\ud83c\udfca\u200d\u2642\ufe0f',
  'swimming_woman': '\ud83c\udfca\u200d\u2640\ufe0f',
  'switzerland': '\ud83c\udde8\ud83c\udded',
  'symbols': '\ud83d\udd23',
  'synagogue': '\ud83d\udd4d',
  'syria': '\ud83c\uddf8\ud83c\uddfe',
  'syringe': '\ud83d\udc89',
  't-rex': '\ud83e\udd96',
  'taco': '\ud83c\udf2e',
  'tada': '\ud83c\udf89',
  'taiwan': '\ud83c\uddf9\ud83c\uddfc',
  'tajikistan': '\ud83c\uddf9\ud83c\uddef',
  'takeout_box': '\ud83e\udd61',
  'tanabata_tree': '\ud83c\udf8b',
  'tangerine': '\ud83c\udf4a',
  'tanzania': '\ud83c\uddf9\ud83c\uddff',
  'taurus': '\u2649',
  'taxi': '\ud83d\ude95',
  'tea': '\ud83c\udf75',
  'teacher': '\ud83e\uddd1\u200d\ud83c\udfeb',
  'technologist': '\ud83e\uddd1\u200d\ud83d\udcbb',
  'teddy_bear': '\ud83e\uddf8',
  'telephone': '\u260e\ufe0f',
  'telephone_receiver': '\ud83d\udcde',
  'telescope': '\ud83d\udd2d',
  'tennis': '\ud83c\udfbe',
  'tent': '\u26fa',
  'test_tube': '\ud83e\uddea',
  'thailand': '\ud83c\uddf9\ud83c\udded',
  'thermometer': '\ud83c\udf21\ufe0f',
  'thinking': '\ud83e\udd14',
  'thought_balloon': '\ud83d\udcad',
  'thread': '\ud83e\uddf5',
  'three': '3\ufe0f\u20e3',
  'thumbsdown': '\ud83d\udc4e',
  'thumbsup': '\ud83d\udc4d',
  'ticket': '\ud83c\udfab',
  'tickets': '\ud83c\udf9f\ufe0f',
  'tiger': '\ud83d\udc2f',
  'tiger2': '\ud83d\udc05',
  'timer_clock': '\u23f2\ufe0f',
  'timor_leste': '\ud83c\uddf9\ud83c\uddf1',
  'tipping_hand_man': '\ud83d\udc81\u200d\u2642\ufe0f',
  'tipping_hand_person': '\ud83d\udc81',
  'tipping_hand_woman': '\ud83d\udc81\u200d\u2640\ufe0f',
  'tired_face': '\ud83d\ude2b',
  'tm': '\u2122\ufe0f',
  'togo': '\ud83c\uddf9\ud83c\uddec',
  'toilet': '\ud83d\udebd',
  'tokelau': '\ud83c\uddf9\ud83c\uddf0',
  'tokyo_tower': '\ud83d\uddfc',
  'tomato': '\ud83c\udf45',
  'tonga': '\ud83c\uddf9\ud83c\uddf4',
  'tongue': '\ud83d\udc45',
  'toolbox': '\ud83e\uddf0',
  'tooth': '\ud83e\uddb7',
  'top': '\ud83d\udd1d',
  'tophat': '\ud83c\udfa9',
  'tornado': '\ud83c\udf2a\ufe0f',
  'tr': '\ud83c\uddf9\ud83c\uddf7',
  'trackball': '\ud83d\uddb2\ufe0f',
  'tractor': '\ud83d\ude9c',
  'traffic_light': '\ud83d\udea5',
  'train': '\ud83d\ude8b',
  'train2': '\ud83d\ude86',
  'tram': '\ud83d\ude8a',
  'triangular_flag_on_post': '\ud83d\udea9',
  'triangular_ruler': '\ud83d\udcd0',
  'trident': '\ud83d\udd31',
  'trinidad_tobago': '\ud83c\uddf9\ud83c\uddf9',
  'tristan_da_cunha': '\ud83c\uddf9\ud83c\udde6',
  'triumph': '\ud83d\ude24',
  'trolleybus': '\ud83d\ude8e',
  'trophy': '\ud83c\udfc6',
  'tropical_drink': '\ud83c\udf79',
  'tropical_fish': '\ud83d\udc20',
  'truck': '\ud83d\ude9a',
  'trumpet': '\ud83c\udfba',
  'tshirt': '\ud83d\udc55',
  'tulip': '\ud83c\udf37',
  'tumbler_glass': '\ud83e\udd43',
  'tunisia': '\ud83c\uddf9\ud83c\uddf3',
  'turkey': '\ud83e\udd83',
  'turkmenistan': '\ud83c\uddf9\ud83c\uddf2',
  'turks_caicos_islands': '\ud83c\uddf9\ud83c\udde8',
  'turtle': '\ud83d\udc22',
  'tuvalu': '\ud83c\uddf9\ud83c\uddfb',
  'tv': '\ud83d\udcfa',
  'twisted_rightwards_arrows': '\ud83d\udd00',
  'two': '2\ufe0f\u20e3',
  'two_hearts': '\ud83d\udc95',
  'two_men_holding_hands': '\ud83d\udc6c',
  'two_women_holding_hands': '\ud83d\udc6d',
  'u5272': '\ud83c\ude39',
  'u5408': '\ud83c\ude34',
  'u55b6': '\ud83c\ude3a',
  'u6307': '\ud83c\ude2f',
  'u6708': '\ud83c\ude37\ufe0f',
  'u6709': '\ud83c\ude36',
  'u6e80': '\ud83c\ude35',
  'u7121': '\ud83c\ude1a',
  'u7533': '\ud83c\ude38',
  'u7981': '\ud83c\ude32',
  'u7a7a': '\ud83c\ude33',
  'uganda': '\ud83c\uddfa\ud83c\uddec',
  'uk': '\ud83c\uddec\ud83c\udde7',
  'ukraine': '\ud83c\uddfa\ud83c\udde6',
  'umbrella': '\u2614',
  'unamused': '\ud83d\ude12',
  'underage': '\ud83d\udd1e',
  'unicorn': '\ud83e\udd84',
  'united_arab_emirates': '\ud83c\udde6\ud83c\uddea',
  'united_nations': '\ud83c\uddfa\ud83c\uddf3',
  'unlock': '\ud83d\udd13',
  'up': '\ud83c\udd99',
  'upside_down_face': '\ud83d\ude43',
  'uruguay': '\ud83c\uddfa\ud83c\uddfe',
  'us': '\ud83c\uddfa\ud83c\uddf8',
  'us_outlying_islands': '\ud83c\uddfa\ud83c\uddf2',
  'us_virgin_islands': '\ud83c\uddfb\ud83c\uddee',
  'uzbekistan': '\ud83c\uddfa\ud83c\uddff',
  'v': '\u270c\ufe0f',
  'vampire': '\ud83e\udddb',
  'vampire_man': '\ud83e\udddb\u200d\u2642\ufe0f',
  'vampire_woman': '\ud83e\udddb\u200d\u2640\ufe0f',
  'vanuatu': '\ud83c\uddfb\ud83c\uddfa',
  'vatican_city': '\ud83c\uddfb\ud83c\udde6',
  'venezuela': '\ud83c\uddfb\ud83c\uddea',
  'vertical_traffic_light': '\ud83d\udea6',
  'vhs': '\ud83d\udcfc',
  'vibration_mode': '\ud83d\udcf3',
  'video_camera': '\ud83d\udcf9',
  'video_game': '\ud83c\udfae',
  'vietnam': '\ud83c\uddfb\ud83c\uddf3',
  'violin': '\ud83c\udfbb',
  'virgo': '\u264d',
  'volcano': '\ud83c\udf0b',
  'volleyball': '\ud83c\udfd0',
  'vomiting_face': '\ud83e\udd2e',
  'vs': '\ud83c\udd9a',
  'vulcan_salute': '\ud83d\udd96',
  'waffle': '\ud83e\uddc7',
  'wales': '\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f',
  'walking': '\ud83d\udeb6',
  'walking_man': '\ud83d\udeb6\u200d\u2642\ufe0f',
  'walking_woman': '\ud83d\udeb6\u200d\u2640\ufe0f',
  'wallis_futuna': '\ud83c\uddfc\ud83c\uddeb',
  'waning_crescent_moon': '\ud83c\udf18',
  'waning_gibbous_moon': '\ud83c\udf16',
  'warning': '\u26a0\ufe0f',
  'wastebasket': '\ud83d\uddd1\ufe0f',
  'watch': '\u231a',
  'water_buffalo': '\ud83d\udc03',
  'water_polo': '\ud83e\udd3d',
  'watermelon': '\ud83c\udf49',
  'wave': '\ud83d\udc4b',
  'wavy_dash': '\u3030\ufe0f',
  'waxing_crescent_moon': '\ud83c\udf12',
  'waxing_gibbous_moon': '\ud83c\udf14',
  'wc': '\ud83d\udebe',
  'weary': '\ud83d\ude29',
  'wedding': '\ud83d\udc92',
  'weight_lifting': '\ud83c\udfcb\ufe0f',
  'weight_lifting_man': '\ud83c\udfcb\ufe0f\u200d\u2642\ufe0f',
  'weight_lifting_woman': '\ud83c\udfcb\ufe0f\u200d\u2640\ufe0f',
  'western_sahara': '\ud83c\uddea\ud83c\udded',
  'whale': '\ud83d\udc33',
  'whale2': '\ud83d\udc0b',
  'wheel_of_dharma': '\u2638\ufe0f',
  'wheelchair': '\u267f',
  'white_check_mark': '\u2705',
  'white_circle': '\u26aa',
  'white_flag': '\ud83c\udff3\ufe0f',
  'white_flower': '\ud83d\udcae',
  'white_haired_man': '\ud83d\udc68\u200d\ud83e\uddb3',
  'white_haired_woman': '\ud83d\udc69\u200d\ud83e\uddb3',
  'white_heart': '\ud83e\udd0d',
  'white_large_square': '\u2b1c',
  'white_medium_small_square': '\u25fd',
  'white_medium_square': '\u25fb\ufe0f',
  'white_small_square': '\u25ab\ufe0f',
  'white_square_button': '\ud83d\udd33',
  'wilted_flower': '\ud83e\udd40',
  'wind_chime': '\ud83c\udf90',
  'wind_face': '\ud83c\udf2c\ufe0f',
  'wine_glass': '\ud83c\udf77',
  'wink': '\ud83d\ude09',
  'wolf': '\ud83d\udc3a',
  'woman': '\ud83d\udc69',
  'woman_artist': '\ud83d\udc69\u200d\ud83c\udfa8',
  'woman_astronaut': '\ud83d\udc69\u200d\ud83d\ude80',
  'woman_cartwheeling': '\ud83e\udd38\u200d\u2640\ufe0f',
  'woman_cook': '\ud83d\udc69\u200d\ud83c\udf73',
  'woman_dancing': '\ud83d\udc83',
  'woman_facepalming': '\ud83e\udd26\u200d\u2640\ufe0f',
  'woman_factory_worker': '\ud83d\udc69\u200d\ud83c\udfed',
  'woman_farmer': '\ud83d\udc69\u200d\ud83c\udf3e',
  'woman_firefighter': '\ud83d\udc69\u200d\ud83d\ude92',
  'woman_health_worker': '\ud83d\udc69\u200d\u2695\ufe0f',
  'woman_in_manual_wheelchair': '\ud83d\udc69\u200d\ud83e\uddbd',
  'woman_in_motorized_wheelchair': '\ud83d\udc69\u200d\ud83e\uddbc',
  'woman_judge': '\ud83d\udc69\u200d\u2696\ufe0f',
  'woman_juggling': '\ud83e\udd39\u200d\u2640\ufe0f',
  'woman_mechanic': '\ud83d\udc69\u200d\ud83d\udd27',
  'woman_office_worker': '\ud83d\udc69\u200d\ud83d\udcbc',
  'woman_pilot': '\ud83d\udc69\u200d\u2708\ufe0f',
  'woman_playing_handball': '\ud83e\udd3e\u200d\u2640\ufe0f',
  'woman_playing_water_polo': '\ud83e\udd3d\u200d\u2640\ufe0f',
  'woman_scientist': '\ud83d\udc69\u200d\ud83d\udd2c',
  'woman_shrugging': '\ud83e\udd37\u200d\u2640\ufe0f',
  'woman_singer': '\ud83d\udc69\u200d\ud83c\udfa4',
  'woman_student': '\ud83d\udc69\u200d\ud83c\udf93',
  'woman_teacher': '\ud83d\udc69\u200d\ud83c\udfeb',
  'woman_technologist': '\ud83d\udc69\u200d\ud83d\udcbb',
  'woman_with_headscarf': '\ud83e\uddd5',
  'woman_with_probing_cane': '\ud83d\udc69\u200d\ud83e\uddaf',
  'woman_with_turban': '\ud83d\udc73\u200d\u2640\ufe0f',
  'womans_clothes': '\ud83d\udc5a',
  'womans_hat': '\ud83d\udc52',
  'women_wrestling': '\ud83e\udd3c\u200d\u2640\ufe0f',
  'womens': '\ud83d\udeba',
  'woozy_face': '\ud83e\udd74',
  'world_map': '\ud83d\uddfa\ufe0f',
  'worried': '\ud83d\ude1f',
  'wrench': '\ud83d\udd27',
  'wrestling': '\ud83e\udd3c',
  'writing_hand': '\u270d\ufe0f',
  'x': '\u274c',
  'yarn': '\ud83e\uddf6',
  'yawning_face': '\ud83e\udd71',
  'yellow_circle': '\ud83d\udfe1',
  'yellow_heart': '\ud83d\udc9b',
  'yellow_square': '\ud83d\udfe8',
  'yemen': '\ud83c\uddfe\ud83c\uddea',
  'yen': '\ud83d\udcb4',
  'yin_yang': '\u262f\ufe0f',
  'yo_yo': '\ud83e\ude80',
  'yum': '\ud83d\ude0b',
  'zambia': '\ud83c\uddff\ud83c\uddf2',
  'zany_face': '\ud83e\udd2a',
  'zap': '\u26a1',
  'zebra': '\ud83e\udd93',
  'zero': '0\ufe0f\u20e3',
  'zimbabwe': '\ud83c\uddff\ud83c\uddfc',
  'zipper_mouth_face': '\ud83e\udd10',
  'zombie': '\ud83e\udddf',
  'zombie_man': '\ud83e\udddf\u200d\u2642\ufe0f',
  'zombie_woman': '\ud83e\udddf\u200d\u2640\ufe0f',
  'zzz': '\ud83d\udca4',

  /* special emojis :P */
  'atom': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/atom.png?v8">',
  'basecamp': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/basecamp.png?v8">',
  'basecampy': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/basecampy.png?v8">',
  'bowtie': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/bowtie.png?v8">',
  'electron': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/electron.png?v8">',
  'feelsgood': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/feelsgood.png?v8">',
  'finnadie': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/finnadie.png?v8">',
  'goberserk': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/goberserk.png?v8">',
  'godmode': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/godmode.png?v8">',
  'hurtrealbad': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/hurtrealbad.png?v8">',
  'neckbeard': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/neckbeard.png?v8">',
  'octocat': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/octocat.png?v8">',
  'rage1': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/rage1.png?v8">',
  'rage2': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/rage2.png?v8">',
  'rage3': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/rage3.png?v8">',
  'rage4': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/rage4.png?v8">',
  'shipit': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/shipit.png?v8">',
  'suspect': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/suspect.png?v8">',
  'trollface': '<img width="20" height="20" align="absmiddle" src="https://github.githubassets.com/images/icons/emoji/trollface.png?v8">',
  'showdown': '<img width="20" height="20" align="absmiddle" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAS1BMVEX///8jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS3b1q3b1q3b1q3b1q3b1q3b1q3b1q3b1q0565CIAAAAGXRSTlMAQHCAYCCw/+DQwPCQUBAwoHCAEP+wwFBgS2fvBgAAAUZJREFUeAHs1cGy7BAUheFFsEDw/k97VTq3T6ge2EmdM+pvrP6Iwd74XV9Kb52xuMU4/uc1YNgZLFOeV8FGdhGrNk5SEgUyPxAEdj4LlMRDyhVAMVEa2M7TBSeVZAFPdqHgzSZJwPKgcLFLAooHDJo4EDCw4gAtBoJA5UFj4Ng5LOGLwVXZuoIlji/jeQHFk7+baHxrCjeUwB9+s88KndvlhcyBN5BSkYNQIVVb4pV+Npm7hhuKDs/uMP5KxT3WzSNNLIuuoDpMmuAVMruMSeDyQBi24DTr43LAY7ILA1QYaWkgfHzFthYYzg67SQsCbB8GhJUEGCtO9n0rSaCLxgJQjS/JSgMTg2eBDEHAJ+H350AsjYNYscrErgI2e/l+mdR967TCX/v6N0EhPECYCP0i+IAoYQOE8BogNhQMEMdrgAQWHaMAAGi5I5euoY9NAAAAAElFTkSuQmCC">'
};
