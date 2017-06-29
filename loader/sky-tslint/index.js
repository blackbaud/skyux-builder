const tslint = require('tslint');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const skyTsLintProgram = require('./program');

const lint = (instance, input) => {
  const options = {
    fix: false,
    typeCheck: true
  };

  const program = skyTsLintProgram.getProgram();
  const linter = new tslint.Linter(options, program);
  const tslintConfig = skyPagesConfigUtil.spaPath('tslint.json');
  const configuration = tslint.Configuration.findConfiguration(tslintConfig).results;

  linter.lint(instance.resourcePath, input, configuration);
  const result = linter.getResult();

  if (result.failures.length) {
    return new Error(`Compilation failed due to tslint errors. ${result.output}`);
  }

  return;
};

module.exports = function (input, map) {
  const instance = this;
  const callback = instance.async();

  instance.cacheable && instance.cacheable();

  let error = lint(instance, input);
  callback(error, input, map);
};
