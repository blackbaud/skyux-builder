import { URLSearchParams } from '@angular/http';

export class SkyAppRuntimeConfigParams {

  private params: {[key: string]: string} = {};

  constructor(
    private url: string,
    private allowed: string[]
  ) {

    // Find just the querystring portion of the url
    if (this.url.indexOf('?') > -1) {
      this.url = this.url.split('?')[1];
    }

    // Let angular convert string into object
    const urlSearchParams: URLSearchParams = new URLSearchParams(this.url);

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
    const delimiter = url.indexOf('?') === -1 ? '?' : '&';
    let joined: string[] = [];

    this.getAllKeys().forEach(key => {
      joined.push(`${key}=${encodeURIComponent(this.get(key))}`);
    });

    return joined.length === 0 ? url : `${url}${delimiter}${joined.join('&')}`;
  }

}
