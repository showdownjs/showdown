# Performance Tests for showdown


## [version 1.6.4](https://github.com/showdownjs/showdown/tree/1.6.4)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.376|6.381|0.183|
|performance.testfile.md|33.835|61.049|30.186|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.564|8.347|1.871|
|anchors|0.499|4.222|0.270|
|autoLinks|0.080|0.174|0.061|
|blockQuotes|3.343|7.306|2.850|
|codeBlocks|0.221|0.822|0.172|
|codeSpans|0.229|0.744|0.156|
|detab|0.097|0.154|0.086|
|encodeAmpsAndAngles|0.117|0.200|0.094|
|encodeBackslashEscapes|0.086|0.230|0.068|
|encodeCode|0.885|1.165|0.816|
|escapeSpecialCharsWithinTagAttributes|0.298|0.495|0.240|
|githubCodeBlocks|0.183|0.785|0.133|
|hashBlock|0.044|0.098|0.035|
|hashElement|0.002|0.033|0.000|
|hashHTMLSpans|4.200|4.552|3.987|
|hashPreCodeTags|0.130|0.313|0.106|
|headers|1.224|4.010|0.945|
|horizontalRule|0.412|4.175|0.196|
|images|0.088|0.203|0.073|
|italicsAndBold|0.276|0.414|0.233|
|lists|5.005|6.109|4.663|
|outdent|0.152|0.337|0.139|
|paragraphs|5.336|7.117|4.843|
|spanGamut|4.450|6.153|3.857|
|strikethrough|0.003|0.049|0.000|
|stripLinkDefinitions|0.180|0.316|0.147|
|tables|0.003|0.055|0.000|
|unescapeSpecialChars|0.009|0.047|0.007|


## [version 1.6.3](https://github.com/showdownjs/showdown/tree/1.6.3)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.388|6.064|0.174|
|performance.testfile.md|26.899|49.063|24.845|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.616|8.181|1.899|
|anchors|0.515|4.691|0.264|
|autoLinks|0.093|0.188|0.073|
|blockQuotes|4.518|8.953|3.036|
|codeBlocks|0.223|0.348|0.188|
|codeSpans|0.318|1.095|0.177|
|detab|0.092|0.137|0.087|
|encodeAmpsAndAngles|0.044|0.089|0.038|
|encodeBackslashEscapes|0.108|0.265|0.078|
|encodeCode|1.535|9.896|0.865|
|escapeSpecialCharsWithinTagAttributes|0.294|0.523|0.253|
|githubCodeBlocks|0.208|0.790|0.142|
|hashBlock|0.042|0.123|0.036|
|hashElement|0.002|0.029|0.000|
|hashHTMLSpans|0.410|1.598|0.240|
|hashPreCodeTags|0.132|0.395|0.110|
|headers|1.015|1.502|0.806|
|horizontalRule|0.220|0.357|0.195|
|images|0.158|0.978|0.077|
|italicsAndBold|0.288|0.639|0.241|
|lists|5.151|6.331|4.629|
|outdent|0.180|0.363|0.143|
|paragraphs|4.548|6.309|4.002|
|spanGamut|1.519|1.864|1.372|
|strikethrough|0.003|0.065|0.000|
|stripLinkDefinitions|0.179|0.313|0.144|
|tables|0.004|0.063|0.000|
|unescapeSpecialChars|0.011|0.049|0.007|


## [version 1.6.2](https://github.com/showdownjs/showdown/tree/1.6.2)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.613|5.894|0.169|
|performance.testfile.md|25.970|62.882|23.710|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|2.669|8.479|1.885|
|anchors|0.500|3.841|0.268|
|autoLinks|0.098|0.211|0.072|
|blockQuotes|3.222|5.826|2.791|
|codeBlocks|0.177|0.371|0.157|
|codeSpans|0.218|0.483|0.151|
|detab|0.135|0.655|0.085|
|encodeAmpsAndAngles|0.042|0.118|0.036|
|encodeBackslashEscapes|0.080|0.133|0.068|
|encodeCode|0.560|0.982|0.484|
|escapeSpecialCharsWithinTagAttributes|0.353|0.568|0.291|
|githubCodeBlocks|0.180|0.773|0.127|
|hashBlock|0.058|0.312|0.037|
|hashElement|0.003|0.046|0.000|
|hashHTMLSpans|0.475|2.325|0.234|
|hashPreCodeTags|0.122|0.307|0.107|
|headers|0.858|0.954|0.780|
|horizontalRule|0.227|0.418|0.197|
|images|0.171|1.453|0.077|
|italicsAndBold|0.101|0.202|0.088|
|lists|4.931|5.460|4.556|
|outdent|0.163|0.315|0.142|
|paragraphs|3.790|5.564|3.278|
|spanGamut|1.442|2.012|1.203|
|strikethrough|0.004|0.082|0.000|
|stripBlankLines|0.086|0.130|0.080|
|stripLinkDefinitions|0.160|0.217|0.145|
|tables|0.004|0.076|0.000|
|unescapeSpecialChars|0.010|0.058|0.007|


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


