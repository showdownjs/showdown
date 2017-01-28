# Performance Tests for showdown


## [version 1.6.1](https://github.com/showdownjs/showdown/tree/1.6.1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.333|5.420|0.160|
|readme.md|25.445|46.022|23.553|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.565|8.039|1.909|
|anchors|0.475|3.950|0.261|
|autoLinks|0.099|0.218|0.072|
|blockQuotes|3.265|5.968|2.812|
|codeBlocks|0.170|0.325|0.149|
|codeSpans|0.195|0.405|0.141|
|detab|0.126|0.736|0.083|
|encodeAmpsAndAngles|0.041|0.079|0.037|
|encodeBackslashEscapes|0.077|0.140|0.069|
|encodeCode|0.542|0.872|0.490|
|escapeSpecialCharsWithinTagAttributes|0.258|0.584|0.217|
|githubCodeBlocks|0.167|0.713|0.128|
|hashBlock|0.062|0.462|0.037|
|hashElement|0.002|0.039|0.000|
|hashHTMLSpans|0.492|2.612|0.247|
|hashPreCodeTags|0.125|0.275|0.102|
|headers|0.783|0.912|0.722|
|horizontalRule|0.207|0.303|0.196|
|images|0.120|0.867|0.073|
|italicsAndBold|0.098|0.138|0.089|
|lists|4.962|5.655|4.556|
|outdent|0.176|0.269|0.143|
|paragraphs|3.587|4.459|3.142|
|spanGamut|1.392|2.037|1.177|
|strikethrough|0.006|0.110|0.000|
|stripBlankLines|0.089|0.140|0.080|
|stripLinkDefinitions|0.165|0.224|0.143|
|tables|0.002|0.034|0.000|
|unescapeSpecialChars|0.009|0.039|0.007|


## [version 1.6.0](https://github.com/showdownjs/showdown/tree/1.6.0)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.308|5.369|0.157|
|readme.md|25.818|47.795|23.775|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.653|8.558|1.880|
|anchors|0.517|4.142|0.271|
|autoLinks|0.089|0.194|0.071|
|blockGamut|17.372|22.941|14.082|
|blockQuotes|3.011|4.110|2.774|
|codeBlocks|0.243|0.834|0.193|
|codeSpans|0.227|0.458|0.191|
|detab|0.095|0.133|0.090|
|encodeAmpsAndAngles|0.040|0.073|0.038|
|encodeBackslashEscapes|0.100|0.510|0.068|
|encodeCode|0.532|0.706|0.479|
|escapeSpecialCharsWithinTagAttributes|0.386|0.702|0.327|
|githubCodeBlocks|0.214|0.778|0.156|
|hashBlock|0.057|0.280|0.035|
|hashElement|0.002|0.033|0.000|
|hashHTMLSpans|0.384|1.997|0.236|
|hashPreCodeTags|0.133|0.200|0.116|
|headers|0.944|2.468|0.782|
|images|0.120|0.486|0.086|
|italicsAndBold|0.111|0.445|0.088|
|lists|5.783|13.249|4.464|
|outdent|0.306|0.956|0.225|
|paragraphs|6.583|8.811|4.499|
|spanGamut|2.437|3.067|1.647|
|strikethrough|0.005|0.100|0.000|
|stripBlankLines|0.121|0.175|0.092|
|stripLinkDefinitions|0.247|0.573|0.171|
|tables|0.006|0.099|0.000|
|unescapeSpecialChars|0.017|0.066|0.011|


