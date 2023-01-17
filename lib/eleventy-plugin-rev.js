const { createHash } = require("crypto");
const { posix: path } = require("path");
const dataStore = require("./data-store");


let settings = {
  hashLength: 8,
  hashAlgorithm: "md5"
};

let inputDir = "";

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

// The plugin does not use this method.
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

const currentPage_Liquid     = binding => binding.context.environments.page;
const currentPage_Nunjucks   = binding => binding.ctx.page;
const currentPage_JavaScript = binding => binding.page;

const createRevFilter = function(currentPage) {
  return function(outputPath) {
    if (typeof outputPath !== "string" || outputPath.length === 0)
      return outputPath;

    if (outputPath[0] !== "/") {
      let page = currentPage(this);
      let currentDir = path.basename(page.outputPath) === "index.html"
                      ? page.url
                      : path.dirname(page.url);
      outputPath = path.join(currentDir, outputPath);
    }

    let hash = revHashFromOutputPath(outputPath);
    return revvedFilePath(outputPath, hash);
  };
};

const revFilter_Liquid     = createRevFilter(currentPage_Liquid);
const revFilter_Nunjucks   = createRevFilter(currentPage_Nunjucks);
const revFilter_JavaScript = createRevFilter(currentPage_JavaScript);

const createRevvedOutputFilter = function(currentPage) {
  return function(inputPath) {
    if (typeof inputPath !== "string" || inputPath.length === 0)
      return inputPath;

    let normalizedInputPath;
    if (inputPath[0] === "/") {
      normalizedInputPath = inputDir.length === 0
                          ? inputPath.slice(1) // remove '/' at index 0
                          : inputDir + inputPath;
    } else {
      let currentDir = path.dirname(currentPage(this).inputPath);
      normalizedInputPath = path.join(currentDir, inputPath);
    }

    let outputPath = dataStore.getOutputPathFromInputPath(normalizedInputPath);
    let hash = revHashFromInputPath(normalizedInputPath);
    return revvedFilePath(outputPath, hash);
  };
};

const revvedOutputFilter_Liquid = createRevvedOutputFilter(currentPage_Liquid);
const revvedOutputFilter_Nunjucks = createRevvedOutputFilter(currentPage_Nunjucks);
const revvedOutputFilter_JavaScript = createRevvedOutputFilter(currentPage_JavaScript);

const eleventyPluginRev = function(eleventyConfig) {
  eleventyConfig.addLiquidFilter("rev", revFilter_Liquid);
  eleventyConfig.addNunjucksFilter("rev", revFilter_Nunjucks);
  eleventyConfig.addHandlebarsHelper("rev", revFilter_JavaScript);
  eleventyConfig.addJavaScriptFunction("rev", revFilter_JavaScript);
  eleventyConfig.addLiquidFilter("revvedOutput", revvedOutputFilter_Liquid);
  eleventyConfig.addNunjucksFilter("revvedOutput", revvedOutputFilter_Nunjucks);
  eleventyConfig.addHandlebarsHelper("revvedOutput", revvedOutputFilter_JavaScript);
  eleventyConfig.addJavaScriptFunction("revvedOutput", revvedOutputFilter_JavaScript);
  eleventyConfig.addFilter("inputToRevvedOutput", revvedFilePathFromInputPath);

  eleventyConfig.on("eleventy.before", (arg) => {
    let _inputDir = arg.dir?.input ?? arg.inputDir;
    if (_inputDir) {
      _inputDir = path.normalize(_inputDir);
      // paths created by node:path.normalized() do not contain "." except when a path === ".".
      // For example:
      // path.normalize("./src/your/path"); // -> "src/your/path"
      // but,
      // path.normalize(".") // -> "."
      // The following line is just removing this exception to make things easier.
      inputDir = _inputDir === "." ? "" : _inputDir;
    }
  });
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
  revvedFilePathFromOutputPath_Liquid: revFilter_Liquid,
  revvedFilePathFromOutputPath_Nunjucks: revFilter_Nunjucks,
  revvedFilePathFromOutputPath_JavaScript: revFilter_JavaScript,
  revvedOutputFilter_Liquid,
  revvedOutputFilter_Nunjucks,
  revvedOutputFilter_JavaScript,

  revvedFilePath,

  settings,
  clear,
  outputAllData,
  name: "eleventy-plugin-rev"
};

module.exports = plugin;
