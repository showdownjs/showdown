# Performance Tests for showdown


## [version 1.9.0](https://github.com/showdownjs/showdown/tree/1.9.0)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.394|9.154|0.104|
|performance.testfile.md|49.286|177.704|26.155|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|6.101|16.106|2.376|
|anchors|0.767|3.507|0.323|
|autoLinks|0.244|0.548|0.124|
|blockQuotes|2.397|4.000|2.013|
|codeBlocks|0.226|0.343|0.208|
|codeSpans|0.316|1.136|0.258|
|detab|0.095|0.184|0.085|
|encodeAmpsAndAngles|0.104|0.153|0.096|
|encodeBackslashEscapes|0.062|0.137|0.056|
|encodeCode|0.558|1.469|0.485|
|escapeSpecialCharsWithinTagAttributes|0.243|0.714|0.192|
|githubCodeBlocks|0.213|0.407|0.186|
|hashBlock|0.046|0.147|0.036|
|hashElement|0.003|0.050|0.000|
|hashHTMLSpans|4.914|7.364|4.474|
|hashPreCodeTags|0.134|0.234|0.110|
|headers|1.515|3.866|1.153|
|horizontalRule|0.216|0.293|0.194|
|images|0.144|0.286|0.124|
|italicsAndBold|0.234|0.656|0.190|
|lists|4.483|7.664|2.482|
|outdent|0.286|0.538|0.179|
|paragraphs|10.257|18.656|5.229|
|spanGamut|10.288|31.124|6.102|
|strikethrough|0.007|0.106|0.001|
|stripLinkDefinitions|0.438|0.678|0.392|
|tables|0.007|0.096|0.001|
|unescapeSpecialChars|0.041|0.086|0.008|


## [version 1.8.7](https://github.com/showdownjs/showdown/tree/1.8.7)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.339|9.454|0.104|
|performance.testfile.md|31.606|62.066|24.851|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|3.987|7.594|2.211|
|anchors|0.763|7.966|0.290|
|autoLinks|0.094|0.193|0.071|
|blockQuotes|2.922|9.315|2.021|
|codeBlocks|0.239|0.346|0.205|
|codeSpans|0.290|0.378|0.243|
|detab|0.094|0.161|0.084|
|encodeAmpsAndAngles|0.262|1.468|0.093|
|encodeBackslashEscapes|0.092|0.177|0.054|
|encodeCode|0.535|1.179|0.457|
|escapeSpecialCharsWithinTagAttributes|0.190|0.252|0.175|
|githubCodeBlocks|0.220|0.446|0.184|
|hashBlock|0.041|0.094|0.036|
|hashElement|0.002|0.025|0.000|
|hashHTMLSpans|4.397|5.805|4.071|
|hashPreCodeTags|0.119|0.221|0.108|
|headers|1.327|3.385|1.085|
|horizontalRule|0.212|0.270|0.198|
|images|0.228|1.336|0.123|
|italicsAndBold|0.211|0.363|0.190|
|lists|2.677|4.028|2.235|
|outdent|0.148|0.218|0.135|
|paragraphs|5.846|7.679|4.920|
|spanGamut|4.082|5.226|3.633|
|strikethrough|0.005|0.079|0.000|
|stripLinkDefinitions|0.327|1.681|0.221|
|tables|0.003|0.043|0.000|
|unescapeSpecialChars|0.010|0.042|0.007|


## [version 1.8.6](https://github.com/showdownjs/showdown/tree/1.8.6)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.454|9.635|0.087|
|performance.testfile.md|31.987|60.669|27.816|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|5.333|15.245|2.412|
|anchors|0.399|0.670|0.291|
|autoLinks|0.118|0.291|0.072|
|blockQuotes|2.897|6.028|1.997|
|codeBlocks|0.305|1.120|0.189|
|codeSpans|0.294|0.626|0.235|
|detab|0.129|0.765|0.087|
|encodeAmpsAndAngles|0.110|0.166|0.094|
|encodeBackslashEscapes|0.099|0.349|0.068|
|encodeCode|0.948|1.386|0.842|
|escapeSpecialCharsWithinTagAttributes|0.214|0.473|0.162|
|githubCodeBlocks|0.161|0.252|0.148|
|hashBlock|0.042|0.070|0.037|
|hashElement|0.002|0.023|0.000|
|hashHTMLSpans|4.292|5.134|3.921|
|hashPreCodeTags|0.131|0.361|0.110|
|headers|1.550|3.810|1.149|
|horizontalRule|0.214|0.287|0.201|
|images|0.176|0.432|0.132|
|italicsAndBold|0.324|1.552|0.228|
|lists|2.931|3.835|2.586|
|outdent|0.154|0.272|0.137|
|paragraphs|6.549|8.261|5.730|
|spanGamut|4.223|5.585|3.756|
|strikethrough|0.005|0.087|0.000|
|stripLinkDefinitions|0.242|0.373|0.224|
|tables|0.003|0.042|0.001|
|unescapeSpecialChars|0.010|0.053|0.007|


## [version 1.8.4](https://github.com/showdownjs/showdown/tree/1.8.4)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.736|11.076|0.117|
|performance.testfile.md|32.918|62.427|27.941|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|5.260|17.333|2.340|
|anchors|0.522|2.898|0.307|
|autoLinks|0.124|0.300|0.071|
|blockQuotes|2.244|3.333|2.015|
|codeBlocks|0.244|0.817|0.190|
|codeSpans|0.354|1.201|0.243|
|detab|0.096|0.143|0.088|
|encodeAmpsAndAngles|0.138|0.198|0.096|
|encodeBackslashEscapes|0.093|0.184|0.071|
|encodeCode|0.961|1.611|0.858|
|escapeSpecialCharsWithinTagAttributes|0.252|0.520|0.158|
|githubCodeBlocks|0.262|0.390|0.161|
|hashBlock|0.052|0.129|0.037|
|hashElement|0.003|0.040|0.000|
|hashHTMLSpans|4.240|4.673|4.044|
|hashPreCodeTags|0.134|0.337|0.113|
|headers|1.412|4.475|1.077|
|horizontalRule|0.358|2.686|0.196|
|images|0.184|0.480|0.130|
|italicsAndBold|0.300|0.458|0.234|
|lists|3.074|4.651|2.626|
|outdent|0.204|0.931|0.137|
|paragraphs|6.406|8.020|5.821|
|spanGamut|4.136|6.038|3.840|
|strikethrough|0.007|0.132|0.000|
|stripLinkDefinitions|0.248|0.403|0.217|
|tables|0.003|0.040|0.001|
|unescapeSpecialChars|0.009|0.039|0.007|


## [version 1.8.3](https://github.com/showdownjs/showdown/tree/1.8.3)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.927|32.654|0.147|
|performance.testfile.md|32.485|62.282|28.403|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|5.454|18.356|2.385|
|anchors|0.504|3.110|0.290|
|autoLinks|0.114|0.284|0.069|
|blockQuotes|2.269|3.374|1.997|
|codeBlocks|0.250|0.840|0.192|
|codeSpans|0.352|1.231|0.249|
|detab|0.115|0.179|0.087|
|encodeAmpsAndAngles|0.105|0.162|0.095|
|encodeBackslashEscapes|0.108|0.235|0.075|
|encodeCode|0.994|1.915|0.847|
|escapeSpecialCharsWithinTagAttributes|0.237|0.475|0.160|
|githubCodeBlocks|0.202|0.771|0.151|
|hashBlock|0.071|0.493|0.039|
|hashElement|0.002|0.036|0.001|
|hashHTMLSpans|4.162|4.708|3.959|
|hashPreCodeTags|0.130|0.331|0.112|
|headers|1.409|4.622|1.044|
|horizontalRule|0.351|2.655|0.196|
|images|0.199|0.545|0.131|
|italicsAndBold|0.269|0.357|0.235|
|lists|3.057|4.403|2.686|
|outdent|0.153|0.307|0.136|
|paragraphs|6.455|7.901|5.708|
|spanGamut|4.256|5.542|3.930|
|strikethrough|0.005|0.089|0.000|
|stripLinkDefinitions|0.248|0.394|0.225|
|tables|0.002|0.028|0.001|
|unescapeSpecialChars|0.009|0.039|0.007|


## [version 1.8.2](https://github.com/showdownjs/showdown/tree/1.8.2)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.361|8.977|0.104|
|performance.testfile.md|33.109|56.478|29.179|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|5.488|20.714|2.321|
|anchors|0.506|3.158|0.292|
|autoLinks|0.141|0.365|0.072|
|blockQuotes|2.300|3.642|2.046|
|codeBlocks|0.243|0.877|0.189|
|codeSpans|0.268|1.176|0.159|
|detab|0.095|0.172|0.089|
|encodeAmpsAndAngles|0.108|0.230|0.097|
|encodeBackslashEscapes|0.078|0.119|0.074|
|encodeCode|1.002|1.544|0.851|
|escapeSpecialCharsWithinTagAttributes|0.256|0.566|0.164|
|githubCodeBlocks|0.253|0.999|0.152|
|hashBlock|0.042|0.080|0.037|
|hashElement|0.002|0.032|0.000|
|hashHTMLSpans|4.444|5.282|3.987|
|hashPreCodeTags|0.152|0.265|0.117|
|headers|1.465|4.970|1.059|
|horizontalRule|0.245|0.562|0.205|
|images|0.312|2.615|0.131|
|italicsAndBold|0.287|0.427|0.244|
|lists|3.261|4.098|2.792|
|outdent|0.179|0.377|0.141|
|paragraphs|6.661|9.047|5.884|
|spanGamut|4.561|6.173|4.009|
|strikethrough|0.005|0.097|0.000|
|stripLinkDefinitions|0.251|0.402|0.216|
|tables|0.006|0.086|0.001|
|unescapeSpecialChars|0.013|0.064|0.008|


## [version 1.8.0](https://github.com/showdownjs/showdown/tree/1.8.0)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.357|9.000|0.091|
|performance.testfile.md|31.434|57.439|26.735|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.177|7.661|2.346|
|anchors|0.542|3.749|0.300|
|autoLinks|0.087|0.183|0.069|
|blockQuotes|2.049|3.552|1.815|
|codeBlocks|0.264|1.163|0.185|
|codeSpans|0.271|0.790|0.163|
|detab|0.092|0.120|0.086|
|encodeAmpsAndAngles|0.106|0.146|0.097|
|encodeBackslashEscapes|0.091|0.152|0.077|
|encodeCode|0.962|1.552|0.862|
|escapeSpecialCharsWithinTagAttributes|0.239|0.487|0.173|
|githubCodeBlocks|0.222|0.914|0.140|
|hashBlock|0.063|0.402|0.035|
|hashElement|0.001|0.025|0.000|
|hashHTMLSpans|4.303|4.889|4.021|
|hashPreCodeTags|0.164|0.541|0.110|
|headers|1.159|3.779|0.968|
|horizontalRule|0.244|0.419|0.194|
|images|0.324|3.058|0.133|
|italicsAndBold|0.289|0.419|0.237|
|lists|2.671|3.139|2.494|
|outdent|0.159|0.253|0.139|
|paragraphs|5.594|6.833|5.159|
|spanGamut|5.069|9.600|4.128|
|strikethrough|0.003|0.062|0.000|
|stripLinkDefinitions|0.271|0.400|0.225|
|tables|0.002|0.031|0.000|
|unescapeSpecialChars|0.008|0.038|0.007|


## [version 1.7.6](https://github.com/showdownjs/showdown/tree/1.7.6)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.313|6.267|0.092|
|performance.testfile.md|30.962|54.583|26.381|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.099|7.072|2.360|
|anchors|0.574|4.502|0.294|
|autoLinks|0.087|0.210|0.066|
|blockQuotes|2.176|4.602|1.823|
|codeBlocks|0.282|0.885|0.193|
|codeSpans|0.265|0.764|0.166|
|detab|0.102|0.155|0.091|
|encodeAmpsAndAngles|0.107|0.175|0.098|
|encodeBackslashEscapes|0.120|0.872|0.073|
|encodeCode|0.983|1.842|0.873|
|escapeSpecialCharsWithinTagAttributes|0.301|0.389|0.277|
|githubCodeBlocks|0.204|0.889|0.146|
|hashBlock|0.063|0.415|0.035|
|hashElement|0.002|0.032|0.000|
|hashHTMLSpans|4.131|4.411|3.988|
|hashPreCodeTags|0.262|2.429|0.108|
|headers|1.264|4.308|0.953|
|horizontalRule|0.230|0.331|0.194|
|images|0.184|0.564|0.134|
|italicsAndBold|0.312|0.828|0.251|
|lists|2.642|3.274|2.451|
|outdent|0.159|0.240|0.144|
|paragraphs|6.724|12.672|5.367|
|spanGamut|4.991|9.206|4.173|
|strikethrough|0.003|0.058|0.000|
|stripLinkDefinitions|0.246|0.390|0.219|
|tables|0.002|0.044|0.000|
|unescapeSpecialChars|0.010|0.051|0.007|


## [version 1.7.5](https://github.com/showdownjs/showdown/tree/1.7.5)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.562|14.434|0.118|
|performance.testfile.md|30.396|57.886|26.628|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.280|8.392|2.357|
|anchors|0.602|5.341|0.285|
|autoLinks|0.092|0.193|0.065|
|blockQuotes|2.068|4.430|1.736|
|codeBlocks|0.279|0.937|0.181|
|codeSpans|0.222|0.592|0.158|
|detab|0.120|0.145|0.091|
|encodeAmpsAndAngles|0.116|0.222|0.096|
|encodeBackslashEscapes|0.140|0.914|0.071|
|encodeCode|1.195|2.009|0.861|
|escapeSpecialCharsWithinTagAttributes|0.307|0.468|0.269|
|githubCodeBlocks|0.197|0.837|0.144|
|hashBlock|0.060|0.442|0.036|
|hashElement|0.002|0.041|0.000|
|hashHTMLSpans|4.289|4.712|4.002|
|hashPreCodeTags|0.281|2.439|0.108|
|headers|1.221|4.603|0.908|
|horizontalRule|0.208|0.352|0.193|
|images|0.182|0.634|0.128|
|italicsAndBold|0.335|1.276|0.239|
|lists|3.143|6.411|2.393|
|outdent|0.398|0.585|0.159|
|paragraphs|5.926|11.596|4.961|
|spanGamut|4.443|6.012|4.024|
|strikethrough|0.003|0.055|0.000|
|stripLinkDefinitions|0.243|0.424|0.215|
|tables|0.003|0.049|0.000|
|unescapeSpecialChars|0.008|0.041|0.006|


## [version 1.7.4](https://github.com/showdownjs/showdown/tree/1.7.4)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.972|25.186|0.160|
|performance.testfile.md|30.397|61.913|26.550|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|3.999|6.603|2.314|
|anchors|0.527|3.823|0.285|
|autoLinks|0.090|0.188|0.063|
|blockQuotes|2.057|4.122|1.780|
|codeBlocks|0.247|1.085|0.186|
|codeSpans|0.263|1.017|0.162|
|detab|0.123|0.158|0.097|
|encodeAmpsAndAngles|0.118|0.171|0.096|
|encodeBackslashEscapes|0.079|0.146|0.071|
|encodeCode|0.945|1.453|0.866|
|escapeSpecialCharsWithinTagAttributes|0.285|0.438|0.246|
|githubCodeBlocks|0.225|0.969|0.142|
|hashBlock|0.068|0.577|0.036|
|hashElement|0.002|0.041|0.000|
|hashHTMLSpans|4.126|4.528|3.950|
|hashPreCodeTags|0.149|0.537|0.110|
|headers|1.171|3.877|0.884|
|horizontalRule|0.381|3.457|0.197|
|images|0.195|0.618|0.133|
|italicsAndBold|0.298|0.562|0.245|
|lists|3.790|6.139|2.612|
|outdent|0.167|0.276|0.139|
|paragraphs|5.349|6.076|4.897|
|spanGamut|4.370|6.111|3.946|
|strikethrough|0.003|0.048|0.000|
|stripLinkDefinitions|0.255|0.401|0.218|
|tables|0.002|0.033|0.000|
|unescapeSpecialChars|0.009|0.040|0.007|


## [version 1.7.3](https://github.com/showdownjs/showdown/tree/1.7.3)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.277|5.743|0.088|
|performance.testfile.md|30.733|54.768|26.972|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.316|8.271|2.339|
|anchors|0.525|3.812|0.288|
|autoLinks|0.085|0.220|0.063|
|blockQuotes|2.033|3.622|1.745|
|codeBlocks|0.251|1.060|0.178|
|codeSpans|0.246|0.749|0.157|
|detab|0.142|0.752|0.087|
|encodeAmpsAndAngles|0.100|0.129|0.095|
|encodeBackslashEscapes|0.079|0.125|0.070|
|encodeCode|0.977|1.774|0.852|
|escapeSpecialCharsWithinTagAttributes|0.271|0.441|0.244|
|githubCodeBlocks|0.235|0.985|0.139|
|hashBlock|0.068|0.550|0.036|
|hashElement|0.002|0.030|0.000|
|hashHTMLSpans|4.197|4.564|4.006|
|hashPreCodeTags|0.139|0.543|0.106|
|headers|1.148|4.214|0.880|
|horizontalRule|0.214|0.273|0.199|
|images|0.310|3.095|0.120|
|italicsAndBold|0.279|0.378|0.235|
|lists|3.843|8.278|2.630|
|outdent|0.193|0.386|0.144|
|paragraphs|5.541|8.153|4.836|
|spanGamut|4.638|5.775|4.142|
|strikethrough|0.003|0.052|0.000|
|stripLinkDefinitions|0.167|0.275|0.142|
|tables|0.002|0.036|0.000|
|unescapeSpecialChars|0.009|0.032|0.008|


## [version 1.7.2](https://github.com/showdownjs/showdown/tree/1.7.2)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.292|5.780|0.087|
|performance.testfile.md|30.396|53.860|26.054|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.303|7.798|2.377|
|anchors|0.347|0.647|0.287|
|autoLinks|0.088|0.165|0.063|
|blockQuotes|2.101|5.121|1.738|
|codeBlocks|0.239|0.878|0.184|
|codeSpans|0.252|0.628|0.160|
|detab|0.094|0.129|0.088|
|encodeAmpsAndAngles|0.131|0.733|0.093|
|encodeBackslashEscapes|0.080|0.116|0.070|
|encodeCode|0.939|1.480|0.857|
|escapeSpecialCharsWithinTagAttributes|0.285|0.473|0.243|
|githubCodeBlocks|0.214|1.047|0.140|
|hashBlock|0.068|0.553|0.036|
|hashElement|0.002|0.030|0.000|
|hashHTMLSpans|4.323|6.162|4.004|
|hashPreCodeTags|0.147|0.558|0.109|
|headers|1.176|4.491|0.884|
|horizontalRule|0.216|0.264|0.193|
|images|0.156|0.559|0.118|
|italicsAndBold|0.322|1.013|0.237|
|lists|2.753|5.613|2.328|
|outdent|0.163|0.232|0.140|
|paragraphs|5.109|6.168|4.741|
|spanGamut|4.423|6.149|4.001|
|strikethrough|0.003|0.051|0.000|
|stripLinkDefinitions|0.160|0.226|0.142|
|tables|0.002|0.043|0.000|
|unescapeSpecialChars|0.011|0.046|0.007|


## [version 1.7.1](https://github.com/showdownjs/showdown/tree/1.7.1)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|1.074|20.566|0.324|
|performance.testfile.md|30.463|82.116|26.022|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.233|9.062|2.359|
|anchors|0.351|0.763|0.286|
|autoLinks|0.089|0.190|0.065|
|blockQuotes|2.074|4.989|1.729|
|codeBlocks|0.256|0.937|0.179|
|codeSpans|0.242|0.839|0.158|
|detab|0.099|0.168|0.086|
|encodeAmpsAndAngles|0.131|0.646|0.093|
|encodeBackslashEscapes|0.076|0.140|0.070|
|encodeCode|0.994|1.706|0.865|
|escapeSpecialCharsWithinTagAttributes|0.267|0.375|0.250|
|githubCodeBlocks|0.192|0.966|0.140|
|hashBlock|0.059|0.397|0.036|
|hashElement|0.002|0.031|0.000|
|hashHTMLSpans|4.117|5.585|3.890|
|hashPreCodeTags|0.142|0.529|0.108|
|headers|1.145|4.103|0.864|
|horizontalRule|0.217|0.366|0.194|
|images|0.151|0.553|0.117|
|italicsAndBold|0.312|1.241|0.236|
|lists|4.023|7.077|2.498|
|outdent|0.175|0.261|0.148|
|paragraphs|6.557|8.645|4.997|
|spanGamut|5.073|6.347|4.137|
|strikethrough|0.006|0.110|0.000|
|stripLinkDefinitions|0.164|0.277|0.142|
|tables|0.004|0.080|0.000|
|unescapeSpecialChars|0.009|0.046|0.007|


## [version 1.7.0](https://github.com/showdownjs/showdown/tree/1.7.0)

### Test Suite: Basic (50 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|Simple "Hello World"|0.393|9.953|0.097|
|performance.testfile.md|29.416|54.253|25.949|

### Test Suite: subParsers (20 cycles)
| test | avgTime | max | min |
|:-----|--------:|----:|----:|
|hashHTMLBlocks|4.062|7.185|2.326|
|anchors|0.488|4.086|0.281|
|autoLinks|0.086|0.200|0.063|
|blockQuotes|2.071|4.554|1.733|
|codeBlocks|0.253|0.864|0.178|
|codeSpans|0.261|0.592|0.160|
|detab|0.095|0.130|0.089|
|encodeAmpsAndAngles|0.103|0.192|0.095|
|encodeBackslashEscapes|0.106|0.589|0.071|
|encodeCode|0.927|1.182|0.835|
|escapeSpecialCharsWithinTagAttributes|0.276|0.617|0.245|
|githubCodeBlocks|0.195|0.980|0.139|
|hashBlock|0.062|0.483|0.035|
|hashElement|0.001|0.025|0.000|
|hashHTMLSpans|4.120|4.610|3.859|
|hashPreCodeTags|0.147|0.535|0.105|
|headers|1.308|4.253|0.856|
|horizontalRule|0.220|0.374|0.194|
|images|0.150|0.507|0.116|
|italicsAndBold|0.306|0.872|0.241|
|lists|3.447|4.893|2.407|
|outdent|0.267|0.868|0.181|
|paragraphs|5.867|8.331|4.970|
|spanGamut|5.039|7.124|4.116|
|strikethrough|0.004|0.073|0.000|
|stripLinkDefinitions|0.153|0.243|0.140|
|tables|0.002|0.044|0.000|
|unescapeSpecialChars|0.009|0.041|0.007|


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


