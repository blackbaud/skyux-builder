/*jshint jasmine: true, node: true */
/*global element, by, $$, protractor, browser*/
'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const common = require('./common');

module.exports = {

  verifyExitCode: (done) => {
    expect(common.getExitCode()).toEqual(0);
    done();
  },

  verifyFiles: (done) => {
    [
      'index.html',
      'metadata.json'
    ].forEach(file => {
      expect(fs.existsSync(path.resolve(common.tmp, 'dist', file))).toEqual(true);
    });

    [
      'app.*.js',
      'polyfills.*.js',
      'skyux.*.chunk.js',
      'vendor.*.chunk.js'
    ].forEach((file) => {
      const files = glob.sync(path.resolve(common.tmp, 'dist', file));
      expect(files.length).toEqual(1);
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

    const aboutComponent = $$('my-about')[0];
    expect(aboutComponent).toBe(undefined);

    done();
  },

  respectRootGuard: (done) => {
    // if the home component isn't there, the outlet was not
    // allowed to activate due to the Guard!
    const homeComponent = $$('my-home')[0];
    expect(homeComponent).toBe(undefined);
    done();
  },

  verifyChildRoute: (done) => {
    $$('#test').get(0).click();
    expect($$('h1').get(0).getText()).toBe('Hi');
    done();
  },

  verifyNestedChildRoute: (done) => {
    $$('#child').get(0).click();

    expect($$('h1').get(0).getText()).toBe('Hi');
    expect($$('#text').get(0).getText()).toBe('Child');
    done();
  },

  verifyNestedTopRoute: (done) => {
    $$('#top').get(0).click();

    expect($$('h1')[0]).toBe(undefined);
    expect($$('#text').get(0).getText()).toBe('Top');
    done();
  }
};
