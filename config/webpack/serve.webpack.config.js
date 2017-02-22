/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const open = require('open');
const logger = require('winston');
const webpackMerge = require('webpack-merge');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const hostUtils = require('../../utils/host-utils');

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
    let launched = false;
    this.plugin('done', (stats) => {
      if (!launched) {

        const localUrl = util.format(
          'https://localhost:%s%s',
          this.options.devServer.port,
          this.options.devServer.publicPath
        );

        const hostUrl = hostUtils.resolve(
          skyPagesConfigUtil.getAppBase(skyPagesConfig),
          localUrl,
          stats.toJson().chunks,
          skyPagesConfig
        );

        logger.info('SKY UX builder is ready.');
        launched = true;

        // Process shorthand flags
        if (argv.l) {
          argv.launch = argv.l;
        }

        switch (argv.launch) {
          case 'none':
            break;
          case 'local':
            logger.info(`Launching Local URL: ${localUrl}`);
            open(localUrl);
            break;
          default:
            logger.info(`Launching Host URL: ${hostUrl}`);
            open(hostUrl);
            break;
        }
      }

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
      secure: false,
      colors: true,
      compress: true,
      inline: true,
      contentBase: path.join(process.cwd(), 'src', 'app'),
      historyApiFallback: {
        index: skyPagesConfigUtil.getAppBase(skyPagesConfig)
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
