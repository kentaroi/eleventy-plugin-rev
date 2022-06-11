

class DataStore {
  constructor() {
    this.inputPathsByOutputPath = new Map();
    this.outputPathsByInputPath = new Map();
    this.hashesByInputPath = new Map();
  }

  clear() {
    this.inputPathsByOutputPath.clear();
    this.outputPathsByInputPath.clear();
    this.hashesByInputPath.clear();
  }

  setPathPair(inputPath, outputPath) {
    let oldOutputPath = this.outputPathsByInputPath.get(inputPath);
    if (outputPath === oldOutputPath)
      return;

    let oldInputPath = this.inputPathsByOutputPath.get(oldOutputPath);
    if (oldInputPath === inputPath) { // If the oldOutputPath hasn't been overwritten by another pair
      this.inputPathsByOutputPath.delete(oldOutputPath);
    }

    this.inputPathsByOutputPath.set(outputPath, inputPath);
    this.outputPathsByInputPath.set(inputPath, outputPath);
  }

  registerRevHash(inputPath, hash) {
    this.hashesByInputPath.set(inputPath, hash);
  }

  deleteRevHash(inputPath) {
    this.hashesByInputPath.delete(inputPath);
  }

  getOutputPathFromInputPath(inputPath) {
    return this.outputPathsByInputPath.get(inputPath);
  }

  getInputPathFromOutputPath(outputPath) {
    return this.inputPathsByOutputPath.get(outputPath);
  }

  getRevHashFromInputPath(inputPath) {
    return this.hashesByInputPath.get(inputPath);
  }

  getRevHashFromOutputPath(outputPath) {
    let inputPath = this.inputPathsByOutputPath.get(outputPath);
    if (!inputPath) {
      return undefined;
    }
    return this.hashesByInputPath.get(inputPath);
  }
}


module.exports = new DataStore();
