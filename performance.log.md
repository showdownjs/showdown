# Performance Tests for showdown


## [version 1.5.5](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.302|5.969|0.148|
|readme.md|8.157|17.988|7.204|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.682|1.095|0.625|
|anchors|0.234|0.579|0.191|
|autoLinks|0.015|0.181|0.013|
|blockGamut|7.307|17.844|6.509|
|blockQuotes|0.065|0.258|0.059|
|codeBlocks|0.073|1.052|0.062|
|codeSpans|0.181|0.898|0.165|
|detab|0.024|0.209|0.022|
|encodeAmpsAndAngles|0.016|0.280|0.014|
|encodeBackslashEscapes|0.014|0.359|0.013|
|encodeCode|0.171|0.542|0.154|
|encodeEmailAddress|2.302|4.221|2.080|
|escapeSpecialCharsWithinTagAttributes|0.064|0.404|0.054|
|githubCodeBlocks|0.112|6.431|0.057|
|hashBlock|0.032|6.549|0.011|
|hashElement|0.001|0.227|0.000|
|hashHTMLSpans|0.032|6.134|0.010|
|hashPreCodeTags|0.018|0.302|0.015|
|headers|0.456|7.749|0.396|
|images|0.039|1.016|0.033|
|italicsAndBold|0.036|0.467|0.031|
|lists|5.111|11.047|4.623|
|outdent|0.051|0.412|0.044|
|paragraphs|1.373|3.729|1.210|
|spanGamut|0.769|1.307|0.669|
|strikethrough|0.000|0.251|0.000|
|stripBlankLines|0.031|0.292|0.027|
|stripLinkDefinitions|0.070|0.422|0.061|
|tables|0.001|0.212|0.000|
|unescapeSpecialChars|0.004|0.187|0.003|


## [version 1.5.4](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.310|5.549|0.149|
|readme.md|8.073|17.976|7.220|


