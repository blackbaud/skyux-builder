/*jslint node: true */
'use strict';

function getWebpackConfig(skyPagesConfig, argv) {

  function spaPath() {
    return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
  }

  function outPath() {
    return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
  }

  const path = require('path');

  const DefinePlugin = require('webpack/lib/DefinePlugin');
  const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
  const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
  const ProcessExitCode = require('../../plugin/process-exit-code');
  const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
  const aliasBuilder = require('./alias-builder');

  const runCoverage = (!argv || argv.coverage !== false);
  skyPagesConfig.runtime.includeRouteModule = false;

  const ENV = process.env.ENV = process.env.NODE_ENV = 'test';
  const srcPath = path.resolve(process.cwd(), 'src', 'app');
  const moduleLoader = outPath('loader', 'sky-pages-module');

  const resolves = [
    process.cwd(),
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  const excludes = [
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  let alias = aliasBuilder.buildAliasList(skyPagesConfig);

  let config = {
    devtool: 'inline-source-map',

    resolveLoader: {
      modules: resolves
    },

    resolve: {
      alias: alias,
      modules: resolves,
      extensions: [
        '.js',
        '.ts'
      ],
    },

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /runtime\/config\.ts$/,
          loader: outPath('loader', 'sky-app-config')
        },
        {
          enforce: 'pre',
          test: /sky-pages\.module\.ts$/,
          loader: moduleLoader
        },
        {
          enforce: 'pre',
          test: /\.ts$/,
          loader: 'tslint-loader',
          exclude: excludes,
          options: {
            emitErrors: true,
            failOnHint: true
          }
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: excludes
        },
        {
          enforce: 'pre',
          loader: outPath('loader', 'sky-processor', 'preload'),
          exclude: /node_modules/
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
          ],
          exclude: [/\.e2e\.ts$/]
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
          use: [
            'raw-loader',
            'sass-loader'
          ]
        }
      ]
    },

    plugins: [
      new LoaderOptionsPlugin({
        debug: true,
        options: {
          context: __dirname,
          skyPagesConfig: skyPagesConfig,
          tslint: {
            emitErrors: false,
            failOnHint: false,
            resourcePath: 'src',
            typeCheck: true
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
        'skyPagesConfig': JSON.stringify(skyPagesConfig),
      }),

      new ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        skyPagesConfigUtil.spaPath('src'), // location of your src
        {}
      ),

      // Webpack 2 behavior does not correctly return non-zero exit code.
      new ProcessExitCode()
    ]
  };

  if (runCoverage) {
    config.module.rules.push({
      enforce: 'post',
      test: /\.(js|ts)$/,
      use: [
        {
          loader: 'istanbul-instrumenter-loader',
          options: {
            esModules: true
          }
        },
        {
          loader: 'source-map-inline-loader'
        }
      ],
      include: srcPath,
      exclude: [
        /\.(e2e|spec)\.ts$/,
        /node_modules/,
        /index\.ts/,
        /fixtures/,
        /testing/,
        /src(\\|\/)app(\\|\/)lib/
      ]
    });
  }

  return config;
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
