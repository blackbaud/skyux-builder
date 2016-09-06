/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

/**
 * Iterates object's devDependencies to find applicable modules.
 * @name getSkyPagesConfig
 * @returns [SkyPagesConfig] skyPagesConfig
 */
const getSkyPagesConfig = () => {

  const jsonPath = path.join(process.cwd(), 'package.json');
  let config = require('sky-pages.json');

  if (fs.existsSync(jsonPath)) {
    const json = require(jsonPath);
    if (json.devDependencies) {
      for (let d in json.devDependencies) {
        if (/(.*)-sky-pages-in-(.*)/gi.test(d)) {
          if (typeof d.getSkyPagesConfig === 'function') {
            config = merge(config, d.getSkyPagesConfig());
          }
        }
      }
    }
  }

  return config;
};

module.exports = {
  runCommand: (command, argv) => {
    const skyPagesConfig = getSkyPagesConfig();
    switch (command) {
      case 'build':
        require('./cli/build')(skyPagesConfig);
        break;
      case 'serve':
        require('./cli/serve')(argv, skyPagesConfig, webpack, WebpackDevServer);
        break;
      case 'version':
        require('./cli/version')();
        break;
    }
  }
};
