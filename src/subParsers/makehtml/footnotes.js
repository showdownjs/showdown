/**
 * GFM footnotes (cmark-gfm footnotes extension).
 *
 * Runs in two phases (selected by the `phase` argument):
 *   'strip' - before stripLinkDefinitions: collect `[^label]: body` definitions
 *             into globals and replace `[^label]` references that have a definition
 *             with a hashed `<sup>` span (numbered by order of first reference).
 *   'build' - after paragraphs: render the referenced footnotes into a
 *             `<section class="footnotes">` and append it to the document.
 */
showdown.subParser('makehtml.footnotes', function (text, options, globals, phase) {
  'use strict';

  if (!options.footnotes) {
    return text;
  }

  if (phase === 'strip') {
    text = collectDefinitions(text);
    text = replaceReferences(text);
    return text;
  }
  if (phase === 'build') {
    return buildSection(text);
  }
  return text;

  // ---- phase 1a: collect (and remove) `[^label]: body` definitions ----------

  function collectDefinitions (str) {
    globals.gFootnotes = globals.gFootnotes || {};
    str += '¨0';
    let n = str.length,
        out = '',
        i = 0;
    while (i < n) {
      // `i` is always at a line start here; a footnote definition may begin at any line
      // (it can interrupt a paragraph), so we try one at every line.
      let def = tryParseDefinition(str, i);
      if (def) {
        let norm = showdown.helper.cmNormalizeLabel(def.rawLabel);
        if (norm !== '' && showdown.helper.isUndefined(globals.gFootnotes[norm])) {
          globals.gFootnotes[norm] = { bodyRaw: def.body, rawLabel: def.rawLabel };
        }
        i = def.end;
        continue;
      }
      let nl = str.indexOf('\n', i);
      if (nl === -1) {
        out += str.slice(i);
        break;
      }
      out += str.slice(i, nl + 1);
      i = nl + 1;
    }
    return out.replace(/¨0/, '');
  }

  /**
   * Try to parse a single footnote definition starting at `start` (a line start).
   * The body is the same-line remainder plus continuation lines indented by at
   * least 4 spaces (with that 4-space base removed), up to a less-indented line.
   * @returns {{rawLabel: string, body: string, end: number}|null}
   */
  function tryParseDefinition (str, start) {
    let n = str.length,
        j = start,
        sp = 0;
    while (j < n && str.charAt(j) === ' ' && sp < 3) { j++; sp++; }
    if (str.charAt(j) !== '[' || str.charAt(j + 1) !== '^') { return null; }
    j += 2;

    let label = '';
    while (j < n) {
      let c = str.charAt(j);
      if (c === '\\' && j + 1 < n) { label += c + str.charAt(j + 1); j += 2; continue; }
      if (c === ']') { break; }
      // a footnote label may not contain whitespace or a nested '['
      if (c === '[' || /\s/.test(c)) { return null; }
      label += c;
      j++;
    }
    if (str.charAt(j) !== ']' || label === '' || str.charAt(j + 1) !== ':') { return null; }
    j += 2;

    let nl = str.indexOf('\n', j),
        firstEnd = (nl === -1) ? n : nl,
        firstLine = str.slice(j, firstEnd).replace(/^[ \t]+/, '').replace(/¨0$/, ''),
        bodyLines = [];
    if (firstLine !== '') { bodyLines.push(firstLine); }
    let k = (nl === -1) ? n : nl + 1;

    while (k < n) {
      let lineNl = str.indexOf('\n', k),
          lineEnd = (lineNl === -1) ? n : lineNl,
          line = str.slice(k, lineEnd);
      if (line.slice(0, 2) === '¨0') { break; }
      if (/^[ \t]*$/.test(line)) {
        bodyLines.push('');
        k = (lineNl === -1) ? n : lineNl + 1;
        continue;
      }
      if (/^ {4}/.test(line)) {
        bodyLines.push(line.slice(4));
        k = (lineNl === -1) ? n : lineNl + 1;
      } else {
        break;
      }
    }

    while (bodyLines.length && bodyLines[bodyLines.length - 1] === '') { bodyLines.pop(); }
    return { rawLabel: label, body: bodyLines.join('\n'), end: k };
  }

  // ---- phase 1b: replace `[^label]` references with hashed <sup> spans -------

  // Replace inline code spans with `¨FN<n>¨` placeholders so a `[^id]` inside them stays
  // literal. Linear scan (ReDoS-safe): a code span is a back-tick run closed by a run of the
  // same length. Unbalanced runs are left as text. Worst case is sub-quadratic because runs
  // that stay unmatched must have distinct lengths (equal-length runs pair up).
  function hashInlineCodeSpans (str, store) {
    let pieces = [], textStart = 0, i = 0, n = str.length;
    while (i < n) {
      if (str.charAt(i) !== '`') { i++; continue; }
      let j = i;
      while (j < n && str.charAt(j) === '`') { j++; }
      let len = j - i, k = j, close = -1;
      while (k < n) {
        if (str.charAt(k) === '`') {
          let m = k;
          while (m < n && str.charAt(m) === '`') { m++; }
          if (m - k === len) { close = m; break; }
          k = m;
        } else {
          k++;
        }
      }
      if (close !== -1) {
        pieces.push(str.substring(textStart, i));
        store.push(str.substring(i, close));
        pieces.push('¨FN' + (store.length - 1) + '¨');
        textStart = close;
        i = close;
      } else {
        // opening run with no matching closer: leave it as literal text
        i = j;
      }
    }
    pieces.push(str.substring(textStart));
    return pieces.join('');
  }

  function replaceReferences (str, raw) {
    globals.gFootnoteOrder = globals.gFootnoteOrder || [];
    globals.gFootnoteRefs = globals.gFootnoteRefs || {};

    // Protect inline code spans so a `[^id]` inside back-ticks stays literal. A linear scan
    // (not a backtracking regex) keeps this safe on long back-tick runs in attacker input.
    // Fenced/indented code is already hashed before this pass.
    let spans = [];
    str = hashInlineCodeSpans(str, spans);

    // a footnote label may not contain whitespace, so `[^a b]` is not a reference
    str = str.replace(/\[\^([^\s\]]+)]/g, function (whole, rawLabel, offset, full) {
      // an escaped reference (`\[^id]`, an odd number of leading back-slashes) is literal
      let bs = 0, p = offset - 1;
      while (p >= 0 && full.charAt(p) === '\\') { bs++; p--; }
      if (bs % 2 === 1) {
        return whole;
      }
      let norm = showdown.helper.cmNormalizeLabel(rawLabel),
          fn = globals.gFootnotes[norm];
      if (showdown.helper.isUndefined(fn)) {
        return whole;
      }
      let ref = globals.gFootnoteRefs[norm];
      if (showdown.helper.isUndefined(ref)) {
        globals.gFootnoteOrder.push(norm);
        ref = globals.gFootnoteRefs[norm] = {
          number: globals.gFootnoteOrder.length,
          encId: showdown.helper.cmEncodeURI(fn.rawLabel),
          occurrences: 0
        };
      }
      ref.occurrences++;
      let idSuffix = (ref.occurrences === 1) ? '' : '-' + ref.occurrences,
          sup = '<sup class="footnote-ref"><a href="#fn-' + ref.encId +
            '" id="fnref-' + ref.encId + idSuffix + '" data-footnote-ref>' + ref.number + '</a></sup>';
      // `raw` (footnote bodies): emit the markup inline so the nested conversion keeps it;
      // otherwise (main text) hash it so the inline parser leaves it alone.
      return raw ? sup : showdown.helper._hashHTMLSpan(sup, globals);
    });

    // restore the protected code spans
    str = str.replace(/¨FN(\d+)¨/g, function (whole, n) { return spans[n]; });
    return str;
  }

  // ---- phase 2: render the referenced footnotes into a <section> ------------

  function buildSection (str) {
    let order = globals.gFootnoteOrder;
    if (!order || order.length === 0) {
      return str;
    }
    let items = '';
    for (let idx = 0; idx < order.length; idx++) {
      let norm = order[idx],
          fn = globals.gFootnotes[norm],
          ref = globals.gFootnoteRefs[norm],
          body = renderBody(fn.bodyRaw);
      body = insertBackrefs(body, buildBackrefs(ref));
      items += '<li id="fn-' + ref.encId + '">\n' + body + '\n</li>\n';
    }
    return str + '\n<section class="footnotes" data-footnotes>\n<ol>\n' + items + '</ol>\n</section>\n';
  }

  function renderBody (bodyRaw) {
    // Resolve any footnote references nested inside this body, continuing the document's
    // numbering (this may append further footnotes to the order, which buildSection's
    // loop then renders). They are emitted as raw <sup> markup so the nested conversion
    // preserves them.
    let body = replaceReferences(bodyRaw, true);
    // Render the (multi-block) body to complete HTML via a nested conversion. This runs
    // the full block pipeline (indented-code framing, fenced code, block quotes,
    // paragraphs) and leaves no hash placeholders behind, which matters because the
    // section is appended after the main paragraphs pass.
    return globals.converter.makeHtml(body).replace(/\n+$/, '');
  }

  function buildBackrefs (ref) {
    let parts = [];
    for (let j = 1; j <= ref.occurrences; j++) {
      let id = 'fnref-' + ref.encId + (j === 1 ? '' : '-' + j),
          idx = ref.number + (j === 1 ? '' : '-' + j),
          inner = (j === 1) ? '↩' : '↩<sup class="footnote-ref">' + j + '</sup>';
      parts.push('<a href="#' + id + '" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="' +
        idx + '" aria-label="Back to reference ' + idx + '">' + inner + '</a>');
    }
    return parts.join(' ');
  }

  function insertBackrefs (body, backrefs) {
    if (/<\/p>\s*$/.test(body)) {
      return body.replace(/<\/p>\s*$/, ' ' + backrefs + '</p>');
    }
    return body + '\n' + backrefs;
  }
});
