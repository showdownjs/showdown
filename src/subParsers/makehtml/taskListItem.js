////
// makehtml/taskListItem.js
// Copyright (c) 2024 ShowdownJS
//
// GFM task-list item renderer, shared by both list parsers.
//
// Given the raw text of a single list item, it matches a leading `[ ]`/`[x]`
// marker plus the rest of that line and renders the marker as a disabled
// `<input type="checkbox">`, leaving the line's text in place for the caller to
// parse further. It runs at the same (raw, pre-parse) stage in both
// `makehtml.list` (the default regex parser) and `makehtml.cmList` (the
// commonmark container-block parser), so the events below always expose the
// task item's raw source line on either path.
//
// Events:
//   makehtml.taskListItem.onCapture - fired on a matched task line. `input` and
//     `_wholeMatch` are the full source line (`[ ] foo *bar*`); `attributes`
//     are the checkbox attributes. Returning output overrides the whole line.
//   makehtml.taskListItem.onHash    - fired with the rendered line
//     (`<input ...> foo *bar*`) before it is handed back to the caller.
//
// ***Author:***
// - Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
////


showdown.subParser('makehtml.taskListItem', function (text, options, globals) {
  'use strict';

  if (!options.tasklists) {
    return text;
  }

  // Match the marker and the remainder of its (first) line. The text is captured so
  // the events expose the full line, not just the checkbox; everything after the line
  // is left untouched for the caller's block/span parsing.
  const taskItemRgx = /^([ \t]*)\[([xX ])]([^\n]*)/;
  return text.replace(taskItemRgx, function (wm, prefix, checkedRaw, lineText) {
    let checked = checkedRaw.trim() !== '';

    // GFM spec output is a bare `<input disabled type="checkbox">` (checked items add a
    // leading `checked`). Only when `moreStyling` is enabled do we keep the legacy inline
    // style that visually aligns the checkbox.
    let attributes = options.moreStyling ?
      {
        type: 'checkbox',
        disabled: true,
        style: 'margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;',
        checked: checked
      } :
      (checked ?
        { checked: true, disabled: true, type: 'checkbox' } :
        { disabled: true, type: 'checkbox' });

    let captureStartEvent = new showdown.Event('makehtml.taskListItem.onCapture', wm);
    captureStartEvent
      .setOutput(null)
      ._setGlobals(globals)
      ._setOptions(options)
      .setRegexp(taskItemRgx)
      .setMatches({
        _wholeMatch: wm,
        _taskListButton: prefix + '[' + checkedRaw + ']',
        _taskListButtonChecked: checkedRaw,
        _taskListItemText: lineText
      })
      .setAttributes(attributes);
    captureStartEvent = globals.converter.dispatch(captureStartEvent);

    let otp;
    if (captureStartEvent.output && captureStartEvent.output !== '') {
      otp = captureStartEvent.output;
    } else {
      attributes = captureStartEvent.attributes;
      let txt = captureStartEvent.matches._taskListItemText;
      otp = prefix + '<input' + showdown.helper._populateAttributes(attributes) + '>' + txt;
    }

    let beforeHashEvent = new showdown.Event('makehtml.taskListItem.onHash', otp);
    beforeHashEvent
      .setOutput(otp)
      ._setGlobals(globals)
      ._setOptions(options);
    beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
    return beforeHashEvent.output;
  });
});
