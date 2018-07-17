/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const browser = require('../../cli/utils/browser');

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

    let launched = false;
    this.plugin('done', (stats) => {
      if (!launched) {
        launched = true;
        browser(argv, skyPagesConfig, stats, this.options.devServer.port);
      }
    });
  }

  const common = require('./common.webpack.config').getWebpackConfig(skyPagesConfig, argv);

  return webpackMerge(common, {
    watch: true,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                // Ignore the "Cannot find module" error that occurs when referencing
                // an aliased file.  Webpack will still throw an error when a module
                // cannot be resolved via a file path or alias.
                ignoreDiagnostics: [2307],
                transpileOnly: true,
                silent: true
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ],
          exclude: [/\.e2e\.ts$/]
        }
      ]
    },
    devServer: {
      compress: true,
      inline: true,
      stats: false,
      hot: argv.hmr,
      contentBase: path.join(process.cwd(), 'src', 'app'),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      historyApiFallback: {
        index: skyPagesConfigUtil.getAppBase(skyPagesConfig)
      },
      https: {
        key: fs.readFileSync(path.join(__dirname, '../../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../../ssl/server.crt'))
      },
      publicPath: skyPagesConfigUtil.getAppBase(skyPagesConfig)
    },
    devtool: 'source-map',
    plugins: [
      new NamedModulesPlugin(),
      WebpackPluginDone,
      new LoaderOptionsPlugin({
        context: __dirname,
        debug: true
      }),
      new HotModuleReplacementPlugin()
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
