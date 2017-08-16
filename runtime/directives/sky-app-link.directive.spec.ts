import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

// import { RouterLinkWithHref } from '@angular/router';
import { SkyAppConfig } from '../config';
import { SkyAppLinkDirective } from './sky-app-link.directive';

@Component({
  template: `<a skyAppLink="test">Test</a>`
})
class SkyAppLinkTestComponent { }

describe('SkyAppLink Directive', () => {

  let component: SkyAppLinkTestComponent;
  let fixture: ComponentFixture<SkyAppLinkTestComponent>;
  let debugElement: DebugElement;

  function setup(params: any) {
    TestBed.configureTestingModule({
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      declarations: [
        SkyAppLinkDirective,
        SkyAppLinkTestComponent
      ],
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
            skyux: {}
          }
        }
      ]
    });

    fixture = TestBed.createComponent(SkyAppLinkTestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges(); // initial binding
  }

  it('should set href without any queryParams', () => {
    setup({});
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test');
  });

  it('should set href with queryParams', () => {
    setup({
      asdf: 123,
      jkl: 'mno'
    });
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test?asdf=123&jkl=mno');
  });
});
