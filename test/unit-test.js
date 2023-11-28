const test = require("ava");
const pluginRev = require("..");
const { createHash } = require("crypto");

const expectedHash = createHash("sha256").update("FOO").digest("hex").slice(0, 8);
const expectedSHA3Hash = createHash("sha3-256").update("FOO").digest("hex").slice(0, 8);
const expectedLongerHash = createHash("sha256").update("FOO").digest("hex").slice(0, 12);

test.beforeEach(t => {
  pluginRev.clear();
});

test("generateRevHash", t => {
  let hash = pluginRev.generateRevHash("FOO");
  t.is(hash, expectedHash);
});

test("settings.hashAlgorithm", t => {
  pluginRev.settings.hashAlgorithm = "sha3-256";
  let hash = pluginRev.generateRevHash("FOO");
  t.is(hash, expectedSHA3Hash);
  pluginRev.settings.hashAlgorithm = "sha256";
});

test("settings.hashLength", t => {
  pluginRev.settings.hashLength = 12;
  let hash = pluginRev.generateRevHash("FOO");
  t.is(hash, expectedLongerHash);
  pluginRev.settings.hashLength = 8;
});

test("createRevHash", t => {
  pluginRev.createRevHash("foo", "FOO");
  t.is(pluginRev.revHashFromInputPath("foo"), expectedHash);
});

test("registerRevHash", t => {
  pluginRev.registerRevHash("foo", "BAR");
  t.is(pluginRev.revHashFromInputPath("foo"), "BAR");
});

test("revvedFilePath", t => {
  t.is(pluginRev.revvedFilePath("foo/bar/baz.qux", "abcdef"), "foo/bar/baz-abcdef.qux");
});

test("setPathPair, revHashFromOutputPath, revvedFilePathFromOutputPath and revvedFilePathFromInputPath", t => {
  pluginRev.createRevHash("foo", "FOO");
  pluginRev.setPathPair("foo", "/bar/baz.qux");
  t.is(pluginRev.revHashFromOutputPath("/bar/baz.qux"), expectedHash);
  t.is(pluginRev.revvedFilePathFromOutputPath("/bar/baz.qux"), `/bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedFilePathFromInputPath("foo"), `/bar/baz-${ expectedHash }.qux`);


  t.is(pluginRev.revvedFilePathFromOutputPath(""), "");
  t.is(pluginRev.revvedFilePathFromOutputPath(undefined), undefined);
  t.is(pluginRev.revvedFilePathFromInputPath(""), "");
  t.is(pluginRev.revvedFilePathFromInputPath(undefined), undefined);
});

test("revvedFilePathFromOutputPath_Liquid, revvedFilePathFromOutputPath_Nunjucks, revvedFilePathFromOutputPath_JavaScript", t => {
  pluginRev.createRevHash("foo", "FOO");
  pluginRev.setPathPair("foo", "/bar/baz.qux");
  t.is(pluginRev.revvedFilePathFromOutputPath_Liquid("/bar/baz.qux"), `/bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedFilePathFromOutputPath_Nunjucks("/bar/baz.qux"), `/bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedFilePathFromOutputPath_JavaScript("/bar/baz.qux"), `/bar/baz-${ expectedHash }.qux`);


  t.is(pluginRev.revvedFilePathFromOutputPath_Liquid(""), "");
  t.is(pluginRev.revvedFilePathFromOutputPath_Nunjucks(""), "");
  t.is(pluginRev.revvedFilePathFromOutputPath_JavaScript(""), "");
  t.is(pluginRev.revvedFilePathFromOutputPath_Liquid(undefined), undefined);
  t.is(pluginRev.revvedFilePathFromOutputPath_Nunjucks(undefined), undefined);
  t.is(pluginRev.revvedFilePathFromOutputPath_JavaScript(undefined), undefined);
});

test("revvedOutputFilter_Liquid, revvedOutputFilter_Nunjucks, revvedOutputFilter_JavaScript", t => {
  pluginRev.createRevHash("foo", "FOO");
  pluginRev.setPathPair("foo", "/bar/baz.qux");
  t.is(pluginRev.revvedOutputFilter_Liquid("/foo"), `/bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedOutputFilter_Nunjucks("/foo"), `/bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedOutputFilter_JavaScript("/foo"), `/bar/baz-${ expectedHash }.qux`);


  t.is(pluginRev.revvedOutputFilter_Liquid(""), "");
  t.is(pluginRev.revvedOutputFilter_Nunjucks(""), "");
  t.is(pluginRev.revvedOutputFilter_JavaScript(""), "");
  t.is(pluginRev.revvedOutputFilter_Liquid(undefined), undefined);
  t.is(pluginRev.revvedOutputFilter_Nunjucks(undefined), undefined);
  t.is(pluginRev.revvedOutputFilter_JavaScript(undefined), undefined);
});

test("revvedFilePathFromInputPath without setPathPair", t => {
  pluginRev.createRevHash("foo", "FOO");
  t.is(pluginRev.revvedFilePathFromInputPath("foo"), undefined);
});

test("deleteRevHash", t => {
  pluginRev.createRevHash("foo", "FOO");
  t.is(pluginRev.revHashFromInputPath("foo"), expectedHash);
  pluginRev.deleteRevHash("foo");
  t.is(pluginRev.revHashFromInputPath("foo"), undefined);
});

test("changing outputPaths", t => {
  pluginRev.registerRevHash("foo", "FOO");
  pluginRev.setPathPair("foo", "/foo");

  pluginRev.registerRevHash("bar", "BAR");
  pluginRev.setPathPair("bar", "/bar");

  pluginRev.setPathPair("bar", "/foo");
  pluginRev.setPathPair("foo", "/foofoo");

  t.is(pluginRev.revHashFromOutputPath("/bar"), undefined);
  t.is(pluginRev.revHashFromOutputPath("/foo"), "BAR");
  t.is(pluginRev.revHashFromOutputPath("/foofoo"), "FOO");
});
