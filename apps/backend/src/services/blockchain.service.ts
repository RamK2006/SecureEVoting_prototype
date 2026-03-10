import { Web3 } from 'web3';
import config from '../config/env';
import logger from '../config/logger';

// Import contract ABIs (will be generated after deployment)
let VoterRegistryABI: any;
let VoteLedgerABI: any;
let ElectionManagerABI: any;

try {
  VoterRegistryABI = require('../../../contracts/exports/abis/VoterRegistry.json');
  VoteLedgerABI = require('../../../contracts/exports/abis/VoteLedger.json');
  ElectionManagerABI = require('../../../contracts/exports/abis/ElectionManager.json');
} catch (error) {
  logger.warn('Contract ABIs not found. Please deploy contracts first.');
}

class BlockchainService {
  private web3: Web3;
  private voterRegistry: any;
  private voteLedger: any;
  private electionManager: any;

  constructor() {
    this.web3 = new Web3(config.blockchainRpcUrl);
    
    if (config.voterRegistryAddress && VoterRegistryABI) {
      this.voterRegistry = new this.web3.eth.Contract(
        VoterRegistryABI,
        config.voterRegistryAddress
      );
    }
    
    if (config.voteLedgerAddress && VoteLedgerABI) {
      this.voteLedger = new this.web3.eth.Contract(
        VoteLedgerABI,
        config.voteLedgerAddress
      );
    }
    
    if (config.electionManagerAddress && ElectionManagerABI) {
      this.electionManager = new this.web3.eth.Contract(
        ElectionManagerABI,
        config.electionManagerAddress
      );
    }
  }

  async registerVoter(voterHash: string, constituencyId: string): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    return await this.voterRegistry.methods
      .registerVoter(voterHash, constituencyId)
      .send({ from: accounts[0], gas: 500000 });
  }

  async isEligible(voterHash: string): Promise<boolean> {
    return await this.voterRegistry.methods.isEligible(voterHash).call();
  }

  async hasVoted(voterHash: string): Promise<boolean> {
    return await this.voterRegistry.methods.hasVoted(voterHash).call();
  }

  async markVoted(voterHash: string): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    return await this.voterRegistry.methods
      .markVoted(voterHash)
      .send({ from: accounts[0], gas: 200000 });
  }

  async submitVote(
    anonymousToken: string,
    encryptedVote: string,
    zkProof: string,
    constituencyId: string
  ): Promise<any> {
    const accounts = await this.web3.eth.getAccounts();
    const tx = await this.voteLedger.methods
      .submitVote(anonymousToken, encryptedVote, zkProof, constituencyId)
      .send({ from: accounts[0], gas: 500000 });
    
    return tx;
  }

  async getVote(voteId: string): Promise<any> {
    return await this.voteLedger.methods.getVote(voteId).call();
  }

  async getTotalVotes(): Promise<number> {
    const total = await this.voteLedger.methods.getTotalVotes().call();
    return Number(total);
  }

  async getConstituencyVoteCount(constituencyId: string): Promise<number> {
    const count = await this.voteLedger.methods
      .getConstituencyVoteCount(constituencyId)
      .call();
    return Number(count);
  }

  async getActiveElection(): Promise<string> {
    return await this.electionManager.methods.getActiveElection().call();
  }

  async getElectionStatus(electionId: string): Promise<any> {
    return await this.electionManager.methods.getElectionStatus(electionId).call();
  }

  async getCandidates(electionId: string): Promise<string[]> {
    return await this.electionManager.methods.getCandidates(electionId).call();
  }

  async getCandidate(electionId: string, candidateId: string): Promise<any> {
    return await this.electionManager.methods
      .getCandidate(electionId, candidateId)
      .call();
  }
}

export default new BlockchainService();
