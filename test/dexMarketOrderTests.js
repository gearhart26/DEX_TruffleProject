    // MARKET Order Tests
//when creating a sell market order: the seller needs to have enough tokens for the trade
//when creating a buy market order: the buyer needs to have enough ETH for the trade
//market orders can be submitted even if order book is empty
//market orders should be filled until the order book is empty or the market order is 100% filled
//the ETH balance of the buyer should decrease with the amount of order filled
//the token balances of the accounts that posted the sell limit order should decrese with the amount of order filled
//filled limit orders should be removed from the order book

const DEX = artifacts.require("DEX")
const testToken = artifacts.require("testToken")
const truffleAssert = require('truffle-assertions')

contract("DEX", accounts => {

        //need to have enough tokens to place market sell order
    it("should reject market sell orders when token balance is insufficent", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]});
        await token.approve(dex.address, 10000);
        await truffleAssert.reverts( 
            dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 50)
        )
    })

        //needs to have enough ETH to place market BUY order
    it("should reject market BUY orders when ETH balance is insufficent", async () => {
        let dex = await DEX.deployed();
        await truffleAssert.reverts( 
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10000)
        )
    })

        //need to accept all valid orders even if book is empty
    it("should accept market BUY orders even when order book is empty", async () => {
        let dex = await DEX.deployed();
        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0);
        assert(orderbook.length == 0, "BUY side of orderbook is not empty");
        await dex.depositEth({value:10000});
        await truffleAssert.passes( 
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 100)
        )
    }) 
    
        //valid market sell order should pass
    it("should accept market sell orders when token balance is sufficent", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await token.approve(dex.address, 1000);
        await dex.deposit(1000, web3.utils.fromUtf8("LINK"));
        await truffleAssert.passes( 
            dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 100)
        )
    })

        //valid market buy orders should pass
    it("should accept market BUY orders if ETH balance is sufficent", async () => {
        let dex = await DEX.deployed();
        await truffleAssert.passes( 
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 100)
        )
    })

        //market orders should be filled until the order book is empty or the market order is 100% filled
    it("should fill orders until market order is 100% filled", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await token.approve(dex.address, 2000);
        //await dex.deposit(400, web3.utils.fromUtf8("LINK"));
        //await dex.depositEth({value:200});
        
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 50, 2);
        await truffleAssert.passes( 
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 200)
        )
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 100, 1);
        await truffleAssert.passes( 
            dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 300)
        )
        // somehow check to see how much of order was filled for truffle assert
    })
})



//new instance of the contract so we can work with a fresh orderbook and 0 balances
contract("DEX", accounts => {

        //the ETH balance of the buyer should decrease with the amount of order filled
    it("ETH balance should decrese with amount of BUY order filled", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]});
        await token.approve(dex.address, 1000);
        await dex.deposit(500, web3.utils.fromUtf8("LINK"));
        await dex.depositEth({value:500});
        
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"));
        assert.equal(balance.toNumber(), 100);
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 100, 1);
        
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 50);
        assert.equal(balance.toNumber(), 50);
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 50);
        assert.equal(balance.toNumber(), 0);
    })
})



//new instance of the contract so we can work with a fresh orderbook and 0 balances
contract("DEX", accounts => {

        //the token balance of the seller should decrease with the amount of order filled
    it("token balance should decrese with amount with amount of SELL order filled", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]});
        await token.approve(dex.address, 1000);
        await dex.depositEth({value:500});
        await dex.deposit(500, web3.utils.fromUtf8("LINK"));
        
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 500, 1);
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"));
        assert.equal(balance.toNumber(), 500);
        
        await dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 300);
        assert.equal(balance.toNumber(), 200);
        
        await dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 150);
        assert.equal(balance.toNumber(), 50);
        
        await dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 50);
        assert.equal(balance.toNumber(), 0);
    })
})



//new instance of the contract so we can work with a fresh orderbook and 0 balances
contract("DEX", accounts => {

    //filled limit orders should be removed from the order book
    it("should remove limit orders as they are filled", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]});
        await token.approve(dex.address, 1000);
        await dex.deposit(30, web3.utils.fromUtf8("LINK"));
        await dex.depositEth({value:30});
        
        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1);

        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1);
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 2);
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 3);
        assert.equal(orderbook.length, 3);
        
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10);
        assert.equal(orderbook.length, 2);
        
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10);
        assert.equal(orderbook.length, 1);

        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10);
        assert.equal(orderbook.length, 0);
    })
})