/**
 * @file      makehtml/inline/autolink.js
 * @summary   Angle-bracket autolinks (CommonMark spec §6.5) plus the Showdown `<www...>` extension.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * Recognizes an `<uri>`, `<email>` or `<www...>` autolink at the scan cursor. cmSpec recognizes any
 * scheme for the `<uri>` form; the Showdown flavors restrict it to http/https/ftp (the `<www...>`
 * and `<email>` forms stay active for every flavor either way).
 *
 * Fires the SAME `makehtml.link.autolink.onCapture`/`.onHash` variant the naked-URL construct
 * fires (inline/nakedUrl.js) — an angle-delimited and a naked autolink are the same kind of link to
 * a listener, so they share one variant name, and (through the family umbrella) every anchor built
 * here also fires `makehtml.link.onCapture`/`.onHash` for listeners that address all links at once.
 * The historic `makehtml.link.angleBrackets.*` family is RETIRED with this file: a listener that
 * targeted angle autolinks specifically now catches them under the `autolink` variant alongside
 * the naked ones — the angle-only hook is deliberately given up (ruling: one `autolink` variant
 * covers every autolink spelling; a listener that must tell them apart can inspect
 * `matches._wholeMatch`, which keeps the angle brackets). The onStart/onEnd lifecycle belongs to the inline engine
 * (`makehtml.inlineEngine.onStart`/`.onEnd`). A declined `<` emits nothing.
 *
 * The angle and naked spellings prepare their hrefs under DIFFERENT URL policies — this file uses
 * `showdown.helper.ANGLE_AUTOLINK_URL_POLICY` (see helpers/gfmAutolinks.js: no `applyBaseUrl`, no
 * entity decoding, no backslash-escape stripping, just `cmEncodeURI` + `&` escaping), while
 * nakedUrl.js uses the LEGACY/CM_GFM policy pair. This is deliberate, not a migration gap: two
 * policies inside one event variant is the spec-mandated shape (CommonMark treats an autolink's
 * enclosed text as the literal destination, never as free text subject to link-destination
 * normalization), and listeners keying off the variant name see one family regardless.
 *
 * `<` is a SHARED trigger character — the raw-HTML constructs (`wholeAnchor`, `rawHtml`) also open
 * on it. The engine arbitrates by priority within the shared `<` bucket: wholeAnchor (10) →
 * autolink (20, this file) → rawHtml (30), reproducing the historic fixed try-order (an angle
 * autolink was always tried before falling back to raw HTML). Declining (returning null) here lets
 * the scanner offer `<` to rawHtml next, then finally to literal-text handling.
 *
 * Deletability: removing this file removes angle-bracket autolinks and nothing else — a `<uri>`,
 * `<email>` or `<www...>` construct simply falls through to raw HTML (if it happens to look like a
 * tag) or literal `<` text, exactly like any other unrecognized angle-delimited text today.
 *
 * This is a `makehtml.inline.*` construct subparser called from the inline engine's scan loop with
 * the scan state — (scan, options, globals) — consuming (returning the new cursor) or declining
 * (returning null); see entity.js for the fuller scan-convention explanation.
 */

/* jshint esnext: false, esversion: 9 */

// Sticky regexes anchored at the scan cursor (lastIndex) so the recognizers never slice the tail of
// the string - keeps the tokenizer linear on `<`-heavy input. Reused across calls; each recognizer
// sets lastIndex before exec and the parse is not re-entrant within a single string. Byte-identical
// to the old makehtml/autolink.js sources (reAutoUri/reAutoEmail/reAutoWww), renamed per convention.
// eslint-disable-next-line no-control-regex -- CommonMark autolinks exclude control chars (\x00-\x20) per spec
const inlineAutolinkUriRegex = /<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\x00-\x20]*>/y;
// Showdown extension: <www...> angle autolinks (cmark-gfm does not autolink these, but the
// explicit <> is unambiguous user intent). Single variable class → linear / ReDoS-safe.
// eslint-disable-next-line no-control-regex -- same control-char exclusion as inlineAutolinkUriRegex
const inlineAutolinkWwwRegex = /<www\.[^<>\x00-\x20]+>/y;
const inlineAutolinkEmailRegex = /<[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*>/y;

/**
 * Build one autolink anchor and run the construct's own capture/hash flow. Shared by all three
 * arms of the handler below (uri, email, www). Returns the final (UNHASHED) anchor HTML — the
 * builds-never-hash convention: the CALLER hash-protects the result with `scan.hashSpan`.
 * @param {string} wholeMatch the whole `<...>` match, angle brackets included
 * @param {string} rawUrl the destination enclosed by the angle brackets (uri/email/www, unencoded)
 * @param {{href: string}} attributes the finished attributes (already run through prepareAnchorAttributes)
 * @param {string} text the anchor body
 * @param {{}} options
 * @param {{}} globals
 * @returns {string}
 */
function inlineAutolinkBuild (wholeMatch, rawUrl, attributes, text, options, globals) {
  'use strict';

  let capture = showdown.Event.dispatchCapture('makehtml.link.autolink.onCapture', wholeMatch, {
    regexp: null,
    matches: {
      _wholeMatch: wholeMatch,
      _url: rawUrl,
      text: text
    },
    attributes: attributes
  }, options, globals);
  let otp;
  if (capture.output && capture.output !== '') {
    // listener-produced output takes precedence and flows raw to the later passes
    otp = capture.output;
  } else {
    // render the (possibly listener-edited) captured text as the anchor body, with the
    // (possibly listener-edited) attributes. All three arms pass plain anchor text — an
    // escaped uri/www or a possibly entity-encoded email address — which never contains inline
    // markdown, so there is nothing to re-parse here.
    otp = '<a' + showdown.helper._populateAttributes(capture.attributes) + '>' + (capture.matches.text || '') + '</a>';
  }
  let hash = showdown.Event.dispatchHash('makehtml.link.autolink.onHash', otp, options, globals);
  return hash.output;
}

showdown.subParser('makehtml.inline.autolink', {

  // `<` is a SHARED trigger: wholeAnchor (10, not yet migrated) → autolink (20, this file) →
  // rawHtml (30, not yet migrated), reproducing the historic fixed try-order — an angle autolink
  // was always tried before falling back to raw HTML.
  triggers: '<',
  priority: 20,

  // Always on: cmSpec/httpsAutoLinks/encodeEmails/safeMode gate HOW each arm matches or renders,
  // not whether the construct participates, so they are internal gates of the handler below.
  enabled: true,

  handler: function (scan, options, globals) {
    'use strict';

    let str = scan.str,
        i = scan.pos;

    // Arm 1 — <uri>. Active for every flavor. cmSpec recognizes any scheme; the Showdown flavors
    // restrict this form to http/https/ftp (the <www...> and <email> arms below stay active for
    // all flavors regardless). The `&` -> `&amp;` href escape is unconditional.
    inlineAutolinkUriRegex.lastIndex = i;
    let uri = inlineAutolinkUriRegex.exec(str);
    if (uri) {
      let raw = uri[0].slice(1, -1);
      if (options.cmSpec || /^(?:https?|ftp):/i.test(raw)) {
        let attributes = showdown.helper.prepareAnchorAttributes(raw, null, options, showdown.helper.ANGLE_AUTOLINK_URL_POLICY),
            text = showdown.helper.escapeHTMLEntities(raw),
            html = inlineAutolinkBuild(uri[0], raw, attributes, text, options, globals);
        scan.appendRaw(scan.hashSpan(html));
        return i + uri[0].length;
      }
    }

    // Arm 2 — <email>. Active for every flavor. encodeEmails entity-encodes the address (href
    // and text) so it works under cmSpec too, mirroring the legacy naked-mail arms; the href is a
    // fully pre-built string (possibly starting with `&#109;...`) that must reach
    // prepareAnchorAttributes untouched, hence `rawHref: true`.
    inlineAutolinkEmailRegex.lastIndex = i;
    let email = inlineAutolinkEmailRegex.exec(str);
    if (email) {
      let raw = email[0].slice(1, -1),
          href, txt;
      if (options.encodeEmails) {
        href = showdown.helper.encodeEmailAddress('mailto:' + raw);
        txt = showdown.helper.encodeEmailAddress(raw);
      } else {
        href = 'mailto:' + showdown.helper.escapeHTMLEntities(raw);
        txt = showdown.helper.escapeHTMLEntities(raw);
      }
      let attributes = showdown.helper.prepareAnchorAttributes(href, null, options, showdown.helper.ANGLE_AUTOLINK_URL_POLICY, true),
          html = inlineAutolinkBuild(email[0], raw, attributes, txt, options, globals);
      scan.appendRaw(scan.hashSpan(html));
      return i + email[0].length;
    }

    // Arm 3 — <www...>. Showdown extension: applies the GFM www rule (http(s):// prepend +
    // showdown.helper.validAutolinkHost domain validation) to the explicitly angle-delimited
    // shortcut. Active for all flavors.
    inlineAutolinkWwwRegex.lastIndex = i;
    let www = inlineAutolinkWwwRegex.exec(str);
    if (www) {
      let raw = www[0].slice(1, -1),
          host = raw.split(/[/?#]/)[0];
      // GFM www rule: the domain after "www." must contain a period, plus the shared host
      // validation (>= 2 labels, last two labels have no "_").
      if (host.slice(4).indexOf('.') !== -1 && showdown.helper.validAutolinkHost(raw, true)) {
        // noinspection HttpUrlsUsage
        let full = (options.httpsAutoLinks ? 'https://' : 'http://') + raw,
            attributes = showdown.helper.prepareAnchorAttributes(full, null, options, showdown.helper.ANGLE_AUTOLINK_URL_POLICY),
            text = showdown.helper.escapeHTMLEntities(raw),
            html = inlineAutolinkBuild(www[0], raw, attributes, text, options, globals);
        scan.appendRaw(scan.hashSpan(html));
        return i + www[0].length;
      }
    }

    // Decline: no autolink at the cursor. The scanner offers `<` to rawHtml next, then finally
    // to literal-text handling.
    return null;
  }
});
