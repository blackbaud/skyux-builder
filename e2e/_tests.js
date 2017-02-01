/*jshint jasmine: true, node: true */
/*global element, by, $$*/
'use strict';

module.exports = {
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
  }
};
