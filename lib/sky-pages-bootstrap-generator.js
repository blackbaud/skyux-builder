/*jshint node: true*/
'use strict';

function getBootstrap(skyPagesConfig) {
  let bootstrap = '';

  if (skyPagesConfig.packages) {
    bootstrap = `
      import { SkyAppBootstrapper } from '${skyPagesConfig.runtimeAlias}';
      SkyAppBootstrapper.bootstrapConfig = ${JSON.stringify(skyPagesConfig.packages)};
    `;
  }

  return bootstrap;
}

module.exports = {
  getBootstrap: getBootstrap
};
