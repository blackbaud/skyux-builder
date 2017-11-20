/*jshint node: true */
'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');

// totally ripped from the tslint testing utils
const createTempFile = (extension) => {
  let tmpfile;
  for (let i = 0; i < 5; i++) {
      const attempt = path.join(os.tmpdir(), `generate_component.test${Math.round(Date.now() * Math.random())}.${extension}`);
      if (tmpfile === null || !fs.existsSync(tmpfile)) {
          tmpfile = attempt;
          break;
      }
  }
  if (tmpfile === null) {
      throw new Error("Couldn't create temp file");
  }
  return tmpfile;
};

module.exports = {
  createTempFile
};