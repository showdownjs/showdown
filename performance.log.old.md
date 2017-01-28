# Performance Tests for showdown


## [version 1.6.1](https://github.com/showdownjs/showdown/tree/1.6.1)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.296|5.551|0.154|
|readme.md|8.404|17.862|7.537|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.693|1.104|0.652|
|anchors|0.186|0.521|0.164|
|autoLinks|0.016|0.183|0.014|
|blockGamut|7.566|16.244|6.642|
|blockQuotes|0.065|0.252|0.061|
|codeBlocks|0.070|1.184|0.061|
|codeSpans|0.202|1.163|0.167|
|detab|0.027|0.239|0.023|
|encodeAmpsAndAngles|0.017|0.433|0.014|
|encodeBackslashEscapes|0.015|0.426|0.013|
|encodeCode|0.180|0.504|0.161|
|escapeSpecialCharsWithinTagAttributes|0.060|0.419|0.054|
|githubCodeBlocks|0.078|4.517|0.057|
|hashBlock|0.031|5.982|0.012|
|hashElement|0.001|0.216|0.000|
|hashHTMLSpans|0.036|4.569|0.011|
|hashPreCodeTags|0.019|0.276|0.015|
|headers|0.462|5.391|0.406|
|images|0.039|1.640|0.033|
|italicsAndBold|0.043|0.333|0.037|
|lists|5.335|8.005|4.849|
|outdent|0.051|0.633|0.046|
|paragraphs|1.396|4.046|1.245|
|spanGamut|0.801|23.092|0.572|
|strikethrough|0.001|0.555|0.000|
|stripBlankLines|0.033|0.333|0.029|
|stripLinkDefinitions|0.072|0.472|0.063|
|tables|0.001|0.228|0.000|
|unescapeSpecialChars|0.004|0.209|0.003|


## [version 1.6.0](https://github.com/showdownjs/showdown/tree/1.6.0)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.294|5.326|0.155|
|readme.md|8.599|16.906|7.736|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.692|1.135|0.642|
|anchors|0.204|0.530|0.175|
|autoLinks|0.016|0.221|0.014|
|blockGamut|7.991|18.830|6.982|
|blockQuotes|0.063|0.261|0.060|
|codeBlocks|0.073|1.277|0.063|
|codeSpans|0.195|0.751|0.177|
|detab|0.025|0.259|0.023|
|encodeAmpsAndAngles|0.019|0.332|0.014|
|encodeBackslashEscapes|0.031|0.456|0.030|
|encodeCode|0.193|0.651|0.159|
|encodeEmailAddress|2.343|5.203|2.145|
|escapeSpecialCharsWithinTagAttributes|0.066|0.620|0.059|
|githubCodeBlocks|0.100|4.566|0.058|
|hashBlock|0.029|6.856|0.011|
|hashElement|0.001|0.210|0.000|
|hashHTMLSpans|0.024|5.002|0.011|
|hashPreCodeTags|0.018|0.262|0.015|
|headers|0.485|8.314|0.410|
|images|0.042|1.295|0.035|
|italicsAndBold|0.040|0.312|0.036|
|lists|5.541|11.729|5.039|
|outdent|0.052|0.776|0.046|
|paragraphs|1.423|2.536|1.290|
|spanGamut|0.663|1.344|0.605|
|strikethrough|0.000|0.243|0.000|
|stripBlankLines|0.031|0.274|0.028|
|stripLinkDefinitions|0.071|0.345|0.063|
|tables|0.001|0.212|0.000|
|unescapeSpecialChars|0.004|0.349|0.003|


## [version 1.5.6](https://github.com/showdownjs/showdown/tree/1.5.6)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.484|5.497|0.159|
|readme.md|8.624|20.725|7.639|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.697|1.193|0.637|
|anchors|0.191|0.628|0.159|
|autoLinks|0.017|0.318|0.014|
|blockGamut|7.720|14.917|6.949|
|blockQuotes|0.065|0.236|0.060|
|codeBlocks|0.082|1.078|0.063|
|codeSpans|0.185|0.915|0.168|
|detab|0.025|0.195|0.023|
|encodeAmpsAndAngles|0.016|0.319|0.014|
|encodeBackslashEscapes|0.014|0.264|0.013|
|encodeCode|0.177|0.489|0.155|
|encodeEmailAddress|2.849|482.687|2.103|
|escapeSpecialCharsWithinTagAttributes|0.061|0.428|0.055|
|githubCodeBlocks|0.084|5.149|0.056|
|hashBlock|0.035|6.322|0.011|
|hashElement|0.001|0.228|0.000|
|hashHTMLSpans|0.024|4.870|0.011|
|hashPreCodeTags|0.018|0.295|0.015|
|headers|0.472|4.046|0.405|
|images|0.040|0.835|0.033|
|italicsAndBold|0.041|0.422|0.036|
|lists|5.606|8.275|5.112|
|outdent|0.051|0.852|0.045|
|paragraphs|1.368|2.683|1.221|
|spanGamut|0.638|1.433|0.569|
|strikethrough|0.000|0.229|0.000|
|stripBlankLines|0.032|0.298|0.027|
|stripLinkDefinitions|0.072|0.354|0.062|
|tables|0.001|0.199|0.000|
|unescapeSpecialChars|0.003|0.152|0.003|


## [version 1.5.5](https://github.com/showdownjs/showdown/tree/1.5.5)

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


## [version 1.5.4](https://github.com/showdownjs/showdown/tree/1.5.4)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.310|5.549|0.149|
|readme.md|8.073|17.976|7.220|


