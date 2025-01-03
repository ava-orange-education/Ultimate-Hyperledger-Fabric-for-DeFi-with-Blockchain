module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    geth:{
      host:"127.0.0.1",
      port:"8545",
      network_id:"12345",
      // from: "0xc8F7af3980B662C8c119E4d2265CDE3335bbb9B9", // The address you are deploying from
      // gas: 4500000,      // Gas limit
      // gasPrice: 10000000000 // 10 Gwei
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};
