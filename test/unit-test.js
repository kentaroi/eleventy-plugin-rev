const test = require("ava");
const pluginRev = require("..");
const { createHash } = require("crypto");

const expectedHash = createHash("md5").update("FOO").digest("hex").slice(0, 8);
const expectedSHA1Hash = createHash("sha1").update("FOO").digest("hex").slice(0, 8);
const expectedLongerHash = createHash("md5").update("FOO").digest("hex").slice(0, 12);

test.beforeEach(t => {
  pluginRev.clear();
});

test("generateRevHash", t => {
  let hash = pluginRev.generateRevHash("FOO");
  t.is(hash, expectedHash);
});

test("settings.hashAlgorithm", t => {
  pluginRev.settings.hashAlgorithm = "sha1";
  let hash = pluginRev.generateRevHash("FOO");
  t.is(hash, expectedSHA1Hash);
  pluginRev.settings.hashAlgorithm = "md5";
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
  pluginRev.setPathPair("foo", "bar/baz.qux");
  t.is(pluginRev.revHashFromOutputPath("bar/baz.qux"), expectedHash);
  t.is(pluginRev.revvedFilePathFromOutputPath("bar/baz.qux"), `bar/baz-${ expectedHash }.qux`);
  t.is(pluginRev.revvedFilePathFromInputPath("foo"), `bar/baz-${ expectedHash }.qux`);
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
