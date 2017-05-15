#!/usr/bin/env node
'use strict';

// Runs the equivalent of `skyux test`, but passes in the `dev`
// This causes ./config/karma/dev.karma.conf.js to be loaded
// This tests the `runtime/` folder.
require('../cli/test')('dev-runtime');

// This tests the `src/app/` folder.
require('../cli/test')('dev-src-app');
