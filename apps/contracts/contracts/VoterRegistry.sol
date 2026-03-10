// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VoterRegistry
 * @notice Chain 1 contract for voter registration and eligibility management
 * @dev Manages voter identity and voting status without storing vote content
 * 
 * Requirements: 1.1.3, 1.2.1, 1.2.2, 1.3.6, 4.2.1, 4.2.2, 4.2.4, 4.2.5
 */
contract VoterRegistry {
    // Voter information structure
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        string constituencyId;
        uint256 registeredAt;
        uint256 votedAt;
    }

    // State variables
    mapping(bytes32 => Voter) private voters;
    mapping(string => bool) private constituencies;
    mapping(string => uint256) private constituencyVoterCount;
    
    address public admin;
    uint256 public totalRegistered;
    uint256 public totalVoted;

    // Events
    event VoterRegistered(
        bytes32 indexed voterHash,
        string constituencyId,
        uint256 timestamp
    );
    
    event VoterMarkedVoted(
        bytes32 indexed voterHash,
        uint256 timestamp
    );
    
    event ConstituencyAdded(
        string constituencyId,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier validConstituency(string memory constituencyId) {
        require(constituencies[constituencyId], "Invalid constituency");
        _;
    }

    /**
     * @notice Contract constructor
     * @dev Sets the deployer as admin
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Add a new constituency
     * @dev Only admin can add constituencies
     * @param constituencyId Unique identifier for the constituency
     */
    function addConstituency(string memory constituencyId) external onlyAdmin {
        require(bytes(constituencyId).length > 0, "Constituency ID cannot be empty");
        require(!constituencies[constituencyId], "Constituency already exists");
        
        constituencies[constituencyId] = true;
        
        emit ConstituencyAdded(constituencyId, block.timestamp);
    }

    /**
     * @notice Register a new voter
     * @dev Voter identity is hashed (SHA256) before being passed to this function
     * @param voterHash SHA256 hash of voter's national ID
     * @param constituencyId Constituency where voter is registered
     * @return voterAddress The address used for this voter (msg.sender)
     */
    function registerVoter(
        bytes32 voterHash,
        string memory constituencyId
    ) external validConstituency(constituencyId) returns (address voterAddress) {
        require(voterHash != bytes32(0), "Invalid voter hash");
        require(!voters[voterHash].isRegistered, "Voter already registered");
        
        voters[voterHash] = Voter({
            isRegistered: true,
            hasVoted: false,
            constituencyId: constituencyId,
            registeredAt: block.timestamp,
            votedAt: 0
        });
        
        totalRegistered++;
        constituencyVoterCount[constituencyId]++;
        
        emit VoterRegistered(voterHash, constituencyId, block.timestamp);
        
        return msg.sender;
    }

    /**
     * @notice Check if a voter is eligible to vote
     * @dev Voter is eligible if registered and has not voted
     * @param voterHash SHA256 hash of voter's national ID
     * @return eligible True if voter can vote, false otherwise
     */
    function isEligible(bytes32 voterHash) external view returns (bool eligible) {
        Voter memory voter = voters[voterHash];
        return voter.isRegistered && !voter.hasVoted;
    }

    /**
     * @notice Check if a voter has already voted
     * @param voterHash SHA256 hash of voter's national ID
     * @return voted True if voter has voted, false otherwise
     */
    function hasVoted(bytes32 voterHash) external view returns (bool voted) {
        return voters[voterHash].hasVoted;
    }

    /**
     * @notice Mark a voter as having voted
     * @dev Called after successful vote submission to Chain 2
     * @param voterHash SHA256 hash of voter's national ID
     */
    function markVoted(bytes32 voterHash) external {
        require(voters[voterHash].isRegistered, "Voter not registered");
        require(!voters[voterHash].hasVoted, "Voter already marked as voted");
        
        voters[voterHash].hasVoted = true;
        voters[voterHash].votedAt = block.timestamp;
        totalVoted++;
        
        emit VoterMarkedVoted(voterHash, block.timestamp);
    }

    /**
     * @notice Get voter information
     * @param voterHash SHA256 hash of voter's national ID
     * @return isRegistered Whether voter is registered
     * @return hasVoted Whether voter has voted
     * @return constituencyId Voter's constituency
     * @return registeredAt Registration timestamp
     * @return votedAt Voting timestamp (0 if not voted)
     */
    function getVoterInfo(bytes32 voterHash) external view returns (
        bool isRegistered,
        bool hasVoted,
        string memory constituencyId,
        uint256 registeredAt,
        uint256 votedAt
    ) {
        Voter memory voter = voters[voterHash];
        return (
            voter.isRegistered,
            voter.hasVoted,
            voter.constituencyId,
            voter.registeredAt,
            voter.votedAt
        );
    }

    /**
     * @notice Get total number of registered voters
     * @return count Total registered voters
     */
    function getTotalRegistered() external view returns (uint256 count) {
        return totalRegistered;
    }

    /**
     * @notice Get total number of voters who have voted
     * @return count Total voters who have voted
     */
    function getTotalVoted() external view returns (uint256 count) {
        return totalVoted;
    }

    /**
     * @notice Get number of registered voters in a constituency
     * @param constituencyId Constituency identifier
     * @return count Number of registered voters
     */
    function getConstituencyVoterCount(string memory constituencyId) 
        external 
        view 
        validConstituency(constituencyId) 
        returns (uint256 count) 
    {
        return constituencyVoterCount[constituencyId];
    }

    /**
     * @notice Check if a constituency exists
     * @param constituencyId Constituency identifier
     * @return exists True if constituency exists
     */
    function constituencyExists(string memory constituencyId) external view returns (bool exists) {
        return constituencies[constituencyId];
    }

    /**
     * @notice Transfer admin role to a new address
     * @dev Only current admin can transfer
     * @param newAdmin Address of new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}
