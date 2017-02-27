/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

function spaPath() {
  return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
}

function outPath() {
  return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
}

/**
 * Sets an alias to the specified module using the SPA path if the file exists in the SPA;
 * otherwise it sets the alias to the file in SKY UX Builder.
 * @name setSpaAlias
 * @param {Object} alias
 * @param {String} moduleName
 * @param {String} path
 */
function setSpaAlias(alias, moduleName, path) {
  let resolvedPath = spaPath(path);

  if (!fs.existsSync(resolvedPath)) {
    resolvedPath = outPath(path);
  }

  alias['sky-pages-internal/' + moduleName] = resolvedPath;
}

module.exports = {
  buildAliasList: function (skyPagesConfig) {
    let alias = {
      'sky-pages-spa/src': spaPath('src'),
      'sky-pages-internal/runtime': outPath('runtime')
    };

    if (skyPagesConfig && skyPagesConfig.skyux) {
      // Order here is very important; the more specific CSS alias must go before
      // the more generic dist one.
      if (skyPagesConfig.skyux.cssPath) {
        alias['@blackbaud/skyux/dist/css/sky.css'] = spaPath(skyPagesConfig.skyux.cssPath);
      }

      if (skyPagesConfig.skyux.importPath) {
        alias['@blackbaud/skyux/dist'] = spaPath(skyPagesConfig.skyux.importPath);
      }
    }

    setSpaAlias(
      alias,
      'src/app/app-extras.module',
      path.join('src', 'app', 'app-extras.module.ts')
    );

    setSpaAlias(alias, 'src/main', path.join('src', 'main.ts'));

    return alias;
  }
};
