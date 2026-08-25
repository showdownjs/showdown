/**
 * @file      makehtml/blockEngine.js
 * @summary   The block engine: construct-agnostic infrastructure for the block layer.
 * @author    Estêvão Soares dos Santos (Tivie) <https://github.com/tivie>
 * @copyright 2018-2026 ShowdownJS
 * @license   MIT
 *
 * The registry-driven successor to blockGamut's hardwired dispatch. Like the inline engine, it
 * owns only what every block construct shares and knows NOTHING about any specific construct: no
 * construct name or ordering may appear in this file. Block constructs live in
 * src/subParsers/makehtml/block/ (one file per syntax: recognition, rendering, events and option
 * gates) and register through the ordinary `showdown.subParser()` call — with a definition
 * OBJECT instead of a function — under the `makehtml.block.*` namespace, which is what marks
 * them as this engine's constructs:
 *
 *   showdown.subParser('makehtml.block.<name>', {
 *     priority: {number}   explicit pipeline position (lower runs first). Required —
 *                          registration order is alphabetical file order under the concat model
 *                          and carries no meaning.
 *     enabled:  {boolean|function} whether the construct participates: `true`, or
 *                          (options) -> boolean for option-gated constructs. Part of every
 *                          definition — when omitted the engine normalizes it to `true`. The
 *                          engine sets it to true or false based on the conversion options at
 *                          pipeline build (a disabled construct never enters the pipeline);
 *                          passes can still test options for their internal gates if needed.
 *     pass:     {function} (text, options, globals) -> text; the construct's whole-text pass.
 *   });
 *
 * (The definition shape is provisional — it gets pinned when the block increments start; the
 * inline layer converts first.) Deleting a construct file removes exactly that syntax and
 * nothing else changes.
 *
 * Dispatch model (current): the block layer is a pipeline of whole-text passes; the engine
 * enumerates `showdown.getSubParserList()` for `makehtml.block.*` definition objects (entries
 * that are plain functions are ignored), validates them here — at pipeline build, failing loudly
 * on first use — filters by `enabled(options)` and runs the passes in `priority` order (ties
 * broken by name for determinism). The registration contract is deliberately independent of that
 * model: the planned line-driven container scanner (containers open/close per line, leaves
 * collect inline content) replaces the engine internals behind the same contract, without
 * touching the construct files.
 */

/* jshint esnext: false, esversion: 9 */

// The block engine pass. Callers invoke it like any other subparser
// (`showdown.subParser('makehtml.blockEngine')(text, options, globals)`); it owns the
// block-pipeline lifecycle events.
// `skip` is blockGamut's transitional re-entry guard (a construct name the dispatcher must not
// re-invoke, e.g. heading.setext recursing through the block layer) — forwarded verbatim while
// the engine delegates; it dies with the delegation once the registry pipeline lands.
showdown.subParser('makehtml.blockEngine', function (text, options, globals, skip) {
  'use strict';

  let startEvent = showdown.Event.dispatchStart('makehtml.blockEngine.onStart', text, options, globals);
  text = startEvent.output;

  text = showdown.subParser('makehtml.blockGamut')(text, options, globals, skip);

  // TODO: build the pipeline from the `makehtml.block.*` definition objects in
  //   showdown.getSubParserList() (validate shape, normalize a missing `enabled` to true,
  //   resolve boolean/function `enabled` against `options`, sort by `priority`) and run the
  //   passes in order.
  // TODO: recursion contract — blockGamut today re-enters itself from container constructs
  //   (blockquote, list); decide how a construct requests a nested block parse (an engine
  //   service on a shared state object, mirroring the inline scan's subParse).

  let endEvent = showdown.Event.dispatchEnd('makehtml.blockEngine.onEnd', text, options, globals);
  return endEvent.output;
});
