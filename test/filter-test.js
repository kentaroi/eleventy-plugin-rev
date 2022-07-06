const test = require("ava");
const Eleventy = require("@11ty/eleventy");
const pluginRev = require("..");

test("rev and inputToRevvedOutput filters", async t => {
  let elev = new Eleventy(
    "./test/fixture",
    "./test/fixture/_site",
    {
      config: function(eleventyConfig) {
        eleventyConfig.addPlugin(pluginRev);
        pluginRev.createRevHash("assets/css/style.css", "file content");
        pluginRev.setPathPair("assets/css/style.css", "/css/style.css");
      }
    }
  );
  let result = await elev.toJSON();

  let hash = pluginRev.generateRevHash("file content");
  t.is(result.filter(entry => entry.url === "/rev/")[0].content,
    `<p>/css/style-${ hash }.css</p>\n`);
  t.is(result.filter(entry => entry.url === "/input-to-revved-output/")[0].content,
    `<p>/css/style-${ hash }.css</p>\n`);
});
