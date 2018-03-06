import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { SkyAppConfig } from '../config';
import { SkyAppLinkExternalDirective } from './sky-app-link-external.directive';
import { SkyAppWindowRef } from '../window-ref';

@Component({
  template: `<a skyAppLinkExternal='test'>Test</a>`
})
class SkyAppLinkExternalTestComponent {
  public static readonly testUrl: string = 'testUrl';
}

describe('SkyAppLinkExternal Directive', () => {
  let component: SkyAppLinkExternalTestComponent;
  let fixture: ComponentFixture<SkyAppLinkExternalTestComponent>;
  let debugElement: DebugElement;

  class MockWindowService {
    public get nativeWindow() {
      return {
        window: {
          name: ''
        }
      };
    }
  }

  let mockWindowService = new MockWindowService();

  function setup(params: any) {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [SkyAppLinkExternalDirective, SkyAppLinkExternalTestComponent],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: SkyAppConfig,
          useValue: {
            runtime: {
              params: {
                getAll: () => params
              }
            },
            skyux: {
              host: {
                url: SkyAppLinkExternalTestComponent.testUrl
              }
            }
          }
        },
        { provide: SkyAppWindowRef, useValue: mockWindowService }
      ]
    });

    fixture = TestBed.createComponent(SkyAppLinkExternalTestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges(); // initial binding
  }

  it('should set href without any queryParams', () => {
    setup({});
    const directive = debugElement.query(By.directive(SkyAppLinkExternalDirective));
    expect(directive.attributes['skyAppLinkExternal']).toEqual('test');
  });

  it('should set href with queryParams', () => {
    setup({
      asdf: 123,
      jkl: 'mno'
    });
    const directive = debugElement.query(By.directive(SkyAppLinkExternalDirective));
    expect(directive.attributes['skyAppLinkExternal']).toEqual('test');
  });
});
