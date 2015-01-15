/**
 * Created by Estevao on 11-01-2015.
 */

showdown.subParser('headers', function (text, options, globals) {
    'use strict';

    // Set text-style headers:
    //	Header 1
    //	========
    //
    //	Header 2
    //	--------
    //
    text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
        function (wholeMatch, m1) {
            return showdown.subParser('hashBlock')('<h1 id="' + headerId(m1) + '">' +
            showdown.subParser('spanGamut')(m1, options, globals) + '</h1>', options, globals);
        });

    text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
        function (matchFound, m1) {
            return showdown.subParser('hashBlock')('<h2 id="' + headerId(m1) + '">' +
            showdown.subParser('spanGamut')(m1, options, globals) + '</h2>', options, globals);
        });

    // atx-style headers:
    //  # Header 1
    //  ## Header 2
    //  ## Header 2 with closing hashes ##
    //  ...
    //  ###### Header 6
    //

    /*
     text = text.replace(/
     ^(\#{1,6})				// $1 = string of #'s
     [ \t]*
     (.+?)					// $2 = Header text
     [ \t]*
     \#*						// optional closing #'s (not counted)
     \n+
     /gm, function() {...});
     */

    text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
        function (wholeMatch, m1, m2) {
            var span = showdown.subParser('spanGamut')(m2, options, globals),
                header = '<h' + m1.length + ' id="' + headerId(m2) + '">' + span + '</h' + m1.length + '>';

            return showdown.subParser('hashBlock')(header, options, globals);
        });

    function headerId(m) {
        return m.replace(/[^\w]/g, '').toLowerCase();
    }

    return text;
});
