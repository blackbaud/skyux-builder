const logger = require('../../utils/logger');

function VerbosePlugin() { }

VerbosePlugin.prototype.apply = function (compiler) {
  const currentTime = new Date().getTime();

  compiler.plugin('compile', function (params) {
    logger.info('The compiler is starting to compile...');
  });

  compiler.plugin('compilation', function (compilation) {
    logger.info('The compiler has started a new compilation...');

    compilation.plugin('after-optimize-modules', function (modules) {
      modules.forEach((mod) => {
        logger.info('-----------------------------------------');
        const modulePath = mod.rawRequest || mod.request || mod.name;
        const timestamp = (parseInt(mod.buildTimestamp) - currentTime) / 1000;
        const name = (modulePath) ? modulePath.replace(mod.context, '') : 'unknown';

        logger.info(`Module optimized: ${name}`);

        if (!isNaN(timestamp)) {
          logger.info(`Finished ${timestamp} seconds after startup.`);
        }

        if (mod.loaders) {
          mod.loaders.forEach((loader) => {
            logger.info(`--> loader: ${loader.loader}`);
          });
        }

        if (mod.assets) {
          Object.keys(mod.assets).forEach((asset) => {
            logger.info(`--> asset: ${asset}`);
          });
        }
      });

      logger.info('=========================================');
    });

    compilation.plugin('build-module', function (module) {
      if (module.resource) {
        logger.info(`Building ${module.resource}...`);
      }
    });

    compilation.plugin('succeed-module', function (module) {
      if (module.resource) {
        logger.info(`Build finished for ${module.resource}.`);
      }
    });

    compilation.plugin('module-asset', function (module, filename) {
      logger.info(`Module asset added to compilation: ${filename}`);
    });

    compilation.plugin('chunk-asset', function (chunk, filename) {
      logger.info(`Chunk asset added to compilation: ${filename}`);
    });
  });
};

module.exports = VerbosePlugin;
