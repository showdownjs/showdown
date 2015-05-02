```
sudo apt-get install \
python2.7 \
python-imaging \
python-mysqldb \
python-setuptools \
python-simplejson \
-y
```

<!-- crazy example -->
A \`

```
1
```

`B`

```
2
```

Below is just about everything you’ll need to style in the theme. Check the source code to see the many embedded elements within paragraphs.

---

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

Lorem ipsum dolor sit amet, <a title="test link" href="#">test link</a> adipiscing elit. <strong>This is strong.</strong> Nullam dignissim convallis est. Quisque aliquam. <em>This is emphasized.</em> Donec faucibus. Nunc iaculis suscipit dui. 5<sup>3</sup> = 125. Water is H<sub>2</sub>O. Nam sit amet sem. Aliquam libero nisi, imperdiet at, tincidunt nec, gravida vehicula, nisl. <cite>The New York Times</cite> (That’s a citation). <span style="text-decoration:underline;">Underline.</span> Maecenas ornare tortor. Donec sed tellus eget sapien fringilla nonummy. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus.

<abbr title="Hyper Text Markup Language">HTML</abbr> and <abbr title="Cascading Style Sheets">CSS</abbr> are our tools. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus.  Praesent mattis, massa quis luctus fermentum, turpis mi volutpat justo, eu volutpat enim diam eget metus. To copy a file type <code>COPY <var>filename</var></code>. <del>Dinner’s at 5:00.</del> <ins>Let’s make that 7.</ins> This <span style="text-decoration:line-through;">text</span> has been struck.

---

## Media

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.

### Big Image

![Test Image](/content/images/2014/09/testimg1.jpeg)

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### Small Image

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore.

![Small Test Image](/content/images/2014/09/testimg2.jpg)

Labore et dolore.

---

## List Types
### Definition List

<dl>
<dt>Definition List Title</dt>
<dd>This is a definition list division.</dd>
<dt>Definition</dt>
<dd>An exact statement or description of the nature, scope, or meaning of something: <em>our definition of what constitutes poetry.</em></dd>
</dl>

### Ordered List

1. List Item 1
2. List Item 2
 1. Nested list item A
 2. Nested list item B
3. List Item 3

### Unordered List

* List Item 1
* List Item 2
 * Nested list item A
 * Nested list item B
* List Item 3

---

## Table

<table>
<tbody>
<tr>
<th>Table Header 1</th>
<th>Table Header 2</th>
<th>Table Header 3</th>
</tr>
<tr>
<td>Division 1</td>
<td>Division 2</td>
<td>Division 3</td>
</tr>
<tr class="even">
<td>Division 1</td>
<td>Division 2</td>
<td>Division 3</td>
</tr>
<tr>
<td>Division 1</td>
<td>Division 2</td>
<td>Division 3</td>
</tr>
</tbody>
</table>

---

## Preformatted Text

Typographically, preformatted text is not the same thing as code. Sometimes, a faithful execution of the text requires preformatted text that may not have anything to do with code. Most browsers use Courier and that’s a good default — with one slight adjustment, Courier 10 Pitch over regular Courier for Linux users.

### Code

Code can be presented inline, like <code>&lt;?php bloginfo('stylesheet_url'); ?&gt;</code>, or within a <code>&lt;pre&gt;</code> block. Because we have more specific typographic needs for code, we’ll specify Consolas and Monaco ahead of the browser-defined monospace font.

    #container {
	    float: left;
	    margin: 0 -240px 0 0;
	    width: 100%;
    }

---

## Blockquotes

Let’s keep it simple. Italics are good to help set it off from the body text. Be sure to style the citation.

> Good afternoon, gentlemen. I am a HAL 9000 computer. I became operational at the H.A.L. plant in Urbana, Illinois on the 12th of January 1992. My instructor was Mr. Langley, and he taught me to sing a song. If you’d like to hear it I can sing it for you. <cite>— [HAL 9000](http://en.wikipedia.org/wiki/HAL_9000)</cite>

And here’s a bit of trailing text.

---

## Text-level semantics


The <a href="#">a element</a> example
The <abbr>abbr element</abbr> and <abbr title="Title text">abbr element with title</abbr> examples
The <b>b element</b> example
The <cite>cite element</cite> example
The <code>code element</code> example
The <del>del element</del> example
The <dfn>dfn element</dfn> and <dfn title="Title text">dfn element with title</dfn> examples
The <em>em element</em> example
The <i>i element</i> example
The <ins>ins element</ins> example
The <kbd>kbd element</kbd> example
The <mark>mark element</mark> example
The <q>q element <q>inside</q> a q element</q> example
The <s>s element</s> example
The <samp>samp element</samp> example
The <small>small element</small> example
The <span>span element</span> example
The <strong>strong element</strong> example
The <sub>sub element</sub> example
The <sup>sup element</sup> example
The <var>var element</var> example
The <u>u element</u> example

---

## Forms

<form> 
<fieldset> 
<legend>Inputs as descendents of labels (form legend)</legend>
<label>
<b>Text input</b>
<input type="text" value="default value">
</label>
<label>
<b>Email input</b>
<input type="email">
</label>
<label>
<b>Search input</b>
<input type="search">
</label>
<label>
<b>Tel input</b>
<input type="tel">
</label>
<label>
<b>URL input</b>
<input type="url" placeholder="http://">
</label>
<label>
<b>Password input</b>
<input type="password" value="password">
</label>
<label>
<b>File input</b>
<input type="file">
</label> 
<label>
<b>Radio input</b>
<input type="radio" name="rad">
</label>
<label>
<b>Checkbox input</b>
<input type="checkbox">
</label>
<label>
<input type="radio" name="rad"> Radio input
</label>
<label>
<input type="checkbox"> Checkbox input
</label> 
<label>
<b>Select field</b>
<select>
<option>Option 01</option>
<option>Option 02</option>
</select>
</label>
<label>
<b>Textarea</b>
<textarea cols="30" rows="5" >Textarea text</textarea>
</label> 
</fieldset> 

<fieldset> 
<legend>Clickable inputs and buttons</legend>
<input type="image" src="http://placekitten.com/90/24" alt="Image (input)">
<input type="reset" value="Reset (input)">
<input type="button" value="Button (input)">
<input type="submit" value="Submit (input)"> 
<button type="reset">Reset (button)</button>
<button type="button">Button (button)</button>
<button type="submit">Submit (button)</button> 
</fieldset> 

<fieldset id="boxsize"> 
<legend>box-sizing tests</legend> 
<div><input type="text" value="text"></div> 
<div><input type="email" value="email"></div> 
<div><input type="search" value="search"></div> 
<div><input type="url" value="http://example.com"></div> 
<div><input type="password" value="password"></div> 

<div><input type="color" value="#000000"></div> 
<div><input type="number" value="5"></div> 
<div><input type="range" value="10"></div> 
<div><input type="date" value="1970-01-01"></div> 
<div><input type="month" value="1970-01"></div> 
<div><input type="week" value="1970-W01"></div>
<div><input type="time" value="18:23"></div>
<div><input type="datetime" value="1970-01-01T00:00:00Z"></div> 
<div><input type="datetime-local" value="1970-01-01T00:00"></div> 

<div><input type="radio"></div> 
<div><input type="checkbox"></div> 

<div><select><option>Option 01</option><option>Option 02</option></select></div> 
<div><textarea cols="30" rows="5" >Textarea text</textarea></div> 

<div><input type="image" src="http://placekitten.com/90/24" alt="Image (input)"></div> 
<div><input type="reset" value="Reset (input)"></div> 
<div><input type="button" value="Button (input)"></div> 
<div><input type="submit" value="Submit (input)"></div> 

<div><button type="reset">Reset (button)</button></div> 
<div><button type="button">Button (button)</button></div> 
<div><button type="submit">Submit (button)</button></div> 
</fieldset> 
</form>

---

## Embeds

Sometimes all you want to do is embed a little love from another location and set your post alive.

### Video

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

<iframe src="//player.vimeo.com/video/103224792?title=0&amp;byline=0&amp;portrait=0" width="600" height="338" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

Culpa qui officia deserunt mollit anim id est laborum.

### Slides

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

<script async class="speakerdeck-embed" data-id="34d2856027ce01316b5d621ab8e7d421" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

Culpa qui officia deserunt mollit anim id est laborum.

### Audio

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/169381837&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>

Culpa qui officia deserunt mollit anim id est laborum.

### Code

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.

<div data-height="268" data-theme-id="0" data-slug-hash="bcqhe" data-default-tab="js" data-user="rglazebrook" class='codepen'>
<pre><code>var c = new Sketch.create({autoclear: false}),
    bigCircle = 50,
    littleCircle = 5,
    // The velocity value determines how much to move the spinner head (in radians).
    velocity = 0.105,
    hue = 0,
    // The alpha value below determines the length of the spinner&#39;s tail.
    bg = &#39;rgba(40,40,40,.075)&#39;;
    Spinner = function() {};

Spinner.prototype.setup = function() {
  this.x = c.width / 2;
  this.y = c.height / 2 - bigCircle;
  this.rotation = 0;
}
Spinner.prototype.update = function() {
  this.rotation += velocity;
  this.rotation = this.rotation % TWO_PI;
  this.x = c.width /2 + cos(this.rotation) * bigCircle;
  this.y = c.height / 2 + sin(this.rotation) * bigCircle;
}
Spinner.prototype.draw = function() {
  c.fillStyle = &#39;hsl(&#39;+hue+&#39;,50%,50%)&#39;;
  c.beginPath();
  c.arc(this.x, this.y, littleCircle, 0, TWO_PI);
  c.fill();
  c.closePath(); 
}
c.setup = function() {
  spinner = new Spinner();
  spinner.setup();
} 
c.update = function() {
  spinner.update();
  hue = ++hue % 360;
}
c.draw = function() {
  spinner.draw();
  c.fillStyle = bg;
  c.fillRect(0,0,c.width,c.height);
}
</code></pre>
<p>See the Pen <a href='http://codepen.io/rglazebrook/pen/bcqhe/'>Simple Rotating Spinner</a> by Rob Glazebrook (<a href='http://codepen.io/rglazebrook'>@rglazebrook</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
</div>

<script async src="//codepen.io/assets/embed/ei.js"></script>

Isn't it beautiful.