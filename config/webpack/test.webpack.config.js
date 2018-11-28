/*jslint node: true */
'use strict';

const path = require('path');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const aliasBuilder = require('./alias-builder');

function spaPath() {
  return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
}

function outPath() {
  return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
}

function getWebpackConfig(skyPagesConfig, argv) {
  const ENV = process.env.ENV = process.env.NODE_ENV = 'test';
  const argvCoverage = (argv) ? argv.coverage : true;
  const runCoverage = (argvCoverage !== false);

  let srcPath;
  if (argvCoverage === 'library') {
    srcPath = path.resolve(process.cwd(), 'src', 'app', 'public');
  } else {
    srcPath = path.resolve(process.cwd(), 'src', 'app');
  }

  const resolves = [
    process.cwd(),
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  const excludes = [
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  skyPagesConfig.runtime.includeRouteModule = false;

  let alias = aliasBuilder.buildAliasList(skyPagesConfig);

  let config = {
    mode: 'development',

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
      ]
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
          loader: outPath('loader', 'sky-pages-module')
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
          exclude: excludes
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
                ignoreDiagnostics: [2307],
                // Linting is handled by the sky-tslint loader.
                transpileOnly: true
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ],
          exclude: [/\.e2e-spec\.ts$/]
        },
        {
          test: /\.s?css$/,
          use: ['raw-loader', 'sass-loader']
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
          // Removing this will cause deprecation warnings to appear.
          // See: https://github.com/angular/angular/issues/21560#issuecomment-433601967
          test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
          parser: {
            system: true
          }
        }
      ]
    },

    plugins: [
      new LoaderOptionsPlugin({
        debug: true,
        options: {
          context: __dirname,
          skyPagesConfig: skyPagesConfig
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
        /angular(\\|\/)core(\\|\/)@angular/,
        skyPagesConfigUtil.spaPath('src'),
        {}
      ),

      // Suppress the "request of a dependency is an expression" warnings.
      // See: https://github.com/angular/angular/issues/20357#issuecomment-343683491
      new ContextReplacementPlugin(
        /\@angular(\\|\/)core(\\|\/)fesm5/,
        spaPath('src'),
        {}
      )
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
        /(\\|\/)node_modules(\\|\/)/,
        /(\\|\/)index\.ts/,
        /(\\|\/)fixtures(\\|\/)/,
        /(\\|\/)testing(\\|\/)/,
        /(\\|\/)src(\\|\/)app(\\|\/)lib(\\|\/)/
      ]
    });
  }

  return config;
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
