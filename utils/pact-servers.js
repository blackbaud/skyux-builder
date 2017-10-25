let pactServers = {};

module.exports = {

  savePactServer: (providerName, host, port) => {
    pactServers[providerName] = { host: host, port: port, fullUrl: `http://${host}:${port}` };
  },

  getPactServer: (providerName) => {
    return pactServers[providerName];
  },

  getPactPort: (providerName) => {
    return pactServers[providerName].port;
  },

  getPactHost: (providerName) => {
    return pactServers[providerName].host;
  },

  getAllPactServers: () => {
    return pactServers;
  }

}
