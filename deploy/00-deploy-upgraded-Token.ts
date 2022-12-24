import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, MIN_DELAY, TIMELOCK_CONTROLLER_NAME, GOVERNANCE_TOKEN_NAME } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployUpgradedGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const timelockAddress = '0x82588dd4faca5ccf9da8eb76ff311c6ada5af87a'

  log("----------------------------------------------------")
  log("Deploying governanceToken and waiting for confirmations...")
  const governanceTokenV2 = await ethers.getContractFactory(GOVERNANCE_TOKEN_NAME);
  const governanceTokenContract = await governanceTokenV2.deploy();

  log(`Upgraded Token at ${governanceTokenContract.address}`)
  
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceTokenContract.address, [])
  }

  log(`Verified Token at ${governanceTokenContract.address}`)


  const owner = await governanceTokenContract.owner();
  log(`owner: ${owner}`)
  const transferTx = await governanceTokenContract.transferOwnership(timelockAddress)
  await transferTx.wait(1)
  


  throw new Error("Failed to avoid continuation of deployment");
}

export default deployUpgradedGovernanceToken
deployUpgradedGovernanceToken.tags = ["all", TIMELOCK_CONTROLLER_NAME]
