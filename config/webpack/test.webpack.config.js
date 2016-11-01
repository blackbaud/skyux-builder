/*jslint node: true */
'use strict';

function getWebpackConfig(skyPagesConfig) {
  const path = require('path');

  const DefinePlugin = require('webpack/lib/DefinePlugin');
  const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
  const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
  const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

  const ENV = process.env.ENV = process.env.NODE_ENV = 'test';
  const srcPath = path.resolve(process.cwd(), 'src', 'app');
  const moduleLoader = path.resolve(__dirname, '..', '..', 'loader', 'sky-pages-module');
  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..', '..'),
    path.join(__dirname, '..', '..', 'node_modules')
  ];

  const excludes = [
    path.join(process.cwd(), 'node_modules'),
    path.resolve(__dirname, '..', '..', 'node_modules')
  ];

  return {
    devtool: 'inline-source-map',

    resolveLoader: {
      modules: resolves
    },
    resolve: {
      modules: resolves,
      extensions: [
        '.js',
        '.ts'
      ],
    },

    module: {

      loaders: [
        {
          enforce: 'pre',
          test: /sky-pages\.module\.ts$/,
          loaders: [
            moduleLoader
          ]
        },

        {
          enforce: 'pre',
          test: /\.ts$/,
          loader: 'tslint-loader',
          exclude: excludes
        },

        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: excludes
        },

        {
          test: /\.ts$/,
          loaders: [
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.e2e\.ts$/]
        },

        {
          test: /\.json$/,
          loader: 'json-loader'
        },

        {
          test: /\.css$/,
          loader: 'raw-loader'
        },

        {
          test: /\.html$/,
          loader: 'raw-loader'
        },

        {
          test: /\.scss$/,
          loader: 'raw-loader!sass-loader'
        }

        // {
        //   enforce: 'post',
        //   test: /\.(js|ts)$/,
        //   loader: 'istanbul-instrumenter-loader!source-map-inline-loader',
        //   include: srcPath,
        //   exclude: [
        //     /\.(e2e|spec)\.ts$/,
        //     /node_modules/,
        //     /index\.ts/,
        //     /fixtures/,
        //     /testing/
        //   ]
        // }

      ]

    },

    plugins: [

      new LoaderOptionsPlugin({
        debug: true,
        options: {
          tslint: {
            emitErrors: false,
            failOnHint: false,
            resourcePath: 'src'
          }
        }
      }),

      new DefinePlugin({
        'ENV': JSON.stringify(ENV),
        'HMR': false,
        'process.env': {
          'ENV': JSON.stringify(ENV),
          'NODE_ENV': JSON.stringify(ENV),
          'HMR': false
        },
        'ROOT_DIR': JSON.stringify(srcPath),
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),

      new ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        skyPagesConfigUtil.spaPath('src') // location of your src
      )
    ]

  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
