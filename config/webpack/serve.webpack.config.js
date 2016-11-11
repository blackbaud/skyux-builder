/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const logger = require('winston');
const webpackMerge = require('webpack-merge');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

const moduleLoader = skyPagesConfigUtil.outPath('loader', 'sky-pages-module');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(argv, skyPagesConfig) {
  /**
   * Opens the host service url.
   * @name WebpackPluginDone
   */
  function WebpackPluginDone() {
    let reported = false;
    const base = skyPagesConfig['blackbaud-sky-pages-out-skyux2'].host.url;
    const host = base + skyPagesConfigUtil.getAppBase(skyPagesConfig);
    const local = util.format(
      'https://localhost:%s%s',
      this.options.devServer.port,
      this.options.devServer.publicPath
    );

    this.plugin('done', (stats) => {
      if (reported) {
        return;
      }

      logger.info('Local files available at:\n%s\n', local);
      reported = true;

      if (!host || argv.noOpen) {
        return;
      }

      const spConfig = {
        assets: stats.toJson().assetsByChunkName,
        local: local
      };
      const encoded = new Buffer(JSON.stringify(spConfig)).toString('base64');

      logger.info('Automatically opening host url:\n%s\n', host);

      // TODO: Pass config to host when it can process it.  For now host just assumes
      // vendor/polyfills/app files.
      // open(host + '?_sp.cfg=' + encodeURIComponent(encoded));
      const open = require('open');
      open(host + '?local=true&_cfg=' + encoded);
    });
  }

  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'serve'
  });
  const common = require('./common.webpack.config')
    .getWebpackConfig(skyPagesConfigServe);

  return webpackMerge(common, {
    watch: true,
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /sky-pages\.module\.ts$/,
          loader: moduleLoader
        },
        {
          test: /\.ts$/,
          loaders: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                // Ignore the "Cannot find module" error that occurs when referencing
                // an aliased file.  Webpack will still throw an error when a module
                // cannot be resolved via a file path or alias.
                ignoreDiagnostics: [2307]
              }
            },
            'angular2-template-loader'
          ]
        }
      ],
    },
    devServer: {
      port: 31337,
      secure: false,
      colors: true,
      compress: true,
      inline: true,
      contentBase: path.join(process.cwd(), 'src', 'app'),
      historyApiFallback: {
        index: common.output.publicPath
      },
      stats: 'minimal',
      https: {
        key: fs.readFileSync(path.join(__dirname, '../../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../../ssl/server.crt'))
      },
      publicPath: skyPagesConfigUtil.getAppBase(skyPagesConfig)
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
      new NamedModulesPlugin(),
      WebpackPluginDone,
      new LoaderOptionsPlugin({
        debug: true
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
