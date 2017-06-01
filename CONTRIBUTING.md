# Contributing to SKY UX Builder

- `npm run coverage` Runs our unit spec tests, saving coverage to the `coverage/` directory.  This contains the following sub tasks:
  - `npm run coverage:builder` which tests the nodejs/builder code and places coverage in `coverage/builder`.
  - `npm run coverage:runtime` which tests the `runtime` components and places coverage in `coverage/runtime`.
  - `npm run coverage:src-app` which tests the `src/app` components and places coverage in `coverage/src-app`.
- `npm run jscs`  Runs this code against the jscs linter.
- `npm run jshint` Runs this code against the jshint linter.
- `npm run lint` Runs the `jscs` and `jshint` commands.
- `npm run test` Runs ALL test commands combined.