/*jshint node: true*/
'use strict';

const { getOptions } = require('loader-utils');
const { readFileSync } = require('fs-extra');
const { processAssets } = require('../../lib/assets-processor');

module.exports = function (content) {
  const options = getOptions(this);

  // Replace any references to static assets with their hashed paths.
  content = processAssets(
    content,
    options && options.baseUrl,
    (filePathWithHash, physicalFilePath) => {
      this.emitFile(filePathWithHash, readFileSync(physicalFilePath));
    }
  );

  return content;
};
