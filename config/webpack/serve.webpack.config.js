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

  // Revert to environment defaults when serving.
  delete common.optimization;

  return webpackMerge(common, {
    mode: 'development',

    devtool: 'source-map',

    watch: true,

    // Do not use hashes during a serve.
    output: {
      filename: '[name].js',
      chunkFilename: '[name].chunk.js'
    },

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
      disableHostCheck: true,
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
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      publicPath: skyPagesConfigUtil.getAppBase(skyPagesConfig)
    },

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
