/*jshint node: true*/
/*global browser, element, by*/
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const portfinder = require('portfinder');
const HttpServer = require('http-server');
const childProcessSpawn = require('child_process').spawn;

const tmp = './.e2e-tmp/';
const cwdOpts = { cwd: tmp };

const skyuxConfigPath = path.resolve(process.cwd(), tmp, 'skyuxconfig.json');
const cliPath = `../e2e/shared/cli`;

let skyuxConfigOriginal;
let webpackServer;
let httpServer;
let _exitCode;
let _port;

/**
 * Closes the http-server if it's running.
 * Kills the serve process if it's running.
 */
function afterAll() {
  if (httpServer) {
    httpServer.close();
  }

  if (webpackServer) {
    webpackServer.kill();
  }

  writeConfig(skyuxConfigOriginal);
};

/**
 * Adds event listeners to serve and resolves a promise.
 */
function bindServe() {
  return new Promise((resolve, reject) => {
    webpackServer.stderr.on('data', reject);
    webpackServer.stdout.on('data', (data) => {
      log(data);
      if (data.toString('utf8').indexOf('webpack: Compiled successfully.') > -1) {
        resolve(_port);
      }
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
 * Spawns a child_process and returns a promise.
 * @name exec
 */
function exec(cmd, args, opts) {
  console.log(`Running command: ${cmd} ${args.join(' ')}`);
  const cp = childProcessSpawn(cmd, args, opts);

  cp.stdout.on('data', data => log(data));
  cp.stderr.on('data', data => log(data));

  return new Promise((resolve, reject) => {
    cp.on('error', err => reject(err));
    cp.on('exit', code => resolve(code));
  });
}

/**
 * Returns the last exit code.
 */
function getExitCode() {
  return _exitCode;
}

/**
 * Logs a buffer
 */
function log(buffer) {
  console.log(buffer.toString('utf8'));
}

/**
 * Run build given the following skyuxconfig object.
 * Spawns http-server and resolves when ready.
 */
function prepareBuild(config) {

  function serve(exitCode) {

    // Save our exitCode for testing
    _exitCode = exitCode;

    // Reset skyuxconfig.json
    writeConfig(skyuxConfigOriginal);

    // Create our server
    httpServer = HttpServer.createServer({ root: tmp });

    return new Promise((resolve, reject) => {
      portfinder.getPortPromise().then(port => {
        httpServer.listen(port, 'localhost', () => {
          browser.get(`http://localhost:${port}/dist/`).then(resolve, reject);
        });
      });
    });
  }

  skyuxConfigOriginal = JSON.parse(fs.readFileSync(skyuxConfigPath));
  writeConfig(config);

  return new Promise((resolve, reject) => {
    exec(`rm`, [`-rf`, `${tmp}/dist`])
      .then(() => exec(`node`, [cliPath, `build`], cwdOpts), reject)
      .then(serve, reject)
      .then(resolve, reject);
  });
}

/**
 * Spawns `skyux serve` and resolves once webpack is ready.
 */
function prepareServe() {

  if (webpackServer) {
    return bindServe();
  } else {
    return portfinder.getPortPromise().then(port => {
      _port = port;
      const skyuxConfigWithPort = merge(true, skyuxConfigOriginal, {
        app: {
          port: port
        }
      });
      writeConfig(skyuxConfigWithPort);
      webpackServer = childProcessSpawn(`node`, [cliPath, `serve`, `-l`, `none`], cwdOpts);
    }).then(bindServe);
  }
}

/**
 * Saves the default skyuxconfig.json
 */
function preserveConfig() {
  return new Promise(resolve => {
    skyuxConfigOriginal = JSON.parse(fs.readFileSync(skyuxConfigPath));
    resolve();
  });
}

/**
 * Writes the specified json to the skyuxconfig.json file
 */
function writeConfig(json) {
  fs.writeFileSync(skyuxConfigPath, JSON.stringify(json), 'utf8');
}

module.exports = {
  afterAll: afterAll,
  catchReject: catchReject,
  cwdOpts: cwdOpts,
  exec: exec,
  bindServe: bindServe,
  getExitCode: getExitCode,
  prepareBuild: prepareBuild,
  prepareServe: prepareServe,
  preserveConfig: preserveConfig,
  tmp: tmp
};
