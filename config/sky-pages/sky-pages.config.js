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
    const skyPagesSpaPath = this.spaPath('skyuxconfig.json');
    let config = require(this.outPath('skyuxconfig.json'));

    // Allow for shorthand -c
    if (argv && argv.c) {
      argv.config = argv.c;
    }

    // Allow config override
    if (argv && argv.config) {

      // Can be a single file or array of files
      const requestedConfigs = argv.config.split(',');
      requestedConfigs.forEach(requestedConfig => {
        const requestedConfigPath = this.spaPath(requestedConfig);
        if (!fs.existsSync(requestedConfigPath)) {
          logger.error(`Unable to locate requested config file ${requestedConfig}`);
        } else {
          logger.info(`Successfully located requested config file ${requestedConfig}`);
          merge.recursive(config, require(requestedConfigPath));
        }
      });

    } else if (fs.existsSync(skyPagesSpaPath)) {
      merge.recursive(config, require(skyPagesSpaPath));
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
