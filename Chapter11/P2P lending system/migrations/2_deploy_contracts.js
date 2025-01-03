const P2PLending = artifacts.require("P2PLending");

module.exports = function(deployer) {
  const priceOracleAddress = "0x0577c7d2710286D7B61617C12602aFEEfaf4FeE2";
  deployer.deploy(P2PLending, priceOracleAddress);
};