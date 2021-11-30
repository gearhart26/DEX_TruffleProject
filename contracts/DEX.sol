// TOPIC: Project - Building a Decentralized Exchange
// Ethereum Smart Contract Programming 201 final project

pragma solidity 0.8.0;
    // allows us to return arrays
pragma experimental ABIEncoderV2;
import "./wallet.sol";



    // inheriting wallet functionality into DEX
contract DEX is Wallet{

        // custom variable to replace boolian for BUY/SELL order type
    enum Side{
        BUY,
        SELL
    }

        // struct to hold order information and type
    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

        // counter to act as order identification numbers
    uint public nextOrderId = 0;

        // mapps each token ticker to a seperate buy and sell orderbook for each supported token. Lets us seperate Buy orders from Sell orders
    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

        // return and view order book
    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
        return orderBook[ticker][uint(side)];
    }

        // limit order
    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) onlySupportedTokens(ticker) public {
            // balance requirments for buy orders
        if(side == Side.BUY){
            require(balances[msg.sender]["ETH"] >= (amount*price), "Insufficent ETH balance");
        }
            // balance requirements for sell orders
        if(side == Side.SELL){
            require(balances[msg.sender][ticker] >= amount, "Insufficent token balance");
        }
            // making reference to the array orderBook in storage 
        Order[] storage orders = orderBook[ticker][uint(side)];
            // pushing new order
        orders.push(
            Order(nextOrderId, msg.sender, side, ticker, amount, price)
        );
        
    // bubble sorting orders in array as new orders are added
            
            // these two options both do the same thing except the second one is an in line if statement that saves some space
//         if( orders.length > 0){
//              i = orders.length - 1
//         }
//         else{
//              i = 0;
//        }

            // ? in code below acts as a simple if statement 
        uint i = orders.length > 0 ? orders.length - 1 : 0;
            //highest to lowest price
        if(side == Side.BUY){
            while(i > 0){   
                if(orders[i-1].price > orders[i].price){
                 break;
                }
                Order memory orderToMove = orders[i-1];
                orders[i-1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
            //lowest to highest price
        else if(side == Side.SELL){
            while(i > 0){   
                if(orders[i-1].price < orders[i].price){
                 break;
                }
                Order memory orderToMove = orders[i-1];
                orders[i-1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }   
        nextOrderId++;
    }

        // market order.  Does not need to be saved like LimitOrder so we just have to look through orderbook to fill orders and remove Limit Orders
    function createMarketOrder(Side side, bytes32 ticker, uint amount) onlySupportedTokens(ticker) public {
        require(balances[msg.sender][ticker] >= amount, "Insufficent Balance");
        uint orderBookSide;
            // if its a BUY market order then we need to get the SELL orderbook to match orders
        if(side == Side.BUY){
            orderBookSide = 1;
        }
            // if its a SELL market order then we need to get the BUY orderbook to match orders
        else{
            orderBookSide = 0;
        }
            // get copy of order array from storage so we dont have to use memory and name it orders 
        Order[] storage orders = orderBook[ticker][uint(side)];
        
        uint totalFilled;

            // for loop to loop through orderbook to find the best orders for Market order
        for(uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
                //How much we can fill from order[i]
            
                //Update totalFilled
            
                //Execute order and shift balances between buyer/seller
                
                //Verify that the trader who put in the market order has enough ETH to cover market order being filled
        
        }
            // loop through the orderbook and remove 100% filled orders
        for(){

        }

    }
}