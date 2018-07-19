#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const cli = require('../../.e2e-tmp/node_modules/@skyux-sdk/builder/index');
const argv = minimist(process.argv.slice(2));

cli.runCommand(argv._[0], argv);
