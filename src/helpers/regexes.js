/**
 * @file      helpers/regexes.js
 * @summary   Shared precompiled regexes and the CommonMark raw-HTML grammar source strings they are built from.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * `showdown.helper.regexes` plus the `cm*` grammar constants it is assembled from. These have load-time interdependencies (the constants feed the object literal), so they MUST stay together in this single file; because src/helpers/ is concatenated alphabetically, nothing here may read another helper's state at load time.
 */

/**
 * Common regexes.
 * We declare some common regexes to improve performance
 */
// CommonMark inline raw-HTML grammar (mirrors commonmark.js' HTMLTAG): an open tag,
// close tag, HTML comment, processing instruction, declaration or CDATA section.
let cmAttributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*',
    cmAttributeValue = '(?:[^"\'=<>`\\x00-\\x20]+|\'[^\']*\'|"[^"]*")',
    cmAttribute = '(?:\\s+' + cmAttributeName + '(?:\\s*=\\s*' + cmAttributeValue + ')?)',
    cmOpenTag = '<[A-Za-z][A-Za-z0-9\\-]*' + cmAttribute + '*\\s*/?>',
    cmCloseTag = '</[A-Za-z][A-Za-z0-9\\-]*\\s*>',
    // Deliberate deviation from CommonMark: `--!>` (the HTML "comment end bang" state) also
    // terminates a comment, matching browser parsing of the output — recognizing only `-->`
    // lets content the parser believes is commented out leak through as live HTML
    // (js/bad-tag-filter). The content loop excludes both terminators.
    cmHTMLComment = '<!-->|<!--->|<!--(?:[^-]|-[^-]|--(?:[^>!]|![^>]))*--!?>',
    cmProcessingInstruction = '<[?][\\s\\S]*?[?]>',
    cmDeclaration = '<![A-Za-z]+[^>]*>',
    cmCDATA = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

showdown.helper.regexes = {
  // The set of characters that would re-trigger emphasis/emoji/strikethrough recognition if left
  // bare inside generated anchor/image text (a URL, a title, an image alt) — escaped via
  // showdown.helper.escapePlaceholder so later passes leave them alone. Scheduled for a later
  // refactor (naming/location under review) — kept as-is here for now.
  asteriskDashTildeAndColon: /([*_:~])/g,
  // Source string (not a RegExp) for the CommonMark inline raw-HTML grammar. Its consumer is
  // the inline raw-HTML construct (makehtml/inline/rawHtml.js), which builds one sticky RegExp from it
  // and anchors it at the scan cursor. Note that file recognizes the `cmHTMLComment` alternative
  // with a cursor scan of its own instead of this regex — see the rationale there before
  // changing this production.
  cmHTMLTagSource:           '(?:' + cmOpenTag + '|' + cmCloseTag + '|' + cmHTMLComment +
                               '|' + cmProcessingInstruction + '|' + cmDeclaration + '|' + cmCDATA + ')',
  // Open and close tag sources on their own, used for the CommonMark "type 7" HTML
  // block start condition (a complete tag that fills the line).
  cmOpenTagSource:           cmOpenTag,
  cmCloseTagSource:          cmCloseTag
};
