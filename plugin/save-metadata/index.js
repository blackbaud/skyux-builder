/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

module.exports = function SaveMetadata() {
  const metadata = [];

  this.plugin('emit', (compilation, done) => {
    const formatName = 'SKY_PAGES_READY_%s';
    const formatDeclare = '%s\nvar %s = true;\n';
    const chunks = compilation.getStats().toJson().chunks;
    let index = 0;

    // Add our variable to the bottom of the JS source files
    Object.keys(compilation.assets).forEach((key) => {
      const parsed = path.parse(key);
      if (parsed.ext === '.js') {
        const asset = compilation.assets[key];
        const source = asset.source();
        const fallback = util.format(formatName, parsed.name.toUpperCase());
        const method = chunks[index].entry ? 'unshift' : 'push';

        // Overwrite the default source method to add our fallback variable
        asset.source = () => util.format(formatDeclare, source, fallback);

        // Add "entry" to beginning of array, others at end
        metadata[method]({
          name: key,
          fallback: fallback
        });

        // Chunks only contain js files, so we need our own index
        index++;
      }
    });

    done();
  });

  this.plugin('done', () => {
    fs.writeFileSync(
      path.join(process.cwd(), 'dist', 'metadata.json'),
      JSON.stringify(metadata, null, '\t')
    );
  });
};
