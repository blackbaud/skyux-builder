/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  require('./test.karma.conf')(config);
  config.set({
    autoWatch: true,
    singleRun: false
  });
}

module.exports = getConfig;
