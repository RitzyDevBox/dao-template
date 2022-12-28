import { GovernanceToken, Box, ThreeMarketGovernorBravoContract, TimelockController } from "../../typechain-types"
import { deployments, ethers } from "hardhat"
import { assert, expect } from "chai"
import {
  FUNC,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
  VOTING_DELAY,
  VOTING_PERIOD,
  MIN_DELAY,
  GOVERNOR_CONTRACT_NAME,
  GOVERNANCE_TOKEN_NAME,
  TIMELOCK_CONTROLLER_NAME,
} from "../../helper-hardhat-config"
import { moveBlocks } from "../../utils/move-blocks"
import { moveTime } from "../../utils/move-time"

describe("Governor Flow", async () => {
  let governor: ThreeMarketGovernorBravoContract
  let governanceToken: GovernanceToken
  let timeLock: TimelockController
  let box: Box
  const voteWay = 1 // for
  const reason = "I lika do da cha cha"
  beforeEach(async () => {
    await deployments.fixture(["all"])
    
    governor = await ethers.getContract(GOVERNOR_CONTRACT_NAME)
    timeLock = await ethers.getContract(TIMELOCK_CONTROLLER_NAME)
    governanceToken = await ethers.getContract(GOVERNANCE_TOKEN_NAME)
    box = await ethers.getContract("Box")
  })

  it("can only be changed through governance", async () => {
    await expect(box.store(55)).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("proposes, votes, waits, queues, and then executes", async () => {
    // propose
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
    const proposeTx = await governor["propose(address[],uint256[],bytes[],string)"](
      [box.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    )

    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events![0].args!.proposalId
    let proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    await moveBlocks(VOTING_DELAY + 1)
    // vote
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTx.wait(1)
    proposalState = await governor.state(proposalId)
    assert.equal(proposalState.toString(), "1")
    console.log(`Current Proposal State: ${proposalState}`)
    await moveBlocks(VOTING_PERIOD + 1)

    // queue & execute
    // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
    const queueTx = await governor["queue(address[],uint256[],bytes[],bytes32)"]([box.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)

    proposalState = await governor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    console.log("Executing...")
    console.log
    const exTx = await governor["execute(address[],uint256[],bytes[],bytes32)"]([box.address], [0], [encodedFunctionCall], descriptionHash)
    await exTx.wait(1)
    console.log((await box.retrieve()).toString())
  })
})
