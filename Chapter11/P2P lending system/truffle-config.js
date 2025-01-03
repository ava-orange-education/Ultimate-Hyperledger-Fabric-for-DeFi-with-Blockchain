module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,            // Ganache GUI default port
      network_id: "*",       // Match any network id
    },
  },

  mocha: {
    timeout: 100000,
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {            
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"  // Default EVM version
      }
    }
  },

  db: {
    enabled: false,
  }
};
