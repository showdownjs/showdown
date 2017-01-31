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

module.exports = Messenger;
