import * as fs from "fs"
import { network, ethers } from "hardhat"
import { TASK_ETHERSCAN_VERIFY } from "hardhat-deploy"
import { proposalsFile, developmentChains, VOTING_PERIOD, GOVERNOR_CONTRACT_NAME } from "../helper-hardhat-config"
import { ThreeMarketGovernorBravoContract } from "../typechain-types/ThreeMarketGovernorBravoContract"
import { moveBlocks } from "../utils/move-blocks"


async function main() {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  // Get the last proposal for the network. You could also change it for your index
  const proposalId = proposals[network.config.chainId!].at(-1);
  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1
  const reason = "I want to allow minting"
  await vote(proposalId, voteWay, reason)
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string) {
  console.log("Voting...")
  const signer = await ethers.getSigners()

  console.log('signers:' + signer);

  const governor = await ethers.getContract(GOVERNOR_CONTRACT_NAME) as ThreeMarketGovernorBravoContract
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait(1)

  if (!voteTxReceipt.events || !voteTxReceipt.events[0].args) {
    throw new Error("no vote reciept")
  }


  console.log(voteTxReceipt.events[0].args.reason)
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
