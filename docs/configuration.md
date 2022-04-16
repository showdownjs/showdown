You can change Showdown's default behavior via options. 

## Set option

### Globally

Setting an option globally affects all Showdown instances.

```js
showdown.setOption('optionKey', 'value');
```

### Locally

Setting an option locally affects the specified Converter object only. You can set local options via:

=== "Constructor"

    ```js
    var converter = new showdown.Converter({optionKey: 'value'});
    ```

=== "setOption() method"

    ```js
    var converter = new showdown.Converter();
    converter.setOption('optionKey', 'value');
    ```

## Get option

Showdown provides both local and global methods to retrieve previously set options:

=== "getOption()"
    
    ```js
    // Global
    var myOption = showdown.getOption('optionKey');

    //Local
    var myOption = converter.getOption('optionKey');
    ```

=== "getOptions()"

    ```js
    // Global
    var showdownGlobalOptions = showdown.getOptions();

    //Local
    var thisConverterSpecificOptions = converter.getOptions();
    ```

### Get default options

You can get Showdown's default options with:

```js
var defaultOptions = showdown.getDefaultOptions();
```