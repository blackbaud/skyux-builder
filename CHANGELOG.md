# 1.0.0-beta.4 (2017-01-11)

- Removed support for `--noOpen` flag.  Instead added `--open` flag with `none`, `local`, or `host` (default).  Ex: `--open=local`

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