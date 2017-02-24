/*jshint node: true*/
'use strict';

function getBootstrap(skyPagesConfig) {
  let bootstrap = '';

  if (skyPagesConfig.auth || skyPagesConfig.omnibar || skyPagesConfig.help) {
    bootstrap =
`import { SkyAppBootstrapper } from '${skyPagesConfig.runtimeAlias}';

SKY_PAGES.bootstrapConfig = SkyAppBootstrapper.bootstrapConfig = {
  omnibar: ${JSON.stringify(skyPagesConfig.omnibar)},
  auth: ${JSON.stringify(skyPagesConfig.auth)},
  help: ${JSON.stringify(skyPagesConfig.help)},
  publicRoutes: ${JSON.stringify(skyPagesConfig.publicRoutes)}
};

`;
  }

  return bootstrap;
}

module.exports = {
  getBootstrap: getBootstrap
};
