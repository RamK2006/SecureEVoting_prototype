# VoterRegistry Contract Documentation

## Overview

The `VoterRegistry` contract is the Chain 1 component of the SecureVote two-chain architecture. It manages voter registration, eligibility verification, and voting status tracking without ever storing vote content. This separation ensures voter anonymity while maintaining election integrity.

## Contract Address

- **Network**: Hardhat Local Node
- **Chain ID**: 1337
- **Deployment**: See deployment scripts

## Key Features

- **Voter Registration**: Records voter identity (hashed) on blockchain
- **Eligibility Checks**: Verifies if a voter can participate
- **Vote Marking**: Tracks who has voted without revealing vote content
- **Constituency Management**: Organizes voters by geographic regions
- **Access Control**: Admin-only functions for system management
- **Event Emission**: Transparent logging of all state changes

## Architecture

### Two-Chain Separation

```
Chain 1 (VoterRegistry)          Chain 2 (VoteLedger)
├─ Voter Identity (hashed)       ├─ Anonymous Tokens
├─ Constituency                  ├─ Encrypted Votes
├─ Has Voted Status              └─ Zero-Knowledge Proofs
└─ Registration Timestamp
```

**Privacy Guarantee**: No link exists between voter identity (Chain 1) and vote content (Chain 2).

## Data Structures

### Voter Struct

```solidity
struct Voter {
    bool isRegistered;      // Whether voter is registered
    bool hasVoted;          // Whether voter has cast a vote
    string constituencyId;  // Geographic constituency
    uint256 registeredAt;   // Registration timestamp
    uint256 votedAt;        // Voting timestamp (0 if not voted)
}
```

### State Variables

- `mapping(bytes32 => Voter) private voters`: Voter records indexed by hash
- `mapping(string => bool) private constituencies`: Valid constituencies
- `mapping(string => uint256) private constituencyVoterCount`: Voter count per constituency
- `address public admin`: Contract administrator
- `uint256 public totalRegistered`: Total registered voters
- `uint256 public totalVoted`: Total voters who have voted

## Functions

### Admin Functions

#### addConstituency

```solidity
function addConstituency(string memory constituencyId) external onlyAdmin
```

Adds a new constituency to the system.

**Parameters:**
- `constituencyId`: Unique identifier for the constituency

**Requirements:**
- Caller must be admin
- Constituency ID cannot be empty
- Constituency must not already exist

**Events:**
- `ConstituencyAdded(constituencyId, timestamp)`

**Example:**
```typescript
await voterRegistry.addConstituency("const-001");
```

#### transferAdmin

```solidity
function transferAdmin(address newAdmin) external onlyAdmin
```

Transfers admin role to a new address.

**Parameters:**
- `newAdmin`: Address of the new administrator

**Requirements:**
- Caller must be current admin
- New admin address cannot be zero address

**Example:**
```typescript
await voterRegistry.transferAdmin(newAdminAddress);
```

### Voter Registration

#### registerVoter

```solidity
function registerVoter(
    bytes32 voterHash,
    string memory constituencyId
) external validConstituency(constituencyId) returns (address voterAddress)
```

Registers a new voter on the blockchain.

**Parameters:**
- `voterHash`: SHA256 hash of voter's national ID (computed off-chain)
- `constituencyId`: Constituency where voter is registered

**Returns:**
- `voterAddress`: The address used for registration (msg.sender)

**Requirements:**
- Voter hash cannot be zero
- Voter must not be already registered
- Constituency must exist

**Events:**
- `VoterRegistered(voterHash, constituencyId, timestamp)`

**Example:**
```typescript
const nationalId = "123456789012";
const salt = "system-salt";
const voterHash = ethers.keccak256(ethers.toUtf8Bytes(nationalId + salt));

await voterRegistry.registerVoter(voterHash, "const-001");
```

### Eligibility Checks

#### isEligible

```solidity
function isEligible(bytes32 voterHash) external view returns (bool eligible)
```

Checks if a voter is eligible to vote.

**Parameters:**
- `voterHash`: SHA256 hash of voter's national ID

**Returns:**
- `eligible`: True if voter is registered and has not voted

**Example:**
```typescript
const eligible = await voterRegistry.isEligible(voterHash);
if (eligible) {
    // Allow voting
}
```

#### hasVoted

```solidity
function hasVoted(bytes32 voterHash) external view returns (bool voted)
```

Checks if a voter has already voted.

**Parameters:**
- `voterHash`: SHA256 hash of voter's national ID

**Returns:**
- `voted`: True if voter has voted

**Example:**
```typescript
const voted = await voterRegistry.hasVoted(voterHash);
```

### Vote Marking

#### markVoted

```solidity
function markVoted(bytes32 voterHash) external
```

Marks a voter as having voted. Called after successful vote submission to Chain 2.

**Parameters:**
- `voterHash`: SHA256 hash of voter's national ID

**Requirements:**
- Voter must be registered
- Voter must not have already voted

**Events:**
- `VoterMarkedVoted(voterHash, timestamp)`

**Example:**
```typescript
// After vote is successfully submitted to Chain 2
await voterRegistry.markVoted(voterHash);
```

### Information Retrieval

#### getVoterInfo

```solidity
function getVoterInfo(bytes32 voterHash) external view returns (
    bool isRegistered,
    bool hasVoted,
    string memory constituencyId,
    uint256 registeredAt,
    uint256 votedAt
)
```

Retrieves complete voter information.

**Parameters:**
- `voterHash`: SHA256 hash of voter's national ID

**Returns:**
- `isRegistered`: Whether voter is registered
- `hasVoted`: Whether voter has voted
- `constituencyId`: Voter's constituency
- `registeredAt`: Registration timestamp
- `votedAt`: Voting timestamp (0 if not voted)

**Example:**
```typescript
const [isRegistered, hasVoted, constituencyId, registeredAt, votedAt] = 
    await voterRegistry.getVoterInfo(voterHash);
```

#### getTotalRegistered

```solidity
function getTotalRegistered() external view returns (uint256 count)
```

Returns total number of registered voters.

#### getTotalVoted

```solidity
function getTotalVoted() external view returns (uint256 count)
```

Returns total number of voters who have voted.

#### getConstituencyVoterCount

```solidity
function getConstituencyVoterCount(string memory constituencyId) 
    external view validConstituency(constituencyId) returns (uint256 count)
```

Returns number of registered voters in a constituency.

#### constituencyExists

```solidity
function constituencyExists(string memory constituencyId) 
    external view returns (bool exists)
```

Checks if a constituency exists.

## Events

### VoterRegistered

```solidity
event VoterRegistered(
    bytes32 indexed voterHash,
    string constituencyId,
    uint256 timestamp
)
```

Emitted when a new voter is registered.

### VoterMarkedVoted

```solidity
event VoterMarkedVoted(
    bytes32 indexed voterHash,
    uint256 timestamp
)
```

Emitted when a voter is marked as having voted.

### ConstituencyAdded

```solidity
event ConstituencyAdded(
    string constituencyId,
    uint256 timestamp
)
```

Emitted when a new constituency is added.

## Security Considerations

### Privacy Protection

1. **No PII on Blockchain**: National IDs are hashed (SHA256) before being stored
2. **Vote Content Separation**: This contract never stores vote content
3. **Anonymous Voting**: No link between voter identity and vote content

### Access Control

1. **Admin Functions**: Only admin can add constituencies and transfer admin role
2. **One-Person-One-Vote**: Contract enforces that each voter can only be marked as voted once
3. **Constituency Validation**: All operations validate constituency existence

### Gas Optimization

1. **Efficient Storage**: Uses mappings for O(1) lookups
2. **Minimal State Changes**: Only updates necessary state variables
3. **Event Emission**: Uses indexed parameters for efficient filtering

## Integration with Backend

### Voter Registration Flow

```typescript
// Backend API endpoint: POST /api/auth/register
async function registerVoter(nationalId: string, constituencyId: string) {
    // 1. Hash national ID (never store plaintext)
    const salt = process.env.SYSTEM_SALT;
    const voterHash = ethers.keccak256(
        ethers.toUtf8Bytes(nationalId + salt)
    );
    
    // 2. Register on blockchain
    const tx = await voterRegistry.registerVoter(voterHash, constituencyId);
    const receipt = await tx.wait();
    
    // 3. Store in database (with hashed ID only)
    await db.voters.create({
        voterHash,
        constituencyId,
        registeredAt: new Date(),
    });
    
    return { success: true, voterHash };
}
```

### Vote Submission Flow

```typescript
// Backend API endpoint: POST /api/vote/cast
async function castVote(voterHash: string, voteData: any) {
    // 1. Check eligibility
    const eligible = await voterRegistry.isEligible(voterHash);
    if (!eligible) {
        throw new Error("Voter not eligible");
    }
    
    // 2. Submit vote to Chain 2 (VoteLedger)
    const voteId = await voteLedger.submitVote(/* ... */);
    
    // 3. Mark voter as voted on Chain 1
    const tx = await voterRegistry.markVoted(voterHash);
    await tx.wait();
    
    return { voteId, success: true };
}
```

## Testing

Comprehensive test suite available in `test/VoterRegistry.test.ts`:

- Deployment tests
- Constituency management tests
- Voter registration tests
- Eligibility check tests
- Vote marking tests
- Admin management tests
- Integration scenarios

Run tests:
```bash
npm test
```

## Deployment

Deploy to local Hardhat node:
```bash
npm run node  # Terminal 1
npm run deploy  # Terminal 2
```

## Requirements Mapping

This contract satisfies the following requirements:

- **1.1.3**: Voter registration recorded on blockchain (Chain 1)
- **1.2.1**: System checks voter registration status on blockchain
- **1.2.2**: System verifies voter has not already voted
- **1.3.6**: Voter marked as voted on Chain 1 after successful submission
- **4.2.1**: Two-chain architecture separates identity from votes
- **4.2.2**: VoterRegistry contract enforces one-person-one-vote
- **4.2.4**: Smart contracts emit events for all state changes
- **4.2.5**: Contracts use access control for admin functions

## Future Enhancements

1. **Re-voting Support**: Add time-window based re-voting capability
2. **Batch Operations**: Support batch voter registration
3. **Upgradability**: Implement proxy pattern for contract upgrades
4. **Multi-Election**: Support multiple concurrent elections
5. **Delegation**: Add voter delegation capabilities

## License

MIT License
