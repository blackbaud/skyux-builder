/*jshint jasmine: true, node: true */
'use strict';

describe('pact-servers', () => {

  it('should save and get pact servers', () => {

    const pactServers = require('../utils/pact-servers');

    pactServers.savePactServer('test-provider', 'localhost', '1234');

    expect(pactServers.getPactServer('test-provider').fullUrl).toEqual('http://localhost:1234');
    expect(pactServers.getPactServer('test-provider').host).toEqual('localhost');
    expect(pactServers.getPactServer('test-provider').port).toEqual('1234');

  });

  it('should save and get pact proxy server', () => {

    const pactServers = require('../utils/pact-servers');

    pactServers.savePactProxyServer('http://localhost:8000');

    expect(pactServers.getPactProxyServer()).toEqual('http://localhost:8000');

  });

});
