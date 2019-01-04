/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

// This will fix a mapping bug for the latest version of rxjs-compat.
// See: https://github.com/ReactiveX/rxjs/issues/4070#issuecomment-429191227
const rxPaths = require('rxjs/_esm5/path-mapping')();
rxPaths['rxjs/internal/Observable'] = 'rxjs/_esm5/internal/Observable';

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
function setSpaAlias(alias, moduleName, filePath) {
  let resolvedPath = spaPath(filePath);

  if (!fs.existsSync(resolvedPath)) {
    resolvedPath = outPath(filePath);
  }

  alias['sky-pages-internal/' + moduleName] = resolvedPath;
}

module.exports = {
  buildAliasList: function () {
    let alias = {
      'sky-pages-spa/src': spaPath('src'),
      'sky-pages-internal/runtime': outPath('runtime')
    };

    setSpaAlias(
      alias,
      'src/app/app-extras.module',
      path.join('src', 'app', 'app-extras.module.ts')
    );

    setSpaAlias(alias, 'src/main', path.join('src', 'main.ts'));

    Object.assign(alias, rxPaths);

    return alias;
  }
};
