import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, ADDRESS_ZERO, GOVERNOR_CONTRACT_NAME } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract(GOVERNOR_CONTRACT_NAME, deployer)

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // would be great to use multicall here...
  const proposerRole = await timeLock.PROPOSER_ROLE()
  log("--Proposer")
  const executorRole = await timeLock.EXECUTOR_ROLE()
  log("--Executor")
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()
  log("--Admin")

  log(`--Proposer ${governor.address}`)

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
  await proposerTx.wait(1)

  log("--Executor")

  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTx.wait(1)

  log("--Admin")  

  const revokeTx = await timeLock.revokeRole(adminRole, deployer)
  await revokeTx.wait(1)

  log("--Done")  
  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
}

export default setupContracts
setupContracts.tags = ["all", "setup"]
