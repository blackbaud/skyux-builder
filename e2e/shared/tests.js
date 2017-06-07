/*jshint jasmine: true, node: true */
/*global element, by, $$*/
'use strict';

const fs = require('fs');
const path = require('path');
const common = require('./common');

module.exports = {

  verifyExitCode: (done) => {
    expect(common.getExitCode()).toEqual(0);
    done();
  },

  verifyFiles: (done) => {
    [
      'app.js',
      'index.html',
      'metadata.json',
      'polyfills.js',
      'skyux.js',
      'vendor.js'
    ].forEach(file => {
      expect(fs.existsSync(path.resolve(common.tmp, 'dist', file))).toEqual(true);
    });
    done();
  },

  renderHomeComponent: (done) => {
    expect(element(by.tagName('h1')).getText()).toBe('SKY UX Template');
    expect(element(by.className('sky-alert')).getText()).toBe(
      `You've just taken your first step into a larger world.`
    );
    done();
  },

  renderSharedNavComponent: (done) => {
    const nav = $$('.sky-navbar-item');
    expect(nav.count()).toBe(2);
    done();
  },

  followRouterLinkRenderAbout: (done) => {
    const nav = $$('.sky-navbar-item a');
    nav.get(1).click();
    expect(element(by.tagName('h1')).getText()).toBe('About our Team');
    done();
  },

  respectGuardCanActivate: (done) => {
    const nav = $$('.sky-navbar-item a');
    nav.get(1).click();
    expect(element(by.tagName('h1')).getText()).toBe('SKY UX Template');
    done();
  }
};
