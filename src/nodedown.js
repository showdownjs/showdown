var Showdown = require('./showdown');
var fs = require('fs');

var converter = new Showdown.converter();

if(process.argv.length > 2) {
    fs.readFile(process.argv[2], function(err, data) {
        if(err) {
            console.log("Error: Invalid file");
        } else {
            console.log(converter.makeHtml(data.toString()));
        }
    })
} else {
    console.log("Error: No file given");
}
