const tslint = require('tslint');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const programUtil = require('./program');
const tslintConfigPath = skyPagesConfigUtil.spaPath('tslint.json');
const tsConfigPath = skyPagesConfigUtil.spaPath('tsconfig.json');

const lint = (instance, input) => {
  const linterOptions = {
    fix: false,
    typeCheck: true
  };

  const program = programUtil.getProgram(tsConfigPath);
  const linter = new tslint.Linter(linterOptions, program);
  const configuration = tslint.Configuration.findConfiguration(tslintConfigPath).results;

  linter.lint(instance.resourcePath, input, configuration);
  const result = linter.getResult();

  if (result.failures.length) {
    return new Error(`Compilation failed due to tslint errors. ${result.output}`);
  }
};

module.exports = function (input, map) {
  const instance = this;
  const callback = instance.async();

  instance.cacheable && instance.cacheable();

  const error = lint(instance, input);
  callback(error, input, map);
};
