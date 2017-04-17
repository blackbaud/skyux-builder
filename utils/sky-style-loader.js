/*jshint node: true*/

'use strict';

require('style!@blackbaud/skyux/dist/css/sky.css');

var FontFaceObserver = require('fontfaceobserver');

var stylesAreLoaded = false;

var LOAD_TIMEOUT = 30000;

module.exports = {
  loadStyles: function () {
    var fontAwesome = new FontFaceObserver('FontAwesome');
    var openSans = new FontFaceObserver('Open Sans');
    var oswald = new FontFaceObserver('Oswald');
    var promise;
    console.log('in loader');
    promise = Promise.all(
      [
        // Specify a character for FontAwesome since some browsers will fail to detect
        // when the font is loaded unless a known character with a different width
        // than the default is not specified.
        fontAwesome.load('\uf0fc', LOAD_TIMEOUT),
        openSans.load(null, LOAD_TIMEOUT),
        oswald.load(null, LOAD_TIMEOUT)
      ]
    );

    promise.then(function () {
      console.log('in promise then');
      stylesAreLoaded = true;
    });

    return promise;
  },

  stylesAreLoaded: function () {
    return stylesAreLoaded;
  }
};
