
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
}

/**
 * Saves a reference to the original config
 */
function beforeAll() {
  skyuxConfigOriginal = JSON.parse(fs.readFileSync(skyuxConfigPath));
}

/**
 * Adds event listeners to serve and resolves a promise.
 */
function bindServe() {
  return new Promise((resolve, reject) => {

    // Logging "warnings" but not rejecting test
    webpackServer.stderr.on('data', data => log(data));
    webpackServer.stdout.on('data', data => {
      const dataAsString = log(data);
      if (dataAsString.indexOf('webpack: Compiled successfully.') > -1) {
        resolve(_port);
      }
      if (dataAsString.indexOf('webpack: Failed to compile.') > -1) {
        reject(dataAsString);
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
 * Logs a buffer.
 * Returns the buffer as a string.
 */
function log(buffer) {
  const bufferAsString = buffer.toString('utf8');
  console.log(bufferAsString);
  return bufferAsString;
}

/**
 * Run build given the following skyuxconfig object.
 * Spawns http-server and resolves when ready.
 * Using executeScript was the only way I found to do a "hard refresh".
 */
function prepareBuild(config) {
  function serve(exitCode) {

    _exitCode = exitCode;
    httpServer = HttpServer.createServer({ root: tmp });

    return new Promise((resolve, reject) => {
      portfinder.getPortPromise().then(port => {
        httpServer.listen(port, 'localhost', () => {
          browser.driver.get(`http://localhost:${port}/dist/`, 1000)
            .then(() => browser.executeScript('document.location.reload();'))
            .then(resolve)
            .catch(err => reject(err));
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    writeConfig(config);
    exec(`rm`, [`-rf`, `${tmp}/dist`])
      .then(() => exec(`node`, [cliPath, `build`], cwdOpts))
      .then(serve)
      .then(resolve)
      .catch(err => reject(err));
  });
}

/**
 * Spawns `skyux serve` and resolves once webpack is ready.
 */
function prepareServe() {

  if (webpackServer) {
    return bindServe();
  } else {
    return new Promise((resolve, reject) => {
      portfinder.getPortPromise()
        .then(writeConfigServe)
        .then(bindServe)
        .then(resolve)
        .catch(err => reject(err));
    });
  }
}

/**
 * Writes the specified json to the skyuxconfig.json file
 * Saves the original if it's the first time we're overwriting the config.
 */
function writeConfig(json) {
  fs.writeFileSync(skyuxConfigPath, JSON.stringify(json), 'utf8');
}

/**
 * Write the config needed for serve
 */
function writeConfigServe(port) {
  return new Promise(resolve => {
    _port = port;
    const skyuxConfigWithPort = merge(true, skyuxConfigOriginal, {
      app: {
        port: port
      }
    });

    writeConfig(skyuxConfigWithPort);
    webpackServer = childProcessSpawn(`node`, [cliPath, `serve`, `-l`, `none`], cwdOpts);
    resolve();
  });
}

module.exports = {
  afterAll: afterAll,
  beforeAll: beforeAll,
  catchReject: catchReject,
  cwdOpts: cwdOpts,
  exec: exec,
  bindServe: bindServe,
  getExitCode: getExitCode,
  prepareBuild: prepareBuild,
  prepareServe: prepareServe,
  tmp: tmp
};
