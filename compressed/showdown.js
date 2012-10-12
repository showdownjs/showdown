//
// showdown.js -- A javascript port of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber
//   <http://daringfireball.net/projects/markdown/>
//
// Redistributable under a BSD-style open source license.
// See license.txt for more information.
//
// The full source distribution is at:
//
//              A A L
//              T C A
//              T K B
//
//   <http://www.attacklab.net/>
//
//
// Wherever possible, Showdown is a straight, line-by-line port
// of the Perl version of Markdown.
//
// This is not a normal parser design; it's basically just a
// series of string substitutions.  It's hard to read and
// maintain this way,  but keeping Showdown close to the original
// design makes it easier to port new features.
//
// More importantly, Showdown behaves like markdown.pl in most
// edge cases.  So web applications can do client-side preview
// in Javascript, and then build identical HTML on the server.
//
// This port needs the new RegExp functionality of ECMA 262,
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
// should do fine.  Even with the new regular expression features,
// We do a lot of work to emulate Perl's regex functionality.
// The tricky changes in this file mostly have the "attacklab:"
// label.  Major or self-explanatory changes don't.
//
// Smart diff tools like Araxis Merge will be able to match up
// this file with markdown.pl in a useful way.  A little tweaking
// helps: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text".  Be sure to ignore whitespace
// and line endings.
//
//
// Showdown usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Showdown.converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//
//
// Showdown namespace
//
var Showdown={converter:function(){var i,j,n,p=0;this.makeHtml=function(a){i=[];j=[];n=[];a=a.replace(/~/g,"~T");a=a.replace(/\$/g,"~D");a=a.replace(/\r\n/g,"\n");a=a.replace(/\r/g,"\n");a=q("\n\n"+a+"\n\n");a=a.replace(/^[ \t]+$/mg,"");a=(a+"~0").replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,function(a,b,e){a=r(e);a=q(a);a=a.replace(/^\n+/g,"");a=a.replace(/\n+$/g,"");a="<pre><code"+(b?' class="'+b+'"':"")+">"+a+"\n</code></pre>";return h(a)});a=a.replace(/~0/,"");a=x(a);a=a.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
function(a,b,e,d,f){b=b.toLowerCase();i[b]=y(e);if(d)return d+f;f&&(j[b]=f.replace(/"/g,"&quot;"));return""});a=s(a);a=z(a);a=a.replace(/~D/g,"$$");return a=a.replace(/~T/g,"~")};var x=function(a){a=a.replace(/\n/g,"\n\n");a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,l);a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,
l);a=a.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,l);a=a.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,l);a=a.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,l);return a=a.replace(/\n\n/g,"\n")},l=function(a,c){var b;b=c.replace(/\n\n/g,"\n");b=b.replace(/^\n/,"");b=b.replace(/\n+$/g,"");return b="\n\n~K"+(n.push(b)-1)+"K\n\n"},s=function(a){for(var c=function(a){return a.replace(/[^\w]/g,"").toLowerCase()},a=a.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
function(a,b){return h('<h1 id="'+c(b)+'">'+m(b)+"</h1>")}),a=a.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(a,b){return h('<h2 id="'+c(b)+'">'+m(b)+"</h2>")}),a=a.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(a,b,f){a=b.length;return h("<h"+a+' id="'+c(f)+'">'+m(f)+"</h"+a+">")}),b=h("<hr />"),a=a.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,b),a=A(a),a=a+"~0",a=a.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
function(a,b,c){a=r(t(b));a=q(a);a=a.replace(/^\n+/g,"");a=a.replace(/\n+$/g,"");a="<pre><code>"+a+"\n</code></pre>";return h(a)+c}),a=a.replace(/~0/,""),a=a.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(a,b){var c;c=b.replace(/^[ \t]*>[ \t]?/gm,"~0");c=c.replace(/~0/g,"");c=c.replace(/^[ \t]+$/gm,"");c=s(c);c=c.replace(/(^|\n)/g,"$1  ");c=c.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(a,c){var b;b=c.replace(/^  /mg,"~0");return b=b.replace(/~0/g,"")});return h("<blockquote>\n"+c+"\n</blockquote>")}),
a=x(a),a=a.replace(/^\n+/g,""),a=a.replace(/\n+$/g,""),e=a.split(/\n{2,}/g),a=[],b=e.length,d=0;d<b;d++){var f=e[d];0<=f.search(/~K(\d+)K/g)?a.push(f):0<=f.search(/\S/)&&(f=m(f),f=f.replace(/^([ \t]*)/g,"<p>"),f+="</p>",a.push(f))}b=a.length;for(d=0;d<b;d++)for(;0<=a[d].search(/~K(\d+)K/);)e=n[RegExp.$1],e=e.replace(/\$/g,"$$$$"),a[d]=a[d].replace(/~K\d+K/,e);return a=a.join("\n\n")},m=function(a){a=a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(a,b,e,d){a=d.replace(/^([ \t]*)/g,"");a=a.replace(/[ \t]*$/g,
"");a=r(a);return b+"<code>"+a+"</code>"});a=a.replace(/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi,function(a){a=a.replace(/(.)<\/?code>(?=.)/g,"$1`");return a=k(a,"\\`*_")});a=a.replace(/\\(\\)/g,u);a=a.replace(/\\([`*_{}\[\]()>#+-.!])/g,u);a=a.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,B);a=a.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,B);a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,v);a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,
v);a=a.replace(/(\[([^\[\]]+)\])()()()()()/g,v);a=a.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,'<a href="$1">$1</a>');a=a.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(a,b){var e=z(b),d=[function(a){return"&#"+a.charCodeAt(0)+";"},function(a){a=a.charCodeAt(0);return"&#x"+("0123456789ABCDEF".charAt(a>>4)+"0123456789ABCDEF".charAt(a&15))+";"},function(a){return a}],e=("mailto:"+e).replace(/./g,function(a){if("@"==a)a=d[Math.floor(2*Math.random())](a);else if(":"!=
a)var b=Math.random(),a=0.9<b?d[2](a):0.45<b?d[1](a):d[0](a);return a}),e='<a href="'+e+'">'+e+"</a>";return e=e.replace(/">.+:/g,'">')});a=y(a);a=a.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>");a=a.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>");return a=a.replace(/  +\n/g," <br />\n")},v=function(a,c,b,e,d,f,h,g){void 0==g&&(g="");a=e.toLowerCase();if(""==d)if(""==a&&(a=b.toLowerCase().replace(/ ?\n/g," ")),void 0!=i[a])d=i[a],void 0!=j[a]&&(g=j[a]);else if(-1<c.search(/\(\s*\)$/m))d=
"";else return c;d=k(d,"*_");c='<a href="'+d+'"';""!=g&&(g=g.replace(/"/g,"&quot;"),g=k(g,"*_"),c+=' title="'+g+'"');return c+(">"+b+"</a>")},B=function(a,c,b,e,d,f,h,g){a=b;e=e.toLowerCase();g||(g="");if(""==d)if(""==e&&(e=a.toLowerCase().replace(/ ?\n/g," ")),void 0!=i[e])d=i[e],void 0!=j[e]&&(g=j[e]);else return c;a=a.replace(/"/g,"&quot;");d=k(d,"*_");c='<img src="'+d+'" alt="'+a+'"';g=g.replace(/"/g,"&quot;");g=k(g,"*_");return c=c+(' title="'+g+'"')+" />"},w,A=function(a){var a=a+"~0",c=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
p?a=a.replace(c,function(a,c,d){a=c;d=-1<d.search(/[*+-]/g)?"ul":"ol";a=a.replace(/\n{2,}/g,"\n\n\n");a=w(a);a=a.replace(/\s+$/,"");return"<"+d+">"+a+"</"+d+">\n"}):(c=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g,a=a.replace(c,function(a,c,d,f){a=d;f=-1<f.search(/[*+-]/g)?"ul":"ol";a=a.replace(/\n{2,}/g,"\n\n\n");a=w(a);return c+"<"+f+">\n"+a+"</"+f+">\n"}));return a=a.replace(/~0/,"")};w=function(a){p++;a=a.replace(/\n{2,}$/,"\n");a=(a+"~0").replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
function(a,b,e,d,f){a=f;b||-1<a.search(/\n{2,}/)?a=s(t(a)):(a=A(t(a)),a=a.replace(/\n$/,""),a=m(a));return"<li>"+a+"</li>\n"});a=a.replace(/~0/g,"");p--;return a};var h=function(a){a=a.replace(/(^\n+|\n+$)/g,"");return"\n\n~K"+(n.push(a)-1)+"K\n\n"},r=function(a){a=a.replace(/&/g,"&amp;");a=a.replace(/</g,"&lt;");a=a.replace(/>/g,"&gt;");return a=k(a,"*_{}[]\\",!1)},y=function(a){a=a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");return a=a.replace(/<(?![a-z\/?\$!])/gi,"&lt;")},z=function(a){return a=
a.replace(/~E(\d+)E/g,function(a,b){var e=parseInt(b);return String.fromCharCode(e)})},t=function(a){a=a.replace(/^(\t|[ ]{1,4})/gm,"~0");return a=a.replace(/~0/g,"")},q=function(a){a=a.replace(/\t(?=\t)/g,"    ");a=a.replace(/\t/g,"~A~B");a=a.replace(/~B(.+?)~A/g,function(a,b){for(var e=b,d=4-e.length%4,f=0;f<d;f++)e+=" ";return e});a=a.replace(/~A/g,"    ");return a=a.replace(/~B/g,"")},k=function(a,c,b){c="(["+c.replace(/([\[\]\\])/g,"\\$1")+"])";b&&(c="\\\\"+c);return a=a.replace(RegExp(c,"g"),
u)},u=function(a,c){return"~E"+c.charCodeAt(0)+"E"}}};"undefined"!==typeof module&&(module.exports=Showdown);
