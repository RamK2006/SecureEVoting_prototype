import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

/**
 * Seed script for populating test data after deployment
 * Reads deployment info and adds additional test voters and elections
 */

interface DeploymentInfo {
  network: string;
  chainId: number;
  deployer: string;
  contracts: {
    voterRegistry: string;
    voteLedger: string;
    electionManager: string;
  };
  constituencies: string[];
}

async function main() {
  console.log('='.repeat(60));
  console.log('SecureVote - Seeding Additional Test Data');
  console.log('='.repeat(60));
  console.log();

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId);
  console.log();

  // Load deployment info
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}. Please run deploy-all.ts first.`);
  }
  
  const deploymentInfo: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log('Loaded deployment info from:', deploymentFile);
  console.log();

  // Get signer
  const [deployer, ...testAccounts] = await ethers.getSigners();
  console.log('Seeding with account:', deployer.address);
  console.log();

  // Connect to deployed contracts
  const voterRegistry = await ethers.getContractAt(
    'VoterRegistry',
    deploymentInfo.contracts.voterRegistry
  );
  
  const voteLedger = await ethers.getContractAt(
    'VoteLedger',
    deploymentInfo.contracts.voteLedger
  );
  
  const electionManager = await ethers.getContractAt(
    'ElectionManager',
    deploymentInfo.contracts.electionManager
  );

  console.log('Connected to contracts:');
  console.log('  VoterRegistry:', deploymentInfo.contracts.voterRegistry);
  console.log('  VoteLedger:', deploymentInfo.contracts.voteLedger);
  console.log('  ElectionManager:', deploymentInfo.contracts.electionManager);
  console.log();

  // ========================================
  // SEED ADDITIONAL VOTERS
  // ========================================
  console.log('Seeding Additional Test Voters');
  console.log('-'.repeat(60));
  
  const additionalVoters = 20; // Add 20 more voters
  const seededVoters = [];
  
  for (let i = 0; i < additionalVoters; i++) {
    // Generate unique voter hash
    const voterHash = ethers.keccak256(
      ethers.toUtf8Bytes(`seed-voter-${i}-${Date.now()}-${Math.random()}`)
    );
    
    // Distribute across constituencies
    const constituencyId = deploymentInfo.constituencies[i % deploymentInfo.constituencies.length];
    
    try {
      const tx = await voterRegistry.registerVoter(voterHash, constituencyId);
      await tx.wait();
      
      seededVoters.push({
        voterHash,
        constituencyId,
        index: i,
      });
      
      if ((i + 1) % 5 === 0) {
        console.log(`✓ Registered ${i + 1}/${additionalVoters} voters`);
      }
    } catch (error) {
      console.error(`Failed to register voter ${i}:`, error);
    }
  }
  
  console.log(`✓ Successfully registered ${seededVoters.length} additional voters`);
  console.log();

  // ========================================
  // SEED SAMPLE VOTES (for testing)
  // ========================================
  console.log('Seeding Sample Votes');
  console.log('-'.repeat(60));
  
  // Get current election
  const totalElections = await electionManager.totalElections();
  console.log('Total elections:', totalElections.toString());
  
  if (totalElections > 0n) {
    // Submit some test votes
    const votesToSubmit = Math.min(5, seededVoters.length);
    
    for (let i = 0; i < votesToSubmit; i++) {
      const voter = seededVoters[i];
      
      // Generate anonymous token
      const anonymousToken = ethers.keccak256(
        ethers.toUtf8Bytes(`anonymous-token-${i}-${Date.now()}-${Math.random()}`)
      );
      
      // Simulate encrypted vote (in production, this would be AES-256 encrypted)
      const encryptedVote = JSON.stringify({
        encrypted: true,
        data: ethers.hexlify(ethers.randomBytes(64)),
        iv: ethers.hexlify(ethers.randomBytes(12)),
        authTag: ethers.hexlify(ethers.randomBytes(16)),
      });
      
      // Simulate ZK proof (in production, this would be a real zero-knowledge proof)
      const zkProof = JSON.stringify({
        commitment: ethers.hexlify(ethers.randomBytes(32)),
        challenge: ethers.hexlify(ethers.randomBytes(32)),
        response: ethers.hexlify(ethers.randomBytes(32)),
        proofType: 'sha256-simulation',
      });
      
      try {
        // Submit vote to VoteLedger
        const voteTx = await voteLedger.submitVote(
          anonymousToken,
          encryptedVote,
          zkProof,
          voter.constituencyId
        );
        await voteTx.wait();
        
        // Mark voter as voted in VoterRegistry
        const markTx = await voterRegistry.markVoted(voter.voterHash);
        await markTx.wait();
        
        console.log(`✓ Submitted vote ${i + 1}/${votesToSubmit} (Constituency: ${voter.constituencyId})`);
      } catch (error) {
        console.error(`Failed to submit vote ${i}:`, error);
      }
    }
    
    console.log();
  } else {
    console.log('No elections found. Skipping vote seeding.');
    console.log();
  }

  // ========================================
  // DISPLAY STATISTICS
  // ========================================
  console.log('='.repeat(60));
  console.log('SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log();
  
  const totalRegistered = await voterRegistry.getTotalRegistered();
  const totalVotes = await voteLedger.getTotalVotes();
  
  console.log('VoterRegistry Statistics:');
  console.log('  Total Registered Voters:', totalRegistered.toString());
  console.log();
  
  console.log('VoteLedger Statistics:');
  console.log('  Total Votes Cast:', totalVotes.toString());
  console.log();
  
  console.log('Constituency Breakdown:');
  for (const constituencyId of deploymentInfo.constituencies) {
    const voteCount = await voteLedger.getConstituencyVoteCount(constituencyId);
    console.log(`  ${constituencyId}: ${voteCount.toString()} votes`);
  }
  console.log();
  
  console.log('✓ Seeding completed successfully!');
  console.log('='.repeat(60));
}

// Execute seeding
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
