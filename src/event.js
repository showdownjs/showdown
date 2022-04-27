/**
 * Created by Estevao on 31-05-2015.
 */

showdown.Event = class {

  /**
   * Creates a new showdown Event object
   * @param {string} name
   * @param {string} input
   * @param {{}} [params]
   * @param {string} params.output
   * @param {RegExp} params.regexp
   * @param {{}} params.matches
   * @param {{}} params.attributes
   * @param {{}} params.globals
   * @param {{}} params.options
   * @param {showdown.Converter} params.converter
   */
  constructor (name, input, params) {
    params = params || {};
    let {output, regexp, matches, attributes, globals, options, converter} = params;
    if (!showdown.helper.isString(name)) {
      if (!showdown.helper.isString(name)) {
        throw new TypeError('Event.name must be a string but ' + typeof name + ' given');
      }
    }
    this._name = name.toLowerCase();
    this.input = input;
    this.output = output || input;
    this.regexp = regexp || null;
    this.matches = matches || {};
    this.attributes = attributes || {};
    this._globals = globals || {};
    this._options = showdown.helper.cloneObject(options, true) || {};
    this._converter = converter || undefined;
  }

  /** @returns {string} */
  get name () {
    return this._name;
  }

  /** @returns {string} */
  get input () {
    return this._input;
  }

  /** @param {string} value */
  set input (value) {
    if (!showdown.helper.isString(value)) {
      throw new TypeError('Event.input must be a string but ' + typeof value + ' given');
    }
    this._input = value;
  }

  /** @returns {string} */
  get output () {
    return this._output;
  }

  /** @param {string|null} value */
  set output (value) {
    if (!showdown.helper.isString(value) && value !== null) {
      throw new TypeError('Event.output must be a string but ' + typeof value + ' given');
    }
    this._output = value;
  }

  /** @returns {null|RegExp} */
  get regexp () {
    return this._regexp;
  }

  /** @param {null|RegExp} value */
  set regexp (value) {
    if (!(value instanceof RegExp) && value !== null) {
      throw new TypeError('Event.regexp must be a RegExp object (or null) but ' + typeof value + ' given');
    }
    this._regexp = value;
  }

  /** @returns {{}} */
  get matches () {
    return this._matches;
  }

  /** @param {{}}value */
  set matches (value) {
    if (typeof value !== 'object') {
      throw new TypeError('Event.matches must be an object (or null) but ' + typeof value + ' given');
    }
    this._matches = {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop)) {
        let descriptor = {};
        if (/^_(.+)/.test(prop)) {
          descriptor = {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value[prop]
          };
        } else {
          descriptor = {
            enumerable: true,
            configurable: false,
            writable: true,
            value: value[prop]
          };
        }
        Object.defineProperty(this._matches, prop, descriptor);
      }
    }
  }

  /** @returns {{}} */
  get attributes () {
    return this._attributes;
  }

  /** @param {{}} value */
  set attributes (value) {
    if (typeof value !== 'object') {
      throw new TypeError('Event.attributes must be an object (or null) but ' + typeof value + ' given');
    }
    this._attributes = value;
  }

  /** @param {showdown.Converter} converter */
  set converter (converter) {
    this._converter = converter;
  }

  /** @returns {showdown.Converter} */
  get converter () {
    return this._converter;
  }

  get options () {
    return this._options;
  }

  get globals () {
    return this._globals;
  }
  // FLUID INTERFACE

  /**
   *
   * @param {string} value
   * @returns {showdown.Event}
   */
  setInput (value) {
    this.input = value;
    return this;
  }

  /**
   *
   * @param {string|null} value
   * @returns {showdown.Event}
   */
  setOutput (value) {
    this.output = value;
    return this;
  }

  /**
   *
   * @param {RegExp} value
   * @returns {showdown.Event}
   */
  setRegexp (value) {
    this.regexp = value;
    return this;
  }

  /**
   *
   * @param {{}}value
   * @returns {showdown.Event}
   */
  setMatches (value) {
    this.matches = value;
    return this;
  }

  /**
   *
   * @param {{}}value
   * @returns {showdown.Event}
   */
  setAttributes (value) {
    this.attributes = value;
    return this;
  }

  _setOptions (value) {
    this._options = value;
    return this;
  }

  _setGlobals (value) {
    this._globals = value;
    return this;
  }

  _setConverter (value) {
    this.converter = value;
    return this;
  }

  /**
   * Legacy: Return the output text
   * @returns {string}
   */
  getText () {
    return this.output;
  }

  getMatches () {
    return this.matches;
  }
};
