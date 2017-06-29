/* This file is just a demo, in case we want to use karma. */

const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const tslint = require('tslint');


function MyFactory() {
  // let linter = new tslint.Linter({
  //   fix: false,
  //   project: skyPagesConfigUtil.spaPath('tsconfig.json')
  // });
  // let fileName = skyPagesConfigUtil.spaPath('tslint.json');
  // let configuration = tslint.Configuration.findConfiguration(null, fileName).results;

  const program = tslint.Linter.createProgram('tsconfig.json', skyPagesConfigUtil.spaPath());
  const files = tslint.Linter.getFileNames(program);
  const results = files.map(file => {
      const fileContents = program.getSourceFile(file).getFullText();
      const linter = new tslint.Linter(file, fileContents, options, program);
      return linter.lint();
  });

  return function (source, file, done) {
    console.log(`Processing ${file.originalPath}...`);

    linter.lint(file.originalPath, source, configuration);

      let result = linter.getResult();
      let error = null;
      //console.log(result);

      if (result.failures.length) {
        console.error(result.output);
        if (stopOnFailure) {
          error = result.output;
        }
      }

      done(error, source);
  };
}

const getConfig = (config) => {
  const files = `${skyPagesConfigUtil.spaPath('src')}/**/*.ts`;
  let preprocessors = {};
  preprocessors[files] = ['mylinter'];
  config.set({
    basePath: '',
    files: [
      {
        pattern: files,
        watched: false
      }
    ],
    preprocessors: preprocessors,
    plugins: [
      {
        'preprocessor:mylinter': ['factory', MyFactory]
      }
    ]
  });
};

module.exports = getConfig;
