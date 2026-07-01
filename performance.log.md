# Performance Tests for showdown


## [version 3.0.0-rc1](https://github.com/showdownjs/showdown/tree/3.0.0-rc1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.320|8.030|0.114|
|performance.testfile.md|26.325|54.464|23.707|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|1.917|5.607|1.649|
|anchors|0.951|5.653|0.583|
|blockQuotes|3.137|6.843|2.608|
|codeBlocks|0.127|0.221|0.118|
|codeSpans|0.253|0.368|0.238|
|encodeAmpsAndAngles|0.090|0.129|0.081|
|encodeBackslashEscapes|0.063|0.088|0.059|
|encodeCode|0.293|0.331|0.283|
|escapeSpecialCharsWithinTagAttributes|0.104|0.155|0.097|
|githubCodeBlocks|0.172|0.246|0.152|
|hashBlock|0.020|0.042|0.017|
|hashElement|0.001|0.015|0.000|
|hashHTMLSpans|2.854|4.032|2.688|
|hashPreCodeTags|0.061|0.151|0.051|
|headers|4.196|8.837|3.682|
|horizontalRule|0.388|0.515|0.369|
|images|0.131|0.261|0.118|
|italicsAndBold|0.832|4.400|0.599|
|lists|2.239|4.427|2.004|
|paragraphs|5.308|6.084|4.990|
|spanGamut|2.098|3.036|1.881|
|strikethrough|0.127|0.228|0.107|
|stripLinkDefinitions|3.431|4.333|3.310|
|tables|0.003|0.054|0.000|
|unescapeSpecialChars|0.007|0.031|0.005|


## [version 3.0.0-rc2](https://github.com/showdownjs/showdown/tree/3.0.0-rc2)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.662|14.660|0.227|
|performance.testfile.md|47.650|83.279|39.866|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|3.921|6.213|2.561|
|anchors|1.387|3.358|1.040|
|blockQuotes|4.698|6.045|4.027|
|codeBlocks|0.207|0.317|0.196|
|codeSpans|0.420|0.667|0.384|
|encodeAmpsAndAngles|0.232|1.407|0.146|
|encodeBackslashEscapes|0.095|0.237|0.083|
|encodeCode|0.594|1.912|0.501|
|escapeSpecialCharsWithinTagAttributes|0.193|0.303|0.177|
|githubCodeBlocks|0.360|1.250|0.278|
|hashBlock|0.033|0.120|0.027|
|hashElement|0.003|0.043|0.000|
|hashHTMLSpans|4.612|5.335|4.157|
|hashPreCodeTags|0.103|0.235|0.090|
|headers|8.275|13.391|5.960|
|horizontalRule|0.676|2.405|0.548|
|images|0.207|0.517|0.185|
|italicsAndBold|1.396|2.959|1.114|
|lists|4.937|7.932|3.772|
|paragraphs|11.210|16.379|9.204|
|spanGamut|3.520|4.970|3.095|
|strikethrough|0.224|1.538|0.132|
|stripLinkDefinitions|5.085|6.063|4.613|
|tables|0.005|0.091|0.000|
|unescapeSpecialChars|0.009|0.043|0.007|


## [version 2.0.0](https://github.com/showdownjs/showdown/tree/2.0.0)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.581|12.279|0.151|
|performance.testfile.md|35.491|79.405|29.046|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.561|7.807|2.461|
|anchors|2.910|6.510|1.056|
|blockQuotes|4.142|19.023|2.541|
|codeBlocks|0.264|0.858|0.194|
|codeSpans|0.365|1.421|0.278|
|detab|0.055|0.116|0.047|
|encodeAmpsAndAngles|0.145|0.796|0.092|
|encodeBackslashEscapes|0.087|0.266|0.063|
|encodeCode|0.605|1.144|0.522|
|escapeSpecialCharsWithinTagAttributes|0.206|0.287|0.184|
|githubCodeBlocks|0.251|1.003|0.192|
|hashBlock|0.038|0.104|0.034|
|hashElement|0.005|0.053|0.001|
|hashHTMLSpans|5.229|9.835|4.240|
|hashPreCodeTags|0.155|0.705|0.117|
|headers|2.278|4.825|1.631|
|horizontalRule|0.159|0.276|0.148|
|images|0.159|0.390|0.124|
|italicsAndBold|0.280|0.773|0.211|
|lists|4.253|8.173|3.146|
|outdent|0.181|0.238|0.162|
|paragraphs|8.968|11.331|7.857|
|spanGamut|2.985|4.162|2.486|
|strikethrough|0.007|0.099|0.001|
|stripLinkDefinitions|1.911|2.855|1.447|
|tables|0.008|0.127|0.002|
|unescapeSpecialChars|0.013|0.073|0.010|


