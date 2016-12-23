# Performance Tests for showdown


## [version 1.5.5](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.315|5.716|0.163|
|readme.md|8.352|18.017|7.207|

### Test Suite: subParsers (1000 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|0.673|1.144|0.622|
|anchors|0.178|0.528|0.157|
|autoLinks|0.014|0.193|0.013|
|blockGamut|7.327|16.050|6.464|
|blockQuotes|0.064|0.256|0.058|
|codeBlocks|0.072|1.590|0.059|
|codeSpans|0.184|1.435|0.165|
|detab|0.024|0.197|0.022|
|encodeAmpsAndAngles|0.016|0.354|0.014|
|encodeBackslashEscapes|0.014|0.236|0.012|
|encodeCode|0.167|0.489|0.149|
|encodeEmailAddress|2.296|3.975|2.079|
|escapeSpecialCharsWithinTagAttributes|0.060|0.414|0.053|
|githubCodeBlocks|0.076|4.397|0.055|
|hashBlock|0.024|5.067|0.011|
|hashElement|0.001|0.239|0.000|
|hashHTMLSpans|0.031|3.577|0.010|
|hashPreCodeTags|0.019|0.332|0.015|
|headers|0.456|2.677|0.391|
|images|0.041|1.657|0.032|
|italicsAndBold|0.038|0.298|0.035|
|lists|5.025|9.631|4.573|
|outdent|0.051|0.586|0.044|
|paragraphs|1.344|2.652|1.195|
|spanGamut|0.612|1.057|0.555|
|strikethrough|0.000|0.228|0.000|
|stripBlankLines|0.030|0.294|0.027|
|stripLinkDefinitions|0.069|0.450|0.060|
|tables|0.001|0.205|0.000|
|unescapeSpecialChars|0.004|0.168|0.003|


## [version 1.5.4](https://github.com/showdownjs/showdown/tree/)

### Test Suite: Basic (100 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.310|5.549|0.149|
|readme.md|8.073|17.976|7.220|


