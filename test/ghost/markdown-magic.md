### Automatic Links

```
https://ghost.org
```

https://ghost.org

### Markdown Footnotes

```
The quick brown fox[^1] jumped over the lazy dog[^2].

[^1]: Foxes are red
[^2]: Dogs are usually not red
```

The quick brown fox[^1] jumped over the lazy dog[^2].


### Syntax Highlighting

    ```language-javascript
       [...]
    ```

Combined with [Prism.js](http://prismjs.com/) in the Ghost theme:

```language-javascript
// # Notifications API
// RESTful API for creating notifications
var Promise            = require('bluebird'),
    _                  = require('lodash'),
    canThis            = require('../permissions').canThis,
    errors             = require('../errors'),
    utils              = require('./utils'),

    // Holds the persistent notifications
    notificationsStore = [],
    // Holds the last used id
    notificationCounter = 0,
    notifications;
```