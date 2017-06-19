import { Pipe } from '@angular/core';
import * as data from '/locales/resources_en_US.json';

@Pipe({
    name: 'lang'
})
export class LanguagePipe {
  private lang: String;
  private country: String;

  transform(val) {
    if(lang){
      if(country){
        let resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'/locales/resources_'+lang+'_'+country+'.json');
        let stringObj: {_description: string, message: string} = this.resources[val];
        if (stringObj) {
          return stringObj.message;
        } else {
          resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'/locales/resources_'+lang+'.json');
          stringObj: {_description: string, message: string} = this.resources[val];
          if (stringObj) {
            return stringObj.message;
          } else {
            resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'/locales/resources_en.json');
            stringObj: {_description: string, message: string} = this.resources[val];
            if (stringObj) {
              return stringObj.message;
            } else {
              return val;
            }
          }
        }
      } else {
        let resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'/locales/resources_'+lang+'.json');
        let stringObj: {_description: string, message: string} = this.resources[val];
        if (stringObj) {
            return stringObj.message;
        } else {
          resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'/locales/resources_en.json');
          stringObj: {_description: string, message: string} = this.resources[val];
          if (stringObj) {
            return stringObj.message;
          } else {
            return val;
          }
        }
      }
    } else {
      let resources: any = skyAppConfig.runtime.spaPathAlias + '/' + require('json-loader!../../locales/resources_en.json');
      let stringObj: {_description: string, message: string} = this.resources[val];
      if(stringObj){
        return stringObj.message;
      } else {
        return val;
      }
    }
  }

  setup(language: String, country: String) {
    this.lang = language;
    this.c = country;
  }
}
