/**
 * Parse metadata at the top of the document
 */
showdown.subParser('makehtml.metadata', function (text, options, globals) {
  'use strict';

  if (!options.metadata) {
    return text;
  }

  let startEvent = new showdown.Event('makehtml.metadata.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  startEvent = globals.converter.dispatch(startEvent);
  text = startEvent.output;

  /**
   * @param {RegExp} pattern
   * @param {string} wholeMatch
   * @param {string} format
   * @param {string} content
   * @returns {string}
   */
  function parseMetadataContents (pattern, wholeMatch, format, content) {
    let otp;
    let captureStartEvent = new showdown.Event('makehtml.metadata.onCapture', content);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(pattern)
      .setMatches({
        _wholeMatch: wholeMatch,
        format: format,
        content: content
      })
      .setAttributes({});
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    format = captureStartEvent.matches.format;
    content = captureStartEvent.matches.content;

    // if something was passed as output, it will be used as output
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      otp = '¨M';
    }

    // raw is raw so it's not changed in any way
    globals.metadata.raw = content;
    globals.metadata.format = format;

    // escape chars forbidden in html attributes
    // double quotes
    content = content
      // ampersand first
      .replace(/&/g, '&amp;')
      // double quotes
      .replace(/"/g, '&quot;')
    // Restore dollar signs and tremas
      .replace(/¨D/g, '$$')
      .replace(/¨T/g, '¨')
      // replace multiple spaces
      .replace(/\n {4}/g, ' ');

    content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
      globals.metadata.parsed[key] = value;
      return '';
    });
    let beforeHashEvent = new showdown.Event('makehtml.metadata.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    otp = beforeHashEvent.output;
    if (!otp) {
      otp = '¨M';
    }
    return otp;
  }

  // 1. Metadata with «««»»» delimiters
  const rgx1 = /^\s*«««+\s*(\S*?)\n([\s\S]+?)\n»»»+\s*\n/;
  text = text.replace(rgx1, function (wholeMatch, format, content) {
    return parseMetadataContents(rgx1, wholeMatch, format, content);
  });

  // 2. Metadata with YAML delimiters
  const rgx2 = /^\s*---+\s*(\S*?)\n([\s\S]+?)\n---+\s*\n/;
  text = text.replace(rgx2, function (wholeMatch, format, content) {
    return parseMetadataContents(rgx1, wholeMatch, format, content);
  });
  text = text.replace(/¨M/g, '');
  let afterEvent = new showdown.Event('makehtml.metadata.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);
  afterEvent = globals.converter.dispatch(afterEvent);
  return afterEvent.output;
});
