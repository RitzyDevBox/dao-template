// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (governance/compatibility/GovernorCompatibilityBravo.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";

abstract contract GovenorEnumerationCompatibilityBravo is GovernorCompatibilityBravo {

    uint256 public proposalCount = 0;
    mapping(uint256 => uint256) private _proposalIndexMap;

    function getProposalIdFromIndex(uint256 index) public view returns (uint256) {
        return _proposalIndexMap[index];
    }

    // ============================================== Proposal lifecycle ==============================================
    /**
     * @dev See {IGovernor-propose}.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override(GovernorCompatibilityBravo) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /**
     * @dev See {IGovernorCompatibilityBravo-propose}.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override returns (uint256) {
        uint256 proposalId = super.propose(targets, values, signatures, calldatas, description);
        _storeProposalIndex(proposalId);
        return proposalId;
    }


    /**
     * @dev Store proposal metadata for later lookup
     */
    function _storeProposalIndex(uint256 proposalId) private {
        _proposalIndexMap[proposalCount] = proposalId;
        proposalCount++;
    }
}
