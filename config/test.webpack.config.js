/*jslint node: true */
'use strict';

function getWebpackConfig(skyPagesConfig) {
  const path = require('path');

  var ProvidePlugin = require('webpack/lib/ProvidePlugin');
  var DefinePlugin = require('webpack/lib/DefinePlugin');

  var ENV = process.env.ENV = process.env.NODE_ENV = 'test';

  var srcPath = path.resolve(process.cwd(), 'src');

  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];

  const excludes = [
    path.join(process.cwd(), 'node_modules'),
    path.resolve(__dirname, '..', 'node_modules')
  ];

  return {
    devtool: 'inline-source-map',

    resolveLoader: {
      root: resolves
    },
    resolve: {
      root: resolves,
      extensions: [
        '',
        '.js',
        '.ts'
      ],
    },

    debug: true,

    module: {

      preLoaders: [
        // {
        //   test: /sky-pages\.module\.ts$/,
        //   loaders: [
        //     moduleLoader
        //   ]
        // },

        {
          test: /\.ts$/,
          loader: 'tslint-loader',
          exclude: excludes
        },

        {
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: excludes
        }

      ],

      loaders: [

        {
          test: /\.ts$/,
          loaders: [
            'ts-loader?silent=true',
            'angular2-template-loader'
          ]
        },

        {
          test: /\.ts$/,
          loader: 'ts-loader',
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

      ],

      postLoaders: [

        // {
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

    // Referenced by the module loader.
    SKY_PAGES: skyPagesConfig,

    plugins: [

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
    ],

    tslint: {
      emitErrors: false,
      failOnHint: false,
      resourcePath: 'src'
    },

    node: {
      global: 'window',
      process: false,
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
