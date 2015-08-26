var yargs = require('yargs'),
    fs = require('fs'),
    errorExit = require('./errorexit.js'),
    showdown = require('../../dist/showdown');

yargs.reset()
  .usage('Usage: showdown makehtml [options]')
  .example('showdown makehtml -i', 'Reads from stdin and outputs to stdout')
  .example('showdown makehtml -i foo.md -o bar.html', 'Reads \'foo.md\' and writes to \'bar.html\'')
  //.demand(['i'])
  .option('i', {
    alias : 'input',
    describe: 'Input source. Usually a md file. If omitted or empty, reads from stdin',
    type: 'string'
  })
  .option('o', {
    alias : 'output',
    describe: 'Output target. Usually a html file. If omitted or empty, writes to stdout',
    type: 'string',
    default: false
  })
  .option('u', {
    alias : 'encoding',
    describe: 'Input encoding',
    type: 'string'
  })
  .option('a', {
    alias : 'append',
    describe: 'Append data to output instead of overwriting',
    type: 'string'
  })
  .option('e', {
    alias : 'extensions',
    describe: 'Load the specified extensions. Should be valid paths to node compatible extensions',
    type: 'array'
  })
  .config('c')
  .alias('c', 'config')
  .help('h')
  .alias('h', 'help');

yargs.options(showdown.getDefaultOptions(false));
argv = yargs.argv;

function run() {
  'use strict';
  var input = '',
    enc = 'utf8',
    output;

  if (argv.encoding) {
    enc = argv.encoding;
  }

  // to avoid passing extensions to converter
  delete argv.extensions;
  var converter = new showdown.Converter(argv);

  // Load extensions
  if (argv.e) {
    for (var i = 0; i < argv.e.length; ++i) {
      loadExtension(argv.e[i], converter);
    }
  }

  if (!argv.i || argv.i === '') {
    // 'i' is undefined or empty, read from stdin
    try {
      var size = fs.fstatSync(process.stdin.fd).size;
      input = size > 0 ? fs.readSync(process.stdin.fd, size)[0] : '';
    } catch (e) {
      var err = new Error('Could not read from stdin, reason: ' + e.message);
      errorExit(err);
    }
  } else {
    // 'i' has a value, read from file
    try {
      input = fs.readFileSync(argv.i, enc);
    } catch (err) {
      errorExit(err);
    }
  }

  // parse and convert file
  output = converter.makeHtml(input);

  // Write output
  if (!argv.o || argv.o === '') {
    // o is undefined or empty, write to stdout
    process.stdout.write(output);
    // we won't print anything since it would conspurcate stdout and,
    // consequently, the outputted file
  } else {
    // o is has a value, presumably a file, write to it.

    // If a flag is passed, it means we should append instead of overwriting.
    // Only works with files, obviously
    var write = (argv.a) ? fs.appendFileSync : fs.writeFileSync;

    try {
      write(argv.o, output);
    } catch (err) {
      errorExit(err);
    }
    console.error('DONE!');
  }
}

function loadExtension(path, converter) {
  'use strict';
  var ext;
  try {
    ext = require(path);
    converter.addExtension(ext, path);
  } catch (e) {
    console.error('Could not load extension ' + path + '. Reason:');
    console.error(e.message);
  }
}

module.exports = exports = {
  run: run
};
