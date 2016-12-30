# Performance Tests for showdown


## [version 1.5.5](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.644|13.067|0.178|
|readme.md|8.181|26.315|7.019|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.665|1.100|0.620|
|anchors|0.187|0.561|0.161|
|autoLinks|0.015|0.198|0.014|
|blockGamut|7.104|15.672|6.344|
|blockQuotes|0.065|0.228|0.058|
|codeBlocks|0.071|1.058|0.061|
|codeSpans|0.189|1.036|0.168|
|detab|0.025|0.251|0.022|
|encodeAmpsAndAngles|0.017|0.268|0.014|
|encodeBackslashEscapes|0.014|0.257|0.012|
|encodeCode|0.175|0.644|0.149|
|encodeEmailAddress|2.291|3.854|2.072|
|escapeSpecialCharsWithinTagAttributes|0.059|0.438|0.053|
|githubCodeBlocks|0.081|4.627|0.056|
|hashBlock|0.029|5.068|0.011|
|hashElement|0.001|0.197|0.000|
|hashHTMLSpans|0.024|3.832|0.010|
|hashPreCodeTags|0.017|0.414|0.014|
|headers|0.462|2.671|0.393|
|images|0.039|0.733|0.033|
|italicsAndBold|0.038|0.309|0.034|
|lists|4.972|11.411|4.443|
|outdent|0.049|0.536|0.044|
|paragraphs|1.361|2.980|1.203|
|spanGamut|0.630|1.273|0.551|
|strikethrough|0.000|0.208|0.000|
|stripBlankLines|0.030|0.271|0.027|
|stripLinkDefinitions|0.068|0.339|0.061|
|tables|0.001|0.186|0.000|
|unescapeSpecialChars|0.003|0.211|0.003|


## [version 1.5.4](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.310|5.549|0.149|
|readme.md|8.073|17.976|7.220|


