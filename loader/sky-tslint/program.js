/*jshint node: true*/
'use strict';

const tslint = require('tslint');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

const tsconfigPath = skyPagesConfigUtil.spaPath('tsconfig.json');
let _context = {};

const getProgram = () => {
  if (!_context.tslintProgram) {
    _context.tslintProgram = tslint.Linter.createProgram(tsconfigPath);
  }

  return _context.tslintProgram;
};

const clearProgram = () => {
  delete _context.tslintProgram;
};

module.exports = {
  getProgram,
  clearProgram
};
