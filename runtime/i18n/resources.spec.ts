import { SkyAppResourcesPipe } from './resources';
import { * } from './fixtures';
// import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('Error Component', () => {
  // let fixture: ComponentFixture<SkyAppResourcesPipe>;
  // let cmp: SkyAppResourcesPipe;
  // let de:  DebugElement;
  // let el: HTMLElement;
  let pipe: SkyAppResourcesPipe;

  beforeEach(() => {
    // TestBed.configureTestingModule({
    //   imports: [],
    //   declarations: [
    //     ESkyAppResourcesPipe
    //   ]
    // });
    pipe = new SkyAppResourcesPipe();
    pipe.resources = require('json-loader!./fixtures/resources_en_US.mock.json');
  });

  fit('should ensure that a defined hello_world identifier returns Hello World', () => {
    let str: string = pipe.transform('hello_world')
    expect(str).toBe('Hello World');
  });

  fit('should ensure that an undefined goodbye_world identifier returns goodbye_world', () => {
    let str: string = pipe.transform('goodbye_world')
    expect(str).toBe('goodbye_world');
  });
});
