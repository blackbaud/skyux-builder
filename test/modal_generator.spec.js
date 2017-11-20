/*jshint node: true */
/*jshint jasmine: true */
'use strict';
const rewire = require('rewire');
const gen_modal = rewire('../lib/modal_generator');

xdescribe('Gen Modal', () => {
  const folderName = 'test_files';
  const componentName = 'myComponent';
  const fsStub = {
    mkdir: (path, callback) => {
      callback(null, []);
    },
    writeFile: (path, data, callback) => { 
      callback(null, []);
    }
  };
  
  beforeEach(() => {
    spyOn(fsStub, 'writeFile');
    gen_modal.__set__('fs', fsStub);
  });

  it('makes a folder', () => {
    spyOn(fsStub, 'mkdir');
    gen_modal.makeFolder(folderName);
    expect(fsStub.mkdir).toHaveBeenCalledWith(folderName);
  });

  it('makes a css file', () => {
    gen_modal.makeCss(componentName, folderName);
    expect(fsStub.writeFile)
      .toHaveBeenCalledWith(`./${folderName}/${componentName}.component.scss`, '');
  });

  it('makes a html file', () => {
    gen_modal.makeHtml(componentName, folderName);
    expect(fsStub.writeFile)
      .toHaveBeenCalledWith(`./${folderName}/${componentName}.component.html`, gen_modal.html(componentName));
  });

  it('makes a typescript file', () => {
    gen_modal.makeTS(componentName, folderName);
    expect(fsStub.writeFile)
      .toHaveBeenCalledWith(`./${folderName}/${componentName}.component.ts`, gen_modal.tsCode(componentName));
  });

  it('makes a spec file', () => {
    gen_modal.makeSpec(componentName, folderName);
    expect(fsStub.writeFile)
      .toHaveBeenCalledWith(`./${folderName}/${componentName}.component.spec.ts`, '');
  });

  describe('.generateComponentName', () => {
    it('handles one word', () => {
      expect(gen_modal.generateComponentName('test'))
        .toBe('test-modal');
    });

    it('handles multiple words', () => {
      expect(gen_modal.generateComponentName('my test'))
        .toBe('my-test-modal');
    });
    
    it('handles words with capitalized letters', () => {
      expect(gen_modal.generateComponentName('My Test'))
        .toBe('my-test-modal');
    });

    it('handles words that are given in component form', () => {
      expect(gen_modal.generateComponentName('my-test'))
        .toBe('my-test-modal');
    });
  });
});