module.exports = {
  getSkyPagesConfig: () => {
    return require('./sky-pages.json');
  },
  getWebpackConfig: (skyPagesConfig) => {
    return require('./config/webpack.config')(skyPagesConfig);
  }
};
