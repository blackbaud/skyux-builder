/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

// HTML Webpack Plugin has already solved sorting the entries
const sorter = require('html-webpack-plugin/lib/chunksorter');

module.exports = function SaveMetadata() {
  const metadata = [];

  function getFallbackName(name) {
    return util.format('SKY_PAGES_READY_%s', name.toUpperCase());
  }

  this.plugin('emit', (compilation, done) => {

    // Sort chunks by dependency and use them to create metadata array
    const chunks = sorter.dependency(compilation.getStats().toJson().chunks);
    chunks.forEach((chunk) => {
      metadata.push({
        name: chunk.files[0],
        fallback: getFallbackName(chunk.names[0])
      });
    });

    // Add our fallback variable to the bottom of the JS source files
    Object.keys(compilation.assets).forEach((key) => {
      const parsed = path.parse(key);
      if (parsed.ext === '.js') {
        const asset = compilation.assets[key];
        const source = asset.source();
        asset.source = () => util.format(
          '%s\nvar %s = true;\n',
          source,
          getFallbackName(parsed.name)
        );
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
