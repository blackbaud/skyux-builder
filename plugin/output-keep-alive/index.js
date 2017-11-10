// const logger = require('../../utils/logger');

function OutputKeepAlivePlugin() { }

OutputKeepAlivePlugin.prototype.apply = function (compiler) {
  const currentTime = new Date().getTime();

  compiler.plugin('compile', function (params) {
    // logger.info('The compiler is starting to compile...');
    process.stdout.write('.');
  });

  compiler.plugin('compilation', function (compilation) {
    // logger.info('The compiler has started a new compilation...');
    process.stdout.write('.');

    compilation.plugin('after-optimize-modules', function (modules) {
      modules.forEach((mod) => {
        // logger.info('-----------------------------------------');
        // const modulePath = mod.rawRequest || mod.request || mod.name;
        // const timestamp = (parseInt(mod.buildTimestamp) - currentTime) / 1000;
        // const name = (modulePath) ? modulePath.replace(mod.context, '') : 'unknown';

        // logger.info(`Module optimized: ${name}`);

        // if (!isNaN(timestamp)) {
        //   logger.info(`Finished ${timestamp} seconds after startup.`);
        // }

        // if (mod.loaders) {
        //   mod.loaders.forEach((loader) => {
        //     logger.info(`--> loader: ${loader.loader}`);
        //   });
        // }

        // if (mod.assets) {
        //   Object.keys(mod.assets).forEach((asset) => {
        //     logger.info(`--> asset: ${asset}`);
        //   });
        // }
        process.stdout.write('.');
      });

      // logger.info('=========================================');
    });

    compilation.plugin('build-module', function (module) {
      // if (module.resource) {
      //   logger.info(`Building ${module.resource}...`);
      // }
      process.stdout.write('.');
    });

    compilation.plugin('module-asset', function (module, filename) {
      // logger.info(`Module asset added to compilation: ${filename}`);
      process.stdout.write('.');
    });
  });
};

module.exports = OutputKeepAlivePlugin;
