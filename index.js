/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('winston');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

/**
 * Iterates object's devDependencies to find applicable modules.
 * @name getSkyPagesConfig
 * @returns [SkyPagesConfig] skyPagesConfig
 */
const getSkyPagesConfig = () => {

  const jsonPath = path.join(process.cwd(), 'package.json');
  let config = require(path.join(__dirname, 'sky-pages.json'));

  if (fs.existsSync(jsonPath)) {
    const json = require(jsonPath);
    if (json.devDependencies) {
      for (let d in json.devDependencies) {
        if (/(.*)-sky-pages-in-(.*)/gi.test(d)) {
          const module = require(d);
          if (typeof module.getSkyPagesConfig === 'function') {
            config = module.getSkyPagesConfig(config);
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
        require('./cli/build')(argv, skyPagesConfig, webpack);
        break;
      case 'serve':
        require('./cli/serve')(argv, skyPagesConfig, webpack, WebpackDevServer);
        break;
      case 'version':
        require('./cli/version')();
        break;
      default:
        logger.info('sky-pages-out-skyux2: Unknown command %s', command);
        break;
    }
  }
};
