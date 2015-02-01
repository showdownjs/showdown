var Showdown = require('./showdown');
var cli = require('cli');
var fs = require('fs');

var converter = new Showdown.converter();

/*
If an argument is given, treat it as the file to be read.
Otherwise, read from stdin.
*/
if(process.argv.length > 2) {
    fs.readFile(process.argv[2], function(err, data) {
        if(err) {
            console.error("Error: Invalid file");
        } else {
            console.log(converter.makeHtml(data.toString()));
        }
    })
} else {
    cli.withStdin(function(data) {
        this.output(converter.makeHtml(data.toString()));
    })
}
