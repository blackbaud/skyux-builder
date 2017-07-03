import { SkyAppResourcesServiceMock } from './resources.service.mock';
import { SkyAppResourcesPipe } from './resources';

describe('SkyAppResourcesPipe', () => {
  let pipe: SkyAppResourcesPipe;
  let mockResources: SkyAppResourcesServiceMock;
  beforeEach(() => {
    pipe = new SkyAppResourcesPipe();
    mockResources = new SkyAppResourcesServiceMock();
    pipe.resourcesService = mockResources;
  });

  it('should ensure that a defined identifier returns the listed message from the resource file', () => {
    let str: string = pipe.transform('hello_world');
    expect(str).toBe('Hello World');
  });

  it('should ensure that an undefined identifier returns that same identifier', () => {
    let str: string = pipe.transform('goodbye_world');
    expect(str).toBe('goodbye_world');
  });
});
