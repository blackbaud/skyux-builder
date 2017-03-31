/*jshint node: true*/
'use strict';

function setSkyAssetsLoaderUrl(config, skyPagesConfig, localUrl) {
  let i;
  let n;

  const rules = config && config.module && config.module.rules;

  if (rules) {
    for (i = 0, n = rules.length; i < n; i++) {
      let rule = rules[i];

      if (rule.loader && rule.loader.match(/sky-assets$/)) {
        rule.options = rule.options || {};
        rule.options.baseUrl = localUrl + skyPagesConfig.app.base;

        return;
      }
    }
  }
}

module.exports = {
  setSkyAssetsLoaderUrl: setSkyAssetsLoaderUrl
};
