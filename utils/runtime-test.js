#!/usr/bin/env node
'use strict';

// Runs the equivalent of `skyux test`, but passes in the `dev`
// This causes ./config/karma/dev.karma.conf.js to be loaded
require('../cli/test')('dev');
