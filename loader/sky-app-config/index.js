/*jshint node: true*/
'use strict';

module.exports = function (source) {

  // Legacy code called this skyPagesConfig, so we'll leave it for now.
  const skyPagesConfig = this.options.skyPagesConfig;
  const runtime = JSON.stringify(skyPagesConfig.runtime);
  const skyux = JSON.stringify(skyPagesConfig.skyux);

  const runtimeDeclaration = `public static runtime: RuntimeConfig;`;
  const skyuxDeclaration = `public static skyux: SkyuxConfig;`;

  source = source.replace(runtimeDeclaration, `${runtimeDeclaration.slice(0, -1)} = ${runtime};`);
  source = source.replace(skyuxDeclaration, `${skyuxDeclaration.slice(0, -1)} = ${skyux};`);

  return source;
};
