import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, GOVERNANCE_TOKEN_NAME, TIMELOCK_CONTROLLER_NAME } from "../helper-hardhat-config"
import { ethers, upgrades } from "hardhat"



const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying GovernanceToken and waiting for confirmations...")

  const governanceTokenContractFactory = await ethers.getContractFactory(GOVERNANCE_TOKEN_NAME);
  console.log(`Deploying ${GOVERNANCE_TOKEN_NAME}...`);

  const deployedProxy = await upgrades.deployProxy(governanceTokenContractFactory, [], {
    initializer: "initialize",
    kind: "uups",
  });


  await deployedProxy.deployed();
  console.log(`${GOVERNANCE_TOKEN_NAME} proxy deployed to: ${deployedProxy.address}`);

  const governanceToken = await governanceTokenContractFactory.attach(
     deployedProxy.address
  );


  log(`Delegating to ${deployer}`)
  
  const transactionResponse = await governanceToken.delegate(deployer)
  await transactionResponse.wait(1)
  console.log(`Checkpoints: ${await governanceToken.numCheckpoints(deployer)}`)
  
  log("Delegated!")
  log("Setting Governance Token Ownership...")

  const timeLock = await ethers.getContract(TIMELOCK_CONTROLLER_NAME, deployer);
  log(`Transfering Ownership to ${timeLock.address}`)
  
  const governanceTokenContract = await ethers.getContractAt(GOVERNANCE_TOKEN_NAME, governanceToken.address)

  const owner = await governanceTokenContract.owner()
  console.log(`owner: ${owner}`);
  
  const transferTx = await governanceTokenContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)

  log('transfered...')
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
