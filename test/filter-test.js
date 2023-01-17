const test = require("ava");
const Eleventy = require("@11ty/eleventy");
const pluginRev = require("..");


let fileContent = "file content";
let hash = pluginRev.generateRevHash(fileContent);
let result;

test.before(async t => {
  let elev = new Eleventy(
    "./test/fixture",
    "./test/fixture/_site",
    {
      config: function(eleventyConfig) {
        eleventyConfig.addPlugin(pluginRev);
        pluginRev.createRevHash("assets/css/style.css", fileContent);
        pluginRev.setPathPair("assets/css/style.css", "/css/style.css");

        pluginRev.createRevHash("relative/foo/style.css", fileContent);
        pluginRev.setPathPair("relative/foo/style.css", "/relative/bar/style.css");
      }
    }
  );
  result = await elev.toJSON();
});

test("rev filter with absolute path", async t => {
  t.is(result.filter(entry => entry.url === "/rev/")[0].content.trim(),
    `<p>/css/style-${ hash }.css</p>`);
});

test("rev Liquid filter with relative path in markdown", async t => {
  t.is(result.filter(entry => entry.url === "/relative/md/rev/")[0].content.trim(),
    `<p>/relative/bar/style-${ hash }.css</p>`);
  t.is(result.filter(entry => entry.url === "/")[0].content.trim(),
    `<p>/css/style-${ hash }.css</p>`);
});

test("rev Liquid filter with relative path in markdown from not index.html", async t => {
  t.is(result.filter(entry => entry.url === "/relative/md/rev-not-index-html.html")[0].content.trim(),
    `<p>/relative/bar/style-${ hash }.css</p>`);
});

test("rev Liquid filter with relative path", async t => {
  t.is(result.filter(entry => entry.url === "/relative/liquid/rev/")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev Liquid filter with relative path from not index.html", async t => {
  t.is(result.filter(entry => entry.url === "/relative/liquid/rev-not-index-html.html")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev Nunjucks filter with relative path", async t => {
  t.is(result.filter(entry => entry.url === "/relative/nunjucks/rev/")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev Nunjucks filter with relative path from not index.html", async t => {
  t.is(result.filter(entry => entry.url === "/relative/nunjucks/rev-not-index-html.html")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev Handlebars helper with relative path", async t => {
  t.is(result.filter(entry => entry.url === "/relative/handlebars/rev/")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev Handlebars helper with relative path from not index.html", async t => {
  t.is(result.filter(entry => entry.url === "/relative/handlebars/rev-not-index-html.html")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev JavaScript function with relative path", async t => {
  t.is(result.filter(entry => entry.url === "/relative/js/rev/")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("rev JavaScript function with relative path from not index.html", async t => {
  t.is(result.filter(entry => entry.url === "/relative/js/rev-not-index-html.html")[0].content.trim(),
    `/relative/bar/style-${ hash }.css`);
});

test("inputToRevvedOutput filter", async t => {
  t.is(result.filter(entry => entry.url === "/input-to-revved-output/")[0].content.trim(),
    `<p>/css/style-${ hash }.css</p>`);
});
