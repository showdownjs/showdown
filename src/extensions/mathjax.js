//
//  MathJax Extension
//  $$ F = m * a $$ -> ` F = m \cdot a `
//	$$$ F = m * a $$$ -> <script type="math/tex; mode=display"> F = m \cdot a </script>
//
//
//	Dont forget to include
//
// 	<script type="text/javascript"
//  	src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML">
//	</script>
//
//


(function(){
	var mathjax = function(converter) {

		var escapeCharacters = function(text, charsToEscape, afterBackslash) {
			// First we have to escape the escape characters so that
			// we can build a character class out of them
			var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

			if (afterBackslash) {
				regexString = "\\\\" + regexString;
			}

			var regex = new RegExp(regexString,"g");
			text = text.replace(regex,escapeCharacters_callback);

			return text;
		}


		var escapeCharacters_callback = function(wholeMatch,m1) {
			var charCodeToEscape = m1.charCodeAt(0);
			return "~E"+charCodeToEscape+"E";
		}

		return [
			{
				type    : 'lang',
				regex   : '(?:~D~D~D)(.*)(?:~D~D~D)',
				replace : function(match, content) {
					content = content.replace(/\*/g,"\\cdot")
					return '<script type="math/tex; mode=display">' + escapeCharacters(content,"\*_{}[]\\",false) + '</script>';
				}
			},
			{
				type    : 'lang',
				regex   : '(?:~D~D)(.*)(?:~D~D)',
				replace : function(match, content) {
					content = content.replace(/\*/g,"\\cdot")
					return escapeCharacters('`' + content + '`',"`\*_{}[]\\",false);
				}
			}
		];
	};

	// Client-side export
	if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.mathjax = mathjax; }
	// Server-side export
	if (typeof module !== 'undefined') module.exports = mathjax;
}());
