// test/my_contract_test.js
const MyContract = artifacts.require("MyContract");

contract("MyContract", (accounts) => {
    let myContractInstance;

    before(async () => {
        myContractInstance = await MyContract.deployed();
    });

    it("should set a new message", async () => {
        await myContractInstance.setMessage("New message", { from: accounts[0] });
        const newMessage = await myContractInstance.message();
        assert.equal(newMessage, "New message", "Message was not updated");
    });
});
