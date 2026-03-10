# VoteLedger Contract Documentation

## Overview

VoteLedger is the Chain 2 smart contract in the SecureVote two-chain architecture. It stores encrypted votes with anonymous tokens but never stores voter identity, ensuring complete voter anonymity while maintaining election integrity.

**Contract Address**: Deployed on local Hardhat network  
**Solidity Version**: ^0.8.20  
**License**: MIT

## Requirements Fulfilled

- **1.3.5**: Encrypted vote is submitted to blockchain (Chain 2 - VoteLedger) with anonymous token
- **1.4.2**: Receipt includes vote ID, block number, transaction hash, and timestamp
- **3.1.3**: System displays blockchain proof (block number, transaction hash, confirmations)
- **4.2.1**: Two-chain architecture separates identity (Chain 1) from votes (Chain 2)
- **4.2.3**: VoteLedger contract stores only encrypted votes with anonymous tokens
- **4.2.4**: Smart contracts emit events for all state changes

## Architecture

### Two-Chain Separation

```
Chain 1 (VoterRegistry)          Chain 2 (VoteLedger)
├── Voter Identity (hashed)      ├── Anonymous Token
├── Has Voted Status             ├── Encrypted Vote
├── Constituency                 ├── ZK Proof
└── NO VOTE CONTENT              └── NO VOTER IDENTITY
```

This separation ensures that even with full blockchain access, votes cannot be linked to voters.

## Data Structures

### Vote Struct

```solidity
struct Vote {
    bytes32 voteId;           // Unique vote identifier
    bytes32 anonymousToken;   // Single-use anonymous token
    string encryptedVote;     // AES-256-GCM encrypted vote data
    string zkProof;           // Zero-knowledge proof (SHA256 simulation)
    string constituencyId;    // Constituency identifier
    uint256 blockNumber;      // Block where vote was recorded
    uint256 timestamp;        // Submission timestamp
    bool exists;              // Existence flag
}
```

## State Variables

- `mapping(bytes32 => Vote) private votes` - Vote records by vote ID
- `mapping(bytes32 => bool) private usedTokens` - Tracks used anonymous tokens
- `mapping(string => uint256) private constituencyVoteCounts` - Vote counts by constituency
- `mapping(string => bytes32[]) private constituencyVoteIds` - Vote IDs by constituency
- `address public admin` - Contract administrator
- `uint256 public totalVotes` - Total votes submitted
- `bytes32[] private allVoteIds` - All vote IDs for tallying

## Functions

### Vote Submission

#### submitVote

```solidity
function submitVote(
    bytes32 anonymousToken,
    string memory encryptedVote,
    string memory zkProof,
    string memory constituencyId
) external returns (bytes32 voteId)
```

Submits an encrypted vote with anonymous token.

**Parameters:**
- `anonymousToken`: UUID v4 anonymous voting token (single-use)
- `encryptedVote`: AES-256-GCM encrypted vote data
- `zkProof`: Zero-knowledge proof for vote validity
- `constituencyId`: Constituency where vote is cast

**Returns:**
- `voteId`: Unique identifier for the submitted vote

**Emits:**
- `VoteSubmitted(voteId, anonymousToken, constituencyId, blockNumber, timestamp)`

**Requirements:**
- Anonymous token must not be zero
- Encrypted vote must not be empty
- ZK proof must not be empty
- Constituency ID must not be empty
- Token must not have been used before

**Example:**
```typescript
const anonymousToken = ethers.keccak256(ethers.toUtf8Bytes("uuid-v4-token"));
const encryptedVote = "encrypted_vote_data_aes256_gcm";
const zkProof = "sha256_based_zk_proof_simulation";
const constituencyId = "const-001";

const tx = await voteLedger.submitVote(
    anonymousToken,
    encryptedVote,
    zkProof,
    constituencyId
);
const receipt = await tx.wait();
```

### Vote Retrieval

#### getVote

```solidity
function getVote(bytes32 voteId) external view returns (
    string memory encryptedVote,
    uint256 blockNumber,
    uint256 timestamp,
    string memory constituencyId
)
```

Retrieves vote information by vote ID (public verification).

**Parameters:**
- `voteId`: Unique vote identifier

**Returns:**
- `encryptedVote`: Encrypted vote data (not decrypted)
- `blockNumber`: Block where vote was recorded
- `timestamp`: When vote was submitted
- `constituencyId`: Constituency of the vote

**Requirements:**
- Vote must exist

**Note:** This function does NOT expose the anonymous token, maintaining voter anonymity.

#### getVoteDetails

```solidity
function getVoteDetails(bytes32 voteId) external view onlyAdmin returns (
    bytes32 anonymousToken,
    string memory encryptedVote,
    string memory zkProof,
    string memory constituencyId,
    uint256 blockNumber,
    uint256 timestamp
)
```

Retrieves complete vote details including ZK proof (admin only).

**Access:** Admin only

**Parameters:**
- `voteId`: Unique vote identifier

**Returns:**
- `anonymousToken`: Token used for submission
- `encryptedVote`: Encrypted vote data
- `zkProof`: Zero-knowledge proof
- `constituencyId`: Constituency of the vote
- `blockNumber`: Block where vote was recorded
- `timestamp`: When vote was submitted

### Constituency-Based Counting

#### getConstituencyVoteCount

```solidity
function getConstituencyVoteCount(string memory constituencyId) 
    external 
    view 
    returns (uint256 count)
```

Gets vote count for a specific constituency.

**Parameters:**
- `constituencyId`: Constituency identifier

**Returns:**
- `count`: Number of votes in constituency

#### getConstituencyVoteIds

```solidity
function getConstituencyVoteIds(string memory constituencyId) 
    external 
    view 
    returns (bytes32[] memory voteIds)
```

Gets all vote IDs for a constituency (used for tallying).

**Parameters:**
- `constituencyId`: Constituency identifier

**Returns:**
- `voteIds`: Array of vote IDs

### Global Statistics

#### getTotalVotes

```solidity
function getTotalVotes() external view returns (uint256 count)
```

Gets total number of votes across all constituencies.

**Returns:**
- `count`: Total votes submitted

#### getAllVoteIds

```solidity
function getAllVoteIds() external view returns (bytes32[] memory voteIds)
```

Gets all vote IDs in the system (used for complete election tallying).

**Returns:**
- `voteIds`: Array of all vote IDs

### Token Management

#### isTokenUsed

```solidity
function isTokenUsed(bytes32 anonymousToken) external view returns (bool used)
```

Checks if an anonymous token has been used.

**Parameters:**
- `anonymousToken`: Token to check

**Returns:**
- `used`: True if token has been used

### Admin Functions

#### transferAdmin

```solidity
function transferAdmin(address newAdmin) external onlyAdmin
```

Transfers admin role to a new address.

**Access:** Admin only

**Parameters:**
- `newAdmin`: Address of new admin

**Requirements:**
- New admin address must not be zero address

## Events

### VoteSubmitted

```solidity
event VoteSubmitted(
    bytes32 indexed voteId,
    bytes32 indexed anonymousToken,
    string constituencyId,
    uint256 blockNumber,
    uint256 timestamp
)
```

Emitted when a vote is successfully submitted.

**Parameters:**
- `voteId`: Unique vote identifier (indexed)
- `anonymousToken`: Anonymous voting token (indexed)
- `constituencyId`: Constituency where vote was cast
- `blockNumber`: Block number where vote was recorded
- `timestamp`: Submission timestamp

## Security Features

### Anonymity Guarantees

1. **No Voter Identity**: Contract never stores or receives voter identity
2. **Single-Use Tokens**: Anonymous tokens can only be used once
3. **Public Verification**: `getVote()` does not expose anonymous token
4. **Encrypted Storage**: Votes stored encrypted, never in plaintext
5. **Unlinkable**: No way to link vote to voter even with full blockchain access

### Access Control

- **Public Functions**: `submitVote`, `getVote`, `getConstituencyVoteCount`, `getTotalVotes`, `isTokenUsed`
- **Admin Functions**: `getVoteDetails`, `transferAdmin`

### Input Validation

- All inputs validated for non-empty/non-zero values
- Token reuse prevented through `usedTokens` mapping
- Vote existence checked before retrieval

## Integration with VoterRegistry (Chain 1)

```typescript
// Backend orchestration
async function castVote(voterHash, encryptedVote, zkProof) {
    // 1. Generate anonymous token
    const anonymousToken = generateUUID();
    
    // 2. Submit to Chain 2 (VoteLedger)
    const voteId = await voteLedger.submitVote(
        anonymousToken,
        encryptedVote,
        zkProof,
        constituencyId
    );
    
    // 3. Mark voted on Chain 1 (VoterRegistry)
    await voterRegistry.markVoted(voterHash);
    
    // 4. Purge token mapping
    deleteTokenMapping(anonymousToken);
    
    return { voteId, blockNumber, timestamp };
}
```

## Gas Optimization

- Uses `bytes32` for vote IDs and tokens (cheaper than strings)
- Efficient storage patterns with mappings
- Events for off-chain indexing
- Minimal on-chain computation

## Testing

Comprehensive test suite covers:
- Vote submission with validation
- Token reuse prevention
- Constituency-based counting
- Block metadata storage
- Admin access control
- Anonymity guarantees
- Event emission

Run tests:
```bash
cd apps/contracts
npm test test/VoteLedger.test.ts
```

## Deployment

Deploy to local Hardhat network:
```bash
cd apps/contracts
npx hardhat run scripts/deploy-vote-ledger.ts --network localhost
```

## Example Usage

### Submit Vote

```typescript
import { ethers } from "hardhat";

const voteLedger = await ethers.getContractAt("VoteLedger", contractAddress);

const anonymousToken = ethers.keccak256(ethers.toUtf8Bytes("uuid-v4-token"));
const encryptedVote = "encrypted_vote_data";
const zkProof = "zk_proof_data";
const constituencyId = "const-001";

const tx = await voteLedger.submitVote(
    anonymousToken,
    encryptedVote,
    zkProof,
    constituencyId
);

const receipt = await tx.wait();
console.log("Vote submitted at block:", receipt.blockNumber);
```

### Verify Vote

```typescript
const vote = await voteLedger.getVote(voteId);

console.log("Encrypted Vote:", vote.encryptedVote);
console.log("Block Number:", vote.blockNumber);
console.log("Timestamp:", vote.timestamp);
console.log("Constituency:", vote.constituencyId);
```

### Get Constituency Tally

```typescript
const voteCount = await voteLedger.getConstituencyVoteCount("const-001");
console.log("Total votes in constituency:", voteCount);

const voteIds = await voteLedger.getConstituencyVoteIds("const-001");
console.log("Vote IDs:", voteIds);
```

## Audit Considerations

1. **Anonymity**: Verify no voter identity is stored or logged
2. **Token Security**: Ensure tokens are cryptographically random and single-use
3. **Encryption**: Verify votes are encrypted before submission
4. **Access Control**: Confirm admin functions are properly restricted
5. **Event Emission**: Ensure all state changes emit events
6. **Gas Limits**: Test with large numbers of votes

## Future Enhancements

1. **Real ZK-SNARKs**: Replace SHA256 simulation with circom + snarkjs
2. **Homomorphic Encryption**: Enable tallying without decryption
3. **Batch Submission**: Allow multiple votes in single transaction
4. **Vote Invalidation**: Support re-voting by invalidating previous votes
5. **Constituency Validation**: Add constituency registry for validation

## License

MIT License - See LICENSE file for details
