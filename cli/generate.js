/*jshint node: true*/
'use strict';

const generateModal = require('../lib/modal_generator');
const generateComponent = require('../lib/generate-component');

function generate(argv) {
  try {
    let type = argv._[1];
    let name = argv._[2];

    switch (type) {
      case 'component':
      case 'c':
        generateComponent.genFiles(name);
        break;
      case 'modal':
        generateModal.genFiles(name);
        break;
    }
  } catch (err) {
    process.exit(1);
  }
}

module.exports = generate;
