/*jshint node: true*/
'use strict';

const tslint = require('tslint');
const logger = require('../../utils/logger');
let _program;

const getProgram = (tsconfigPath) => {
  if (!_program) {
    logger.info('Creating new TSLint compiler...');
    _program = tslint.Linter.createProgram(tsconfigPath);
    logger.info('Done.');
  }

  return _program;
};

const clearProgram = () => {
  _program = undefined;
};

module.exports = {
  getProgram,
  clearProgram
};
