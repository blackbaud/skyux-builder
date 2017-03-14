/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const logger = require('winston');

/**
 * Resolves a path given a root path and an array-like arguments object.
 * @name resolve
 * @param {String} root The root path.
 * @param {Array} args An array or array-like object of additional path parts to add to the root.
 * @returns {String} The resolved path.
*/
function resolve(root, args) {
  args = root.concat(Array.prototype.slice.call(args));
  return path.resolve.apply(path, args);
}

function readConfig(file) {
  if (!fs.existsSync(file)) {
    logger.error(`Unable to locate config file ${file}`);
    return {};
  }

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = {

  /**
   * Builder's skyuxconfig is default.
   * Adds routes, modules, and components next.
   * Merges in SPA's skyuxconfig last.
   * @name getSkyPagesConfig
   * @param {argv} Optional arguments from command line
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: function (argv) {

    const localEnvConfig = this.spaPath(`skyuxconfig.${process.env.SKYUX_ENV}.json`);
    const localBaseConfig = this.spaPath(`skyuxconfig.json`);
    let configs = [];

    // Builder's base config always is the baseline
    let config = readConfig(this.outPath(`skyuxconfig.json`));

    // Allow for shorthand -c
    if (argv && argv.c) {
      argv.config = argv.c;
    }

    // Order of precedence...
    // 1. Config flag passed in.
    // 2. SKYUX_ENV set and matching config file found
    // 3. Local skyuxconfig.json file found
    if (argv && argv.config) {
      logger.info(`Processing config file ${argv.config}`);
      configs.push(readConfig(argv.config));
    } else if (process.env.SKYUX_ENV && fs.existsSync(localEnvConfig)) {
      logger.info(`Processing config file ${localEnvConfig}`);
      configs.push(readConfig(localEnvConfig));
    } else if (fs.existsSync(localBaseConfig)) {
      logger.info(`Processing config file ${localBaseConfig}`);
      configs.push(readConfig(localBaseConfig));
    } else {
      logger.info('Using default skyuxconfig.json configuration.');
    }

    if (configs.length) {

      // Recursively process any "extends", reading from last config
      while (configs[configs.length - 1].extends) {
        const extendsFrom = path.resolve(configs[configs.length - 1].extends);
        logger.info(`Processing config file ${extendsFrom}`);
        configs.push(readConfig(extendsFrom));
      }

      // Finally, merge our configs in, in reverse
      configs.reverse().forEach(c => merge.recursive(config, c));
    }

    return config;
  },

  /**
   * Reads the name field of package.json.
   * Removes "blackbaud-skyux-spa-" and wraps in "/".
   * @name getAppName
   * @returns {String} appName
   */
  getAppBase: function (skyPagesConfig) {
    let name;
    if (skyPagesConfig.name) {
      name = skyPagesConfig.name;
    } else {
      name = require(this.spaPath('package.json')).name;
    }

    return '/' + name.replace(/blackbaud-skyux-spa-/gi, '') + '/';
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in this project (@blackbaud/skyux-builder).
   * @returns {String} The fully-qualified path.
   */
  outPath: function () {
    return resolve([__dirname, '..', '..'], arguments);
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in the SPA project.
   * @returns {String} The fully-qualified path.
   */
  spaPath: function () {
    return resolve([process.cwd()], arguments);
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in the temp source folder in the SPA project.
   * @returns {String} The fully-qualified path.
   */
  spaPathTemp: function () {
    return resolve([this.spaPath(), '.skypagestmp'], arguments);
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in the temp folder in the SPA project.
   * @returns {String} The fully-qualified path.
   */
  spaPathTempSrc: function () {
    return resolve([this.spaPathTemp(), 'src'], arguments);
  }
};
