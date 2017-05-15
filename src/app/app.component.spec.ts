import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import { SkyAppConfig, SkyAppWindowRef } from '@blackbaud/skyux-builder/runtime';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let parseParams: any;
  let navigateByUrlParams: any;
  let subscribeHandler: any;
  let scrollCalled: boolean = false;

  const location = 'my-custom-location';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            events: {
              subscribe: handler => subscribeHandler = handler
            },
            navigateByUrl: url => navigateByUrlParams = url
          }
        },
        {
          provide: SkyAppWindowRef,
          useValue: {
            nativeWindow: {
              location: location,
              scroll: () => scrollCalled = true
            }
          }
        },
        {
          provide: SkyAppConfig,
          useValue: {
            runtime: {
              params: {
                getAllKeys: () => [],
                parse: (p) => parseParams = p
              }
            },
            skyux: {}
          }
        }
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      comp    = fixture.componentInstance;
    });
  }));

  it('should create component', () => {
    expect(comp).toBeDefined();
  });

  it('should pass the current location to RuntimeConfigParams to be parsed', () => {
    fixture.detectChanges();
    expect(parseParams).toEqual(location);
  });

  it('should subscribe to router events and call scroll on NavigationEnd', () => {
    fixture.detectChanges();
    subscribeHandler(new NavigationStart(0, ''));
    expect(scrollCalled).toBe(false);

    subscribeHandler(new NavigationEnd(0, '', ''));
    expect(scrollCalled).toBe(true);
  });

  it('should correctly set OmnibarConfig before calling BBOmnibar.load', () => {
    // Waiting to test this until master is merged
  });

  it('should pass help config to BBHelp.load', () =>  {
    // Waiting to test this until master is merged
  });
});
