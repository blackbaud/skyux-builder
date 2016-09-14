const path = require('path');
const spawn = require('cross-spawn');

module.exports = () => {
  const npmProcess = spawn(
    'node',
    [
      '--max-old-space-size=4096',
      'node_modules/karma/bin/karma',
      'start',
      path.resolve(__dirname, '..', 'config/karma/local.karma.conf.js'),
      '--auto-watch',
      '--no-single-run'
    ],
    {
      stdio: 'inherit'
    }
  );
};
