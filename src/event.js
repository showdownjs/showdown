/**
 * @file      event.js
 * @summary   The `showdown.Event` class and the static dispatch helpers powering the listener event system.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Implements the event object (name, `input`, `output`, `regexp`, `matches`, `attributes`, plus
 * read-only `_globals`/`_options`/`_converter` context) with validating accessors and fluent
 * builders, and the static dispatch helpers (`dispatchStart`/`dispatchCapture`/`dispatchHash`/
 * `dispatchEnd`) that construct subparsers must use to emit `onStart`/`onCapture`/`onHash`/`onEnd`.
 * This is the contract listener extensions hook into.
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
      throw new TypeError('Event.name must be a string but ' + typeof name + ' given');
    }
    this._name = name.toLowerCase();
    this.input = input;
    this.output = output || input;
    this.regexp = regexp || null;
    this.matches = matches || {};
    this.attributes = attributes || {};
    this._globals = globals || {};
    this._options = options || {};
    this._optionsCopy = null;
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
      if (Object.prototype.hasOwnProperty.call(value, prop)) {
        let descriptor;
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

  /**
   * The conversion options, as read-only context.
   *
   * `_options` is the converter's own live object, so exposing it directly would let a listener
   * reconfigure the conversion mid-pipeline. A copy is handed out instead — made on first access
   * rather than at dispatch time, because the overwhelming majority of events are never inspected
   * by a listener and copying every one of them measurably slows conversion down. The copy is one
   * level deep: it guards the option keys themselves, and unlike a deep clone it neither costs a
   * full traversal nor chokes on function-valued options.
   *
   * @returns {{}}
   */
  get options () {
    if (this._optionsCopy === null) {
      this._optionsCopy = showdown.helper.cloneObject(this._options) || {};
    }
    return this._optionsCopy;
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

  /**
   * @param {{}} value the converter's live options; listeners only ever see the copy the
   *   `options` getter hands out
   * @returns {showdown.Event}
   */
  _setOptions (value) {
    this._options = value || {};
    this._optionsCopy = null;
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

// ---------------------------------------------------------------------------
// Lifecycle dispatch helpers
//
// Shared event ceremony for the makehtml subparsers, the makeMarkdown subparsers
// and the document-level event sites in converter.js. Each helper builds a
// showdown.Event with the payload shape mandated by the event contract,
// dispatches it through the converter and returns the dispatched event so callers
// can read back the (possibly listener-mutated) output, matches and attributes.
//
// The contract (see docs/event-system.md for the full reference, including the
// makeMarkdown counterpart):
//   - onStart / onEnd / onHash : input, output (initially === input), options, globals
//   - onCapture                : output = null, regexp (RegExp|null), matches, attributes
//   - matches always carries the read-only `_wholeMatch` context key and, for
//     every construct that has inner content, the main content under `text`;
//     construct-specific extras use descriptive names (url, title, format, …).
//
// makeMarkdown lifecycle events additionally carry the source DOM node under the
// read-only `matches._node` key (mutating that live node is how a listener rewrites
// the input on `onStart`); their captures are node-based, so `regexp` and
// `attributes` are ALWAYS null there (there is no regex match and markdown output
// has no HTML attributes). The `makeMarkdown.*` namespace is detected from the event
// name and validated accordingly.
//
// dispatchCapture validates the payload cheaply and throws a descriptive Error
// on a malformed capture (missing matches, absent `_wholeMatch`, or a regexp /
// attributes value that violates the namespace's shape) so contract violations
// fail loudly at their source instead of producing a silently broken event.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// The family umbrella (maintainer contract)
//
// Event names follow `<side>.<family>[.<variant>].<phase>`. When a family has
// variants — `makehtml.link.{inline, reference, autolink, ghMention}`,
// `makehtml.image.{inline, reference}`, `makehtml.heading.{setext, atx}`, … —
// a variant event is, FOR USER CONVENIENCE, re-dispatched under the family-level
// name too: `makehtml.link.inline.onCapture` also fires `makehtml.link.onCapture`
// carrying the exact same event content. So a listener on the family name catches
// every variant (`makehtml.link.onCapture` = all links), while a listener on a
// variant name targets one syntax. This is structural — every variant family gets
// it, present and future; nothing is hardcoded per family.
//
// Ordering: variant listeners run FIRST, the family listeners see the variant
// listeners' edits (the matches/attributes objects are shared, not copied), and
// the state after both is what the construct honors. A family-level name has no
// variant segment, so it is never itself re-dispatched (no recursion).
// ---------------------------------------------------------------------------

// Event names arrive lowercased (the Event constructor lowercases them):
// `<side>.<family>.<variant>.<phase>` -> the family name `<side>.<family>.<phase>`.
const eventFamilyUmbrellaRegex = /^((?:makehtml|makemarkdown)\.[^.]+)\.[^.]+\.(on[a-z]+)$/;

/**
 * The family-level umbrella name for a variant event name, or null when the name
 * carries no variant segment.
 * @param {string} name (already lowercased)
 * @returns {string|null}
 */
showdown.Event._familyEventName = function (name) {
  'use strict';
  let m = eventFamilyUmbrellaRegex.exec(name);
  return m ? (m[1] + '.' + m[2]) : null;
};

/**
 * Dispatch `event` and, when its name is a `<side>.<family>.<variant>.<phase>` variant
 * event, re-dispatch the resulting state under the family-level `<side>.<family>.<phase>`
 * name (see the umbrella contract above). Returns the final event — the one the calling
 * construct must honor.
 * @param {showdown.Event} event
 * @param {{}} options
 * @param {{}} globals
 * @returns {showdown.Event}
 */
showdown.Event._dispatchWithFamily = function (event, options, globals) {
  'use strict';
  event = globals.converter.dispatch(event);
  let familyName = showdown.Event._familyEventName(event.name);
  if (familyName === null) {
    return event;
  }
  let familyEvent = new showdown.Event(familyName, event.input);
  familyEvent
    .setOutput(event.output)
    ._setGlobals(globals)
    ._setOptions(options)
    .setRegexp(event.regexp);
  // share (not copy) the variant event's matches/attributes: the family listeners see the
  // variant listeners' edits, their own edits land on the same objects the construct reads,
  // and the read-only `_` keys keep their wrapping
  familyEvent._matches = event._matches;
  familyEvent._attributes = event._attributes;
  return globals.converter.dispatch(familyEvent);
};

/**
 * Build, dispatch and return a lifecycle event whose input and output both start
 * as `text`. Shared by dispatchStart / dispatchEnd / dispatchHash. An optional
 * `matches` object attaches read-only/mutable context (the makeMarkdown lifecycle
 * events pass `{_node: node}` so listeners can reach the live DOM node).
 * @param {string} name
 * @param {string} text
 * @param {{}} options
 * @param {{}} globals
 * @param {{}} [matches]
 * @returns {showdown.Event}
 */
showdown.Event._dispatchLifecycle = function (name, text, options, globals, matches) {
  'use strict';
  let event = new showdown.Event(name, text);
  event
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  if (matches) {
    event.setMatches(matches);
  }
  return showdown.Event._dispatchWithFamily(event, options, globals);
};

/**
 * Dispatch a subparser's `onStart` event.
 * @param {string} name
 * @param {string} text
 * @param {{}} options
 * @param {{}} globals
 * @param {{}} [matches]
 * @returns {showdown.Event}
 */
showdown.Event.dispatchStart = function (name, text, options, globals, matches) {
  'use strict';
  return showdown.Event._dispatchLifecycle(name, text, options, globals, matches);
};

/**
 * Dispatch a subparser's `onEnd` event.
 * @param {string} name
 * @param {string} text
 * @param {{}} options
 * @param {{}} globals
 * @param {{}} [matches]
 * @returns {showdown.Event}
 */
showdown.Event.dispatchEnd = function (name, text, options, globals, matches) {
  'use strict';
  return showdown.Event._dispatchLifecycle(name, text, options, globals, matches);
};

/**
 * Dispatch a construct's `onHash` event, carrying the built output that is about
 * to be hashed/returned.
 * @param {string} name
 * @param {string} output
 * @param {{}} options
 * @param {{}} globals
 * @returns {showdown.Event}
 */
showdown.Event.dispatchHash = function (name, output, options, globals) {
  'use strict';
  return showdown.Event._dispatchLifecycle(name, output, options, globals);
};

/**
 * Dispatch a construct's `onCapture` event. Sets the contract payload
 * (`output: null`, plus the given regexp / matches / attributes) and returns the
 * dispatched event so the caller can read back matches, attributes and any
 * output a listener supplied.
 * @param {string} name
 * @param {string} input the captured content
 * @param {{regexp: (RegExp|null), matches: {}, attributes: ({}|undefined)}} params
 * @param {{}} options
 * @param {{}} globals
 * @returns {showdown.Event}
 */
showdown.Event.dispatchCapture = function (name, input, params, options, globals) {
  'use strict';
  params = params || {};
  // makeMarkdown captures are node-based: they never carry a regexp or HTML attributes,
  // so the contract there REQUIRES regexp === null and attributes === null. makehtml
  // captures keep their shape (regexp is a RegExp or null, attributes is an object).
  let isMakeMarkdown = /^makemarkdown\./i.test(name);
  let regexp = (typeof params.regexp === 'undefined') ? null : params.regexp,
      matches = params.matches,
      attributes = (typeof params.attributes === 'undefined') ?
        (isMakeMarkdown ? null : {}) :
        params.attributes;

  if (isMakeMarkdown) {
    if (regexp !== null) {
      throw new Error('Malformed "' + name + '" capture event: makeMarkdown captures are node-based and carry no regexp, so regexp must be null, but ' +
        (regexp instanceof RegExp ? 'a RegExp' : typeof regexp) + ' given');
    }
    if (attributes !== null) {
      throw new Error('Malformed "' + name + '" capture event: makeMarkdown output has no attributes, so attributes must be null, but ' +
        typeof attributes + ' given');
    }
  } else {
    if (regexp !== null && !(regexp instanceof RegExp)) {
      throw new Error('Malformed "' + name + '" capture event: regexp must be a RegExp or null, but ' +
        typeof regexp + ' given');
    }
    if (attributes === null || typeof attributes !== 'object') {
      throw new Error('Malformed "' + name + '" capture event: attributes must be an object, but ' +
        typeof attributes + ' given');
    }
  }
  if (matches === null || typeof matches !== 'object') {
    throw new Error('Malformed "' + name + '" capture event: matches must be an object, but ' +
      typeof matches + ' given');
  }
  if (!Object.prototype.hasOwnProperty.call(matches, '_wholeMatch')) {
    throw new Error('Malformed "' + name + '" capture event: matches must include a "_wholeMatch" key');
  }

  let event = new showdown.Event(name, input);
  event
    .setOutput(null)
    ._setGlobals(globals)
    ._setOptions(options)
    .setRegexp(regexp)
    .setMatches(matches)
    .setAttributes(attributes);
  return showdown.Event._dispatchWithFamily(event, options, globals);
};
