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
  version = require('../../package.json');
}


program
  .name('showdown')
  .description('CLI to Showdownjs markdown parser v' + version)
  .version(version)
  .usage('<command> [options]')
  .option('-q, --quiet', 'Quiet mode. Only print errors')
  .option('-m, --mute', 'Mute mode. Does not print anything');

program.command('makehtml')
  .description('Converts markdown into html')

  .addHelpText('after', '\n\nExamples:')
  .addHelpText('after', '  showdown makehtml -i                     Reads from stdin and outputs to stdout')
  .addHelpText('after', '  showdown makehtml -i foo.md -o bar.html  Reads \'foo.md\' and writes to \'bar.html\'')
  .addHelpText('after', '  showdown makehtml -i --flavor="github"   Parses stdin using GFM style')

  .addHelpText('after', '\nNote for windows users:')
  .addHelpText('after', 'When reading from stdin, use option -u to set the proper encoding or run `chcp 65001` prior to calling showdown cli to set the command line to utf-8')

  .option('-i, --input [file]', 'Input source. Usually a md file. If omitted or empty, reads from stdin. Windows users see note below.', true)
  .option('-o, --output [file]', 'Output target. Usually a html file. If omitted or empty, writes to stdout', true)
  .option('-u, --encoding <encoding>', 'Sets the input encoding', 'utf8')
  .option('-y, --output-encoding <encoding>', 'Sets the output encoding', 'utf8')
  .option('-a, --append', 'Append data to output instead of overwriting. Ignored if writing to stdout', false)
  .option('-e, --extensions <extensions...>', 'Load the specified extensions. Should be valid paths to node compatible extensions')
  .option('-p, --flavor <flavor>', 'Run with a predetermined flavor of options. Default is vanilla', 'vanilla')
  .option('-c, --config <config...>', 'Enables showdown makehtml parser config options (example: strikethrough). Overrides flavor')
  .option('--config-help', 'Shows configuration options for showdown parser')
  .action(makehtmlCommand);

program.parse();


//
// HELPER FUCNTIONS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Messenger helper object to the CLI
 * @param {string} writeMode
 * @param {boolean} supress
 * @param {boolean} mute
 * @constructor
 */
function Messenger (writeMode, supress, mute) {
  'use strict';
  writeMode = writeMode || 'stderr';
  supress = (!!supress || !!mute);
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
    if (supress || mute || !msg) {
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
  console.log('\nshowdown makehtml config options:');
  // show showdown options
  for (var sopt in showdownOptions) {
    if (showdownOptions.hasOwnProperty(sopt)) {
      console.log('  ' + sopt + ':', '[default=' + showdownOptions[sopt].defaultValue + ']',showdownOptions[sopt].describe);
    }
  }
  console.log('\n\nExample: showdown makehtml -c openLinksInNewWindow ghMentions ghMentionsLink="https://google.com"');
}

/**
 * Helper function to parse showdown options
 * @param {{}} configOptions
 * @param {{}} defaultOptions
 * @returns {{}}
 */
function parseShowdownOptions (configOptions, defaultOptions) {
  'use strict';
  var shOpt = defaultOptions;

  // first prepare passed options
  if (configOptions) {
    for (var i = 0; i < configOptions.length; ++i) {
      var opt = configOptions[i],
          key = configOptions[i],
          val = true;
      if (/=/.test(opt)) {
        key = opt.split('=')[0];
        val = opt.split('=')[1];
      }
      shOpt[key] = val;
    }
  }
  return shOpt;
}

/**
 * Reads stdin
 * @returns {string}
 */
function readFromStdIn (encoding) {
  'use strict';
  var size = fs.fstatSync(process.stdin.fd).size;
  if (size <= 0) {
    throw new Error('Could not read from stdin, reason: stdin is empty');
  }
  encoding = encoding || 'utf8';
  try {
    return size > 0 ? fs.readFileSync(process.stdin.fd, encoding).toString() : '';
  } catch (e) {
    throw new Error('Could not read from stdin, reason: ' + e.message);
  }
}

/**
 * Reads from a file
 * @param {string} file Filepath to dile
 * @param {string} encoding Encoding of the file
 * @returns {Buffer}
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
 * @param {string} html
 * @returns {boolean}
 */
function writeToStdOut (html) {
  'use strict';
  if (!process.stdout.write(html)) {
    throw new Error('Could not write to StdOut');
  }
}

/**
 * Writes to file
 * @param {string} html HTML to write
 * @param {string} file Filepath
 * @param {boolean} append If the result should be appended
 */
function writeToFile (html, file, append) {
  'use strict';
  // If a flag is passed, it means we should append instead of overwriting.
  // Only works with files, obviously
  var write = (append) ? fs.appendFileSync : fs.writeFileSync;
  try {
    write(file, html);
  } catch (err) {
    throw new Error('Could not write to file ' + file + ', readon: ' + err.message);
  }
}

/**
 * makehtml command
 * @param {{}} options
 * @param {Command} cmd
 */
function makehtmlCommand (options, cmd) {
  'use strict';

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
      md, html;

  // deal with flavor first since config flag overrides flavor individual options
  if (options.flavor) {
    messenger.printMsg('Enabling flavor ' + options.flavor + '...');
    defaultOptions = showdown.getFlavorOptions(options.flavor);
    if (!defaultOptions) {
      messenger.errorExit(new Error('Flavor ' + options.flavor + ' is not recognised'));
      return;
    }
    messenger.printMsg('OK!');
  }
  // store config options in the options.config as an object
  options.config = parseShowdownOptions(options.config, defaultOptions);

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
        var ext = require(options.extensions[i]);
        converter.addExtension(ext, options.extensions[i]);
        messenger.printMsg(options.extensions[i] + ' loaded...');
      } catch (e) {
        messenger.printError('Could not load extension ' + options.extensions[i] + '. Reason:');
        messenger.errorExit(e);
      }
    }
  }

  messenger.printMsg('...');
  // read the input
  messenger.printMsg('Reading data from ' + readMode + '...');

  if (readMode === 'stdin') {
    try {
      md = readFromStdIn(options.encoding);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  } else {
    try {
      md = readFromFile(options.input, options.encoding);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  }

  // process the input
  messenger.printMsg('Parsing markdown...');
  html = converter.makeHtml(md);

  // write the output
  messenger.printMsg('Writing data to ' + writeMode + '...');
  if (writeMode === 'stdout') {
    try {
      writeToStdOut(html);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  } else {
    try {
      writeToFile(html, options.output, options.append);
    } catch (err) {
      messenger.errorExit(err);
      return;
    }
  }
  messenger.okExit();
}
