# 1.0.0-beta.5 (2017-01-18)

- Bugfix where `skyux e2e` would fail if no spec files were found.
- Bugfix where `skyux version` incorrectly read version from SPA's `package.json`.
- Changed `skyux serve` to only pass externals, scripts, and localUrl in querystring.
- Corrected documentation for `-l` or `--launch` flags.
- Added badges to README

# 1.0.0-beta.4 (2017-01-11)

- Removed support for `--noOpen` flag.  Instead added `-launch` flag with `none`, `local`, or `host` (default).  Ex: `-launch local`
- Bugfix where `e2e` task would always return an exit code of 0.
- Passing the local `skyuxconfig.json` and `package.json` files to host for better local development.

# 1.0.0-beta.3 (2017-01-11)

- Added `externals` support in `skyuxconfig.json` for adding external CSS + JS.
- Upgraded ssl certificates used.  Please follow [installation instructions](https://github.com/blackbaud/skyux-cli#installing-ssl-certificate).

# 1.0.0-beta.2 (2017-01-10)

- Upgraded various NPM packages including SKY UX and Angular.

# 1.0.0-beta.1 (2017-01-09)

- Using single underscore to prefix routes with parameters.
- Bugfix where new folders were not added to the watch list when running `skyux serve`.

# 1.0.0-beta.0 (2017-01-05)

- Initial release to NPM.