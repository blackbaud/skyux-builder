/*jshint node: true*/
/*global browser, element, by*/
'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('winston');
const HttpServer = require('http-server');
const childProcessSpawn = require('child_process').spawn;

const tmp = './.e2e-tmp/';
const opts = { cwd: tmp };

const skyuxConfigPath = path.resolve(process.cwd(), tmp, 'skyuxconfig.json');
const skyuxConfigOriginal = JSON.parse(fs.readFileSync(skyuxConfigPath));
const PORT = 31338;

let server;

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

  // Leaving this while contiuing to debug
  // exec('echo', ['START']).then(done, catchReject);
}

/**
 * Called on beforeAll build step.
 */
function beforeAllBuild(done) {
  beforeAll(() => {
    server = HttpServer.createServer({ root: tmp });
    server.listen(PORT, 'localhost', done);
  });
}

/**
 * Called on afterAll step.
 */
function afterAll(done) {
  exec(`rm`, [`-rf`, `${tmp}`]).then(done, catchReject);

  // Leaving this while continuing to debug
  // exec('echo', ['FINISH']).then(done, catchReject);
}

/**
 * Calls on afterAll build step.
 */
function afterAllBuild(done) {
  afterAll(() => {
    server.close();
    done();
  });
}

/**
 * Spawns `skyux serve` and resolves once webpack is ready.
 */
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

/**
 * Writes the given object to skyuxconfig.json
 */
function writeConfig(json) {
  fs.writeFileSync(skyuxConfigPath, JSON.stringify(json), 'utf8');
}

/**
 * Run build given the following skyuxconfig object.
 * Spawns http-server and resolves when ready.
 */
function serveBuild(config) {
  return new Promise((resolve, reject) => {

    // Prepare skyuxconfig.json
    writeConfig(config);

    exec(`node`, [`../e2e/_cli`, `build`], opts)
      .then(() => {
        writeConfig(skyuxConfigOriginal);
        browser.get(`http://localhost:${PORT}/dist/`).then(resolve, reject);
      }, reject);
  });
}

module.exports = {
  afterAll: afterAll,
  afterAllBuild: afterAllBuild,
  beforeAll: beforeAll,
  beforeAllBuild: beforeAllBuild,
  bufferToString,
  exec: exec,
  catchReject: catchReject,
  opts: opts,
  spawn: spawn,
  serveBuild: serveBuild,
  serveIsReady: serveIsReady,
  tmp: tmp
};
