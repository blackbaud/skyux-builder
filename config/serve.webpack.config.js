/*jslint node: true */
'use strict';

const fs = require('fs');
const open = require('open');
const path = require('path');
const util = require('util');
const logger = require('winston');
const webpackMerge = require('webpack-merge');

/**
 * Opens the host service url.
 * @name WebpackPluginDone
 */
const WebpackPluginDone = function () {
  let reported = false;
  const base = this.options.SKY_PAGES['blackbaud-sky-pages-out-skyux2'].host.url;
  const host = base + this.options.devServer.publicPath;
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

    if (!host || this.options.argv.noOpen) {
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
    open(host + '?local=true');
  });
};

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {

  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'serve'
  });
  const common = require('./common.webpack.config')
    .getWebpackConfig(skyPagesConfigServe);

  return webpackMerge(common, {
    watch: true,
    devServer: {
      port: 31337,
      secure: false,
      colors: true,
      compress: true,
      inline: true,
      historyApiFallback: {
        index: common.output.publicPath
      },
      stats: 'minimal',
      https: {
        key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
      },
      publicPath: common.output.publicPath
    },
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
      ]
    },
    plugins: [
      WebpackPluginDone
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
