showdown.subParser('italicsAndBold', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

  // it's faster to have 3 separate regexes for each case than have just one
  // because of backtracing, in some cases, it could lead to an exponential effect
  // called "catastrophic backtrace". Ominous!

  // Parse underscores
  if (options.literalMidWordUnderscores) {
    text = text.replace(/\b___(\S[\s\S]*)___\b/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\b__(\S[\s\S]*)__\b/g, '<strong>$1</strong>');
    text = text.replace(/\b_(\S[\s\S]*?)_\b/g, '<em>$1</em>');
  } else {
    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
      return (/\S$/.test(m)) ? '<strong><em>' + m + '</em></strong>' : wm;
    });
    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
      return (/\S$/.test(m)) ? '<strong>' + m + '</strong>' : wm;
    });
    text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
      return (/\S$/.test(m)) ? '<em>' + m + '</em>' : wm;
    });
  }

  // Now parse asterisks
  text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
    return (/\S$/.test(m)) ? '<strong><em>' + m + '</em></strong>' : wm;
  });
  text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
    return (/\S$/.test(m)) ? '<strong>' + m + '</strong>' : wm;
  });
  text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
    // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
    return (/\S$/.test(m)) ? '<em>' + m + '</em>' : wm;
  });

  text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
  return text;
});
