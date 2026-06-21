/**
 * Created by tivie
 */
var fs = require('fs'),
    path = require('path'),
    Command = require('commander').Command,
    program = new Command(),
    path1 = path.resolve(__dirname + '/../dist/showdown.js'),
    path2 = path.resolve(__dirname + '/../../.build/showdown.js'),
    showdown,
    version;

// require shodown. We use conditional loading for each use case
if (fs.existsSync(path1)) {
  // production. File lives in bin directory
  showdown = require(path1);
  version = require(path.resolve(__dirname + '/../package.json')).version;
} else if (fs.existsSync(path2)) {
  // testing envo, uses the concatenated stuff for testing
  showdown = require(path2);
  version = require(path.resolve(__dirname + '/../../package.json')).version;
} else {
  // cold testing (manual) of cli.js in the src file. We load the dist file
  showdown = require('../../dist/showdown');
  version = require('../../package.json').version;
}


program
  .name('showdown')
  .description('CLI to Showdownjs markdown parser v' + version)
  .version(version)
  .usage('<command> [options]')
  .option('-q, --quiet', 'Quiet mode. Only print errors')
  .option('-m, --mute', 'Mute mode. Does not print anything');

addConversionOptions(
  program.command('makehtml')
    .description('Converts markdown into html')

    .addHelpText('after', '\n\nExamples:')
    .addHelpText('after', '  showdown makehtml -i                     Reads from stdin and outputs to stdout')
    .addHelpText('after', '  showdown makehtml -i foo.md -o bar.html  Reads \'foo.md\' and writes to \'bar.html\'')
    .addHelpText('after', '  showdown makehtml -i --flavor="github"   Parses stdin using GFM style')

    .addHelpText('after', '\nNote for windows users:')
    .addHelpText('after', 'When reading from stdin, use option -u to set the proper encoding or run `chcp 65001` prior to calling showdown cli to set the command line to utf-8'),
  'Input source. Usually a md file. If omitted or empty, reads from stdin. Windows users see note below.',
  'Output target. Usually a html file. If omitted or empty, writes to stdout'
).action(function (options, command) {
  conversionCommand('makeHtml', 'markdown', options, command);
});

addConversionOptions(
  program.command('makemarkdown')
    .description('Converts html into markdown')

    .addHelpText('after', '\n\nExamples:')
    .addHelpText('after', '  showdown makemarkdown -i                     Reads from stdin and outputs to stdout')
    .addHelpText('after', '  showdown makemarkdown -i foo.html -o bar.md  Reads \'foo.html\' and writes to \'bar.md\'')

    .addHelpText('after', '\nNote for windows users:')
    .addHelpText('after', 'When reading from stdin, use option -u to set the proper encoding or run `chcp 65001` prior to calling showdown cli to set the command line to utf-8'),
  'Input source. Usually a html file. If omitted or empty, reads from stdin. Windows users see note below.',
  'Output target. Usually a md file. If omitted or empty, writes to stdout'
).action(function (options, command) {
  conversionCommand('makeMarkdown', 'html', options, command);
});

program.parse();


//
// HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Adds the conversion options shared by the makehtml and makemarkdown commands
 * @param {Command} cmd
 * @param {string} inputDesc Description for the --input option
 * @param {string} outputDesc Description for the --output option
 * @returns {Command}
 */
function addConversionOptions (cmd, inputDesc, outputDesc) {
  'use strict';
  return cmd
    .option('-i, --input [file]', inputDesc, true)
    .option('-o, --output [file]', outputDesc, true)
    .option('-u, --encoding <encoding>', 'Sets the input encoding', 'utf8')
    .option('-y, --output-encoding <encoding>', 'Sets the output encoding', 'utf8')
    .option('-a, --append', 'Append data to output instead of overwriting. Ignored if writing to stdout', false)
    .option('-e, --extensions <extensions...>', 'Load the specified extensions. Should be valid paths to node compatible extensions')
    .option('-p, --flavor <flavor>', 'Run with a predetermined flavor of options. Default is vanilla. Run with --list-flavors to see the available flavors', 'vanilla')
    .option('-c, --config <config...>', 'Enables showdown parser config options. Overrides flavor')
    .option('--config-help', 'Shows configuration options for showdown parser')
    .option('--list-flavors', 'Lists the available flavors');
}

/**
 * Messenger helper object to the CLI
 * @param {string} writeMode
 * @param {boolean} suppress
 * @param {boolean} mute
 * @constructor
 */
function Messenger (writeMode, suppress, mute) {
  'use strict';
  writeMode = writeMode || 'stderr';
  suppress = (!!suppress || !!mute);
  mute = !!mute;
  this._print = (writeMode === 'stdout') ? console.log : console.error;

  this.errorExit = function (e) {
    if (!mute) {
      console.error('ERROR: ' + e.message);
      console.error('Run \'showdown <command> -h\' for help');
    }
    process.exit(1);
  };

  this.okExit = function () {
    if (!mute) {
      this._print('\n');
      this._print('DONE!');
    }
    process.exit(0);
  };

  this.printMsg = function (msg) {
    if (suppress || mute || !msg) {
      return;
    }
    this._print(msg);
  };

  this.printError = function (msg) {
    if (mute) {
      return;
    }
    console.error(msg);
  };

}

/**
 * Helper function to show Showdown Options
 */
function showShowdownOptions () {
  'use strict';
  var showdownOptions = showdown.getDefaultOptions(false);
  console.log('\nshowdown config options:');
  // show showdown options
  for (var sopt in showdownOptions) {
    if (showdownOptions.hasOwnProperty(sopt)) {
      console.log('  ' + sopt + ':', '[default=' + showdownOptions[sopt].defaultValue + ']', showdownOptions[sopt].describe);
    }
  }
  console.log('\n\nBoolean options can be enabled with `-c <option>` or `-c <option>=true`, and disabled with `-c <option>=false`.');
  console.log('Example: showdown makehtml -c openLinksInNewWindow -c headerLevelStart=2 -c ghMentionsLink="https://google.com"');
}

/**
 * Returns the list of available flavor names.
 * Falls back to the known flavors if the loaded showdown build predates getFlavors().
 * @returns {string[]}
 */
function getAvailableFlavors () {
  'use strict';
  if (typeof showdown.getFlavors === 'function') {
    return showdown.getFlavors();
  }
  return ['github', 'original', 'commonmark', 'vanilla'];
}

/**
 * Helper function to list the available flavors
 */
function showFlavors () {
  'use strict';
  console.log('\nAvailable flavors:');
  var flavors = getAvailableFlavors();
  for (var i = 0; i < flavors.length; ++i) {
    console.log('  ' + flavors[i] + ((flavors[i] === 'vanilla') ? ' (default)' : ''));
  }
  console.log('\nExample: showdown makehtml -i foo.md -o bar.html -p github');
}

/**
 * Coerces a single config value to the type declared for the option
 * @param {string} key Option name
 * @param {(string|boolean)} rawVal Raw value (true for a bare flag, string otherwise)
 * @param {string} type Declared option type ('boolean', 'number' or 'string')
 * @param {Messenger} messenger
 * @returns {*} The coerced value, or undefined if the value is invalid (already warned)
 */
function coerceOptionValue (key, rawVal, type, messenger) {
  'use strict';
  // a bare flag (no '=value') always means "enable this option"
  if (rawVal === true) {
    return true;
  }

  // prefixHeaderId is special: it accepts a boolean or a string prefix
  if (key === 'prefixHeaderId') {
    if (/^true$/i.test(rawVal)) { return true; }
    if (/^false$/i.test(rawVal)) { return false; }
    return rawVal;
  }

  if (type === 'boolean') {
    if (/^true$/i.test(rawVal)) { return true; }
    if (/^false$/i.test(rawVal)) { return false; }
    messenger.printError('WARNING: invalid boolean value \'' + rawVal + '\' for option \'' + key + '\', ignored');
    return undefined;
  }

  if (type === 'number') {
    var num = Number(rawVal);
    if (isNaN(num)) {
      messenger.printError('WARNING: invalid number value \'' + rawVal + '\' for option \'' + key + '\', ignored');
      return undefined;
    }
    return num;
  }

  // string (and any other) type: pass through unchanged
  return rawVal;
}

/**
 * Helper function to parse showdown options
 * @param {string[]} configOptions Raw `key` / `key=value` strings from the -c flag
 * @param {{}} defaultOptions Base options (flavor preset or defaults)
 * @param {Messenger} messenger
 * @returns {{}}
 */
function parseShowdownOptions (configOptions, defaultOptions, messenger) {
  'use strict';
  // clone the base options so we never mutate the passed-in object
  // (getFlavorOptions returns the internal preset by reference)
  var shOpt = {};
  for (var d in defaultOptions) {
    if (defaultOptions.hasOwnProperty(d)) {
      shOpt[d] = defaultOptions[d];
    }
  }

  if (!configOptions) {
    return shOpt;
  }

  var optionMeta = showdown.getDefaultOptions(false);

  for (var i = 0; i < configOptions.length; ++i) {
    var opt = configOptions[i],
        key = opt,
        rawVal = true,
        eqIdx = opt.indexOf('=');
    if (eqIdx > -1) {
      key = opt.slice(0, eqIdx);
      rawVal = opt.slice(eqIdx + 1);
    }

    if (!optionMeta.hasOwnProperty(key)) {
      messenger.printError('WARNING: unknown option \'' + key + '\', ignored');
      continue;
    }

    var val = coerceOptionValue(key, rawVal, optionMeta[key].type, messenger);
    if (typeof val === 'undefined') {
      continue;
    }
    shOpt[key] = val;
  }
  return shOpt;
}

/**
 * Resolves the path/specifier passed to the -e flag.
 * Path-like specifiers are resolved against the current working directory; bare
 * module specifiers (npm packages) are returned untouched so require() can resolve them.
 * @param {string} ext
 * @returns {string}
 */
function resolveExtensionPath (ext) {
  'use strict';
  if (/^~[/\\]/.test(ext)) {
    var home = process.env.HOME || process.env.USERPROFILE || '';
    return path.resolve(home, ext.slice(2));
  }
  if (/^[./\\]/.test(ext) || path.isAbsolute(ext)) {
    return path.resolve(process.cwd(), ext);
  }
  return ext;
}

/**
 * Reads stdin
 * @returns {string}
 */
function readFromStdIn (encoding) {
  'use strict';
  encoding = encoding || 'utf8';
  try {
    return fs.readFileSync(process.stdin.fd, encoding).toString();
  } catch (e) {
    throw new Error('Could not read from stdin, reason: ' + e.message);
  }
}

/**
 * Reads from a file
 * @param {string} file Filepath to file
 * @param {string} encoding Encoding of the file
 * @returns {string}
 */
function readFromFile (file, encoding) {
  'use strict';
  try {
    return fs.readFileSync(file, encoding);
  } catch (err) {
    throw new Error('Could not read from file ' + file + ', reason: ' + err.message);
  }
}

/**
 * Writes to stdout
 * @param {string} output
 * @param {string} encoding
 * @param {Messenger} messenger
 */
function writeToStdOut (output, encoding, messenger) {
  'use strict';
  // add a trailing newline so the shell prompt does not collide with the output.
  // This is only done for stdout; files are written verbatim.
  if (output && !/\n$/.test(output)) {
    output += '\n';
  }
  // flush before exiting so large piped output is not truncated by process.exit
  process.stdout.write(Buffer.from(output, encoding || 'utf8'), function () {
    messenger.okExit();
  });
}

/**
 * Writes to file
 * @param {string} output Data to write
 * @param {string} file Filepath
 * @param {boolean} append If the result should be appended
 * @param {string} encoding
 */
function writeToFile (output, file, append, encoding) {
  'use strict';
  // If a flag is passed, it means we should append instead of overwriting.
  // Only works with files, obviously
  var write = (append) ? fs.appendFileSync : fs.writeFileSync;
  try {
    write(file, Buffer.from(output, encoding || 'utf8'));
  } catch (err) {
    throw new Error('Could not write to file ' + file + ', reason: ' + err.message);
  }
}

/**
 * Shared conversion command for both makehtml and makemarkdown
 * @param {string} method Converter method to call ('makeHtml' or 'makeMarkdown')
 * @param {string} srcFormat Human readable name of the input format ('markdown' or 'html')
 * @param {{}} options
 * @param {Command} cmd
 */
function conversionCommand (method, srcFormat, options, cmd) {
  'use strict';

  // list the available flavors if listFlavors was passed
  if (options.listFlavors) {
    showFlavors();
    return;
  }

  // show configuration options for showdown helper if configHelp was passed
  if (options.configHelp) {
    showShowdownOptions();
    return;
  }

  var quiet = !!(cmd.parent._optionValues.quiet),
      mute = !!(cmd.parent._optionValues.mute),
      readMode = (!options.input || options.input === '' || options.input === true) ? 'stdin' : 'file',
      writeMode = (!options.output || options.output === '' || options.output === true) ? 'stdout' : 'file',
      msgMode = (writeMode === 'file') ? 'stdout' : 'stderr',
      // initiate Messenger helper, can maybe be replaced with commanderjs internal stuff
      messenger = new Messenger(msgMode, quiet, mute),
      defaultOptions = showdown.getDefaultOptions(true),
      input, output;

  // deal with flavor first since config flag overrides flavor individual options
  if (options.flavor) {
    messenger.printMsg('Enabling flavor ' + options.flavor + '...');
    var flavorOptions = showdown.getFlavorOptions(options.flavor);
    if (!flavorOptions) {
      messenger.errorExit(new Error('Flavor ' + options.flavor + ' is not recognised. Available flavors: ' + getAvailableFlavors().join(', ')));
      return;
    }
    defaultOptions = flavorOptions;
    messenger.printMsg('OK!');
  }
  // store config options in the options.config as an object
  options.config = parseShowdownOptions(options.config, defaultOptions, messenger);

  // print enabled options
  for (var o in options.config) {
    if (options.config.hasOwnProperty(o) && options.config[o] === true) {
      messenger.printMsg('Enabling option ' + o);
    }
  }

  // initialize the converter
  messenger.printMsg('\nInitializing converter...');
  var converter;
  try {
    converter = new showdown.Converter(options.config);
  } catch (e) {
    messenger.errorExit(e);
    return;
  }
  messenger.printMsg('OK!');

  // load extensions
  if (options.extensions) {
    messenger.printMsg('\nLoading extensions...');
    for (var i = 0; i < options.extensions.length; ++i) {
      try {
        messenger.printMsg(options.extensions[i]);
        var ext = require(resolveExtensionPath(options.extensions[i]));
        converter.addExtension(ext, options.extensions[i]);
        messenger.printMsg(options.extensions[i] + ' loaded...');
      } catch (e) {
        messenger.printError('ERROR: Could not load extension ' + options.extensions[i] + '. Reason:');
        messenger.errorExit(e);
      }
    }
  }

  messenger.printMsg('...');
  // read the input
  messenger.printMsg('Reading data from ' + readMode + '...');

  if (readMode === 'stdin') {
    try {
      input = readFromStdIn(options.encoding);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  } else {
    try {
      input = readFromFile(options.input, options.encoding);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  }

  // process the input
  messenger.printMsg('Parsing ' + srcFormat + '...');
  try {
    output = converter[method](input.toString());
  } catch (err) {
    messenger.errorExit(err);
    return;
  }

  // write the output
  messenger.printMsg('Writing data to ' + writeMode + '...');
  if (writeMode === 'stdout') {
    try {
      // okExit is called from within writeToStdOut once the data is flushed
      writeToStdOut(output, options.outputEncoding, messenger);
      return;
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  } else {
    try {
      writeToFile(output, options.output, options.append, options.outputEncoding);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  }
  messenger.okExit();
}
