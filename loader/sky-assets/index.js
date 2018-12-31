const fs = require('fs-extra');
const loaderUtils = require('loader-utils');

const assetsProcessor = require('../../lib/assets-processor');

module.exports = function (content) {
  const options = loaderUtils.getOptions(this);

  content = assetsProcessor.processAssets(
    content,
    options && options.baseUrl,
    (filePathWithHash, physicalFilePath) => {
      this.emitFile(
        filePathWithHash,
        fs.readFileSync(physicalFilePath)
      );
    }
  );

  return content;
};
