//import Web3 as web3 from "./index.js";
// const Web3 = require("web3");
// const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

App = {
  web3: null,
  contracts: {},
  address: "0x5F6F25c907D60774843dfa369a1Ef53E2D0E4a53",
  handler: null,
  network_id: 5777,
  url: "http://127.0.0.1:7545",
  value: 1000000000000000000,
  index: 0,
  margin: 10,
  left: 15,
  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    //Is there is an injected web3 instance?
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }

    ethereum.enable();

    //App.populateAddress();
    return App.initContract();
  },

  initContract: function () {
    web3 = new Web3(new Web3.providers.HttpProvider(App.url));
    App.web3 = web3;
    console.log(App.web3);
    App.contracts.FishTankContract = new App.web3.eth.Contract(
      App.abi,
      App.address,
      {}
    );
    return App.bindEvents();
  },
  bindEvents: function () {
    //for investors
    $(document).on("click", "#invest", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.investButtonPressed(jQuery("#nameVar").val());
    });

    //when user click on 'Raise Funds'
    $(document).on("click", "#business", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.businessButtonPressed(jQuery("#nameVar").val());
    });

    //When 'Let's go' button is pressed
    $(document).on("click", "#startFunding", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handlestartFunding(
        jQuery("#fundAmt").val(),
        jQuery("#businessB").val()
      );
    });

    //get the value of how much the business has raised so far
    $(document).on("click", "#fundsraisedButton", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handlegetfundsRaised();
    });

    //withdraw handling for the business
    $(document).on("click", "#withdraw", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handleWithdraw(jQuery("#fundsraisedAmt").val());
    });

    //ending the fund for the business
    $(document).on("click", "#endFunding", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handleendFunding();
    });

     //When 'Invest' button is pressed
     $(document).on("click", "#startInvesting", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handlestartInvesting(
        jQuery("#investBusiness").val(),
        jQuery("#investAmt").val(),
      );
    });
  },

  setAddressId(){
    console.log(App.handler)
  },

  populateAddress: async function () {
    App.handler = App.web3.givenProvider.selectedAddress;
    return await ethereum.request({ method: "eth_requestAccounts" });
  },
  investButtonPressed: function (userName) {
    var option = { from: App.handler };
    App.contracts.FishTankContract.methods
      .register(1)
      .send(option)
      .on("receipt", (receipt) => {
        console.log(receipt);
        if (receipt.status) {
          window.location.href = "/InvestorPage";
        }
      })
      .on("error", (err) => {
        toastr.error("Please try that again");
      });
  },
  businessButtonPressed: function (businessName) {
    var option = { from: App.handler };

    //checking if the user exists
    App.contracts.FishTankContract.methods
      .useralreadyExists(2)
      .call()
      .then((r) => {
        console.log(`${r}`);
        if (r) {
          //pushing changes
          App.contracts.FishTankContract.methods
            .register(2)
            .send(option)
            .on("receipt", (receipt) => {
              if (receipt.status) {
                console.log("in register");
                window.location.href = "/BusinessPage";
              }
            })
            .on("error", (err) => {
              toastr.error("Please try that again");
            });
        } else {
          window.location.href = "/BusinessLandingPage";
        }
      });
  },

  handlestartFunding: function (fundAmt, nameofBusiness) {
    var option = { from: App.handler };

    //calling startFunding in the contract
    App.contracts.FishTankContract.methods
      .startFunding(fundAmt)
      .send(option)
      .on("receipt", (receipt) => {
        if (receipt.status) {
          console.log("here");
        }
      })
      .on("error", (err) => {
        toastr.error("Please try that again");
      });

    //creating the business identity by passing in their name to the contract
    App.contracts.FishTankContract.methods
      .createBuisness(nameofBusiness)
      .send(option)
      .on("receipt", (receipt) => {
        console.log(receipt);
        if (receipt.status) {
          //navigate to the business landing page
          toastr.success(`Welcome ${nameofBusiness}!`);
          setTimeout(() => {
            window.location.href = "/BusinessLandingPage";
          }, 1500);
        }
      })
      .on("error", (err) => {
        toastr.error("Please try that again");
      });
  },

  handlestartInvesting: function (addr, investAmt) {
    var option = { 
      from: App.handler ,
      value: web3.utils.toWei(investAmt, "ether"),
    };

    if(addr == null || investAmt == 0){
      alert("Cannot Invest 0 amount")
      return false;
    }

    console.log(App.handler)
    console.log(addr)
    console.log(investAmt)

    //calling invest in the contract
    App.contracts.FishTankContract.methods
    .invest(addr, investAmt)
    .send(option)
    .on("receipt", (receipt) => {
      if (receipt.status) {
        console.log(receipt);
      }
    })
    .on("error", (err) => {
      console.log(err)
      //toastr.error("Please try that again");
    });
  },

  handlegetfundsRaised: function () {
    //calling startFunding in the contract
    App.contracts.FishTankContract.methods
      .getfundsRaised()
      .call()
      .then((r) => {
        document.getElementById("fundsraisedAmt").innerHTML = `${r}`;
      });
  },

  handleWithdraw: function (withdraw) {
    App.contracts.FishTankContract.methods
      .getfundsRaised()
      .call()
      .then((r) => {
        var option = { from: App.handler };

        //calling startFunding in the contract
        App.contracts.FishTankContract.methods
          .withdraw(r)
          .send(option)
          .on("receipt", (receipt) => {
            if (receipt.status) {
              toastr.success("Withdraw Initiated");
              console.log(r);
            }
          })
          .on("error", (err) => {
            toastr.error("Please try that again");
          });
      });
  },
  handleendFunding: function () {
    // App.contracts.FishTankContract.methods
    //   .endFunding()
    //   .call()
    //   .then((r) => {
    //     toastr.success("Withdraw Initiated");
    //   });
    var option = { from: App.handler };

    //calling startFunding in the contract
    App.contracts.FishTankContract.methods
      .endFunding()
      .send(option)
      .on("receipt", (receipt) => {
        if (receipt.status) {
          toastr.success("Initiated!");
          console.log(r);
        }
      })
      .on("error", (err) => {
        toastr.error("Please try that again");
      });
  },

  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "businesses",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "funds_needed",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "funding",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "funds_raised",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "createBuisness",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endFunding",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getfundsRaised",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        }
      ],
      "name": "giveToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "business",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "invest",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "memberType",
          "type": "uint256"
        }
      ],
      "name": "register",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "funds",
          "type": "uint256"
        }
      ],
      "name": "startFunding",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "memberType",
          "type": "uint256"
        }
      ],
      "name": "useralreadyExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountToBeWithdrawn",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};
window.onload = (event) => {
  console.log("page is fully loaded");
  App.init();
  toastr.options = {
    // toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-bottom-full-width",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };
};
