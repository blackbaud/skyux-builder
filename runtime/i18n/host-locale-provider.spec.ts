import {
  SkyAppHostLocaleProvider
} from './host-locale-provider';

describe('Host locale provider', () => {
  let mockWindowRef: any;

  beforeEach(() => {
    mockWindowRef = {
      nativeWindow: {
        SKYUX_HOST: {
          acceptLanguage: 'en-GB'
        }
      }
    };
  });

  it('should get locale info from the global SKYUX_HOST variable', (done) => {
    const localeProvider = new SkyAppHostLocaleProvider(mockWindowRef);

    localeProvider.getLocaleInfo().subscribe((info: any) => {
      expect(info.locale).toBe('en-GB');
      done();
    });
  });

  it(
    'should fall back to default local if the global SKYUX_HOST variable does not ' +
    'specify a language',
    (done) => {
      mockWindowRef.nativeWindow.SKYUX_HOST.acceptLanguage = undefined;

      const localeProvider = new SkyAppHostLocaleProvider(mockWindowRef);

      localeProvider.getLocaleInfo().subscribe((info: any) => {
        expect(info.locale).toBe('en-US');
        done();
      });
    }
  );

  it('should expose the current locale synchronously', () => {
    const localeProvider = new SkyAppHostLocaleProvider(mockWindowRef);
    expect(localeProvider.currentLocale).toBe('en-GB');
  });
});
