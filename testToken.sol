// creating an ERC token to be launched alongside our wallet so we have some ERC20 tokens to test our wallet with.
// Ethereum Smart Contract Programming 201 final project


pragma solidity 0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract testToken is ERC20 {

        // constructor to launch token contract and mint contract creator 1000 test Link 
    constructor() ERC20("Chainlink", "LINK") public {
        _mint(msg.sender, 1000);
    }
}
