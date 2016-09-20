/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');

module.exports = {
  /**
   * Iterates object's devDependencies to find applicable modules.
   * Includes project's sky-pages.json last.
   * @name getSkyPagesConfig
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: () => {
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
  }
};
