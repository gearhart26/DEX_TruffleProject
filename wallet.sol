// TOPIC: Project - Building a Decentralized Exchange  -->  VIDEO: Building wallet
// Ethereum Smart Contract Programming 201 final project


pragma solidity 0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


    // Wallet contract to be inherited by our DEX contract
contract Wallet is Ownable {

        // struct to hold information for each supported token
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }
        // mapping to quickly find specific token
    mapping(bytes32 => Token) public tokenMapping;
        // list to hold Token structs for loops and inumeration
    bytes32[] public tokenList;

        // mapping token balances to token ticker to addresses to keep track of all token balances for each address
        // using bytes32 instead of string to make comparisons possible since strings cannot be compared without first being converted
    mapping( address => mapping(bytes32 => uint256)) public balances;

    modifier onlySupportedTokens(bytes32 ticker){
        require(tokenMapping[ticker].tokenAddress != address(0), "Token not supported");
        _;
    }

        // adding DEX support for a token by adding its info to tokenList
    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }

        // deposit for ERC20
    function deposit(uint amount, bytes32 ticker) onlySupportedTokens(ticker) external {
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][ticker] += amount; 
    }

        //deposit for ETH
    function depositEth() payable external {
        balances[msg.sender][bytes32("ETH")] += msg.value;
    }
    
        //withdraw for ETH
    function withdrawEth(uint amount) external {
        require(balances[msg.sender][bytes32("ETH")] >= amount,'Insuffient balance'); 
        balances[msg.sender][bytes32("ETH")] -= amount;
        msg.sender.call{value:amount}("");
    }

        // withdraw -> checks, effects, interactions
    function withdraw(uint amount, bytes32 ticker) onlySupportedTokens(ticker) external {
            // check balance
        require(balances[msg.sender][ticker] >= amount, "Insufficent balance.");
            // effects
        balances[msg.sender][ticker] -= amount;
            // interactions
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }

}