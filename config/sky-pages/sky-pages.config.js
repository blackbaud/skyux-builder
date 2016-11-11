/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');

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
   * Iterates object's devDependencies to find applicable modules.
   * Includes project's sky-pages.json last.
   * @name getSkyPagesConfig
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: function () {
    const jsonPath = path.join(process.cwd(), 'package.json');
    const skyPagesPath = path.join(process.cwd(), 'sky-pages.json');
    let config = require(path.join(__dirname, '../../sky-pages.json'));

    if (fs.existsSync(jsonPath)) {
      const json = require(jsonPath);
      if (json.devDependencies) {
        for (let d in json.devDependencies) {
          if (/(.*)-sky-pages-in-(.*)/gi.test(d)) {
            const module = require(path.join(process.cwd(), 'node_modules', d));
            if (typeof module.getSkyPagesConfig === 'function') {
              config = module.getSkyPagesConfig(config);
            }
          }
        }
      }
    }

    if (fs.existsSync(skyPagesPath)) {
      const skyPagesJson = JSON.parse(
        fs.readFileSync(skyPagesPath, { encoding: 'utf8' })
      );
      merge.recursive(config, skyPagesJson);
    }

    return config;
  },

  /**
   * Reads the name field of package.json.
   * Removes "blackbaud-sky-pages-spa-" and wraps in "/".
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

    return '/' + name.replace(/blackbaud-sky-pages-spa-/gi, '') + '/';
  },

  /**
   * Takes one or more path parts and returns the fully-qualified path to the file
   * contained in this project (sky-pages-out-skyux2).
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
