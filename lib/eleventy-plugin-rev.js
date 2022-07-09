const { createHash } = require("crypto");
const path = require("path");
const dataStore = require("./data-store");


let settings = {
  hashLength: 8,
  hashAlgorithm: "md5"
};

// TODO think about windows environment
const revvedFilePath = function(filePath, hash) {
  if (typeof filePath !== "string" || hash == undefined || hash.length === 0) {
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
  if (typeof inputPath !== "string" || inputPath.length === 0)
    return inputPath;

  let outputPath = dataStore.getOutputPathFromInputPath(inputPath);
  let hash = revHashFromInputPath(inputPath);
  return revvedFilePath(outputPath, hash);
};

const revvedFilePathFromOutputPath = function(outputPath) {
  if (typeof outputPath !== "string" || outputPath.length === 0)
    return outputPath;

  if (outputPath[0] !== "/") {
    let current = this.ctx?.page?.url ?? this.context?.environments?.page?.url ?? this.page?.url ?? "/";
    outputPath = path.resolve(current, outputPath);
  }

  let hash = revHashFromOutputPath(outputPath);
  return revvedFilePath(outputPath, hash);
};

const revvedFilePathFromOutputPath_Liquid = function(outputPath) {
  if (typeof outputPath !== "string" || outputPath.length === 0)
    return outputPath;

  if (outputPath[0] !== "/") {
    let current = this.context.environments.page.url;
    outputPath = path.resolve(current, outputPath);
  }

  let hash = revHashFromOutputPath(outputPath);
  return revvedFilePath(outputPath, hash);
};

const revvedFilePathFromOutputPath_Nunjucks = function(outputPath) {
  if (typeof outputPath !== "string" || outputPath.length === 0)
    return outputPath;

  if (outputPath[0] !== "/") {
    let current = this.ctx.page.url;
    outputPath = path.resolve(current, outputPath);
  }

  let hash = revHashFromOutputPath(outputPath);
  return revvedFilePath(outputPath, hash);
};

const revvedFilePathFromOutputPath_JavaScript = function(outputPath) {
  if (typeof outputPath !== "string" || outputPath.length === 0)
    return outputPath;

  if (outputPath[0] !== "/") {
    let current = this.page.url;
    outputPath = path.resolve(current, outputPath);
  }

  let hash = revHashFromOutputPath(outputPath);
  return revvedFilePath(outputPath, hash);
};

const eleventyPluginRev = function(eleventyConfig) {
  eleventyConfig.addLiquidFilter("rev", revvedFilePathFromOutputPath_Liquid);
  eleventyConfig.addNunjucksFilter("rev", revvedFilePathFromOutputPath_Nunjucks);
  eleventyConfig.addHandlebarsHelper("rev", revvedFilePathFromOutputPath_JavaScript);
  eleventyConfig.addJavaScriptFunction("rev", revvedFilePathFromOutputPath_JavaScript);
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
  revvedFilePathFromOutputPath_Liquid,
  revvedFilePathFromOutputPath_Nunjucks,
  revvedFilePathFromOutputPath_JavaScript,

  revvedFilePath,

  settings,
  clear,
  outputAllData,
  name: "eleventy-plugin-rev"
};

module.exports = plugin;
