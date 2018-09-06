/*jshint node: true*/
'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./config/sky-pages/sky-pages.config');

// Used to suppress logging unless it's a known command
function getConfig(command) {
  return config.getSkyPagesConfig(command);
}

module.exports = {
  runCommand: (command, argv) => {
    const shorthand = {
      l: 'launch',
      b: 'browser',
      s: 'serve'
    };

    // Process shorthand flags
    Object.keys(shorthand).forEach(key => {
      if (argv[key]) {
        argv[shorthand[key]] = argv[key];
      }
    });

    if (argv.profiler) {
      const v8 = require('v8');
      const stats = v8.getHeapStatistics();
      console.log('Debugging available memory:');
      for (let key in stats) {
        console.log(`${key} ${Math.round(stats[key] / 1024 / 1024 * 100) / 100} MB`);
      }
    }

    switch (command) {
      case 'build':
        require('./cli/build')(argv, getConfig(command), webpack);
        break;
      case 'build-public-library':
        require('./cli/build-public-library')(getConfig(command), webpack);
        break;
      case 'e2e':
        require('./cli/e2e')(command, argv, getConfig(command), webpack);
        break;
      case 'serve':
        require('./cli/serve')(argv, getConfig(command), webpack, WebpackDevServer);
        break;
      case 'lint':
        require('./cli/lint')();
        break;
      case 'pact':
        require('./cli/pact')(command, argv);
        break;
      case 'test':
      case 'watch':
        require('./cli/test')(command, argv);
        break;
      case 'version':
        require('./cli/version')();
        break;
      case 'generate':
        require('./cli/generate')(argv);
        break;
      default:
        return false;
    }

    return true;
  }
};
