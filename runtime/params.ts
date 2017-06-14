import { URLSearchParams } from '@angular/http';

/**
 * Given a "url" (could be just querystring, or fully qualified),
 * Returns the extracted URLSearchParams.
 * @param {string} url
 * @return {URLSearchParams} urlSearchParams
 */
function getUrlSearchParams(url: string): URLSearchParams {
  if (url.indexOf('?') > -1) {
    url = url.split('?')[1];
  }

  return new URLSearchParams(url);
}

export class SkyAppRuntimeConfigParams {

  private params: {[key: string]: string} = {};

  constructor(
    private url: string,
    private allowed: string[]
  ) {

    const urlSearchParams: URLSearchParams = this.getUrlSearchParams(url);

    // Filter to allowed params
    this.allowed.forEach(key => {
      if (urlSearchParams.has(key)) {
        this.params[key] = urlSearchParams.get(key);
      }
    });
  }

  /**
   * Returns the value of the requested param.
   * @name get
   * @param {string} key
   * @returns {string}
   */
  public get(key: string): string {
    if (this.params && this.params[key]) {
      return this.params[key];
    }
    return '';
  }

  /**
   * Returns the params object
   * @name getAll
   * @returns {Object}
   */
  public getAll(): Object {
    return this.params;
  }

  /**
   * Returns all keys for current params.
   * @name getAllKeys
   * @returns {array}
   */
  public getAllKeys(): string[] {
    return Object.keys(this.params);
  }

  /**
   * Adds the current params to the supplied url.
   * @name getUrl
   * @param {string} url
   * @returns {string} url
   */
  public getUrl(url: string): string {
    const urlSearchParams: URLSearchParams = getUrlSearchParams(url);
    const delimiter = url.indexOf('?') === -1 ? '?' : '&';
    let joined: string[] = [];

    this.getAllKeys().forEach(key => {
      if (!urlSearchParams.has(key)) {
        joined.push(`${key}=${encodeURIComponent(this.get(key))}`);
      }
    });

    return joined.length === 0 ? url : `${url}${delimiter}${joined.join('&')}`;
  }

}
