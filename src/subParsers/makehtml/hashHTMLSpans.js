/**
 * Hash span elements that should not be parsed as markdown
 */
showdown.subParser('makehtml.hashHTMLSpans', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashHTMLSpans.before', text, options, globals).getText();

  // Hash Self Closing tags
  text = text.replace(/<[^>]+?\/>/gi, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash tags without properties
  text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash tags with properties
  text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  // Hash self closing tags without />
  text = text.replace(/<[^>]+?>/gi, function (wm) {
    return showdown.helper._hashHTMLSpan(wm, globals);
  });

  text = globals.converter._dispatch('makehtml.hashHTMLSpans.after', text, options, globals).getText();
  return text;
});

/**
 * Unhash HTML spans
 */
showdown.subParser('makehtml.unhashHTMLSpans', function (text, options, globals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.unhashHTMLSpans.before', text, options, globals).getText();

  var replacedSpans = [];

  for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
    var repText = globals.gHtmlSpans[i],
        // limiter to prevent infinite loop (assume 10 as limit for recurse)
        limit = 0;

    while (/¨C(\d+)C/.test(repText)) {
      var num = RegExp.$1;
      repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
      if (limit === 10) {
        console.error('maximum nesting of 10 spans reached!!!');
        break;
      }
      ++limit;
    }

    replacedSpans.push(repText);
  }

  // It is important to only do one replace for all the spans combined.
  // Otherwise this gets really slow on large texts with many spans because
  // of all the string copies.
  text = text.replace(/¨C(\d+)C/g, function (_wm, num) {
    return replacedSpans[num];
  });

  text = globals.converter._dispatch('makehtml.unhashHTMLSpans.after', text, options, globals).getText();
  return text;
});
