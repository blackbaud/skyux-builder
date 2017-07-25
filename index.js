/*jshint node: true*/
'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const logger = require('./utils/logger');
const config = require('./config/sky-pages/sky-pages.config');

module.exports = {
  runCommand: (command, argv) => {
    const skyPagesConfig = config.getSkyPagesConfig(command);
    switch (command) {
      case 'build':
        require('./cli/build')(argv, skyPagesConfig, webpack);
        break;
      case 'build-public-library':
        require('./cli/build-public-library')(skyPagesConfig, webpack);
        break;
      case 'e2e':
        require('./cli/e2e')(argv, skyPagesConfig, webpack);
        break;
      case 'serve':
        require('./cli/serve')(argv, skyPagesConfig, webpack, WebpackDevServer);
        break;
      case 'test':
      case 'watch':
        require('./cli/test')(command, argv);
        break;
      case 'version':
        require('./cli/version')();
        break;
      default:
        logger.info('@blackbaud/skyux-builder: Unknown command %s', command);
        break;
    }
  }
};
