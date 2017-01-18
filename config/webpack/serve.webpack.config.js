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
const sorter = require('html-webpack-plugin/lib/chunksorter');

const moduleLoader = skyPagesConfigUtil.outPath('loader', 'sky-pages-module');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(argv, skyPagesConfig) {

  /**
   * If the requested file exists, returns it.
   * @name getLocalConfig
   * @param {string} filename
   * @returns {Object} config
   */
  function getLocalConfig(filename) {
    const filepath = path.join(process.cwd(), filename);

    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } else {
      return {};
    }
  }
  /**
   * Opens the host service url.
   * @name WebpackPluginDone
   */
  function WebpackPluginDone() {
    let launched = false;
    const hostBaseUrl = skyPagesConfig.host.url + skyPagesConfigUtil.getAppBase(skyPagesConfig);
    const localUrl = util.format(
      'https://localhost:%s%s',
      this.options.devServer.port,
      this.options.devServer.publicPath
    );
    let scripts = [];

    this.plugin('emit', (compilation, done) => {
      const chunks = sorter.dependency(compilation.getStats().toJson().chunks);
      chunks.forEach((chunk) => {
        scripts.push({
          name: chunk.files[0]
        });
      });
      done();
    });

    this.plugin('done', () => {
      if (!launched) {

        const open = require('open');
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
            const spConfig = {
              scripts: scripts,
              skyuxConfig: skyPagesConfig,
              packageConfig: getLocalConfig('package.json'),
              localUrl: localUrl
            };

            const encoded = new Buffer(JSON.stringify(spConfig)).toString('base64');
            const hostUrl = `${hostBaseUrl}?local=true&_cfg=${encoded}`;

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
