/// <reference path="../typings/index.d.ts"/>

import 'core-js/es6';
import 'reflect-metadata';
import 'zone.js/dist/zone';

import 'ts-helpers';

if (process.env.ENV === 'production') {
  // Production
} else {
  // Development
  Error['stackTraceLimit'] = Infinity;
  require('zone.js/dist/long-stack-trace-zone');
}
