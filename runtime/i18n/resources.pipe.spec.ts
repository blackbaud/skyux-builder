import { Observable } from 'rxjs/Observable';

import { SkyAppResourcesService } from '@blackbaud/skyux-builder/runtime/i18n/resources.service';
import { SkyAppResourcesPipe } from '@blackbaud/skyux-builder/runtime/i18n/resources.pipe';

describe('Resources pipe', () => {
  let resources: SkyAppResourcesService;

  beforeEach(() => {
    resources = {
      getString: (name: string) => {
        return Observable.of('hello');
      }
    };
  });

  it('should return the expected string', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    expect(pipe.transform('hi')).toBe('hello');
  });

  it('should cache strings that have been retrieved via the resource service', () => {
    let pipe = new SkyAppResourcesPipe(resources);

    const getStringSpy = spyOn(resources, 'getString').and.callThrough();

    pipe.transform('hi');
    pipe.transform('hi');
    pipe.transform('hi');

    expect(getStringSpy).toHaveBeenCalledTimes(1);
  });

});
