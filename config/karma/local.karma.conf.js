/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  require('./shared.karma.conf')(config);
  config.set({
    browsers: [
      'Chrome'
    ]
  });
}

module.exports = getConfig;
