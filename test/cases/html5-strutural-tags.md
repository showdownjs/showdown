
These HTML5 tags should pass through just fine.

<section>hello</section>
<header>head</header>
<footer>footsies</footer>
<nav>navigation</nav>
<article>read me</article>
<aside>ignore me</aside>
<article>read
me</article>
<aside>
ignore me
</aside>

the end

<table class="test">
    <tr>
        <td>Foo</td>
    </tr>
    <tr>
        <td>Bar</td>
    </tr>
</table>

<table class="test">
    <thead>
        <tr>
            <td>Foo</td>
        </tr>
    </thead>
    <tr>
        <td>Bar</td>
    </tr>
    <tfoot>
        <tr>
            <td>Bar</td>
        </tr>
    </tfoot>
</table>

<audio class="podcastplayer" controls>
    <source src="foobar.mp3" type="audio/mp3" preload="none"></source>
    <source src="foobar.off" type="audio/ogg" preload="none"></source>
</audio>

<video src="foo.ogg">
    <track kind="subtitles" src="foo.en.vtt" srclang="en" label="English">
    <track kind="subtitles" src="foo.sv.vtt" srclang="sv" label="Svenska">
</video>

<address>My street</address>

<canvas id="canvas" width="300" height="300">
    Sorry, your browser doesn't support the &lt;canvas&gt; element.
</canvas>

<figure>
    <img src="mypic.png" alt="An awesome picture">
    <figcaption>Caption for the awesome picture</figcaption>
</figure>

<hgroup>
  <h1>Main title</h1>
  <h2>Secondary title</h2>
</hgroup>

<output name="result"></output>