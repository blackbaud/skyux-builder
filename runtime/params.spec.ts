import { RuntimeConfigParams } from './params';

describe('RuntimeConfigParams', () => {

  beforeEach(() => {
    RuntimeConfigParams.clear();
    RuntimeConfigParams.setConfig({
      params: [
        'a1',
        'a3'
      ]
    });
  });

  it('should parse allowed params from a url', () => {
    const url = 'https://example.com/?a1=a&b2=jkl&a3=b';
    RuntimeConfigParams.parse(url);

    expect(RuntimeConfigParams.getAllKeys()).toEqual(['a1', 'a3']);
    expect(RuntimeConfigParams.get('a1')).toEqual('a');
    expect(RuntimeConfigParams.get('b2')).not.toEqual('jkl');
    expect(RuntimeConfigParams.get('a3')).toEqual('b');
    expect(RuntimeConfigParams.getAll()).toEqual({
      a1: 'a',
      a3: 'b'
    });
  });

  it('should only let allowed params be set', () => {
    RuntimeConfigParams.set('a1', 'b');
    RuntimeConfigParams.set('b2', 'c');
    expect(RuntimeConfigParams.get('a1')).toEqual('b');
    expect(RuntimeConfigParams.get('b2')).not.toEqual('c');
  });

  it('should add the current params to a url with a querystring', () => {
    RuntimeConfigParams.set('a1', 'b');
    expect(RuntimeConfigParams.getUrl('https://mysite.com?c=d')).toEqual(
      'https://mysite.com?c=d&a1=b'
    );
  });

  it('should add the current params to a url without a querystring', () => {
    RuntimeConfigParams.set('a1', 'b');
    expect(RuntimeConfigParams.getUrl('https://mysite.com')).toEqual(
      'https://mysite.com?a1=b'
    );
  });

  it('should return the current url if no params set (do not add ?)', () => {
    expect(RuntimeConfigParams.getUrl('https://mysite.com')).toEqual(
      'https://mysite.com'
    );
  });

});
