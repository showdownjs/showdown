var Showdown = require('../src/showdown');
var fs = require('fs');

module.exports = {
    setUp:function(callback) {
        this.showdown = new Showdown.converter({extensions:['table']});
        callback();
    },
    testMakeHtml:function(test) {
        var html = this.showdown.makeHtml("**blah**");
        console.log(html);
        test.equals(html ,'<p><strong>blah</strong></p>');
        test.done();
    },
    testMakeTable:function(test) {
        var md = fs.readFileSync('test/extensions/table/multiple-tables.md','UTF-8');
        var html = fs.readFileSync('test/extensions/table/multiple-tables.html','UTF-8');

        var result = this.showdown.makeHtml(md);
        console.log(result);
        test.equals(result, html);
        test.done();
    }
};