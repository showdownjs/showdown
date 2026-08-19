/**
 * @file       makehtml/figure.js
 * @summary    Block-level `<figure>`/`<figcaption>` wrapping for standalone images (opt-in via `useFigure`).
 * @authors    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 *             Thomas Hunter II <me@thomashunter.name>
 * @copyright  2018-2026 ShowdownJS
 * @license    MIT
 *
 * A block-level construct, not an inline one: it owns the case where an image *stands alone as a
 * block*. When the `figure` option is on, any image syntax (`![alt](src)` or the reference form
 * `![alt][id]`) that is the sole content of its block — a lone image with a blank line before and
 * after and no other text around it — is rendered as
 *
 *     <figure><img src="src" alt="alt" /><figcaption>alt</figcaption></figure>
 *
 * instead of being wrapped in a paragraph. The image's alt text becomes the `<figcaption>` (an image
 * with empty alt is left as a plain `<img>`, since there is no caption to show). Images that appear
 * inline — mixed with surrounding text in a paragraph — are untouched and keep rendering as `<img>`;
 * only the standalone-block case is promoted to a `<figure>`, which is block-level content and must
 * therefore sit outside `<p>` to produce valid HTML.
 *
 * With `figure` off (the default) this pass is a no-op and images render exactly as before.
 */
showdown.subParser('makehtml.figure', function (text, options, globals) {
  'use strict';

  if (!options.figures) {
    return text;
  }

  let startEvent = showdown.Event.dispatchStart('makehtml.figure.onStart', text, options, globals);
  text = startEvent.output;

  let afterEvent = showdown.Event.dispatchEnd('makehtml.codeBlock.onEnd', text, options, globals);
  return afterEvent.output;

});
