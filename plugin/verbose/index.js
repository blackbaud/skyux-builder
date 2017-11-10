function VerbosePlugin() { }

VerbosePlugin.prototype.apply = function (compiler) {
  const currentTime = new Date().getTime();

  compiler.plugin('compile', function (params) {
    console.log('The compiler is starting to compile...');
  });

  compiler.plugin('compilation', function (compilation) {
    const modulePath = mod.rawRequest || mod.request || mod.name;
    const name = (modulePath) ? modulePath.replace(mod.context, '') : 'unknown';

    console.log('The compiler has started a new compilation for:', name);

    compilation.plugin('after-optimize-modules', function (modules) {
      console.log('Modules optimized.');
      modules.forEach((mod) => {
        console.log('-----------------------------------------');
        const modulePath = mod.rawRequest || mod.request || mod.name;
        const timestamp = (parseInt(mod.buildTimestamp) - currentTime) / 1000;
        const name = (modulePath) ? modulePath.replace(mod.context, '') : 'unknown';

        console.log('Module optimized:', name);

        if (!isNaN(timestamp)) {
          console.log('Finished ' + timestamp + ' seconds after startup.');
        }

        if (mod.loaders) {
          mod.loaders.forEach((loader) => {
            console.log('--> loader:', loader.loader);
          });
        }

        if (mod.assets) {
          Object.keys(mod.assets).forEach((asset) => {
            console.log('--> asset:', asset);
          });
        }
      });

      console.log('=========================================');
    });
  });
};

module.exports = VerbosePlugin;
