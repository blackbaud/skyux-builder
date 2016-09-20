/*jshint node: true*/
'use strict';

/**
 * @author: @AngularClass
 */

module.exports = function (config) {

  require('./shared.karma.conf')(config);

  config.set({
    browsers: [
      'Chrome'
    ]
  });

};
