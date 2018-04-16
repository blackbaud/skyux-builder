/*jslint node: true */
'use strict';

const { start } = require('./utils/start-e2e');

function visual(command, argv, skyPagesConfig, webpack) {
  start(command, argv, skyPagesConfig, webpack);
}

module.exports = visual;
