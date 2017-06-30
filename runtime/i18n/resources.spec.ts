import { SkyAppResourcesPipe } from './resources';

describe('SkyAppResourcesPipe', () => {

  let pipe: SkyAppResourcesPipe;
  beforeEach(() => {
    pipe = new SkyAppResourcesPipe();
    pipe.setup('.\\/fixtures\\/resources_en_US.json');
  });

  it('should ensure that a defined hello_world identifier returns Hello World', () => {
    let str: string = pipe.transform('hello_world');
    expect(str).toBe('Hello World');
  });

  it('should ensure that an undefined goodbye_world identifier returns goodbye_world', () => {
    let str: string = pipe.transform('goodbye_world');
    expect(str).toBe('goodbye_world');
  });
});
