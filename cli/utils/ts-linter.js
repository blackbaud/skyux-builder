/*jslint node: true */
'use strict';

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const logger = require('../../utils/logger');
const tslint = require('tslint');

function lintSync2() {

  const Linter = tslint.Linter;
  const tsconfigPath = skyPagesConfigUtil.spaPath('tsconfig.json');
  const tslintPath = skyPagesConfigUtil.spaPath('tslint.json');

  const options = {
    project: tsconfigPath,
    config: tslintPath,
    exclude: '**/node_modules/**/*.ts',
    typeCheck: true
  };

  const config = tslint.Configuration.loadConfigurationFromPath(
    tslintPath,
    process.cwd()
  );

  const program = Linter.createProgram(tsconfigPath);
  const files = Linter.getFileNames(program);
  let errors = [];

  files.forEach(file => {
    const fileContents = program.getSourceFile(file).getFullText();
    const linter = new Linter(options, program);

    linter.lint(file, fileContents, config);
    const result = linter.getResult();

    if (result.errorCount) {
      const output = result.output.trim();
      errors.push(output);
      logger.error(output);
    }
  });

  const plural = (errors.length === 1) ? '' : 's';
  logger.info(`TSLint finished with ${errors.length} error${plural}.`);

  return {
    exitCode: errors.length === 0 ? 0 : 1,
    errors: errors
  };
}

module.exports = {
  lintSync: lintSync2
};
