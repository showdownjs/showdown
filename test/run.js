var showdown    = new require('../src/showdown'),
    convertor   = new showdown.converter(),
    fs          = require('fs'),
    path        = require('path'),
    should      = require('should');

// Load test cases from disk
var cases = fs.readdirSync('test/cases').filter(function(file){
    return ~file.indexOf('.md');
}).map(function(file){
    return file.replace('.md', '');
});

// Run each test case
cases.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it (name, function(){
        var mdpath = path.join('test/cases', test + '.md'),
            htmlpath = path.join('test/cases', test + '.html'),
            md = fs.readFileSync(mdpath, 'utf8'),
            expected = fs.readFileSync(htmlpath, 'utf8').trim(),
            actual = convertor.makeHtml(md).trim();

        // Normalize line returns
        expected = expected.replace(/\r/g, '');

        // Ignore all leading/trailing whitespace
        expected = expected.split('\n').map(function(x){
            return x.trim();
        }).join('\n');
        actual = actual.split('\n').map(function(x){
            return x.trim();
        }).join('\n');

        // Convert whitespace to a visible character so that it shows up on error reports
        expected = expected.replace(/ /g, '·');
        expected = expected.replace(/\n/g, '•\n');
        actual = actual.replace(/ /g, '·');
        actual = actual.replace(/\n/g, '•\n');

        // Compare
        actual.should.equal(expected);
    });
});