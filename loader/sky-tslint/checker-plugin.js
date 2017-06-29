/*jshint node: true*/
'use strict';

module.exports = function () {
  const apply = (compiler) => {
    compiler.plugin('done', () => {
      // Delete the existing TSLint program after each compilation so that it will get
      // recreated when files change.
      require('./program').clearProgram();
    });
  };

  return { apply };
}
