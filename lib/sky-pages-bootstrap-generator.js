/*jshint node: true*/
'use strict';

function getBootstrap(skyPagesConfig) {
  let bootstrap = '';

  if (skyPagesConfig.auth || skyPagesConfig.omnibar) {
    bootstrap =
`import { SkyAppBootstrapper } from '${skyPagesConfig.runtimeAlias}';

SkyAppBootstrapper.bootstrapConfig = {
  omnibar: ${JSON.stringify(skyPagesConfig.omnibar)},
  auth: ${JSON.stringify(skyPagesConfig.auth)}
};

`;
  }

  return bootstrap;
}

module.exports = {
  getBootstrap: getBootstrap
};
