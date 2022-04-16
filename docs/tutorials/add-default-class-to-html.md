# Add default class for each HTML element

Many people use CSS kits like Bootstrap, Semantic UI, or others that require default name classes for HTML elements:

```html
<h1 class="ui large header">1st Heading</h1>
<h2 class="ui medium header">2nd Heading</h2>
<ul class="ui list">
  <li class="ui item">first item</li>
  <li class="ui item">second item</li>
</ul>
```

Showdown does not support this out-of-the-box. But you can create an extension for this:

```js
const showdown = require('showdown');

const classMap = {
  h1: 'ui large header',
  h2: 'ui medium header',
  ul: 'ui list',
  li: 'ui item'
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: 'output',
    regex: new RegExp(`<${key}(.*)>`, 'g'),
    replace: `<${key} class="${classMap[key]}" $1>`
  }));

const conv = new showdown.Converter({
  extensions: [...bindings]
});

const text = `
# 1st Heading
## 2nd Heading

- first item
- second item
`;
```

With this extension, the output will be as follows:

```html
​​​​​<h1 class="ui large header">1st Heading</h1>​​​​​
​​​​​<h2 class="ui medium header">2nd Heading</h2>​​​​​
​​​​​<ul class="ui list">​​​​​
  ​​​​​<li class="ui item">first item</li>​​​​​
  ​​​​​<li class="ui item">second item</li>​​​​​
​​​​​</ul>​​​​​
```

## Credits

* Initial creator: [@zusamann](https://github.com/zusamann), [(original issue)](https://github.com/showdownjs/showdown/issues/376).
* Updated by [@Kameelridder](https://github.com/Kameelridder), [(original issue)](https://github.com/showdownjs/showdown/issues/509).
