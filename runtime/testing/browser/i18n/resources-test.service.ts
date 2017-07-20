import { Observable } from 'rxjs/Observable';

import { SkyAppResources } from '../../../i18n/resources';

declare const ROOT_DIR: string;
declare const require: {context: any};

/**
 * Provides a replacement for the SkyAppResourcesService to use in unit tests.
 */
export class SkyAppResourcesTestService {
    public getString(name: string): Observable<string> {
      function throwMissingResourceError(message: string) {
        throw new Error(
          'No matching string for the resource name "' + name + '" ' +
          'was found in the  default culture\'s resource file.  ' + message
        );
      }

      // A normal require where no resource file exists would cause an error even if this
      // method is never called since it's evaluated at build time.
      // Requiring through context allows for an "optional" require, which keeps an app
      // that has no resource files from erroring during a unit test run unless it
      // explicitly tries to reference a resource string.
      const resourcesContext = require.context(
        'json-loader!' + ROOT_DIR + '/..', true, /\.\/assets\/locales\/resources_en_US\.json$/
      );

      const resources: SkyAppResources = resourcesContext.keys().map(resourcesContext)[0];

      if (!resources) {
        throwMissingResourceError('No resource file exists for the default locale en-US.');
      }

      const resource = resources[name];

      // Instead of falling back to the key like the standard resources service does, throw
      // an error to notify the unit test author that an invalid resource string is being
      // referenced.
      if (resource === undefined) {
        throwMissingResourceError(
          'Ensure your component or service is referencing a valid resource string.'
        );
      }

      return Observable.of(resource.message);
    }
}
