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
} from "../helper-hardhat-config"

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await get("GovernanceToken")
  const timeLock = await get(TIMELOCK_CONTROLLER_NAME)
  const args = [
      governanceToken.address,
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
