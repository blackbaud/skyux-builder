/*jshint node: true*/
'use strict';

const fs = require('fs');
const glob = require('glob');

function generateImport(component) {
  return `
// BEGIN IMPORTED COMPONENT: ${component.componentName}
import { ${component.componentName} } from '${component.importPath}';
// END IMPORTED COMPONENT: ${component.componentName}
`;
}

function extractComponentName(file) {
  const content = fs.readFileSync(file, { encoding: 'utf8' });
  const groups = /(class )([^\s]+)/gi.exec(content);

  if (!groups || groups.length <= 2) {
    throw new Error(`Unable to locate an exported class in ${file}`);
  }

  return groups[2];
}

function generateImports(components) {
  return components
    .map(component => generateImport(component))
    .join('\n\n');
}

function generateNames(components) {
  return components.map(component => component.componentName);
}

function generateComponents(skyPagesConfig) {
  // Prepend the alias and remove the file extension,
  // since the file extension causes a TypeScript error.
  return glob
    .sync(skyPagesConfig.componentsPattern)
    .map(file => ({
      importPath: skyPagesConfig.spaPathAlias + file.replace(/\.[^\.]+$/, ''),
      componentName: extractComponentName(file)
    }));
}

function getComponents(skyPagesConfig) {
  const components = skyPagesConfig.components || generateComponents(skyPagesConfig);
  return {
    imports: generateImports(components),
    names: generateNames(components)
  };
}

module.exports = {
  getComponents: getComponents
};
