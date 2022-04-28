# Spec Compliance

## Commonmark

Compliance percentage:

### How to enable commonmark flavor

Enable Commonmark flavor

```
let converter = new showdown.Converter();
converter.setFlavor('commonmark');
```

### Known differences:

#### ATX Headings

 - Showdown doesn't support empty headings

    Input:
    ```md
    # 
    ```
   
    Showdown Output:
    ```html
    <p>#</p>
    ```
   
    Commonmark output:
    ```
    <h1></h1>
    ```