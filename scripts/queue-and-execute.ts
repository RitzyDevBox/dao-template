import { ethers, network } from "hardhat"
import {
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
  MINT_VALUE,
  MINT_FUNC,
  MINT_PROPOSAL_DESCRIPTION,
  GOVERNOR_CONTRACT_NAME,
} from "../helper-hardhat-config"
import { ThreeMarketGovernorBravoContract } from "../typechain-types/ThreeMarketGovernorBravoContract";
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

export async function queueAndExecute() {

  const box = await ethers.getContract("Box");
  const args =[box.address, MINT_VALUE];
  const functionToCall = MINT_FUNC; 
  const RitzyToken = await ethers.getContract("RitzyToken")
  const encodedFunctionCall = RitzyToken.interface.encodeFunctionData(functionToCall, args)
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(MINT_PROPOSAL_DESCRIPTION))
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContract(GOVERNOR_CONTRACT_NAME) as ThreeMarketGovernorBravoContract
  console.log("Queueing...")
  const queueTx = await governor["queue(address[],uint256[],bytes[],bytes32)"]([RitzyToken.address], [0], [encodedFunctionCall], descriptionHash)
  await queueTx.wait(1)

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log(`Ritzy Token Balance Box: ${await RitzyToken.balanceOf(box.address)}`)
  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor["execute(address[],uint256[],bytes[],bytes32)"](
    [RitzyToken.address],
    [0],
    [encodedFunctionCall],
    descriptionHash);
  
  await executeTx.wait(1)
  console.log(`Ritzy Token Balance Box: ${await RitzyToken.balanceOf(box.address)}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
