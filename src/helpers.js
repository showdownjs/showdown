/**
 * Created by Estevao on 11-01-2015.
 */

function isString(a) {
    return (typeof a === 'string' || a instanceof String);
}

function forEach(obj, callback) {
    if (typeof obj.forEach === 'function') {
        obj.forEach(callback);
    } else {
        var i, len = obj.length;
        for (i = 0; i < len; i++) {
            callback(obj[i], i, obj);
        }
    }
}

function isArray(a) {
    return a.constructor === Array;
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

var escapeCharactersCallback = function (wholeMatch, m1) {
    var charCodeToEscape = m1.charCodeAt(0);
    return '~E' + charCodeToEscape + 'E';
};

var escapeCharacters = function (text, charsToEscape, afterBackslash) {
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

if (!showdown.hasOwnProperty('helper')) {
    showdown.helper = {};
}

/**
 * isString helper function
 * @param a
 * @returns {boolean}
 */
showdown.helper.isString = isString;

/**
 * ForEach helper function
 * @param {*} obj
 * @param callback
 */
showdown.helper.forEach = forEach;

/**
 * isArray helper function
 * @param {*} a
 * @returns {boolean}
 */
showdown.helper.isArray = isArray;

/**
 * Check if value is undefined
 *
 * @static
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 */
showdown.helper.isUndefined = isUndefined;

/**
 * Callback used to escape characters when passing through String.replace
 * @param {string} wholeMatch
 * @param {string} m1
 * @returns {string}
 */
showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

/**
 * Escape characters in a string
 *
 * @param {string} text
 * @param {string} charsToEscape
 * @param {boolean} afterBackslash
 * @returns {XML|string|void|*}
 */
showdown.helper.escapeCharacters = escapeCharacters;
