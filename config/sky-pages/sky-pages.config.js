/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('../../utils/merge');
const logger = require('@blackbaud/skyux-logger');

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
  return fs.readJsonSync(file, 'utf8');
}

module.exports = {

  /**
   * Merge's configs in the following order:
   *   1. Builder's skyuxconfig.json
   *   2. Builder's skyuxconfig.{command}.json
   *   3. App's skyuxconfig.json
   *   4. App's skyuxconfig.{command}.json
   * @name getSkyPagesConfig
   * @param {argv} Optional arguments from command line
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: function (command) {

    let skyuxConfig = {};
    const hierarchy = [
      {
        fileName: `App Builder skyuxconfig.json`,
        filePath: this.outPath(`skyuxconfig.json`)
      },
      {
        fileName: `App Builder skyuxconfig.${command}.json`,
        filePath: this.outPath(`skyuxconfig.${command}.json`)
      },
      {
        fileName: `SPA skyuxconfig.json`,
        filePath: this.spaPath(`skyuxconfig.json`)
      },
      {
        fileName: `SPA skyuxconfig.${command}.json`,
        filePath: this.spaPath(`skyuxconfig.${command}.json`)
      }
    ];

    hierarchy.forEach(file => {
      if (fs.existsSync(file.filePath)) {
        logger.info(`Merging ${file.fileName}`);
        skyuxConfig = merge(skyuxConfig, readConfig(file.filePath));
      }
    });

    let config = {
      runtime: {
        app: {
          inject: false,
          template: this.outPath('src', 'main.ejs')
        },
        command: command,
        componentsPattern: '**/*.component.ts',
        componentsIgnorePattern: './public/**/*',
        includeRouteModule: true,
        routesPattern: '**/index.html',
        runtimeAlias: 'sky-pages-internal/runtime',
        srcPath: 'src/app/',
        spaPathAlias: 'sky-pages-spa',
        skyPagesOutAlias: 'sky-pages-internal',
        useTemplateUrl: false
      },
      skyux: skyuxConfig
    };

    // Manually set after as it depends on properties set above
    config.runtime.app.base = this.getAppBase(config);
    return config;
  },

  /**
   * Reads the name field of package.json.
   * Removes "blackbaud-skyux-spa-" and wraps in "/".
   * @name getAppName
   * @returns {String} appName
   */
  getAppBase: function (skyPagesConfig) {
    let name = '';

    if (skyPagesConfig.skyux.name) {
      name = skyPagesConfig.skyux.name;
    } else {

      const packagePath = this.spaPath('package.json');
      const packageJson = fs.existsSync(packagePath) ? readConfig(packagePath) : {};

      if (packageJson.name) {
        name = packageJson.name;
      } else {
        logger.error('The `name` property should exist in package.json or skyuxconfig.json');
      }
    }

    return '/' + name.replace(/blackbaud-skyux-spa-/gi, '') + '/';
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in this project (@skyux-sdk/builder).
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
