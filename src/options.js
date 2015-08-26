/**
 * Created by Tivie on 13-07-2015.
 */

function getDefaultOpts(simple) {
  'use strict';

  var defaultOptions = {
    omitExtraWLInCodeBlocks: {
      default: false,
      describe: 'Omit the default extra whiteline added to code blocks',
      type: 'boolean'
    },
    noHeaderId: {
      default: false,
      describe: 'Turn on/off generated header id',
      type: 'boolean'
    },
    prefixHeaderId: {
      default: false,
      describe: 'Specify a prefix to generated header ids',
      type: 'string'
    },
    headerLevelStart: {
      default: false,
      describe: 'The header blocks level start',
      type: 'integer'
    },
    parseImgDimensions: {
      default: false,
      describe: 'Turn on/off image dimension parsing',
      type: 'boolean'
    },
    simplifiedAutoLink: {
      default: false,
      describe: 'Turn on/off GFM autolink style',
      type: 'boolean'
    },
    literalMidWordUnderscores: {
      default: false,
      describe: 'Parse midword underscores as literal underscores',
      type: 'boolean'
    },
    strikethrough: {
      default: false,
      describe: 'Turn on/off strikethrough support',
      type: 'boolean'
    },
    tables: {
      default: false,
      describe: 'Turn on/off tables support',
      type: 'boolean'
    },
    tablesHeaderId: {
      default: false,
      describe: 'Add an id to table headers',
      type: 'boolean'
    },
    ghCodeBlocks: {
      default: true,
      describe: 'Turn on/off GFM fenced code blocks support',
      type: 'boolean'
    },
    tasklists: {
      default: false,
      describe: 'Turn on/off GFM tasklist support',
      type: 'boolean'
    },
    smoothLivePreview: {
      default: false,
      describe: 'Prevents weird effects in live previews due to incomplete input',
      type: 'boolean'
    }
  };
  if (simple === false) {
    return JSON.parse(JSON.stringify(defaultOptions));
  }
  var ret = {};
  for (var opt in defaultOptions) {
    if (defaultOptions.hasOwnProperty(opt)) {
      ret[opt] = defaultOptions[opt].default;
    }
  }
  return ret;
}
