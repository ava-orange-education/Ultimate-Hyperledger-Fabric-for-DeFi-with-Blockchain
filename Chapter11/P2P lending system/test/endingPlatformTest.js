const LendingPlatform = artifacts.require("P2PLending");
const ERC20Mock = artifacts.require("../contracts/ERC20Mock.sol"); // Mock ERC20 token for testing
const { expectRevert } = require("@openzeppelin/test-helpers");
const web3 = require("web3");

contract("LendingPlatform", (accounts) => {
  const [depositor, borrower] = accounts;

  let token;
  let instance;

  before(async () => {
    // Deploy mock ERC20 token
    token = await ERC20Mock.new(
      "Mock Token",
      "MKT",
      depositor,
      web3.utils.toWei("100", "ether")
    );

    // Deploy LendingPlatform contract with a mock price oracle address
    instance = await LendingPlatform.new(
      "0x0577c7d2710286D7B61617C12602aFEEfaf4FeE2"
    ); // Replace with actual mock price oracle address
  });

  it("should allow a user to deposit assets", async () => {
    // Approve and deposit 10 ERC20 tokens
    await token.approve(instance.address, web3.utils.toWei("10", "ether"), {
      from: depositor,
    });
    await instance.depositAssets(
      web3.utils.toWei("10", "ether"),
      token.address,
      { from: depositor }
    );

    // Check the deposit balance
    const balance = await instance.lenderBalances(depositor, token.address);
    assert.equal(
      balance.toString(),
      web3.utils.toWei("10", "ether"),
      "Deposit balance should be 10 ERC20 tokens"
    );
  });

  it("should allow a user to request a loan", async () => {
    const collateralAmount = web3.utils.toWei("1", "ether"); // 1 Ether as collateral

    // Request a loan of 5 ERC20 tokens
    await instance.requestLoan(
      web3.utils.toWei("5", "ether"),
      token.address,
      30,
      { from: borrower, value: collateralAmount }
    );

    // Check the loan request details
    const loanRequest = await instance.loanRequests(0); // Assuming it's the first loan request
    assert.equal(
      loanRequest.amount.toString(),
      web3.utils.toWei("5", "ether"),
      "Loan amount should be 5 ERC20 tokens"
    );
    assert.equal(
      loanRequest.collateral.toString(),
      collateralAmount,
      "Collateral should be 1 Ether"
    );
  });


});
