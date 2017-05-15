import { SkyuxConfig } from './config';
import { URLSearchParams } from '@angular/http';

let params: Object = {};
let allowed: string[] = [];

export class RuntimeConfigParams {

  /**
   * Clears the list of params.
   * @name clear
   */
  public static clear(): void {
    params = {};
    allowed = [];
  }

  /**
   * Returns the value of the requested param.
   * @name get
   * @param {string} key
   * @returns {string}
   */
  public static get(key: string): string {
    if (params && params[key]) {
      return params[key];
    }
    return '';
  }

  /**
   * Returns the params object
   * @name getAll
   * @returns {Object}
   */
  public static getAll(): Object {
    return params;
  }

  /**
   * Returns all keys for current params.
   * @name getAllKeys
   * @returns {array}
   */
  public static getAllKeys(): string[] {
    return Object.keys(params);
  }

  /**
   * Adds the current params to the supplied url.
   * @name getUrl
   * @param {string} url
   * @returns {string} url
   */
  public static getUrl(url: string): string {
    const delimiter = url.indexOf('?') === -1 ? '?' : '&';
    let joined = [];

    RuntimeConfigParams.getAllKeys().forEach(key => {
      joined.push(`${key}=${encodeURIComponent(RuntimeConfigParams.get(key))}`);
    });

    return joined.length === 0 ? url : `${url}${delimiter}${joined.join('&')}`;
  }

  /**
   * Filters the parameters supplied in a URL from those allowed via skyuxConfig.params.
   * @name parse
   * @param {string}
   * @param {string} url
   */
  public static parse (url: string): void {

    let qs: string = url;
    let urlSearchParams: URLSearchParams;

    // Find just the querystring portion of the url
    if (qs.indexOf('?') > -1) {
      qs = qs.split('?')[1];
    }

    // Let angular convert string into object
    urlSearchParams = new URLSearchParams(qs);

    // Filter to allowed params
    allowed.forEach(key => {
      if (urlSearchParams.has(key)) {

        // Not calling `set` since we know it's already allowed
        params[key] = urlSearchParams.get(key);
      }
    });
  }

  /**
   * Sets the value for the supplied key.
   * @name set
   * @param {string} key
   * @param {string} value
   */
  public static set(key: string, val: string): void {
    if (allowed.indexOf(key) > -1) {
      params[key] = val;
    }
  }

  /**
   * Sets the allowed params.
   * @name setConfig
   * @param {Object} config
   */
  public static setConfig(config: SkyuxConfig): void {
    if (config && config.params) {
      allowed = config.params;
    }
  }

}
