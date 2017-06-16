/*jshint node: true*/
'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');

function generateImport(component) {
  const definition =
`// BEGIN IMPORTED COMPONENT: ${component.componentName}
import { ${component.componentName} } from '${component.importPath}';
// END IMPORTED COMPONENT: ${component.componentName}`;
  return definition;
}

function extractComponentName(file) {
  const content = fs.readFileSync(file, { encoding: 'utf8' });
  const matches = content.split(/@Component\s*\([\s\S]+?\)\s*export\s+class\s+(\w+)/g);

  switch (matches.length) {
    case 3:
      return matches[1];

    case 1:
    case 2:
      throw new Error(`Unable to locate an exported class in ${file}`);

    default:
      throw new Error(`As a best practice, please export one component per file in ${file}`);
  }
}

function generateImports(components) {
  return components
    .map(component => generateImport(component))
    .join('\n\n');
}

function generateNames(components) {
  return components.map(component => component.componentName);
}

function generateComponents(skyAppConfig) {
  // Prepend the alias and remove the file extension,
  // since the file extension causes a TypeScript error.
  return glob
    .sync(path.join(skyAppConfig.runtime.srcPath, skyAppConfig.runtime.componentsPattern), {
      ignore: [
        path.join(skyAppConfig.runtime.srcPath, skyAppConfig.runtime.componentsIgnorePattern)
      ]
    })
    .map(file => ({
      importPath: skyAppConfig.runtime.spaPathAlias + '/' + file.replace(/\.[^\.]+$/, ''),
      componentName: extractComponentName(file)
    }));
}

function getComponents(skyAppConfig) {
  const components = skyAppConfig.runtime.components || generateComponents(skyAppConfig);
  return {
    imports: generateImports(components),
    names: generateNames(components)
  };
}

module.exports = {
  getComponents: getComponents
};
