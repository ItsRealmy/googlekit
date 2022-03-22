# googlekit
Get an array of search results, scraped right from Google!

## Example
The default export is just a function, which returns a `Promise`.

```js
const search = require("googlekit");

await search("furry porn", 0); // The first argument is the query, the second argument is the page it should be on (0 == page one, 1 == page two)
```