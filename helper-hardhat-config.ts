export interface networkConfigItem {
  ethUsdPriceFeed?: string
  blockConfirmations?: number
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  polygon: {
    blockConfirmations: 6,
  },
  polygon_mumbai: {
    blockConfirmations: 6,
  },
}

export const developmentChains = ["hardhat", "localhost"]
export const proposalsFile = "proposals.json"

// Governor Values
export const QUORUM_PERCENTAGE = 4 // Need 4% of voters to pass
export const MIN_DELAY = 600 // Delay in seconds
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 300 // blocks
export const VOTING_DELAY = 1 // 1 Block - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

export const NEW_STORE_VALUE = 77
export const FUNC = "store"
export const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!"

export const MINT_VALUE = "1000000000000000000";
export const MINT_FUNC = "mint";
export const MINT_PROPOSAL_DESCRIPTION = "mint address new debt 2"; 

export const GOVERNOR_CONTRACT_NAME = "ThreeMarketGovernorBravoContract";
export const TIMELOCK_CONTROLLER_NAME = "GovernanceTimeLock";
export const GOVERNANCE_TOKEN_NAME = "GovernanceToken";