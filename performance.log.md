# Performance Tests for showdown


## [version 1.6.1](https://github.com/showdownjs/showdown/tree/1.6.1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.330|5.345|0.168|
|readme.md|25.823|46.558|23.516|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.599|8.291|1.929|
|anchors|0.519|4.014|0.272|
|autoLinks|0.089|0.193|0.071|
|blockQuotes|3.127|6.063|2.751|
|codeBlocks|0.178|0.294|0.168|
|codeSpans|0.233|0.569|0.178|
|detab|0.129|0.796|0.087|
|encodeAmpsAndAngles|0.042|0.076|0.037|
|encodeBackslashEscapes|0.072|0.104|0.068|
|encodeCode|0.529|0.826|0.484|
|escapeSpecialCharsWithinTagAttributes|0.359|0.444|0.325|
|githubCodeBlocks|0.189|0.776|0.141|
|hashBlock|0.056|0.343|0.037|
|hashElement|0.002|0.028|0.000|
|hashHTMLSpans|0.599|3.072|0.248|
|hashPreCodeTags|0.200|0.343|0.132|
|headers|1.069|1.445|0.934|
|horizontalRule|0.310|1.091|0.198|
|images|0.192|0.310|0.116|
|italicsAndBold|0.194|0.243|0.141|
|lists|5.782|9.187|4.470|
|outdent|0.158|0.226|0.141|
|paragraphs|3.712|4.484|3.384|
|spanGamut|1.586|2.240|1.380|
|strikethrough|0.002|0.042|0.000|
|stripBlankLines|0.089|0.119|0.083|
|stripLinkDefinitions|0.170|0.279|0.143|
|tables|0.003|0.036|0.000|
|unescapeSpecialChars|0.008|0.038|0.006|


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


