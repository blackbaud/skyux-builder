/*jshint node: true*/
'use strict';

const fs = require('fs');
const glob = require('glob');
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

/**
 * Return an array of SkyPagesFile given a glob pattern.
 * @name getFiles
 * @param {string} pattern
 * @returns {Array} files
 */
function getFiles(pattern) {
  return glob.sync(pattern, { realpath: true }).map((file) => {
    const relative = file.slice(process.cwd().length + 1);
    return {
      path: relative,
      pathWeb: relative.replace(/\\/g, '/'),
      pathParts: relative.split(path.sep).slice(2, -1),  // Needs configurable as above
      get: () => fs.readFileSync(file, { encoding: 'utf8' })
    };
  });
}

module.exports = {

  /**
   * Builder's sky-pages is default.
   * Add's routes, modules, and components next.
   * Merges in SPA's sky-pages last.
   * @name getSkyPagesConfig
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: function () {
    const skyPagesSpaPath = this.spaPath('sky-pages.json');
    let config = require(this.outPath('sky-pages.json'));

    merge.recursive(config, {
      routes: getFiles('src/app/**/index.html'),
      modules: getFiles('src/app/**/*.module.ts'),
      components: getFiles('src/app/**/*.component.ts')
    });

    if (fs.existsSync(skyPagesSpaPath)) {
      merge.recursive(config, require(skyPagesSpaPath));
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
