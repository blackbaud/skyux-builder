/*jshint node: true*/

'use strict';

var FontFaceObserver = require('fontfaceobserver');

var stylesAreLoaded = false;

// Set to a number below Jasmine's default of 5000
// so that tests can still run if the font's fail to load.
const LOAD_TIMEOUT = 4000;

module.exports = {
  loadStyles: function () {
    const fontAwesome = new FontFaceObserver('FontAwesome');
    const blackbaudSans = new FontFaceObserver('Blackbaud Sans');
    let promise;

    promise = Promise.all(
      [
        // Specify a character for FontAwesome since some browsers will fail to detect
        // when the font is loaded unless a known character with a different width
        // than the default is not specified.
        fontAwesome.load('\uf0fc', LOAD_TIMEOUT),
        blackbaudSans.load(null, LOAD_TIMEOUT)
      ]
    );

    promise.then(function () {
      stylesAreLoaded = true;
    });

    return promise;
  },

  stylesAreLoaded: function () {
    return stylesAreLoaded;
  }
};
