var showdown    = new require('../src/showdown'),
    fs          = require('fs'),
    path        = require('path'),
    should      = require('should');


var runTestsInDir = function(dir, converter) {

    // Load test cases from disk
    var cases = fs.readdirSync(dir).filter(function(file){
        return ~file.indexOf('.md');
    }).map(function(file){
        return file.replace('.md', '');
    });

    // Run each test case (markdown -> html)
    showdown.forEach(cases, function(test){
        var name = test.replace(/[-.]/g, ' ');
        it (name, function(){
            var mdpath = path.join(dir, test + '.md'),
                htmlpath = path.join(dir, test + '.html'),
                md = fs.readFileSync(mdpath, 'utf8'),
                expected = fs.readFileSync(htmlpath, 'utf8').trim(),
                actual = converter.makeHtml(md).trim();

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
};


//
// :: Markdown to HTML testing ::
//

describe('Markdown', function() {
    var converter = new showdown.converter();
    runTestsInDir('test/cases', converter);
});


//
// :: Extensions Testing ::
//

if (path.existsSync('test/extensions')) {

    describe('extensions', function() {
        // Search all sub-folders looking for directory-specific tests
        var extensions = fs.readdirSync('test/extensions').filter(function(file){
            return fs.lstatSync('test/extensions/' + file).isDirectory();
        });

        // Run tests in each extension sub-folder
        showdown.forEach(extensions, function(ext){
            // Make sure extension exists
            var src = 'src/extensions/' + ext + '.js';
            if (!path.existsSync(src)) {
                throw "Attempting tests for '" + ext + "' but source file (" + src + ") was not found.";
            }

            var converter = new showdown.converter({ extensions: [ ext ] });
            var dir = 'test/extensions/' + ext;
            runTestsInDir(dir, converter);
        });
    });

}
