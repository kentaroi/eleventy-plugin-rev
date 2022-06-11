const { createHash } = require("crypto");
const path = require("path");
const dataStore = require("./data-store");


let settings = {
  hashLength: 8,
  hashAlgorithm: "md5"
};

// TODO think about windows environment
const revvedFilePath = function(filePath, hash) {
  if (hash == undefined || hash.length === 0) {
    return filePath;
  }
  let dir = path.dirname(filePath);
  let ext = path.extname(filePath);
  let basename = path.basename(filePath, ext);
  return path.join(dir, basename + "-" + hash + ext);
};


const generateRevHash = function(contents) {
  return createHash(settings.hashAlgorithm).update(contents).digest("hex").slice(0, settings.hashLength);
};

const registerRevHash = function(inputPath, hash) {
  dataStore.registerRevHash(inputPath, hash);
};

const createRevHash = function(inputPath, contents) {
  let hash = generateRevHash(contents);
  registerRevHash(inputPath, hash);
  return hash;
};

const deleteRevHash = function(inputPath) {
  dataStore.deleteRevHash(inputPath);
};

const setPathPair = function(inputPath, outputPath) {
  return dataStore.setPathPair(inputPath, outputPath);
};


const revHashFromInputPath = function(inputPath) {
  return dataStore.getRevHashFromInputPath(inputPath);
};

const revHashFromOutputPath = function(outputPath) {
  return dataStore.getRevHashFromOutputPath(outputPath);
};

const revvedFilePathFromInputPath = function(inputPath) {
  let outputPath = dataStore.getOutputPathFromInputPath(inputPath);
  let hash = revHashFromInputPath(inputPath);
  return revvedFilePath(outputPath, hash);
};

const revvedFilePathFromOutputPath = function(outputPath) {
  let hash = revHashFromOutputPath(outputPath);
  return revvedFilePath(outputPath, hash);
};

const eleventyPluginRev = function(eleventyConfig) {
  eleventyConfig.addFilter("rev", revvedFilePathFromOutputPath);
  eleventyConfig.addFilter("inputToRevvedOutput", revvedFilePathFromInputPath);
};

const clear = function() {
  dataStore.clear();
};

const outputAllData = function() {
  console.error({
    inputPathsByOutputPath: dataStore.inputPathsByOutputPath,
    outputPathsByInputPath: dataStore.outputPathsByInputPath,
    hashesByInputPath: dataStore.hashesByInputPath
  });
};


const plugin = {
  configFunction: eleventyPluginRev,

  generateRevHash,
  registerRevHash,
  createRevHash,
  deleteRevHash,
  setPathPair,

  revHashFromInputPath,
  revHashFromOutputPath,
  revvedFilePathFromInputPath,
  revvedFilePathFromOutputPath,

  revvedFilePath,

  settings,
  clear,
  outputAllData,
  name: "eleventy-plugin-rev"
};

module.exports = plugin;
