import * as FontFaceObserver from 'fontfaceobserver';

export class StyleLoader {
  public static readonly LOAD_TIMEOUT: number = 3000;
  public static loadStyles(): Promise<any> {
    const fontAwesome = new FontFaceObserver('FontAwesome');
    const openSans = new FontFaceObserver('Open Sans');
    const oswald = new FontFaceObserver('Oswald');

    return Promise.all([
      // Specify a character for FontAwesome since some browsers will fail to detect
      // when the font is loaded unless a known character with a different width
      // than the default is not specified.
      fontAwesome.load('\uf0fc', StyleLoader.LOAD_TIMEOUT),
      openSans.load(undefined, StyleLoader.LOAD_TIMEOUT),
      oswald.load(undefined, StyleLoader.LOAD_TIMEOUT)
    ]);
  }
}
