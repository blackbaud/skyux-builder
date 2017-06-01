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
 * Returns the querystring base for parameters allowed to be passed through.
 * PLEASE NOTE: The method is nearly duplicated in `runtime/params.ts`.
 * @name getQueryStringFromArgv
 * @param {Object} argv
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {string}
 */
function getQueryStringFromArgv(argv, skyPagesConfig) {

  let found = [];
  skyPagesConfig.skyux.params.forEach(param => {
    if (argv[param]) {
      found.push(`${param}=${encodeURIComponent(argv[param])}`);
    }
  });

  if (found.length) {
    return `?${found.join('&')}`;
  }

  return '';
}

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
    const shorthand = {
      l: 'launch',
      b: 'browser'
    };

    let launched = false;
    this.plugin('done', (stats) => {
      if (!launched) {

        const queryStringBase = getQueryStringFromArgv(argv, skyPagesConfig);
        let localUrl = util.format(
          'https://localhost:%s%s',
          this.options.devServer.port,
          this.options.devServer.publicPath
        );

        let hostUrl = hostUtils.resolve(
          queryStringBase,
          localUrl,
          stats.toJson().chunks,
          skyPagesConfig
        );

        logger.info('SKY UX builder is ready.');
        launched = true;

        // Process shorthand flags
        Object.keys(shorthand).forEach(key => {
          if (argv[key]) {
            argv[shorthand[key]] = argv[key];
          }
        });

        // Edge uses a different technique (protocol vs executable)
        if (argv.browser === 'edge') {
          const edge = 'microsoft-edge:';
          argv.browser = undefined;
          hostUrl = edge + hostUrl;
          localUrl = edge + localUrl;
        }

        switch (argv.launch) {
          case 'none':
            break;
          case 'local':

            // Only adding queryStringBase to the message + local url opened,
            // Meaning doesn't need those to communicate back to localhost
            localUrl += queryStringBase;

            logger.info(`Launching Local URL: ${localUrl}`);
            open(localUrl, argv.browser);
            break;
          default:
            logger.info(`Launching Host URL: ${hostUrl}`);
            open(hostUrl, argv.browser);
            break;
        }
      }

    });
  }

  const common = require('./common.webpack.config').getWebpackConfig(skyPagesConfig);

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
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                // Ignore the "Cannot find module" error that occurs when referencing
                // an aliased file.  Webpack will still throw an error when a module
                // cannot be resolved via a file path or alias.
                ignoreDiagnostics: [2307]
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ]
        }
      ],
    },
    devServer: {
      compress: true,
      inline: true,
      contentBase: path.join(process.cwd(), 'src', 'app'),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
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
        context: __dirname,
        debug: true
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
