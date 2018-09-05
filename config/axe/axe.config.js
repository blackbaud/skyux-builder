/*jshint node: true*/
'use strict';

// Defaults derived from: https://github.com/dequelabs/axe-core
const defaults = {
  rules: {
    'area-alt': { 'enabled': true },
    'audio-caption': { 'enabled': true },
    'button-name': { 'enabled': true },
    'document-title': { 'enabled': true },
    'empty-heading': { 'enabled': true },
    'frame-title': { 'enabled': true },
    'frame-title-unique': { 'enabled': true },
    'image-alt': { 'enabled': true },
    'image-redundant-alt': { 'enabled': true },
    'input-image-alt': { 'enabled': true },
    'link-name': { 'enabled': true },
    'object-alt': { 'enabled': true },
    'server-side-image-map': { 'enabled': true },
    'video-caption': { 'enabled': true },
    'video-description': { 'enabled': true },

    'definition-list': { 'enabled': true },
    'dlitem': { 'enabled': true },
    'heading-order': { 'enabled': true },
    'href-no-hash': { 'enabled': true },
    'layout-table': { 'enabled': true },
    'list': { 'enabled': true },
    'listitem': { 'enabled': true },
    'p-as-heading': { 'enabled': true },

    'scope-attr-valid': { 'enabled': true },
    'table-duplicate-name': { 'enabled': true },
    'table-fake-caption': { 'enabled': true },
    'td-has-header': { 'enabled': true },
    'td-headers-attr': { 'enabled': true },
    'th-has-data-cells': { 'enabled': true },

    'duplicate-id': { 'enabled': true },
    'html-has-lang': { 'enabled': true },
    'html-lang-valid': { 'enabled': true },
    'meta-refresh': { 'enabled': true },
    'valid-lang': { 'enabled': true },

    'checkboxgroup': { 'enabled': true },
    'label': { 'enabled': true },
    'radiogroup': { 'enabled': true },

    'accesskeys': { 'enabled': true },
    'bypass': { 'enabled': true },
    'tabindex': { 'enabled': true },

    // TODO: this should be re-enabled when we upgrade to axe-core ^3.1.1 (https://github.com/dequelabs/axe-core/issues/961)
    'aria-allowed-attr': { 'enabled': false },
    'aria-required-attr': { 'enabled': true },
    'aria-required-children': { 'enabled': true },
    'aria-required-parent': { 'enabled': true },
    'aria-roles': { 'enabled': true },
    'aria-valid-attr': { 'enabled': true },
    'aria-valid-attr-value': { 'enabled': true },

    'blink': { 'enabled': true },
    'color-contrast': { 'enabled': true },
    'link-in-text-block': { 'enabled': true },
    'marquee': { 'enabled': true },
    'meta-viewport': { 'enabled': true },
    'meta-viewport-large': { 'enabled': true }
  }
};

module.exports = {
  getConfig: () => {
    const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
    const skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig();

    let config = {};

    // Merge rules from skyux config.
    if (skyPagesConfig.skyux.a11y && skyPagesConfig.skyux.a11y.rules) {
      config.rules = Object.assign({}, defaults.rules, skyPagesConfig.skyux.a11y.rules);
    }

    // The consuming SPA wishes to disable all rules.
    if (skyPagesConfig.skyux.a11y === false) {
      config.rules = Object.assign({}, defaults.rules);
      Object.keys(config.rules).forEach((key) => {
        config.rules[key].enabled = false;
      });
    }

    if (!config.rules) {
      return defaults;
    }

    return config;
  }
};
