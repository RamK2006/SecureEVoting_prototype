# ElectionManager Contract

## Overview

The ElectionManager contract manages the complete election lifecycle from creation through results finalization. It handles election state transitions, candidate management, time-based validation, and immutable results storage on the blockchain.

**Requirements Implemented:** 2.1.1, 2.1.6, 2.2.1, 2.2.2, 2.2.5, 2.3.4, 2.3.5

## Contract Address

Deployed on local Hardhat network (address set during deployment)

## Key Features

- **Election Lifecycle Management**: Create, start, end, and finalize elections
- **Candidate Management**: Add and retrieve candidate information
- **Time-Based Validation**: Enforce election time windows (1 hour to 7 days)
- **Results Storage**: Immutable results finalization on blockchain
- **Event Emission**: All state transitions emit events for transparency
- **Access Control**: Admin-only functions for election management

## Data Structures

### ElectionStatus Enum

```solidity
enum ElectionStatus {
    Draft,      // Created but not started
    Active,     // Currently accepting votes
    Ended,      // Voting period ended, not finalized
    Finalized   // Results finalized and immutable
}
```

### Election Struct

```solidity
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
```

### Candidate Struct

```solidity
struct Candidate {
    string candidateId;
    string name;
    string party;
    string constituencyId;
    bool exists;
}
```

### ElectionResults Struct

```solidity
struct ElectionResults {
    string[] candidateIds;
    uint256[] voteCounts;
    uint256 totalVotes;
    uint256 finalizedAt;
    bool isFinalized;
}
```

## Functions

### Admin Functions

#### createElection

```solidity
function createElection(
    string memory name,
    string memory description,
    uint256 startTime,
    uint256 endTime,
    bool allowRevoting,
    uint256 revotingWindowMinutes
) external onlyAdmin returns (bytes32 electionId)
```

Creates a new election in Draft status.

**Parameters:**
- `name`: Election name (required, non-empty)
- `description`: Election description
- `startTime`: Unix timestamp for election start (must be in future)
- `endTime`: Unix timestamp for election end (must be after startTime)
- `allowRevoting`: Whether to allow vote changes
- `revotingWindowMinutes`: Time window for revoting (must be positive)

**Returns:**
- `electionId`: Unique identifier for the election

**Requirements:**
- Start time must be in the future
- End time must be after start time
- Duration must be between 1 hour and 7 days
- Name cannot be empty
- Revoting window must be positive

**Events:**
- `ElectionCreated(electionId, name, startTime, endTime, timestamp)`

#### addCandidate

```solidity
function addCandidate(
    bytes32 electionId,
    string memory candidateId,
    string memory name,
    string memory party,
    string memory constituencyId
) external onlyAdmin
```

Adds a candidate to a draft election.

**Parameters:**
- `electionId`: Election identifier
- `candidateId`: Unique candidate identifier
- `name`: Candidate name (required, non-empty)
- `party`: Political party
- `constituencyId`: Constituency identifier

**Requirements:**
- Election must exist
- Election must be in Draft status
- Candidate ID must be unique within election
- Candidate name cannot be empty

**Events:**
- `CandidateAdded(electionId, candidateId, name, party, constituencyId, timestamp)`

#### startElection

```solidity
function startElection(bytes32 electionId) external onlyAdmin
```

Starts an election, transitioning from Draft to Active status.

**Parameters:**
- `electionId`: Election identifier

**Requirements:**
- Election must exist
- Election must be in Draft status
- Current time must be >= start time
- Current time must be < end time
- Election must have at least 2 candidates

**Events:**
- `ElectionStarted(electionId, timestamp)`

#### endElection

```solidity
function endElection(bytes32 electionId) external onlyAdmin
```

Ends an election, transitioning from Active to Ended status.

**Parameters:**
- `electionId`: Election identifier

**Requirements:**
- Election must exist
- Election must be in Active status
- Current time must be >= end time

**Events:**
- `ElectionEnded(electionId, timestamp)`

#### finalizeResults

```solidity
function finalizeResults(
    bytes32 electionId,
    string[] memory candidateIds,
    uint256[] memory voteCounts
) external onlyAdmin
```

Finalizes election results, making them immutable on the blockchain.

**Parameters:**
- `electionId`: Election identifier
- `candidateIds`: Array of candidate IDs
- `voteCounts`: Array of vote counts (must match candidateIds order)

**Requirements:**
- Election must exist
- Election must be in Ended status
- Results must not be already finalized
- Candidate IDs and vote counts arrays must have same length
- All candidate IDs must exist in the election
- At least one candidate must be present

**Events:**
- `ResultsFinalized(electionId, totalVotes, timestamp)`

### View Functions

#### getElectionStatus

```solidity
function getElectionStatus(bytes32 electionId) external view returns (
    string memory name,
    string memory description,
    uint256 startTime,
    uint256 endTime,
    ElectionStatus status,
    bool isActive,
    bool isFinalized
)
```

Retrieves election status and details.

**Parameters:**
- `electionId`: Election identifier

**Returns:**
- `name`: Election name
- `description`: Election description
- `startTime`: Election start timestamp
- `endTime`: Election end timestamp
- `status`: Current election status (0=Draft, 1=Active, 2=Ended, 3=Finalized)
- `isActive`: Whether election is currently active
- `isFinalized`: Whether results are finalized

#### getResults

```solidity
function getResults(bytes32 electionId) external view returns (
    string[] memory candidateIds,
    uint256[] memory voteCounts,
    uint256 totalVotes
)
```

Retrieves finalized election results.

**Parameters:**
- `electionId`: Election identifier

**Returns:**
- `candidateIds`: Array of candidate IDs
- `voteCounts`: Array of vote counts
- `totalVotes`: Total number of votes

**Requirements:**
- Election must exist
- Results must be finalized

#### getCandidate

```solidity
function getCandidate(bytes32 electionId, string memory candidateId) external view returns (
    string memory name,
    string memory party,
    string memory constituencyId
)
```

Retrieves candidate information.

**Parameters:**
- `electionId`: Election identifier
- `candidateId`: Candidate identifier

**Returns:**
- `name`: Candidate name
- `party`: Political party
- `constituencyId`: Constituency identifier

**Requirements:**
- Election must exist
- Candidate must exist

#### getCandidates

```solidity
function getCandidates(bytes32 electionId) external view returns (string[] memory candidateIds)
```

Retrieves all candidate IDs for an election.

**Parameters:**
- `electionId`: Election identifier

**Returns:**
- `candidateIds`: Array of candidate IDs

#### getActiveElection

```solidity
function getActiveElection() external view returns (bytes32 electionId)
```

Retrieves the currently active election ID.

**Returns:**
- `electionId`: Active election ID (bytes32(0) if none)

#### getAllElections

```solidity
function getAllElections() external view returns (bytes32[] memory electionIds)
```

Retrieves all election IDs.

**Returns:**
- `electionIds`: Array of all election IDs

#### getElectionConfig

```solidity
function getElectionConfig(bytes32 electionId) external view returns (
    bool allowRevoting,
    uint256 revotingWindowMinutes,
    uint256 createdAt,
    uint256 startedAt,
    uint256 endedAt,
    uint256 finalizedAt
)
```

Retrieves election configuration details.

**Parameters:**
- `electionId`: Election identifier

**Returns:**
- `allowRevoting`: Whether revoting is allowed
- `revotingWindowMinutes`: Revoting window in minutes
- `createdAt`: Creation timestamp
- `startedAt`: Start timestamp (0 if not started)
- `endedAt`: End timestamp (0 if not ended)
- `finalizedAt`: Finalization timestamp (0 if not finalized)

#### isInVotingWindow

```solidity
function isInVotingWindow(bytes32 electionId) external view returns (bool isValid)
```

Checks if election is currently in valid voting window.

**Parameters:**
- `electionId`: Election identifier

**Returns:**
- `isValid`: True if current time is within election window and election is active

## Events

### ElectionCreated

```solidity
event ElectionCreated(
    bytes32 indexed electionId,
    string name,
    uint256 startTime,
    uint256 endTime,
    uint256 timestamp
)
```

Emitted when a new election is created.

### CandidateAdded

```solidity
event CandidateAdded(
    bytes32 indexed electionId,
    string candidateId,
    string name,
    string party,
    string constituencyId,
    uint256 timestamp
)
```

Emitted when a candidate is added to an election.

### ElectionStarted

```solidity
event ElectionStarted(
    bytes32 indexed electionId,
    uint256 timestamp
)
```

Emitted when an election is started.

### ElectionEnded

```solidity
event ElectionEnded(
    bytes32 indexed electionId,
    uint256 timestamp
)
```

Emitted when an election is ended.

### ResultsFinalized

```solidity
event ResultsFinalized(
    bytes32 indexed electionId,
    uint256 totalVotes,
    uint256 timestamp
)
```

Emitted when election results are finalized.

## Usage Examples

### Creating and Managing an Election

```typescript
// Create election
const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const endTime = startTime + 86400; // 24 hours duration

const tx = await electionManager.createElection(
  "General Election 2026",
  "National parliamentary election",
  startTime,
  endTime,
  true,  // allowRevoting
  30     // revotingWindowMinutes
);

const receipt = await tx.wait();
const electionId = receipt.logs[0].args[0];

// Add candidates
await electionManager.addCandidate(
  electionId,
  "candidate-001",
  "Alice Johnson",
  "Progressive Party",
  "const-001"
);

await electionManager.addCandidate(
  electionId,
  "candidate-002",
  "Bob Smith",
  "Conservative Alliance",
  "const-001"
);

// Start election (when time comes)
await electionManager.startElection(electionId);

// End election (after end time)
await electionManager.endElection(electionId);

// Finalize results
const candidateIds = ["candidate-001", "candidate-002"];
const voteCounts = [150, 100];

await electionManager.finalizeResults(electionId, candidateIds, voteCounts);

// Get results
const [candidates, votes, totalVotes] = await electionManager.getResults(electionId);
console.log(`Total votes: ${totalVotes}`);
```

### Querying Election Information

```typescript
// Get election status
const [name, description, startTime, endTime, status, isActive, isFinalized] =
  await electionManager.getElectionStatus(electionId);

// Get all candidates
const candidates = await electionManager.getCandidates(electionId);

// Get active election
const activeElectionId = await electionManager.getActiveElection();

// Check if in voting window
const isValid = await electionManager.isInVotingWindow(electionId);
```

## Security Considerations

1. **Admin Access Control**: All state-changing functions require admin privileges
2. **Time Validation**: Strict enforcement of election time windows
3. **Immutable Results**: Results cannot be changed after finalization
4. **Event Transparency**: All state transitions emit events for audit trail
5. **Input Validation**: All inputs are validated before processing

## Gas Optimization

- Uses `memory` for function parameters to reduce gas costs
- Efficient storage patterns with mappings
- Minimal storage updates during state transitions

## Testing

Comprehensive test suite covers:
- Election creation with various time windows
- Candidate management
- Election lifecycle transitions
- Results finalization
- Access control
- Edge cases and error conditions

Run tests:
```bash
npx hardhat test test/ElectionManager.test.ts
```

## Deployment

Deploy the contract:
```bash
npx hardhat run scripts/deploy-election-manager.ts --network localhost
```

## Integration with Other Contracts

ElectionManager works alongside:
- **VoterRegistry**: Manages voter eligibility and voting status
- **VoteLedger**: Stores encrypted votes with anonymous tokens

The backend API orchestrates interactions between all three contracts to provide the complete voting system.
