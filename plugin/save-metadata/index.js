/*jslint node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const hostUtils = require('../../utils/host-utils');

module.exports = function SaveMetadata() {

  function getFallbackName(name) {
    return util.format('SKY_PAGES_READY_%s', name.toUpperCase().replace(/\./g, '_'));
  }

  this.plugin('emit', (compilation, done) => {

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

  this.plugin('done', (stats) => {

    let metadata = [];
    hostUtils.getScripts(stats.toJson().chunks).forEach(script => {
      metadata.push({
        name: script.name,
        fallback: getFallbackName(path.parse(script.name).name)
      });
    });

    fs.writeFileSync(
      path.join(process.cwd(), 'dist', 'metadata.json'),
      JSON.stringify(metadata, null, '\t')
    );
  });
};
