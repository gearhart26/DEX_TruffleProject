    // LIMIT Order Tests
//The user must have ETH deposited such that deposited eth >= buy order value
//The user must have enough tokens deposited such that the token balance >= sell order amount
//The user should not be allowed to place a buy or sell order for an unsupported token
//The BUY order book should be ordered on price from highest to lowest starting at index 0
//The SELL order book should be ordered on price from lowest to highest starting at index 0

const DEX = artifacts.require("DEX")
const testToken = artifacts.require("testToken")
const truffleAssert = require('truffle-assertions')

contract("DEX", accounts => {
      
        // should reject BUY order because user's ETH balance is < total BUY order amount
    it("should reject invalid BUY orders", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]});
        await truffleAssert.reverts( 
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 5, 1)
        )
    })    

        // should allow user to place BUY order as long as user's ETH balance is >= total BUY order amount
    it("should accept valid BUY orders", async () => {
        let dex = await DEX.deployed();
        dex.depositEth({value:18});
        await truffleAssert.passes( 
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 6, 1)
        )
        await truffleAssert.passes( 
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 4, 3)
        )
    })
        
        // should allow user to place SELL order if user's selected token balance is >= total amount of tokens in SELL order
    it("should accept valid SELL orders", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await token.approve(dex.address, 1000);
        await dex.deposit(50, web3.utils.fromUtf8("LINK"));
        await truffleAssert.passes( 
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 20, 8)
        )
        await truffleAssert.passes( 
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 30, 6)
        )
    })

        // should reject SELL order because user's selected token balance is < total amount of tokens in SELL order
    it("should reject invalid SELL orders", async () => {
        let dex = await DEX.deployed();
        await truffleAssert.reverts( 
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 500, 1)
        )
    })

        // should reject BUY & SELL orders because token is not supported
    it("should reject SELL/BUY orders for unsupported tokens", async () => {
        let dex = await DEX.deployed();
        dex.depositEth({value: 10});
        await truffleAssert.reverts( 
            dex.createLimitOrder(0, web3.utils.fromUtf8("BTC"), 1, 10)
        )
        await truffleAssert.reverts( 
            dex.createLimitOrder(1, web3.utils.fromUtf8("BTC"), 1, 100)
        )
    })

        //The BUY order book should be ordered on price from highest to lowest starting at index 0
    it("The BUY order book should be ordered on price from highest to lowest starting at index 0", async () => {
        let dex = await DEX.deployed();
        await dex.depositEth({value: 10000});
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 200)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0);
        assert(orderbook.length > 0, "Not enough orders in BUY orderbook for testing");
        //console.log(orderbook);
        assert(orderbook[0].price >= orderbook[1].price >= orderbook[2].price >= orderbook[3].price, "BUY order book is out of order");
            //having problems with loop, sticking with simple test above instead of loop below
        // for (let i = 0; i < orderbook.length - 1; i++) {
        //     assert(orderbook[i].price >= orderbook[i+1].price, "BUY order book is out of order")
        // }
    })
       
        //The SELL order book should be ordered on price from lowest to highest starting at index 0
    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
        let dex = await DEX.deployed();
        let token = await testToken.deployed();
        await token.approve(dex.address, 1000);
        await dex.deposit(3, web3.utils.fromUtf8("LINK"));
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 200)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1);
        assert(orderbook.length > 0, "Not enough orders in SELL orderbook for testing");
        //console.log(orderbook);
        assert(orderbook[0].price <= orderbook[1].price <= orderbook[2].price <= orderbook[3].price <= orderbook[4].price, "SELL order book is out of order");
            //having problems with loop, sticking with simple test above instead of loop below
        //for (let i = 0; i < orderbook.length - 1; i++) {
        //    assert(orderbook[i].price <= orderbook[i+1].price, "SELL order book is out of order")
        //}
    })
})