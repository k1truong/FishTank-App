const FishTank = artifacts.require("FishTankContract.sol");

module.exports = function (deployer) {
  deployer.deploy(FishTank);
};
