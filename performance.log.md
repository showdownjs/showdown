# Performance Tests for showdown


## [version 1.6.1](https://github.com/showdownjs/showdown/tree/1.6.1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.311|5.505|0.157|
|readme.md|25.527|48.200|23.654|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.571|7.892|1.848|
|anchors|0.500|4.097|0.272|
|autoLinks|0.093|0.220|0.071|
|blockGamut|16.474|22.569|13.148|
|blockQuotes|3.115|5.541|2.719|
|codeBlocks|0.284|1.167|0.173|
|codeSpans|0.209|0.453|0.174|
|detab|0.095|0.135|0.088|
|encodeAmpsAndAngles|0.047|0.074|0.037|
|encodeBackslashEscapes|0.074|0.112|0.068|
|encodeCode|0.544|1.438|0.480|
|escapeSpecialCharsWithinTagAttributes|0.359|0.446|0.330|
|githubCodeBlocks|0.199|0.779|0.146|
|hashBlock|0.120|1.556|0.037|
|hashElement|0.002|0.034|0.000|
|hashHTMLSpans|0.354|1.562|0.255|
|hashPreCodeTags|0.132|0.233|0.114|
|headers|0.838|2.014|0.724|
|images|0.156|0.825|0.088|
|italicsAndBold|0.099|0.198|0.090|
|lists|4.856|5.639|4.491|
|outdent|0.181|0.576|0.141|
|paragraphs|6.092|9.738|3.413|
|spanGamut|2.472|4.012|1.641|
|strikethrough|0.004|0.082|0.000|
|stripBlankLines|0.118|0.138|0.089|
|stripLinkDefinitions|0.205|0.520|0.148|
|tables|0.007|0.117|0.000|
|unescapeSpecialChars|0.011|0.055|0.007|


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


