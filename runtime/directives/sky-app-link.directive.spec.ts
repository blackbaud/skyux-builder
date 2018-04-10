import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

// import { RouterLinkWithHref } from '@angular/router';
import { SkyAppConfig } from '../config';
import { SkyAppLinkDirective } from './sky-app-link.directive';

@Component({
  template: '<a skyAppLink="test">Test</a>'
})
class SkyAppLinkTestComponent { }

@Component({
  template: '<a skyAppLink="test" [queryParams]="{qp1: 1, qp2: false}">Test</a>'
})
class SkyAppLinkWithParamsTestComponent { }

describe('SkyAppLink Directive', () => {

  let component: SkyAppLinkTestComponent;
  let fixture: ComponentFixture<SkyAppLinkTestComponent>;
  let debugElement: DebugElement;

  function setup(params: any, useQueryParams: boolean) {
    let componentToUse = useQueryParams ?
      SkyAppLinkWithParamsTestComponent :
      SkyAppLinkTestComponent;

    TestBed.configureTestingModule({
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      declarations: [
        SkyAppLinkDirective,
        SkyAppLinkTestComponent,
        SkyAppLinkWithParamsTestComponent
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

    fixture = TestBed.createComponent(componentToUse);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges(); // initial binding
  }

  it('should set href without any queryParams', () => {
    setup({}, false);
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test');
  });

  it('should set href with queryParams', () => {
    setup({
      asdf: 123,
      jkl: 'mno'
    }, false);
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test?asdf=123&jkl=mno');
  });

  it('should set href with queryParams supplied by the queryParams attribute', () => {
    setup({}, true);
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test?qp1=1&qp2=false');
  });

  it('should set href with merged queryParams supplied by the queryParams attribute and app config', () => {
    setup({
      asdf: 123,
      jkl: 'mno'
    }, true);
    const directive = debugElement.query(By.directive(SkyAppLinkDirective));
    expect(directive.attributes['skyAppLink']).toEqual('test');
    expect(directive.properties['href']).toEqual('/test?qp1=1&qp2=false&asdf=123&jkl=mno');
  });
});
