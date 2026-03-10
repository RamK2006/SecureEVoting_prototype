/**
 * Contract addresses for backend integration
 * Generated at: 2026-03-09T18:57:41.263Z
 * Network: localhost (Chain ID: 1337)
 */

export const CONTRACT_ADDRESSES = {
  VOTER_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  VOTE_LEDGER: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ELECTION_MANAGER: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
} as const;

export const BLOCKCHAIN_CONFIG = {
  NETWORK: 'localhost',
  CHAIN_ID: 1337,
  RPC_URL: 'http://127.0.0.1:8545',
} as const;

// Load ABIs from JSON files
import voterRegistryAbi from './abis/VoterRegistry.json';
import voteLedgerAbi from './abis/VoteLedger.json';
import electionManagerAbi from './abis/ElectionManager.json';

export const CONTRACT_ABIS = {
  VOTER_REGISTRY: voterRegistryAbi,
  VOTE_LEDGER: voteLedgerAbi,
  ELECTION_MANAGER: electionManagerAbi,
} as const;
