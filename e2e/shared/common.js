/*jshint node: true*/
/*global browser, element, by*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('../../utils/merge');
const rimraf = require('rimraf');
const portfinder = require('portfinder');
const HttpServer = require('http-server');
const childProcessSpawn = require('cross-spawn');

const tmp = './.e2e-tmp/';
const cwdOpts = { cwd: tmp };

const skyuxConfigPath = path.resolve(process.cwd(), tmp, 'skyuxconfig.json');
const appExtrasPath = path.resolve(process.cwd(), tmp, 'src/app/app-extras.module.ts');
const cliPath = `../e2e/shared/cli`;

let skyuxConfigOriginal;
let appExtrasOriginal;
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

  resetConfig();

  if (appExtrasOriginal) {
    resetAppExtras();
  }
};

/**
 * Adds event listeners to serve and resolves a promise.
 */
function bindServe() {
  return new Promise((resolve, reject) => {

    // Logging "warnings" but not rejecting test
    webpackServer.stderr.on('data', data => log(data));
    webpackServer.stdout.on('data', data => {
      const dataAsString = log(data);
      if (dataAsString.indexOf('Compiled successfully.') > -1) {
        resolve(_port);
      }
      if (dataAsString.indexOf('Failed to compile.') > -1) {
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
    cp.on('error', err => reject(log(err)));
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
 */
function prepareBuild(config) {

  function serve(exitCode) {

    // Save our exitCode for testing
    _exitCode = exitCode;

    // Reset skyuxconfig.json
    resetConfig();

    // Create our server
    httpServer = HttpServer.createServer({ root: tmp, cache: 0 });

    return new Promise((resolve, reject) => {
      portfinder.getPortPromise()
        .then(port => {
          httpServer.listen(port, 'localhost', () => {
            browser.get(`http://localhost:${port}/dist/`).then(resolve, reject);
          });
        })
        .catch(err => reject(err));
    });
  }

  writeConfig(config);

  return new Promise((resolve, reject) => {
    rimrafPromise(path.join(tmp, 'dist'))
      .then(() => exec(`node`, [cliPath, `build`, `--logFormat`, `none`], cwdOpts))
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
 * Resets to the default config.
 */
function resetConfig() {
  writeConfig(skyuxConfigOriginal);
}

/**
 * Wraps the rimraf command in a promise.
 */
function rimrafPromise(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Writes the specified json to the skyuxconfig.json file
 */
function writeConfig(json) {
  if (!skyuxConfigOriginal) {
    skyuxConfigOriginal = JSON.parse(fs.readFileSync(skyuxConfigPath));
  }

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
    const args = [cliPath, `serve`, `-l`, `none`, `--logFormat`, `none`];
    webpackServer = childProcessSpawn(`node`, args, cwdOpts);
    resetConfig();
    resolve();
  });
}

/**
 * Write a file into the src/app folder -- Used for injecting files prior to build
 * that we don't want to include in the skyux-template but need to test
 */
function writeAppFile(filePath, content) {
  return new Promise((resolve, reject) => {
    const resolvedFilePath = path.join(path.resolve(tmp), 'src', 'app', filePath);
    fs.writeFile(resolvedFilePath, content, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

/**
 * Verify directory exists in src/app folder
 */
function verifyAppFolder(folderPath) {
  const resolvedFolderPath = path.join(path.resolve(tmp), 'src', 'app', folderPath);
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(resolvedFolderPath)) {
      fs.mkdirSync(resolvedFolderPath);
    }

    resolve();
  });
}

/**
 * Remove specified file or directory and its contents if it exists in src/app folder
 * -- Used for cleaning up after we've injected files for a specific test or group of tests
 */

function removeAppFolderItem(itemPath) {
  const resolvedFolderPath = path.join(path.resolve(tmp), 'src', 'app', itemPath);
  return fs.remove(resolvedFolderPath);
}

function writeAppExtras(content) {
  if (!appExtrasOriginal) {
    appExtrasOriginal = fs.readFileSync(appExtrasPath, 'utf8');
  }

  fs.writeFileSync(appExtrasPath, content, 'utf8');
}

function resetAppExtras() {
  writeAppExtras(appExtrasOriginal);
}

module.exports = {
  afterAll: afterAll,
  catchReject: catchReject,
  cliPath: cliPath,
  cwdOpts: cwdOpts,
  exec: exec,
  bindServe: bindServe,
  getExitCode: getExitCode,
  prepareBuild: prepareBuild,
  prepareServe: prepareServe,
  rimrafPromise: rimrafPromise,
  tmp: tmp,
  writeAppFile: writeAppFile,
  removeAppFolderItem: removeAppFolderItem,
  verifyAppFolder: verifyAppFolder,
  writeAppExtras: writeAppExtras
};
