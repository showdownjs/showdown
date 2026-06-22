/**
 * Created by tivie
 */
const fs = require('fs'),
    path = require('path'),
    Command = require('commander').Command,
    program = new Command(),
    path1 = path.resolve(__dirname + '/../dist/showdown.js'),
    path2 = path.resolve(__dirname + '/../../.build/showdown.js');
let showdown,
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
  .option('-m, --mute', 'Mute mode. Does not print anything')
  .option('-v, --verbose', 'Verbose mode. Print extra information about the conversion')
  .option('--color', 'Force colored output even when the output is not a terminal')
  .option('--no-color', 'Disable colored output');

addConversionOptions(
  program.command('makehtml')
    .description('Converts markdown into html')

    .addHelpText('after', '\n\nExamples:')
    .addHelpText('after', '  showdown makehtml -i                     Reads from stdin and outputs to stdout')
    .addHelpText('after', '  showdown makehtml -i foo.md -o bar.html  Reads \'foo.md\' and writes to \'bar.html\'')
    .addHelpText('after', '  showdown makehtml -i *.md -o out/         Converts every md file into the \'out\' directory')
    .addHelpText('after', '  showdown makehtml -i --flavor="github"   Parses stdin using GFM style')

    .addHelpText('after', '\nNote for windows users:')
    .addHelpText('after', 'When reading from stdin, use option -u to set the proper encoding or run `chcp 65001` prior to calling showdown cli to set the command line to utf-8'),
  'Input source. One or more md files or glob patterns. If omitted or empty, reads from stdin. Windows users see note below.',
  'Output target. A html file, or a directory when converting multiple inputs. If omitted or empty, writes to stdout (single input) or beside each source (multiple inputs)'
).action(function (options, command) {
  conversionCommand('makeHtml', 'markdown', options, command);
});

addConversionOptions(
  program.command('makemarkdown')
    .description('Converts html into markdown')

    .addHelpText('after', '\n\nExamples:')
    .addHelpText('after', '  showdown makemarkdown -i                     Reads from stdin and outputs to stdout')
    .addHelpText('after', '  showdown makemarkdown -i foo.html -o bar.md  Reads \'foo.html\' and writes to \'bar.md\'')
    .addHelpText('after', '  showdown makemarkdown -i *.html -o out/      Converts every html file into the \'out\' directory')

    .addHelpText('after', '\nNote for windows users:')
    .addHelpText('after', 'When reading from stdin, use option -u to set the proper encoding or run `chcp 65001` prior to calling showdown cli to set the command line to utf-8'),
  'Input source. One or more html files or glob patterns. If omitted or empty, reads from stdin. Windows users see note below.',
  'Output target. A md file, or a directory when converting multiple inputs. If omitted or empty, writes to stdout (single input) or beside each source (multiple inputs)'
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
    .option('-i, --input [files...]', inputDesc, true)
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
 * Builds a set of ANSI color helpers. When disabled, every helper is the identity
 * function, so call sites can colorize unconditionally.
 * @param {boolean} enabled
 * @returns {{red: function, green: function, yellow: function, cyan: function, dim: function, bold: function}}
 */
function makeColor (enabled) {
  'use strict';
  let esc = String.fromCharCode(27);
  function wrap (open, close) {
    return function (str) {
      return enabled ? (esc + '[' + open + 'm' + str + esc + '[' + close + 'm') : str;
    };
  }
  return {
    red: wrap(31, 39),
    green: wrap(32, 39),
    yellow: wrap(33, 39),
    cyan: wrap(36, 39),
    dim: wrap(2, 22),
    bold: wrap(1, 22)
  };
}

/**
 * Determines whether colored output should be enabled.
 * Explicit --color / --no-color win; then FORCE_COLOR / NO_COLOR env vars;
 * otherwise color is on only when the message stream is a TTY.
 * @param {Command} program The root program (for option source detection)
 * @param {{}} globalOpts Parsed global options
 * @param {string} msgMode 'stdout' or 'stderr' — the stream messages are written to
 * @returns {boolean}
 */
function resolveColorEnabled (program, globalOpts, msgMode) {
  'use strict';
  if (typeof program.getOptionValueSource === 'function' && program.getOptionValueSource('color') === 'cli') {
    return globalOpts.color === true;
  }
  if (process.env.FORCE_COLOR) {
    return true;
  }
  if (process.env.NO_COLOR) {
    return false;
  }
  let stream = (msgMode === 'stdout') ? process.stdout : process.stderr;
  return !!stream.isTTY;
}

/**
 * Messenger helper object to the CLI
 * @param {{writeMode?: string, quiet?: boolean, mute?: boolean, verbose?: boolean, color?: {}}} opts
 * @constructor
 */
function Messenger (opts) {
  'use strict';
  opts = opts || {};
  let writeMode = opts.writeMode || 'stderr',
      mute = !!opts.mute,
      // quiet (and mute) suppress normal informational messages
      suppress = (!!opts.quiet || mute),
      // verbose is ignored when quiet/mute is set — silence wins
      verbose = (!!opts.verbose && !suppress),
      color = opts.color || makeColor(false);
  this._print = (writeMode === 'stdout') ? console.log : console.error;

  this.errorExit = function (e) {
    if (!mute) {
      console.error(color.red(color.bold('ERROR:')) + ' ' + e.message);
      console.error('Run \'showdown <command> -h\' for help');
    }
    process.exit(1);
  };

  this.okExit = function () {
    if (!mute) {
      this._print('\n');
      this._print(color.green('DONE!'));
    }
    process.exit(0);
  };

  this.printMsg = function (msg) {
    if (suppress || mute || !msg) {
      return;
    }
    this._print(msg);
  };

  this.printWarning = function (msg) {
    if (mute) {
      return;
    }
    console.error(color.yellow(msg));
  };

  this.printError = function (msg) {
    if (mute) {
      return;
    }
    console.error(color.red(msg));
  };

  this.printVerbose = function (msg) {
    if (!verbose || !msg) {
      return;
    }
    this._print(color.dim(msg));
  };

}

/**
 * Helper function to show Showdown Options
 */
function showShowdownOptions () {
  'use strict';
  let showdownOptions = showdown.getDefaultOptions(false);
  console.log('\nshowdown config options:');
  // show showdown options
  for (let sopt in showdownOptions) {
    if (showdownOptions.hasOwnProperty(sopt)) {
      console.log('  ' + sopt + ':', '[default=' + showdownOptions[sopt].defaultValue + ']', showdownOptions[sopt].describe);
    }
  }
  console.log('\n\nBoolean options can be enabled with `-c <option>` or `-c <option>=true`, and disabled with `-c <option>=false`.');
  console.log('Example: showdown makehtml -c ghMentions -c headerLevelStart=2 -c ghMentionsLink="https://google.com"');
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
  let flavors = getAvailableFlavors();
  for (let i = 0; i < flavors.length; ++i) {
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
    messenger.printWarning('WARNING: invalid boolean value \'' + rawVal + '\' for option \'' + key + '\', ignored');
    return undefined;
  }

  if (type === 'number') {
    let num = Number(rawVal);
    if (isNaN(num)) {
      messenger.printWarning('WARNING: invalid number value \'' + rawVal + '\' for option \'' + key + '\', ignored');
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
  let shOpt = {};
  for (let d in defaultOptions) {
    if (defaultOptions.hasOwnProperty(d)) {
      shOpt[d] = defaultOptions[d];
    }
  }

  if (!configOptions) {
    return shOpt;
  }

  let optionMeta = showdown.getDefaultOptions(false);

  for (let i = 0; i < configOptions.length; ++i) {
    let opt = configOptions[i],
        key = opt,
        rawVal = true,
        eqIdx = opt.indexOf('=');
    if (eqIdx > -1) {
      key = opt.slice(0, eqIdx);
      rawVal = opt.slice(eqIdx + 1);
    }

    if (!optionMeta.hasOwnProperty(key)) {
      messenger.printWarning('WARNING: unknown option \'' + key + '\', ignored');
      continue;
    }

    let val = coerceOptionValue(key, rawVal, optionMeta[key].type, messenger);
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
    let home = process.env.HOME || process.env.USERPROFILE || '';
    return path.resolve(home, ext.slice(2));
  }
  if (/^[./\\]/.test(ext) || path.isAbsolute(ext)) {
    return path.resolve(process.cwd(), ext);
  }
  return ext;
}

/**
 * Translates a single glob path-segment (supporting * and ?) into an anchored RegExp.
 * @param {string} segment
 * @returns {RegExp}
 */
function globSegmentToRegExp (segment) {
  'use strict';
  let re = '';
  for (let i = 0; i < segment.length; ++i) {
    let ch = segment.charAt(i);
    if (ch === '*') {
      re += '[^/\\\\]*';
    } else if (ch === '?') {
      re += '[^/\\\\]';
    } else {
      re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp('^' + re + '$');
}

/**
 * Expands a list of input patterns into a sorted, de-duplicated list of file paths.
 * Patterns containing * or ? are matched (single level) against their directory;
 * literal paths pass through unchanged. Patterns that match nothing emit a warning.
 * @param {string[]} patterns
 * @param {Messenger} messenger
 * @returns {string[]}
 */
function expandInputs (patterns, messenger) {
  'use strict';
  let files = [];
  for (let i = 0; i < patterns.length; ++i) {
    let pattern = patterns[i];
    if (/[*?]/.test(pattern)) {
      let dir = path.dirname(pattern),
          rx = globSegmentToRegExp(path.basename(pattern)),
          matched = [];
      try {
        let entries = fs.readdirSync(dir || '.');
        for (let j = 0; j < entries.length; ++j) {
          if (rx.test(entries[j])) {
            matched.push(path.join(dir, entries[j]));
          }
        }
      } catch (e) {
        // directory unreadable — treated as no match below
      }
      if (matched.length === 0) {
        messenger.printWarning('WARNING: no files matched \'' + pattern + '\'');
      } else {
        matched.sort();
        files = files.concat(matched);
      }
    } else {
      files.push(pattern);
    }
  }
  // de-duplicate while preserving order
  let seen = {}, unique = [];
  for (let k = 0; k < files.length; ++k) {
    if (!Object.prototype.hasOwnProperty.call(seen, files[k])) {
      seen[files[k]] = true;
      unique.push(files[k]);
    }
  }
  return unique;
}

/**
 * Derives the output file path for a source file (batch / directory output).
 * The source extension is swapped for targetExt; if the source has no known
 * source extension, targetExt is appended.
 * @param {string} srcPath Source file path
 * @param {string} targetExt Target extension including the dot ('.html' or '.md')
 * @param {string[]} srcExts Known (lower-cased) source extensions to strip
 * @param {(string|null)} outDir Output directory, or null to write beside the source
 * @returns {string}
 */
function deriveOutputPath (srcPath, targetExt, srcExts, outDir) {
  'use strict';
  let dir = (outDir !== null) ? outDir : path.dirname(srcPath),
      base = path.basename(srcPath),
      ext = path.extname(base),
      stem = (srcExts.indexOf(ext.toLowerCase()) > -1) ? base.slice(0, base.length - ext.length) : base;
  return path.join(dir, stem + targetExt);
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
  let write = (append) ? fs.appendFileSync : fs.writeFileSync;
  try {
    write(file, Buffer.from(output, encoding || 'utf8'));
  } catch (err) {
    throw new Error('Could not write to file ' + file + ', reason: ' + err.message);
  }
}

/**
 * Returns true if the given path exists and is a directory
 * @param {string} p
 * @returns {boolean}
 */
function isDirectory (p) {
  'use strict';
  try {
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * Builds and configures the converter from the parsed options.
 * Exits the process (via messenger) on a fatal flavor/converter/extension error.
 * @param {{}} options
 * @param {Messenger} messenger
 * @returns {Converter}
 */
function buildConverter (options, messenger) {
  'use strict';
  let defaultOptions = showdown.getDefaultOptions(true);

  // deal with flavor first since config flag overrides flavor individual options
  if (options.flavor) {
    messenger.printMsg('Enabling flavor ' + options.flavor + '...');
    let flavorOptions = showdown.getFlavorOptions(options.flavor);
    if (!flavorOptions) {
      messenger.errorExit(new Error('Flavor ' + options.flavor + ' is not recognised. Available flavors: ' + getAvailableFlavors().join(', ')));
      return null;
    }
    defaultOptions = flavorOptions;
    messenger.printMsg('OK!');
  }
  // store config options in the options.config as an object
  options.config = parseShowdownOptions(options.config, defaultOptions, messenger);

  // print enabled options
  for (let o in options.config) {
    if (options.config.hasOwnProperty(o) && options.config[o] === true) {
      messenger.printMsg('Enabling option ' + o);
    }
  }

  // initialize the converter
  messenger.printMsg('\nInitializing converter...');
  let converter;
  try {
    converter = new showdown.Converter(options.config);
  } catch (e) {
    messenger.errorExit(e);
    return null;
  }
  messenger.printMsg('OK!');

  // load extensions
  if (options.extensions) {
    messenger.printMsg('\nLoading extensions...');
    for (let i = 0; i < options.extensions.length; ++i) {
      try {
        messenger.printMsg(options.extensions[i]);
        let ext = require(resolveExtensionPath(options.extensions[i]));
        converter.addExtension(ext, options.extensions[i]);
        messenger.printMsg(options.extensions[i] + ' loaded...');
      } catch (e) {
        messenger.printError('ERROR: Could not load extension ' + options.extensions[i] + '. Reason:');
        messenger.errorExit(e);
      }
    }
  }
  return converter;
}

/**
 * Converts a list of files (batch / directory output). Continues on per-file errors
 * and exits non-zero if any file failed.
 * @param {string[]} files
 * @param {(string|null)} outDir Output directory, or null to write beside each source
 * @param {Converter} converter
 * @param {string} method
 * @param {string} targetExt
 * @param {string[]} srcExts
 * @param {{}} options
 * @param {Messenger} messenger
 */
function convertBatch (files, outDir, converter, method, targetExt, srcExts, options, messenger) {
  'use strict';
  let failures = 0,
      start = Date.now();
  messenger.printMsg('Converting ' + files.length + ' file(s)...');
  for (let i = 0; i < files.length; ++i) {
    let src = files[i];
    try {
      let text = readFromFile(src, options.encoding),
          out = converter[method](text.toString()),
          dest = deriveOutputPath(src, targetExt, srcExts, outDir);
      writeToFile(out, dest, options.append, options.outputEncoding);
      messenger.printVerbose(src + ' -> ' + dest);
    } catch (err) {
      failures += 1;
      messenger.printError('ERROR: ' + src + ': ' + err.message);
    }
  }
  messenger.printVerbose('Converted ' + (files.length - failures) + '/' + files.length + ' file(s) in ' + (Date.now() - start) + 'ms');
  if (failures > 0) {
    messenger.printError(failures + ' of ' + files.length + ' file(s) failed');
    process.exit(1);
  }
  messenger.okExit();
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

  let globalOpts = cmd.parent._optionValues,
      quiet = !!globalOpts.quiet,
      mute = !!globalOpts.mute,
      verbose = !!globalOpts.verbose,
      targetExt = (method === 'makeHtml') ? '.html' : '.md',
      srcExts = (method === 'makeHtml') ? ['.md', '.markdown', '.mdown', '.mkd', '.mkdn'] : ['.html', '.htm', '.xhtml'],
      // variadic -i yields an array of patterns; `true` (absent / flag-only) means stdin
      inputs = Array.isArray(options.input) ? options.input : (typeof options.input === 'string' && options.input ? [options.input] : []),
      readMode = (inputs.length === 0) ? 'stdin' : 'files',
      outputGiven = !(!options.output || options.output === '' || options.output === true),
      outDir = (outputGiven && isDirectory(options.output)) ? options.output : null;

  // expand globs up-front so we know the file count (and thus where data goes)
  let files = [],
      unmatched = [];
  if (readMode === 'files') {
    files = expandInputs(inputs, {printWarning: function (m) { unmatched.push(m); }});
  }

  // decide whether the converted data goes to stdout (so messages avoid that stream)
  let dataToStdout;
  if (readMode === 'stdin') {
    dataToStdout = !outputGiven;
  } else if (outDir) {
    dataToStdout = false;
  } else if (files.length === 1) {
    dataToStdout = !outputGiven;
  } else {
    dataToStdout = false;
  }
  let msgMode = dataToStdout ? 'stderr' : 'stdout',
      colorEnabled = resolveColorEnabled(cmd.parent, globalOpts, msgMode),
      messenger = new Messenger({writeMode: msgMode, quiet: quiet, mute: mute, verbose: verbose, color: makeColor(colorEnabled)});

  // surface any glob patterns that matched nothing
  for (let w = 0; w < unmatched.length; ++w) {
    messenger.printWarning(unmatched[w]);
  }
  if (readMode === 'files' && files.length === 0) {
    messenger.errorExit(new Error('No input files to process'));
    return;
  }
  if (readMode === 'files') {
    messenger.printVerbose('Resolved ' + files.length + ' input file(s): ' + files.join(', '));
  }

  // reject a single output file for multiple inputs (would clobber)
  if (readMode === 'files' && files.length > 1 && outputGiven && !outDir) {
    messenger.errorExit(new Error('Multiple input files require an output directory; \'' + options.output + '\' is not a directory'));
    return;
  }

  // build the converter (may exit on a fatal flavor/converter/extension error)
  let converter = buildConverter(options, messenger);
  if (!converter) {
    return;
  }

  // batch mode: directory output, or multiple inputs written beside their sources
  if (readMode === 'files' && (outDir || files.length > 1)) {
    convertBatch(files, outDir, converter, method, targetExt, srcExts, options, messenger);
    return;
  }

  // single conversion (stdin or exactly one file)
  messenger.printMsg('...');
  messenger.printMsg('Reading data from ' + (readMode === 'stdin' ? 'stdin' : files[0]) + '...');
  let input;
  try {
    input = (readMode === 'stdin') ? readFromStdIn(options.encoding) : readFromFile(files[0], options.encoding);
  } catch (err) {
    messenger.errorExit(err);
    return;
  }
  messenger.printVerbose('Read ' + Buffer.byteLength(input.toString(), 'utf8') + ' bytes from ' + (readMode === 'stdin' ? 'stdin' : files[0]));

  messenger.printMsg('Parsing ' + srcFormat + '...');
  let output;
  try {
    output = converter[method](input.toString());
  } catch (err) {
    messenger.errorExit(err);
    return;
  }

  if (dataToStdout) {
    messenger.printMsg('Writing data to stdout...');
    try {
      // okExit is called from within writeToStdOut once the data is flushed
      writeToStdOut(output, options.outputEncoding, messenger);
      return;
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  }

  // single input written to an explicit -o file
  let dest = outputGiven ? options.output : deriveOutputPath(files[0], targetExt, srcExts, null);
  messenger.printMsg('Writing data to ' + dest + '...');
  try {
    writeToFile(output, dest, options.append, options.outputEncoding);
  } catch (err) {
    messenger.errorExit(err);
    return;
  }
  messenger.printVerbose((readMode === 'stdin' ? 'stdin' : files[0]) + ' -> ' + dest);
  messenger.okExit();
}
