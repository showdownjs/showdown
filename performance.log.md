# Performance Tests for showdown


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


