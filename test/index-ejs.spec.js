/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

describe('index.ejs template', () => {

  it('should support external css & js in the correct locations', (done) => {

    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => ({
        entry: {
          test: ['test.js']
        },
        plugins: [
          new HtmlWebpackPlugin({
            template: 'src/main.ejs',
            inject: false,
            externals: {
              css: {
                before: [
                  {
                    url: 'f1.css',
                    integrity: 'ic1'
                  }
                ],
                after: [
                  {
                    url: 'f2.css'
                  }
                ]
              },
              js: {
                before: [
                  {
                    url: 'f1.js',
                    integrity: 'ic2',
                    head: true
                  },
                  {
                    url: 'f2.js',
                    integrity: 'ic3'
                  }
                ],
                after: [
                  {
                    url: 'f3.js'
                  }
                ]
              }
            }
          }),
          function () {
            this.plugin('emit', (compilation) => {
              const source = compilation.assets['index.html'].source();

              const css1 = `<link rel="stylesheet" href="f1.css" integrity="ic1" crossorigin="anonymous">`;
              const css2 = `<link rel="stylesheet" href="f2.css">`;
              const js1 = `<script src="f1.js" integrity="ic2" crossorigin="anonymous"></script>`;
              const js2 = `<script src="f2.js" integrity="ic3" crossorigin="anonymous"></script>`;
              const js3 = `<script src="f3.js"></script>`;

              // Order
              const icss1 = source.indexOf(css1);
              const icss2 = source.indexOf(css2);
              const ijs1 = source.indexOf(js1);
              const ijs2 = source.indexOf(js2);
              const ijs3 = source.indexOf(js3);
              const ipp = source.indexOf(`__webpack_public_path__`);

              // CSS - Files + Integrity
              expect(source).toContain(css1);
              expect(source).toContain(css2);

              // JS - Files + Integrity
              expect(source).toContain(js1);
              expect(source).toContain(js2);
              expect(source).toContain(js3);

              // CSS - Order
              expect(icss1).toBeLessThan(icss2);

              // JS - Order
              expect(ijs1).toBeLessThan(ipp);
              expect(ijs2).toBeLessThan(ipp);
              expect(ipp).toBeLessThan(ijs3);

              done();
            });
          }
        ]
      })
    });

    require('../cli/build')({}, {}, webpack);

  });

});
