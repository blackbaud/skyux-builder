/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * Iterates object's devDependencies to find applicable modules.
   * @name getSkyPagesConfig
   * @returns [SkyPagesConfig] skyPagesConfig
   */
  getSkyPagesConfig: () => {
    const jsonPath = path.join(process.cwd(), 'package.json');
    let config = require(path.join(__dirname, '../sky-pages.json'));

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

    return config;
  }
};
