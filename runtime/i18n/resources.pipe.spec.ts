import { Observable } from 'rxjs/Observable';

import { SkyAppResourcesService } from '@blackbaud/skyux-builder/runtime/i18n/resources.service';
import { SkyAppResourcesPipe } from '@blackbaud/skyux-builder/runtime/i18n/resources.pipe';

describe('Resources pipe', () => {
  let resources: SkyAppResourcesService;

  beforeEach(() => {
    resources = {
      getString: (name: string, ...args) => {
        let value: string;

        if (args.length > 0) {
          value = 'format me ' + args[0];
        } else {
          value = 'hello';
        }

        return Observable.of(value);
      }
    } as SkyAppResourcesService;
  });

  it('should return the expected string', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    expect(pipe.transform('hi')).toBe('hello');
  });

  it('should return the expected string formatted with the specified parameters', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    expect(pipe.transform('hi', 'abc')).toBe('format me abc');
  });

  it('should cache strings that have been retrieved via the resource service', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    const getStringSpy = spyOn(resources, 'getString').and.callThrough();

    pipe.transform('hi');
    pipe.transform('hi');
    pipe.transform('hi');

    expect(getStringSpy).toHaveBeenCalledTimes(1);
  });

  it('should consider format args as part of the cache key', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    const getStringSpy = spyOn(resources, 'getString').and.callThrough();

    expect(pipe.transform('hi')).toBe('hello');
    expect(pipe.transform('hi', 'abc')).toBe('format me abc');
    expect(pipe.transform('hi')).toBe('hello');
    expect(pipe.transform('hi', 'abc')).toBe('format me abc');
    expect(pipe.transform('hi')).toBe('hello');
    expect(pipe.transform('hi', 'abc')).toBe('format me abc');

    expect(getStringSpy).toHaveBeenCalledTimes(2);
  });

});
