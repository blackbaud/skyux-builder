const path = require('path');

var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');

var ENV = process.env.ENV = process.env.NODE_ENV = 'test';

var srcPath = path.resolve(process.cwd(), 'src');

module.exports = {

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['', '.ts', '.js'],
    root: srcPath,
  },

  module: {

    preLoaders: [
      {
        test: /\.ts$/,
        loader: 'tslint-loader',
        exclude: [path.resolve(srcPath, '..', 'node_modules')]
      },

      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          // these packages have problems with their sourcemaps
          path.resolve(srcPath, 'node_modules/rxjs'),
          path.resolve(srcPath, 'node_modules/@angular/compiler')
        ]
      }

    ],

    loaders: [

      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        query: {
          compilerOptions: {

            // Remove TypeScript helpers to be injected
            // below by DefinePlugin
            removeComments: true

          }
        },
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

      {
        test: /\.(js|ts)$/,
        loader: 'istanbul-instrumenter-loader!source-map-inline-loader',
        include: srcPath,
        exclude: [
          /\.(e2e|spec)\.ts$/,
          /node_modules/,
          /index\.ts/,
          /fixtures/,
          /testing/
        ]
      }

    ]
  },

  plugins: [

    new DefinePlugin({
      'ENV': JSON.stringify(ENV),
      'HMR': false,
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'NODE_ENV': JSON.stringify(ENV),
        'HMR': false
      },
      'ROOT_DIR': JSON.stringify(srcPath)
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
