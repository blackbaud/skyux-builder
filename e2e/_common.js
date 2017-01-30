/*jshint node: true*/
'use strict';

const logger = require('winston');
const childProcessSpawn = require('child_process').spawn;

const tmp = './.e2e-tmp/';
const opts = { cwd: tmp };

/**
 * Creates a child_process.
 * @name spawn
 */
function spawn(cmd, args, opts) {
  return childProcessSpawn(cmd, args, opts);
}

/**
 * Spawns a child_process and returns a promise.
 * @name exec
 */
function exec(cmd, args, opts) {
  const cp = spawn(cmd, args, opts);

  cp.stdout.on('data', bufferToString);
  cp.stderr.on('data', bufferToString);

  return new Promise((resolve, reject) => {
    cp.on('error', (err) => {
      reject(err);
    });
    cp.on('exit', (code) => {
      resolve(code);
    });
  });
}

/**
 * Generic handler for rejected promises.
 * @name catchReject
 */
function catchReject(err) {
  throw new Error(err);
}

/**
 * Converts a buffer to utf8 string.
 * @name bufferToString
 * @param {Buffer} data
 */
function bufferToString(data) {
  logger.info(data.toString('utf8'));
}

/**
 * Called on beforeAll step.
 * @name beforeAll
 */
function beforeAll(done) {
  const url = 'https://github.com/blackbaud/skyux-template';
  exec(`rm`, [`-rf`, `${tmp}`])
    .then(() => exec(`git`, [`clone`, `${url}`, `${tmp}`]), catchReject)
    .then(() => exec(`npm`, [`i`], opts), catchReject)
    .then(() => exec(`npm`, [`i`, `../`], opts), catchReject)
    .then(done, catchReject);
}

/**
 * Called on afterAll step.
 */
function afterAll(done) {
  exec(`rm`, [`-rf`, `${tmp}`]).then(done, catchReject);
}

function serveIsReady(serve) {
  serve = serve || spawn(`node`, [`../e2e/_cli`, `serve`, `-l`, `none`], opts);
  return new Promise((resolve, reject) => {
    serve.stderr.on('data', reject);
    serve.stdout.on('data', (data) => {
      if (data.toString('utf8').indexOf('webpack: bundle is now VALID') > -1) {
        resolve(serve);
      }
    });
  });
}

module.exports = {
  afterAll: afterAll,
  beforeAll: beforeAll,
  bufferToString,
  exec: exec,
  catchReject: catchReject,
  opts: opts,
  spawn: spawn,
  serveIsReady: serveIsReady,
  tmp: tmp
};
