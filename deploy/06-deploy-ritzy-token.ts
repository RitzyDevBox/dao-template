import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying RitzyToken and waiting for confirmations...")
  const ritzyToken = await deploy("RitzyToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`RitzyToken at ${ritzyToken.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(ritzyToken.address, [], " contracts/RitzyToken.sol:RitzyToken")
  }


  const timeLock = await ethers.getContract("TimeLock")
  log(`Transfer Ownership to ${timeLock.address}`)

  const ritzyTokenContract = await ethers.getContractAt("RitzyToken", ritzyToken.address)
  const transferTx = await ritzyTokenContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
  
  log("Transfered!")
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
