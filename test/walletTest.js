const DEX = artifacts.require("DEX")
const testToken = artifacts.require("testToken")
const truffleAssert = require('truffle-assertions')

contract("DEX", accounts => {
    
    it("should only be possible for owner to add tokens", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
            // should allow owner to add tokens
        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]})
        )
            // should revert if anyone other than the owner trys to add a token
        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("AAVE"), testToken.address, {from: accounts[1]})
        )
    })

    it("should handle deposits correctly", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await token.approve(dex.address, 500);
        await dex.deposit(100, web3.utils.fromUtf8("LINK"));
            // should have a balance of 100
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"));
        assert.equal(balance.toNumber(), 100);
    })
    
    it("should handle faulty withdrawls correctly", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
            // should NOT be able to withdraw 500 with a balance of only 100
        await truffleAssert.reverts( 
            dex.withdraw(500, web3.utils.fromUtf8("LINK")) 
        )
        
    })

    it("should handle valid withdrawls correctly", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
            // should be able to withdraw 100 with a balance of 100
        await truffleAssert.passes( 
            dex.withdraw(100, web3.utils.fromUtf8("LINK")) 
        )
    })

        //ETH tests
    it("should deposit the correct amount of ETH", async () => {
        let dex = await DEX.deployed()
        let token = await testToken.deployed()
        await dex.depositEth({ value: 1000 });
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"))
        assert.equal(balance.toNumber(), 1000);
    })
    
    it("should withdraw the correct amount of ETH", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.withdrawEth(1000);
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"))
        assert.equal(balance.toNumber(), 0);
    })
    
    it("should not allow over-withdrawing of ETH", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await truffleAssert.reverts(
            dex.withdrawEth(10000)
        )
    })

})