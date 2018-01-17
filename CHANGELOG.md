# 1.9.0 (2018-01-17)

- Added support for reading locale from SKYUX_HOST global variable. [#345](https://github.com/blackbaud/skyux-builder/pull/345)
- Disabled standalone install for webdriver manager. [#349](https://github.com/blackbaud/skyux-builder/pull/349)
- Using the latest release of Chrome when testing on Appveyor. [#352](https://github.com/blackbaud/skyux-builder/pull/352)
- Removed process.exit(0) from the generate module so the generate command can be passed through to plugins. [#351](https://github.com/blackbaud/skyux-builder/pull/351)
- Created e2e tests around integration with the help service. [#311](https://github.com/blackbaud/skyux-builder/pull/311)
- Release `skyux pact` command to allow Pact testing without using `skyux e2e`. [#319](https://github.com/blackbaud/skyux-builder/pull/319) and [#350](https://github.com/blackbaud/skyux-builder/pull/350) Thanks [@Blackbaud-JoshLandi](https://github.com/Blackbaud-JoshLandi)!

# 1.8.0 (2017-12-07)

- Upgraded `@blackbaud/auth-client` to 2.2.0. [#344](https://github.com/blackbaud/skyux-builder/pull/344)

# 1.7.1 (2017-11-17)

- Fixed slowness and out-of-memory issues with build. [#340](https://github.com/blackbaud/skyux-builder/pull/340)

# 1.7.0 (2017-11-14)

- Added ability to generate a component from the SKY UX CLI.  Run `skyux generate component <component-name>` where `<component-name>` is the name of the component preceded by an optional subfolder (e.g. `skyux generate component some-folder/some-thing`).  This will generate the TypeScript, HTML, CSS and spec files for your new component in the specified folder. [#330](https://github.com/blackbaud/skyux-builder/pull/330)

# 1.6.2 (2017-11-14)

- Reduced number of console logs for output keep alive. [#334](https://github.com/blackbaud/skyux-builder/pull/334)

# 1.6.1 (2017-11-13)

- Fixed navigation via Omnibar due to loading outside Angular. [#332](https://github.com/blackbaud/skyux-builder/pull/332)

# 1.6.0 (2017-11-13)

- Added webpack `OutputKeepAlivePlugin` to periodically print to the console to reset any timeouts associated with watched output. [#328](https://github.com/blackbaud/skyux-builder/pull/328)
- Added support for RxJS 5.4.3. [#298](https://github.com/blackbaud/skyux-builder/pull/298) Thanks [@Blackbaud-MikitaYankouski](https://github.com/Blackbaud-MikitaYankouski)!
- Adjusted regular expression specificity for elements referencing static assets. [#326](https://github.com/blackbaud/skyux-builder/pull/326)

# 1.5.0 (2017-11-03)

- Added `SkyAppOmnibarProvider` to enable custom `envId` and `svcId` to be provided to the omnibar. [#323](https://github.com/blackbaud/skyux-builder/pull/323)
- Cleaned up logging by only generating config for known commands. [#321](https://github.com/blackbaud/skyux-builder/pull/321)
- Enabled default `envid` and `svcid` params in `skyuxconfig.json`. [#320](https://github.com/blackbaud/skyux-builder/pull/320)
- Exposed `--platform` flag and adjusted config paths to improve internal continuous integration. [#297](https://github.com/blackbaud/skyux-builder/pull/297), [#322](https://github.com/blackbaud/skyux-builder/pull/322)
- Performance enhancement to load omnibar outside context of Angular. [#317](https://github.com/blackbaud/skyux-builder/pull/317)
- Bugfix to handle stopping `skyux test` before linter finishes. [#316](https://github.com/blackbaud/skyux-builder/pull/316)

# 1.4.0 (2017-10-27)

- Adjusted class names used to hide help invoker on full-page modal. [#314](https://github.com/blackbaud/skyux-builder/pull/314)
- Bugfix to not force URLs to lowercase when calling `navigateByUrl`. [#313](https://github.com/blackbaud/skyux-builder/pull/313)
- Using AppVeyor to validate building on the Windows platform. [#310](https://github.com/blackbaud/skyux-builder/pull/310), [#312](https://github.com/blackbaud/skyux-builder/pull/312)
- Upgraded `@blackbaud/auth-client` to 2.0.0. Providing backwards compatibility until 2.x.x release. [#308](https://github.com/blackbaud/skyux-builder/pull/308)
- Fixed the paths used for automatically excluding files from code coverage. [#306](https://github.com/blackbaud/skyux-builder/pull/306)

# 1.3.1 (2017-10-20)

- Fixed help invoker not being hidden when full-page modal opened. [#304](https://github.com/blackbaud/skyux-builder/pull/304)

# 1.3.0 (2017-10-16)

- Added support for `@blackbaud/auth-client` 1.18.0. [#302](https://github.com/blackbaud/skyux-builder/pull/302)
- Separated coverage and e2e steps into separate environments. [#299](https://github.com/blackbaud/skyux-builder/pull/299)

# 1.2.0 (2017-10-04)

- Created `SkyAppViewportService` for tracking when properties of the viewport change, such as when all styles and fonts have been loaded and the contents are ready for display. [#300](https://github.com/blackbaud/skyux-builder/pull/300)
- Upgraded `@blackbaud/skyux-lib-help` to `1.1.10`. [#293](https://github.com/blackbaud/skyux-builder/pull/293)
- Bugfix regarding merging of multiple `skyuxconfig.json` files. [#292](https://github.com/blackbaud/skyux-builder/pull/292) Thanks [@Blackbaud-BrandonHare](https://github.com/Blackbaud-BrandonHare)!

# 1.1.0 (2017-10-04)

- Updated `runCommmand` to return a boolean to `skyux-cli`, indicating whether the command was handled. [#277](https://github.com/blackbaud/skyux-builder/pull/277)
- Bugfix to correctly merge multiple `skyuxconfig.json` files. [#288](https://github.com/blackbaud/skyux-builder/pull/288) Thanks [@Blackbaud-BrandonHare](https://github.com/Blackbaud-BrandonHare)!
- Upgraded `@blackbaud/auth-client` to 1.15.0. Supplying `allowAnonymous` flag to Omnibar. [#290](https://github.com/blackbaud/skyux-builder/pull/289)
- Added ability to handle child route with parameter. [#286](https://github.com/blackbaud/skyux-builder/pull/286) Thanks [@Blackbaud-JoshGerdes](https://github.com/Blackbaud-JoshGerdes)!
- Exporting `SkyAppAssetsService` in default `@blackbaud/skyux-builder/runtime` barrel. [#287](https://github.com/blackbaud/skyux-builder/pull/287)

# 1.0.2 (2017-09-27)

- Removed `help-client` from dependencies as it was causing a conflict with the help library. (#284)[https://github.com/blackbaud/skyux-builder/pull/284]

# 1.0.1 (2017-09-26)

- Bugfix: Reverted some dependencies to fix `@angular/animations` errors. [#281](https://github.com/blackbaud/skyux-builder/pull/281)

# 1.0.0 (2017-09-20)

- Updated reference to new `@blackbaud/skyux-lib-help`. [#270](https://github.com/blackbaud/skyux-builder/pull/270) Thanks [@Blackbaud-BrandonJones](https://github.com/Blackbaud-BrandonJones)!
- Increased linter line-length to 140. [#275](https://github.com/blackbaud/skyux-builder/pull/275) Thanks [@Blackbaud-BrandonHare](https://github.com/Blackbaud-BrandonHare)!
- Upgraded dependency versions and internally changed how `skyux e2e` launches Protractor. [#266](https://github.com/blackbaud/skyux-builder/pull/266)

# 1.0.0-rc.19 (2017-09-13)

- Upgraded `@blackbaud/auth-client` to 1.15.0. [#268](https://github.com/blackbaud/skyux-builder/pull/268)
- Bugfix to allow periods in the filenames of JavaScript assets. [#271](https://github.com/blackbaud/skyux-builder/pull/271)

# 1.0.0-rc.18 (2017-09-06)

- Created the `--no-build` flag for `skyux e2e` to skip the build step before running end-to-end tests. [#262](https://github.com/blackbaud/skyux-builder/pull/262)
- Disabled downloading Gecko driver when running `skyux e2e`. [#263](https://github.com/blackbaud/skyux-builder/pull/263)
- More verbose messages when using `toHaveText` helper in `skyux test`. [#264](https://github.com/blackbaud/skyux-builder/pull/264) Thanks [@Blackbaud-BryonWilkins](https://github.com/Blackbaud-BryonWilkins)!

# 1.0.0-rc.17 (2017-08-23)

- Created the `--serve`/`-s` flag for `skyux build` to serve the SPA locally after it builds.  Can use in conjunction with the `--launch` and `--browser` flags. [#219](https://github.com/blackbaud/skyux-builder/pull/219)
- Upgraded `@blackbaud/auth-client` to 1.12.0. [#259](https://github.com/blackbaud/skyux-builder/pull/259)

# 1.0.0-rc.16 (2017-08-18)

- Created `SkyA11y` class.  It's available during `skyux e2e` and aids in testing accessibility guidelines. [#250](https://github.com/blackbaud/skyux-builder/pull/250)
- Bugfix when running `skyux serve` more than once at the same time on Windows. [#257](https://github.com/blackbaud/skyux-builder/pull/257)
- Made `skyux e2e` more efficient by checking for spec files before performing a build. [#256](https://github.com/blackbaud/skyux-builder/pull/256) Thanks [@blackbaud-brandonhare](https://github.com/blackbaud-brandonhare)!

# 1.0.0-rc.15 (2017-08-04)

- Fixed issue where the default port for local files during `skyux serve` could not be manually overridden in `skyuxconfig.json`. [#254](https://github.com/blackbaud/skyux-builder/pull/254)

# 1.0.0-rc.14 (2017-08-03)

- Added support for `@blackbaud/auth-client@1.11.0`. [#251](https://github.com/blackbaud/skyux-builder/pull/251)
- Fixed bug where files were being processed twice by plugins during AoT compilation (Windows only). [#252](https://github.com/blackbaud/skyux-builder/pull/252)

# 1.0.0-rc.13 (2017-07-27)

- Fixed TSLint checking node_modules [#247](https://github.com/blackbaud/skyux-builder/pull/247)

# 1.0.0-rc.12 (2017-07-26)

- Added ability to specify a permission scope with `SkyAuthHttp`. [#245](https://github.com/blackbaud/skyux-builder/pull/245)
- Added string formatting method to `SkyAppResourcesTestService`. [#239](https://github.com/blackbaud/skyux-builder/pull/239)
- Added `skyux lint` command and fixed TSLint rules (that require type checking) not failing the build. [#205](https://github.com/blackbaud/skyux-builder/pull/205)
- Added check to prevent window scroll if a route fragment exists. [#232](https://github.com/blackbaud/skyux-builder/pull/232)
- Added colors to console logs. [#244](https://github.com/blackbaud/skyux-builder/pull/244)
- Made public and referenced route properties optional. [#240](https://github.com/blackbaud/skyux-builder/pull/240)
- Fixed bug with change detection when a resource string is loaded asynchronously. [#243](https://github.com/blackbaud/skyux-builder/pull/243)

# 1.0.0-rc.11 (2017-07-24)

- Fixed transient dependency of `enhanced-resolve` created by `@ngtools/webpack`, which was breaking `skyux build` and `skyux e2e`. [#241](https://github.com/blackbaud/skyux-builder/pull/241)

# 1.0.0-rc.10 (2017-07-21)

- Fixed bug around Font Face Observer to allow compatibility with SKY UX 2.0.0-rc.7 and above.
- Upgraded rxjs to 5.4.2

# 1.0.0-rc.9 (2017-07-19)

- Added ability to format a templated resource string. [#231](https://github.com/blackbaud/skyux-builder/pull/231)
- Added version range to install latest `rc-x` branch from SKY UX. [#233](https://github.com/blackbaud/skyux-builder/pull/233)
- Fixed bug with static assets URL in e2e tests. [#234](https://github.com/blackbaud/skyux-builder/pull/234)
- Fixed `redirects` type in `SkyAppConfig`. [#229](https://github.com/blackbaud/skyux-builder/pull/229)

# 1.0.0-rc.8 (2017-07-14)

- Bugfix to allow `redirects` property in `skyuxconfig.json`. [#224](https://github.com/blackbaud/skyux-builder/pull/224)
- Bugfix that caused plugins to process files twice during AOT compilation.  [#225](https://github.com/blackbaud/skyux-builder/pull/225)
- Implemented a better caching strategy and fallback to non-region-specific languages.  [#226](https://github.com/blackbaud/skyux-builder/pull/226) 
- Upgraded `@blackbaud/auth-client` to 1.9.1. [#227](https://github.com/blackbaud/skyux-builder/pull/227)

# 1.0.0-rc.7 (2017-07-13)

- Added ability to configure route redirects in `skyuxconfig.json`. [#217](https://github.com/blackbaud/skyux-builder/pull/217)
- Added a new CLI command, `skyux build-public-library`, which bundles Angular component libraries into a consumable module for NPM. [#198](https://github.com/blackbaud/skyux-builder/pull/198)
- Fixed various issues with Builder development in a Windows environment. [#185](https://github.com/blackbaud/skyux-builder/pull/185)
- Added `SkyAppResourcesService` and `skyAppResources` pipe for retrieving and displaying strings in the `assets/locale` folder. [#552](https://github.com/blackbaud/skyux2/issues/552)
- Added `SkyAppAssetsService` for getting a URL for an asset file. [#766](https://github.com/blackbaud/skyux2/issues/766)

# 1.0.0-rc.6 (2017-07-05)

  - Updated the auth client library to pick up logic for showing the search button based on whether search has been implemented by the SPA author. [#214](https://github.com/blackbaud/skyux-builder/pull/214)
  
# 1.0.0-rc.5 (2017-07-03)

  - Added web-animations polyfill to support Angular animations in more browsers. [#204](https://github.com/blackbaud/skyux-builder/pull/204)
  - Added support for Angular v4.2.5 and SKY UX 2.0.0-rc.4. [#208](https://github.com/blackbaud/skyux-builder/pull/208)
  - Added support for `useHashRouting` in `skyuxconfig.json`. [#206](https://github.com/blackbaud/skyux-builder/pull/206)

# 1.0.0-rc.4 (2017-06-29)

- Added support for SKY UX 2.0.0-rc.2.
- Fixed typo when passing `svcid` to `auth-client`. [#201](https://github.com/blackbaud/skyux-builder/pull/201)
- Improved execution time for `skyux test` and `skyux watch`. [#202](https://github.com/blackbaud/skyux-builder/pull/202)

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
