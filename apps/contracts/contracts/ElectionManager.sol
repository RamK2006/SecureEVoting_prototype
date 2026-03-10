// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ElectionManager
 * @notice Manages election lifecycle, candidates, and results finalization
 * @dev Handles election creation, state transitions, and immutable results storage
 * 
 * Requirements: 2.1.1, 2.1.6, 2.2.1, 2.2.2, 2.2.5, 2.3.4, 2.3.5
 */
contract ElectionManager {
    // Election status enum
    enum ElectionStatus {
        Draft,      // Created but not started
        Active,     // Currently accepting votes
        Ended,      // Voting period ended, not finalized
        Finalized   // Results finalized and immutable
    }

    // Candidate structure
    struct Candidate {
        string candidateId;
        string name;
        string party;
        string constituencyId;
        bool exists;
    }

    // Election structure
    struct Election {
        bytes32 electionId;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        uint256 createdAt;
        uint256 startedAt;
        uint256 endedAt;
        uint256 finalizedAt;
        bool allowRevoting;
        uint256 revotingWindowMinutes;
        bool exists;
    }

    // Results structure
    struct ElectionResults {
        string[] candidateIds;
        uint256[] voteCounts;
        uint256 totalVotes;
        uint256 finalizedAt;
        bool isFinalized;
    }

    // State variables
    mapping(bytes32 => Election) private elections;
    mapping(bytes32 => mapping(string => Candidate)) private electionCandidates;
    mapping(bytes32 => string[]) private electionCandidateIds;
    mapping(bytes32 => ElectionResults) private electionResults;
    
    address public admin;
    bytes32[] private allElectionIds;
    bytes32 public activeElectionId;

    // Events
    event ElectionCreated(
        bytes32 indexed electionId,
        string name,
        uint256 startTime,
        uint256 endTime,
        uint256 timestamp
    );

    event CandidateAdded(
        bytes32 indexed electionId,
        string candidateId,
        string name,
        string party,
        string constituencyId,
        uint256 timestamp
    );

    event ElectionStarted(
        bytes32 indexed electionId,
        uint256 timestamp
    );

    event ElectionEnded(
        bytes32 indexed electionId,
        uint256 timestamp
    );

    event ResultsFinalized(
        bytes32 indexed electionId,
        uint256 totalVotes,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier electionExists(bytes32 electionId) {
        require(elections[electionId].exists, "Election does not exist");
        _;
    }

    modifier validTimeWindow(uint256 startTime, uint256 endTime) {
        require(startTime > block.timestamp, "Start time must be in future");
        require(endTime > startTime, "End time must be after start time");
        
        uint256 duration = endTime - startTime;
        require(duration >= 1 hours, "Election duration must be at least 1 hour");
        require(duration <= 7 days, "Election duration cannot exceed 7 days");
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
     * @notice Create a new election
     * @dev Creates election in Draft status with time validation
     * @param name Election name
     * @param description Election description
     * @param startTime Unix timestamp for election start
     * @param endTime Unix timestamp for election end
     * @param allowRevoting Whether to allow vote changes
     * @param revotingWindowMinutes Time window for revoting (default 30)
     * @return electionId Unique identifier for the election
     */
    function createElection(
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool allowRevoting,
        uint256 revotingWindowMinutes
    ) external onlyAdmin validTimeWindow(startTime, endTime) returns (bytes32 electionId) {
        require(bytes(name).length > 0, "Election name cannot be empty");
        require(revotingWindowMinutes > 0, "Revoting window must be positive");
        
        // Generate unique election ID
        electionId = keccak256(abi.encodePacked(
            name,
            block.timestamp,
            block.number,
            allElectionIds.length
        ));
        
        elections[electionId] = Election({
            electionId: electionId,
            name: name,
            description: description,
            startTime: startTime,
            endTime: endTime,
            status: ElectionStatus.Draft,
            createdAt: block.timestamp,
            startedAt: 0,
            endedAt: 0,
            finalizedAt: 0,
            allowRevoting: allowRevoting,
            revotingWindowMinutes: revotingWindowMinutes,
            exists: true
        });
        
        allElectionIds.push(electionId);
        
        emit ElectionCreated(electionId, name, startTime, endTime, block.timestamp);
        
        return electionId;
    }

    /**
     * @notice Add a candidate to an election
     * @dev Can only add candidates to Draft elections
     * @param electionId Election identifier
     * @param candidateId Unique candidate identifier
     * @param name Candidate name
     * @param party Political party
     * @param constituencyId Constituency identifier
     */
    function addCandidate(
        bytes32 electionId,
        string memory candidateId,
        string memory name,
        string memory party,
        string memory constituencyId
    ) external onlyAdmin electionExists(electionId) {
        require(elections[electionId].status == ElectionStatus.Draft, "Can only add candidates to draft elections");
        require(bytes(candidateId).length > 0, "Candidate ID cannot be empty");
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        require(!electionCandidates[electionId][candidateId].exists, "Candidate already exists");
        
        electionCandidates[electionId][candidateId] = Candidate({
            candidateId: candidateId,
            name: name,
            party: party,
            constituencyId: constituencyId,
            exists: true
        });
        
        electionCandidateIds[electionId].push(candidateId);
        
        emit CandidateAdded(electionId, candidateId, name, party, constituencyId, block.timestamp);
    }

    /**
     * @notice Start an election
     * @dev Transitions election from Draft to Active status
     * @param electionId Election identifier
     */
    function startElection(bytes32 electionId) external onlyAdmin electionExists(electionId) {
        Election storage election = elections[electionId];
        
        require(election.status == ElectionStatus.Draft, "Election must be in Draft status");
        require(block.timestamp >= election.startTime, "Election start time not reached");
        require(block.timestamp < election.endTime, "Election end time has passed");
        require(electionCandidateIds[electionId].length >= 2, "Election must have at least 2 candidates");
        
        election.status = ElectionStatus.Active;
        election.startedAt = block.timestamp;
        activeElectionId = electionId;
        
        emit ElectionStarted(electionId, block.timestamp);
    }

    /**
     * @notice End an election
     * @dev Transitions election from Active to Ended status
     * @param electionId Election identifier
     */
    function endElection(bytes32 electionId) external onlyAdmin electionExists(electionId) {
        Election storage election = elections[electionId];
        
        require(election.status == ElectionStatus.Active, "Election must be Active");
        require(block.timestamp >= election.endTime, "Election end time not reached");
        
        election.status = ElectionStatus.Ended;
        election.endedAt = block.timestamp;
        
        if (activeElectionId == electionId) {
            activeElectionId = bytes32(0);
        }
        
        emit ElectionEnded(electionId, block.timestamp);
    }

    /**
     * @notice Finalize election results
     * @dev Stores immutable results on blockchain, can only be called once
     * @param electionId Election identifier
     * @param candidateIds Array of candidate IDs
     * @param voteCounts Array of vote counts (must match candidateIds order)
     */
    function finalizeResults(
        bytes32 electionId,
        string[] memory candidateIds,
        uint256[] memory voteCounts
    ) external onlyAdmin electionExists(electionId) {
        Election storage election = elections[electionId];
        
        require(election.status == ElectionStatus.Ended, "Election must be Ended");
        require(!electionResults[electionId].isFinalized, "Results already finalized");
        require(candidateIds.length == voteCounts.length, "Candidate IDs and vote counts length mismatch");
        require(candidateIds.length > 0, "Must have at least one candidate");
        
        // Verify all candidates exist
        for (uint256 i = 0; i < candidateIds.length; i++) {
            require(
                electionCandidates[electionId][candidateIds[i]].exists,
                "Invalid candidate ID"
            );
        }
        
        // Calculate total votes
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < voteCounts.length; i++) {
            totalVotes += voteCounts[i];
        }
        
        // Store results
        electionResults[electionId] = ElectionResults({
            candidateIds: candidateIds,
            voteCounts: voteCounts,
            totalVotes: totalVotes,
            finalizedAt: block.timestamp,
            isFinalized: true
        });
        
        election.status = ElectionStatus.Finalized;
        election.finalizedAt = block.timestamp;
        
        emit ResultsFinalized(electionId, totalVotes, block.timestamp);
    }

    /**
     * @notice Get election status and details
     * @param electionId Election identifier
     * @return name Election name
     * @return description Election description
     * @return startTime Election start timestamp
     * @return endTime Election end timestamp
     * @return status Current election status
     * @return isActive Whether election is currently active
     * @return isFinalized Whether results are finalized
     */
    function getElectionStatus(bytes32 electionId) 
        external 
        view 
        electionExists(electionId) 
        returns (
            string memory name,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            ElectionStatus status,
            bool isActive,
            bool isFinalized
        ) 
    {
        Election memory election = elections[electionId];
        return (
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.status,
            election.status == ElectionStatus.Active,
            election.status == ElectionStatus.Finalized
        );
    }

    /**
     * @notice Get election results
     * @dev Only returns results if election is finalized
     * @param electionId Election identifier
     * @return candidateIds Array of candidate IDs
     * @return voteCounts Array of vote counts
     * @return totalVotes Total number of votes
     */
    function getResults(bytes32 electionId) 
        external 
        view 
        electionExists(electionId) 
        returns (
            string[] memory candidateIds,
            uint256[] memory voteCounts,
            uint256 totalVotes
        ) 
    {
        require(electionResults[electionId].isFinalized, "Results not finalized");
        
        ElectionResults memory results = electionResults[electionId];
        return (results.candidateIds, results.voteCounts, results.totalVotes);
    }

    /**
     * @notice Get candidate information
     * @param electionId Election identifier
     * @param candidateId Candidate identifier
     * @return name Candidate name
     * @return party Political party
     * @return constituencyId Constituency identifier
     */
    function getCandidate(bytes32 electionId, string memory candidateId) 
        external 
        view 
        electionExists(electionId) 
        returns (
            string memory name,
            string memory party,
            string memory constituencyId
        ) 
    {
        require(electionCandidates[electionId][candidateId].exists, "Candidate does not exist");
        
        Candidate memory candidate = electionCandidates[electionId][candidateId];
        return (candidate.name, candidate.party, candidate.constituencyId);
    }

    /**
     * @notice Get all candidates for an election
     * @param electionId Election identifier
     * @return candidateIds Array of candidate IDs
     */
    function getCandidates(bytes32 electionId) 
        external 
        view 
        electionExists(electionId) 
        returns (string[] memory candidateIds) 
    {
        return electionCandidateIds[electionId];
    }

    /**
     * @notice Get the currently active election
     * @return electionId Active election ID (bytes32(0) if none)
     */
    function getActiveElection() external view returns (bytes32 electionId) {
        return activeElectionId;
    }

    /**
     * @notice Get all election IDs
     * @return electionIds Array of all election IDs
     */
    function getAllElections() external view returns (bytes32[] memory electionIds) {
        return allElectionIds;
    }

    /**
     * @notice Get election configuration details
     * @param electionId Election identifier
     * @return allowRevoting Whether revoting is allowed
     * @return revotingWindowMinutes Revoting window in minutes
     * @return createdAt Creation timestamp
     * @return startedAt Start timestamp (0 if not started)
     * @return endedAt End timestamp (0 if not ended)
     * @return finalizedAt Finalization timestamp (0 if not finalized)
     */
    function getElectionConfig(bytes32 electionId) 
        external 
        view 
        electionExists(electionId) 
        returns (
            bool allowRevoting,
            uint256 revotingWindowMinutes,
            uint256 createdAt,
            uint256 startedAt,
            uint256 endedAt,
            uint256 finalizedAt
        ) 
    {
        Election memory election = elections[electionId];
        return (
            election.allowRevoting,
            election.revotingWindowMinutes,
            election.createdAt,
            election.startedAt,
            election.endedAt,
            election.finalizedAt
        );
    }

    /**
     * @notice Check if election is in valid voting window
     * @param electionId Election identifier
     * @return isValid True if current time is within election window
     */
    function isInVotingWindow(bytes32 electionId) 
        external 
        view 
        electionExists(electionId) 
        returns (bool isValid) 
    {
        Election memory election = elections[electionId];
        return (
            election.status == ElectionStatus.Active &&
            block.timestamp >= election.startTime &&
            block.timestamp <= election.endTime
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
