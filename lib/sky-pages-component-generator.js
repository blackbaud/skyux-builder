/*jshint node: true*/
'use strict';

var helpers = require('./helpers');

/**
 * Given an entry, return a component definition.
 * @name getComponentDefinition
 * @param {SkyPagesEntry} entry
 * @returns {string} componentDefinition
 */
function getComponentDefinition(skyPagesConfig, component) {
  const name = getComponentName(component);
  const definition =
`
// BEGIN IMPORTED COMPONENT: ${name}
import { ${name} } from '${helpers.importPath(component.pathWeb, skyPagesConfig.spaPathAlias)}';
// END IMPORTED COMPONENT: ${name}
`;
  return definition;
}

/**
 * Given an entry, reads it and extracts any component names.
 * @name getSiblingComponentName
 * @param {SkyPagesFile} file
 * @returns {string} componentName
 */
function getComponentName(file) {
  const groups = /(class )([^\s]+)/gi.exec(file.get());
  if (groups && groups.length > 2) {
    return groups[2];
  }
}

/**
 * Given the skyPagesConfig, returns an array of component names.
 * @name getComponentNames
 * @param {Object} skyPagesConfig
 * @returns {Array} componentNames
 */
function getComponentNames(skyPagesConfig) {
  return skyPagesConfig.components.map(getComponentName);
}

/**
 * Given the skyPagesConfig, returns the components.
 * @name getComponents
 * @param {Object} skyPagesConfig
 * @returns {String} components
 */
function getComponents(skyPagesConfig) {
  return skyPagesConfig.components
    .map(component => getComponentDefinition(skyPagesConfig, component))
    .join('\n\n');
}

module.exports = {
  getComponents: getComponents,
  getComponentNames: getComponentNames
};
