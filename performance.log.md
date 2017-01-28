# Performance Tests for showdown


## [version 1.6.1](https://github.com/showdownjs/showdown/tree/1.6.1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.317|5.498|0.161|
|readme.md|26.014|46.799|24.245|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.641|7.792|1.936|
|anchors|0.475|4.063|0.259|
|autoLinks|0.089|0.197|0.069|
|blockQuotes|3.213|6.054|2.880|
|codeBlocks|0.162|0.269|0.153|
|codeSpans|0.169|0.399|0.141|
|detab|0.125|0.665|0.086|
|encodeAmpsAndAngles|0.042|0.089|0.038|
|encodeBackslashEscapes|0.076|0.133|0.068|
|encodeCode|0.577|0.970|0.479|
|escapeSpecialCharsWithinTagAttributes|0.246|0.350|0.221|
|githubCodeBlocks|0.177|0.815|0.125|
|hashBlock|0.065|0.430|0.038|
|hashElement|0.002|0.034|0.000|
|hashHTMLSpans|0.424|2.321|0.241|
|hashPreCodeTags|0.122|0.238|0.104|
|headers|0.804|0.946|0.726|
|horizontalRule|0.219|0.274|0.194|
|images|0.124|0.902|0.071|
|italicsAndBold|0.101|0.150|0.090|
|lists|4.939|5.421|4.624|
|outdent|0.165|0.337|0.140|
|paragraphs|3.495|4.555|3.171|
|spanGamut|1.319|1.992|1.147|
|strikethrough|0.007|0.143|0.000|
|stripBlankLines|0.094|0.155|0.082|
|stripLinkDefinitions|0.176|0.311|0.146|
|tables|0.002|0.039|0.000|
|unescapeSpecialChars|0.008|0.034|0.007|


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


