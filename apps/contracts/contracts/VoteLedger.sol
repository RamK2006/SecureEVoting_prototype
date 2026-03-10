// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VoteLedger
 * @notice Chain 2 contract for anonymous vote submission and storage
 * @dev Stores encrypted votes with anonymous tokens, never stores voter identity
 * 
 * Requirements: 1.3.5, 1.4.2, 3.1.3, 4.2.1, 4.2.3, 4.2.4
 */
contract VoteLedger {
    // Vote record structure
    struct Vote {
        bytes32 voteId;
        bytes32 anonymousToken;
        string encryptedVote;
        string zkProof;
        string constituencyId;
        uint256 blockNumber;
        uint256 timestamp;
        bool exists;
    }

    // State variables
    mapping(bytes32 => Vote) private votes;
    mapping(bytes32 => bool) private usedTokens;
    mapping(string => uint256) private constituencyVoteCounts;
    mapping(string => bytes32[]) private constituencyVoteIds;
    
    address public admin;
    uint256 public totalVotes;
    bytes32[] private allVoteIds;

    // Events
    event VoteSubmitted(
        bytes32 indexed voteId,
        bytes32 indexed anonymousToken,
        string constituencyId,
        uint256 blockNumber,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
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
     * @notice Submit an encrypted vote with anonymous token
     * @dev Vote is encrypted client-side, token is single-use
     * @param anonymousToken UUID v4 anonymous voting token
     * @param encryptedVote AES-256-GCM encrypted vote data
     * @param zkProof Zero-knowledge proof for vote validity
     * @param constituencyId Constituency where vote is cast
     * @return voteId Unique identifier for the submitted vote
     */
    function submitVote(
        bytes32 anonymousToken,
        string memory encryptedVote,
        string memory zkProof,
        string memory constituencyId
    ) external returns (bytes32 voteId) {
        require(anonymousToken != bytes32(0), "Invalid anonymous token");
        require(bytes(encryptedVote).length > 0, "Encrypted vote cannot be empty");
        require(bytes(zkProof).length > 0, "ZK proof cannot be empty");
        require(bytes(constituencyId).length > 0, "Constituency ID cannot be empty");
        require(!usedTokens[anonymousToken], "Token already used");
        
        // Generate unique vote ID
        voteId = keccak256(abi.encodePacked(
            anonymousToken,
            block.timestamp,
            block.number,
            totalVotes
        ));
        
        // Store vote record
        votes[voteId] = Vote({
            voteId: voteId,
            anonymousToken: anonymousToken,
            encryptedVote: encryptedVote,
            zkProof: zkProof,
            constituencyId: constituencyId,
            blockNumber: block.number,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Mark token as used
        usedTokens[anonymousToken] = true;
        
        // Update counters
        totalVotes++;
        constituencyVoteCounts[constituencyId]++;
        
        // Track vote IDs
        allVoteIds.push(voteId);
        constituencyVoteIds[constituencyId].push(voteId);
        
        emit VoteSubmitted(
            voteId,
            anonymousToken,
            constituencyId,
            block.number,
            block.timestamp
        );
        
        return voteId;
    }

    /**
     * @notice Retrieve vote information by vote ID
     * @dev Used for public verification, returns encrypted vote (not decrypted)
     * @param voteId Unique vote identifier
     * @return encryptedVote Encrypted vote data
     * @return blockNumber Block where vote was recorded
     * @return timestamp When vote was submitted
     * @return constituencyId Constituency of the vote
     */
    function getVote(bytes32 voteId) external view returns (
        string memory encryptedVote,
        uint256 blockNumber,
        uint256 timestamp,
        string memory constituencyId
    ) {
        require(votes[voteId].exists, "Vote does not exist");
        
        Vote memory vote = votes[voteId];
        return (
            vote.encryptedVote,
            vote.blockNumber,
            vote.timestamp,
            vote.constituencyId
        );
    }

    /**
     * @notice Get vote count for a specific constituency
     * @param constituencyId Constituency identifier
     * @return count Number of votes in constituency
     */
    function getConstituencyVoteCount(string memory constituencyId) 
        external 
        view 
        returns (uint256 count) 
    {
        return constituencyVoteCounts[constituencyId];
    }

    /**
     * @notice Get total number of votes across all constituencies
     * @return count Total votes submitted
     */
    function getTotalVotes() external view returns (uint256 count) {
        return totalVotes;
    }

    /**
     * @notice Check if an anonymous token has been used
     * @param anonymousToken Token to check
     * @return used True if token has been used
     */
    function isTokenUsed(bytes32 anonymousToken) external view returns (bool used) {
        return usedTokens[anonymousToken];
    }

    /**
     * @notice Get all vote IDs for a constituency
     * @dev Used for tallying votes by constituency
     * @param constituencyId Constituency identifier
     * @return voteIds Array of vote IDs
     */
    function getConstituencyVoteIds(string memory constituencyId) 
        external 
        view 
        returns (bytes32[] memory voteIds) 
    {
        return constituencyVoteIds[constituencyId];
    }

    /**
     * @notice Get all vote IDs in the system
     * @dev Used for complete election tallying
     * @return voteIds Array of all vote IDs
     */
    function getAllVoteIds() external view returns (bytes32[] memory voteIds) {
        return allVoteIds;
    }

    /**
     * @notice Get complete vote details including ZK proof
     * @dev Admin function for auditing and tallying
     * @param voteId Unique vote identifier
     * @return anonymousToken Token used for submission
     * @return encryptedVote Encrypted vote data
     * @return zkProof Zero-knowledge proof
     * @return constituencyId Constituency of the vote
     * @return blockNumber Block where vote was recorded
     * @return timestamp When vote was submitted
     */
    function getVoteDetails(bytes32 voteId) 
        external 
        view 
        onlyAdmin 
        returns (
            bytes32 anonymousToken,
            string memory encryptedVote,
            string memory zkProof,
            string memory constituencyId,
            uint256 blockNumber,
            uint256 timestamp
        ) 
    {
        require(votes[voteId].exists, "Vote does not exist");
        
        Vote memory vote = votes[voteId];
        return (
            vote.anonymousToken,
            vote.encryptedVote,
            vote.zkProof,
            vote.constituencyId,
            vote.blockNumber,
            vote.timestamp
        );
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
