//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FishTankContract is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint) memberShip; //maps the user address to a unit which describes if they are an investor or a business

    mapping(address => Business) public businesses; //maps the user address to more info about the business

    struct Business {
        string name; //name of the business
        uint funds_needed; //funds needed for the round
        bool funding; //boolean that establishes if the business is looking for funding or not
        uint funds_raised; //amount of funding raised
    }

    constructor() ERC721("FISHTANK", "FISH") {}

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function giveToken(address minter, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemID = _tokenIds.current();
        _mint(minter, newItemID);
        _setTokenURI(newItemID, tokenURI);
        return newItemID;
    }

    // receive() external payable{}

    //Register
    //uint 1 = investor
    //uint 2 = business
    function useralreadyExists(uint memberType) public view returns (bool) {
        //checking if the user already exists
        if (memberShip[msg.sender] == memberType) {
            return false;
        } else {
            return true;
        }
    }

    //resistering the user
    function register(uint memberType) public {
        memberShip[msg.sender] = memberType;
    }

    //function to create a record of the business
    function createBuisness(string memory name) public {
        Business memory new_business = Business(name, 0, false, 0);
        businesses[msg.sender] = new_business;
    }

    //function to change the values of the business struct to indicate start of the funding
    function startFunding(uint funds) public onlyBusiness {
        businesses[msg.sender].funding = true;
        businesses[msg.sender].funds_needed = funds;
    }

    //Ends funding for the business
    function endFunding() public onlyBusiness {
        businesses[msg.sender].funding = false;
        businesses[msg.sender].funds_needed = 0;
    }

    //the function stores the ether in the contract
    function invest(address payable business, uint256 amount) external payable {
        //require(msg.value == amount); //makes sure the right amount was sent
        businesses[business].funds_raised += amount; //keeps track of the funds raised
        businesses[business].funds_needed -= amount; //subtracts the amount from funds needed
        business.transfer(msg.value);
}

    //function lets businesses withdraw an amount specified by them
    function withdraw(uint256 amountToBeWithdrawn) public onlyBusiness {
        //funds business has raised so far
        uint256 fundsRaised = businesses[msg.sender].funds_raised;

        //makes sure that the business can't withdraw more ether than they have raised
        require(amountToBeWithdrawn <= fundsRaised);

        payable(msg.sender).transfer(amountToBeWithdrawn);
        businesses[msg.sender].funds_raised -= amountToBeWithdrawn;
    }

    //get the value of funds_raised
    function getfundsRaised() public view onlyBusiness returns (uint256) {
        return businesses[msg.sender].funds_raised;
    }

    //Modifiers

    //makes sure that only businesses can call a certain function
    modifier onlyBusiness() {
        require(
            memberShip[msg.sender] == 2,
            "Only registered Businesses can call this function"
        );
        _;
    }
}
