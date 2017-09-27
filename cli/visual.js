const path = require('path');

function runVisualTests(argv, skyPagesConfig, webpack) {
  argv.config = path.resolve(
    __dirname,
    '..',
    'config',
    'protractor',
    'protractor-visual.conf.js'
  );

  argv.specs = '**/*.visual-spec.ts';

  e2e(argv, skyPagesConfig, webpack);
}

module.exports = runVisualTests;
