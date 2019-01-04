#!/usr/bin/env node
'use strict';

// Runs the equivalent of `skyux test`, but passes in the third argument as the command.
require('../cli/test')(process.argv[2]);
