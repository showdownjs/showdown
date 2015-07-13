'use strict';

var version = require('../../package.json').version,
    yargs = require('yargs');

yargs
  .version(version, 'v')
  .alias('v', 'version')
  .option('h', {
    alias: 'help',
    description: 'Show help'
  })
  .usage('Usage: showdown <command> [options]')
  .demand(1, 'You must provide a valid command')
  .command('makehtml', 'Converts markdown into html')
  .example('showdown makehtml -i foo.md -o bar.html', 'Converts \'foo.md\' to \'bar.html\'')
  .wrap(yargs.terminalWidth());

var argv = yargs.argv,
  command = argv._[0];
if (command === 'makehtml') {
  require('./makehtml.cmd.js').run();
} else {
  yargs.showHelp();
}

if (argv.help) {
  yargs.showHelp();
}
process.exit(0);
