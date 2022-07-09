# eleventy-plugin-rev

This Eleventy plugin provides utility functions to make your assets revisioned.

## Install

```bash
npm install eleventy-plugin-rev
```

Add it to Eleventy config file (usually `.eleventy.js`)
```JavaScript
const rev = require("eleventy-plugin-rev");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(rev);
};
```
