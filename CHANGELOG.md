# 1.0.0-rc.4 (2017-06-29)

- Added support for SKY UX 2.0.0-rc.2.
- Fixed typo in `OmnibarConfigMap` (`svid` -> `svcid`). ([#201](https://github.com/blackbaud/skyux-builder/pull/201))
- Improved execution time for `skyux test` and `skyux watch`. ([#202](https://github.com/blackbaud/skyux-builder/pull/202))

# 1.0.0-rc.3 (2017-06-23)

- Added support for SKY UX 2.0.0-rc.1.
- Fixed a typings bug with `SkyAuthHttp`.

# 1.0.0-rc.2 (2017-06-21)

- Fixed invalid glob pattern (and unit tests) for ignored auto-generated components.

# 1.0.0-rc.1 (2017-06-20)

- Ignoring `src/app/public` directory when auto-generating components. [#187](https://github.com/blackbaud/skyux-builder/pull/187)
- Updated path and rules related to Codelyzer. [#192](https://github.com/blackbaud/skyux-builder/pull/192)
- Correctly setting `envId` and `svcId` for `auth-client`. [#193](https://github.com/blackbaud/skyux-builder/pull/193)

# 1.0.0-rc.0 (2017-06-16)

- Added support for Angular v4.1.3 and SKY UX 2.0.0-rc.0. 

# 1.0.0-beta.33 (2017-06-15)

- Bugfix to stop `SkyAuthHttp` from adding duplicate `envid` or `svcid` params. [#182](https://github.com/blackbaud/skyux-builder/pull/182)

# 1.0.0-beta.32 (2017-06-14)

- Bugfix for plugins to successfully run in an AOT build. [#180](https://github.com/blackbaud/skyux-builder/pull/180)
- Upgraded the default 404 route to use the SKY UX error component. [#178](https://github.com/blackbaud/skyux-builder/pull/178)
- Added support for a root route guard and child routes. [#177](https://github.com/blackbaud/skyux-builder/pull/177) Thanks [@blackbaud-brandonstirnaman](https://github.com/blackbaud-brandonstirnaman)!

# 1.0.0-beta.31 (2017-06-07)

- Added support for route guards. [#168](https://github.com/blackbaud/skyux-builder/pull/168) Thanks [@blackbaud-brandonstirnaman](https://github.com/blackbaud-brandonstirnaman)!
- Bugfix for `skyux test` not returning non-zero exit code during failure. [#173](https://github.com/blackbaud/skyux-builder/pull/173)

# 1.0.0-beta.30 (2017-06-06)

- Bugfix for `SkyAuthHttp`. [#171](https://github.com/blackbaud/skyux-builder/pull/171)

# 1.0.0-beta.29 (2017-06-05)

- Implemented style loader to resolve FOUC (flash of unstyled content). [#166](https://github.com/blackbaud/skyux-builder/pull/166)
- Initial creation of `skyRouterLink` directive. [#159](https://github.com/blackbaud/skyux-builder/pull/159)
- Updated testing suite to include internal files in `src/app` directory.
- Added the `--browser` or `-b` flag to determine which browser to open during `skyux serve`. [#167](https://github.com/blackbaud/skyux-builder/pull/167)

# 1.0.0-beta.28 (2017-05-25)

- Bugfix to correct incorrect paths specified when running `skyux e2e`.

# 1.0.0-beta.27 (2017-05-25)

- Passing `enableHelp` to the omnibar config. [#160](https://github.com/blackbaud/skyux-builder/pull/160)
- Bugfix where `skyux e2e` failed if the `skyuxconfig.json` file contained more than 8000 characters. [#161](https://github.com/blackbaud/skyux-builder/pull/161)
- Added the `--no-coverage` flag to the `skyux test` and `skyux watch` commands. [#157](https://github.com/blackbaud/skyux-builder/pull/157)
- Passing `SkyAppConfig` to any plugins defined in `skyuxconfig.json`. [#156](https://github.com/blackbaud/skyux-builder/pull/156)

# 1.0.0-beta.26 (2017-05-16)

- Added support for passing local navigation to omnibar via `skyuxconfig.json`. [#152](https://github.com/blackbaud/skyux-builder/pull/152)
- Refactored `publicRoutes` property in `skyuxconfig.json` to `routes` with `public` and `referenced` properties in preparation for publishing SPA routes to the navigation service.  [#152](https://github.com/blackbaud/skyux-builder/pull/152)
- Fixed bug parsing `skyuxconfig.json` when a BOM was present. [#153](https://github.com/blackbaud/skyux-builder/pull/153)
- Updated `@blackbaud\auth-client` to 1.5.0. [#154](https://github.com/blackbaud/skyux-builder/pull/154)

# 1.0.0-beta.25 (2017-05-15)

- Added `appSettings` property to `skyuxconfig.json`. [#146](https://github.com/blackbaud/skyux-builder/pull/146)
- Removed internal duplicate interface for AuthClient. [#145](https://github.com/blackbaud/skyux-builder/pull/145), [#149](https://github.com/blackbaud/skyux-builder/pull/149)
- Removed internal duplicate interface for HelpClient. [#147](https://github.com/blackbaud/skyux-builder/pull/147)
- Bugfix: Correctly expose `SkyAppConfig.runtime.routes`. [#150](https://github.com/blackbaud/skyux-builder/pull/150)

# 1.0.0-beta.24 (2017-05-10)

- Bugfix: Correctly return a non-zero exit code if the `skyux build` command fails.

# 1.0.0-beta.23 (2017-05-10)

- Correctly displaying sourcemaps for TypeScript file. [#136](https://github.com/blackbaud/skyux-builder/pull/136)
- Updated dependencies. [#133](https://github.com/blackbaud/skyux-builder/pull/133)
- Fixed dependency reference for `remap-istanbul`.
- Excluding `src/app/lib/` folder from code coverage instrumentation.  [#135](https://github.com/blackbaud/skyux-builder/pull/135)
- Allowing TSLint errors to fail the `skyux build` command. [#139](https://github.com/blackbaud/skyux-builder/pull/139)

# 1.0.0-beta.22 (2017-04-27)

- Added ability for tokens to be provided via a token provider rather than always using `BBAuth` to obtain a token. [#129](https://github.com/blackbaud/skyux-builder/pull/129)
- Fixed issue where not all possible properties for help config were specified in the help config interface. [#130](https://github.com/blackbaud/skyux-builder/pull/130)
- Upgraded `@blackbaud/auth-client` to 1.3.1. [#131](https://github.com/blackbaud/skyux-builder/pull/131)

# 1.0.0-beta.21 (2017-04-25)

- Using `subjectAltName` in SSL certificate in order to support Chrome 58+. [#127](https://github.com/blackbaud/skyux-builder/pull/127)
- Bugfix to allow content to pass through multiple plugins.  [#124](https://github.com/blackbaud/skyux-builder/pull/124)

# 1.0.0-beta.20 (2017-04-24)

- Explicitly adding `Access-Control-Allow-Origin` header when running `skyux serve`.

# 1.0.0-beta.19 (2017-04-24)

- Bugfix: Removed unnecessary route information in order to fix `skyux e2e` on Windows. [#122](https://github.com/blackbaud/skyux-builder/pull/122)

# 1.0.0-beta.18 (2017-04-21)

- Preventing `skyux test` from failing if no `*.spec.ts` files are specified.

# 1.0.0-beta.17 (2017-04-20)

- Bugfix: Reverted to src/app for tests/imports. [#118](https://github.com/blackbaud/skyux-builder/pull/118)
- Mock auth during e2e tests. [#117](https://github.com/blackbaud/skyux-builder/pull/117)

# 1.0.0-beta.16 (2017-04-17)

- Bugfix to correctly read `importPath` from `skyuxconfig.json`.

# 1.0.0-beta.15 (2017-04-13)

- Bundling images stored in `src/assets` and referenced via `~/assets/` in all HTML/SCSS files.
- Automatically including `envid` and `svcid` in `SkyAuthHttp` requests.
- Added `preload` and `postload` plugin hooks.  Started initial work for lifecycle hooks. (Thanks @Blackbaud-SteveBrush!)
- Created a consistent `SkyAppConfig` interface for passing around configuration.

# 1.0.0-beta.14 (2017-03-22)

- Merging `skyuxconfig.{current-skyux-command}.json`, if it exists, into the `skyuxconfig.json` file.  For example, `skyuxconfig.serve.json`.
- Adding `--envid` and `--svcid` to be specificed via the CLI and added to the Host URL opened when running `skyux serve`.  For example, `skyux serve --envid 1234`
- SKY UX styles are now loaded when running unit tests so CSS rules defined in SKY UX take effect during tests. This allows you to check the the expected computed style of an element when using things like the HTML `hidden` property that only take effect when SKY UX styles are loaded.

# 1.0.0-beta.13 (2017-03-06)

- Bugfix: Fixes AOT + Auth build.

# 1.0.0-beta.12 (2017-03-01)

- Bugfix: Reorganized runtime exports into `browser` and `e2e`.

# 1.0.0-beta.11 (2017-03-01)

- Updated URI used when accessing HOST to https://host.nxt.blackbaud.com.
- Removed hard-coded port used in `skyux serve` in favor of dynamically finding an available one. Port is configurable in `skyuxconfig.json` with the `app: { port: <port> }` setting.
- Automatically passing SPA name when using host-utils.
- Created `SkyAppTestModule` to support better SPA unit testing.
- Bugfix: Added json-loader as dependency.
- Bugfix: Calling `webdriver-manager update` before running `npm run test`. (Testing SKY UX Builder).
- Bugfix: Incorrectly passed SPA name twice in URL opened by `skyux serve`.

# 1.0.0-beta.10 (2017-02-13)

- Allowing `help-client` to be automatically included by adding `"help": { "productId": "applicable-productId" }` to `skyuxconfig.json`. Thanks [@blackbaud-stevebrush](https://github.com/blackbaud-stevebrush)!
- Refactored `e2e` command to run `build`, then lightly serve files to host.
- Created `SkyHostBrowser` for easily communicating with SKY UX Host when running `skyux e2e`.
- Deprecated `--noServe` option on `skyux e2e`.

# 1.0.0-beta.9 (2017-01-27)

- Correctly passing `--launch none` when running `skyux e2e`.
- Fixed import path for bootstrapper in AoT mode.

# 1.0.0-beta.8 (2017-01-27)

- Fixed 'No provider for SkyAuthHttp' error with AoT compilation.
- Relaxed constraints on omnibar configuration to account for all possible omnibar options.

# 1.0.0-beta.7 (2017-01-26)

- Fixed AoT compilation that broke when Blackbaud auth/omnibar support was added.

# 1.0.0-beta.6 (2017-01-23)

- Added Blackbaud auth/omnibar integration.

# 1.0.0-beta.5 (2017-01-18)

- Bugfix where `skyux e2e` would fail if no spec files were found.
- Bugfix where `skyux version` incorrectly read version from SPA's `package.json`.
- Changed `skyux serve` to only pass externals, scripts, and localUrl in querystring.
- Corrected documentation for `-l` or `--launch` flags.
- Added badges to README.

# 1.0.0-beta.4 (2017-01-11)

- Removed support for `--noOpen` flag.  Instead added `-launch` flag with `none`, `local`, or `host` (default). Ex: `-launch local`.
- Bugfix where `e2e` task would always return an exit code of 0.
- Passing any externals defined in `skyuxconfig.json` for local development.

# 1.0.0-beta.3 (2017-01-11)

- Added `externals` support in `skyuxconfig.json` for adding external CSS and JS.
- Upgraded SSL certificates used. Please follow [installation instructions](https://developer.blackbaud.com/skyux2/learn/tutorials/install).

# 1.0.0-beta.2 (2017-01-10)

- Upgraded various NPM packages including SKY UX and Angular.

# 1.0.0-beta.1 (2017-01-09)

- Using single underscore to prefix routes with parameters.
- Bugfix where new folders were not added to the watch list when running `skyux serve`.

# 1.0.0-beta.0 (2017-01-05)

- Initial release to NPM.
