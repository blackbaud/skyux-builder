const mock = require('mock-require');
// import { SkyA11y } from './a11y';

describe('SkyA11y', () => {
  // let opts = { 'a11y': {
  //         'rules': {
  //           'area-alt': { 'enabled': false },
  //           'audio-caption': { 'enabled': false }
  //         }
  //       }
  //     };
  // let res = { };

  beforeEach(function() {

    mock('axe-webdriverjs', { axeBuilder: function() {
      // options: () => {},
      // analyze: () => { return 0; }
      return 0;
    });

  });

  it('should return a promise', (done) => {
    const skyA11y = require('./a11y');
    spyOn(skyA11y, 'run');
    skyA11y.run();
    expect(typeof skyA11y.run.then).toBe('function');
    done();
  });

  afterEach(() => {
     mock.stop('axe-webdriverjs');
   });

});
