import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  GOVERNOR_CONTRACT_NAME,
  TIMELOCK_CONTROLLER_NAME,
  GOVERNANCE_TOKEN_NAME,
} from "../helper-hardhat-config"
import { ethers } from "hardhat"
const { getContractAddress } = require('@ethersproject/address')

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()

  const governanceTokenContractFactory = await ethers.getContractFactory(GOVERNANCE_TOKEN_NAME);
  const deploySigner = await governanceTokenContractFactory.signer;
  const transactionCount = await deploySigner.getTransactionCount()

  const governanceTokenAddress = getContractAddress({
    from: await deploySigner.getAddress(),
    nonce: transactionCount-3
  });

   console.log(`governanceToken Addresss: ${governanceTokenAddress}`)

  // const governanceToken = await get(GOVERNANCE_TOKEN_NAME)
  const timeLock = await get(TIMELOCK_CONTROLLER_NAME)
  //const governanceToken = await get(GOVERNANCE_TOKEN_NAME)
  const args = [
      governanceTokenAddress,
      timeLock.address,
      QUORUM_PERCENTAGE,
      VOTING_PERIOD,
      VOTING_DELAY,
  ]
  
  log("----------------------------------------------------")
  log(`Deploying ${GOVERNOR_CONTRACT_NAME} and waiting for confirmations...`)
  const governorContract = await deploy(GOVERNOR_CONTRACT_NAME, {
    from: deployer,
    args, 
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`${GOVERNOR_CONTRACT_NAME} at ${governorContract.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governorContract.address, args)
  }
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "governor"]
