import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive deployment script for SecureVote blockchain e-voting system
 * Deploys all three contracts in correct order and seeds initial test data
 */

interface DeploymentResult {
  network: string;
  chainId: number;
  deployer: string;
  contracts: {
    voterRegistry: string;
    voteLedger: string;
    electionManager: string;
  };
  constituencies: string[];
  testVoters: Array<{
    voterHash: string;
    constituencyId: string;
    address: string;
  }>;
  testElection?: {
    electionId: string;
    name: string;
    candidates: Array<{
      id: string;
      name: string;
      party: string;
      constituency: string;
    }>;
  };
  timestamp: string;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SecureVote Blockchain E-Voting System - Full Deployment');
  console.log('='.repeat(60));
  console.log();

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId);
  console.log();

  // Get deployer account
  const [deployer, ...testAccounts] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');
  console.log('Available test accounts:', testAccounts.length);
  console.log();

  // ========================================
  // PHASE 1: Deploy VoterRegistry (Chain 1)
  // ========================================
  console.log('PHASE 1: Deploying VoterRegistry (Chain 1 - Identity & Eligibility)');
  console.log('-'.repeat(60));
  
  const VoterRegistryFactory = await ethers.getContractFactory('VoterRegistry');
  const voterRegistry = await VoterRegistryFactory.deploy();
  await voterRegistry.waitForDeployment();
  
  const voterRegistryAddress = await voterRegistry.getAddress();
  console.log('✓ VoterRegistry deployed to:', voterRegistryAddress);
  console.log('  Admin:', await voterRegistry.admin());
  console.log();

  // ========================================
  // PHASE 2: Deploy VoteLedger (Chain 2)
  // ========================================
  console.log('PHASE 2: Deploying VoteLedger (Chain 2 - Anonymous Votes)');
  console.log('-'.repeat(60));
  
  const VoteLedgerFactory = await ethers.getContractFactory('VoteLedger');
  const voteLedger = await VoteLedgerFactory.deploy();
  await voteLedger.waitForDeployment();
  
  const voteLedgerAddress = await voteLedger.getAddress();
  console.log('✓ VoteLedger deployed to:', voteLedgerAddress);
  console.log('  Admin:', await voteLedger.admin());
  console.log();

  // ========================================
  // PHASE 3: Deploy ElectionManager
  // ========================================
  console.log('PHASE 3: Deploying ElectionManager (Lifecycle & Results)');
  console.log('-'.repeat(60));
  
  const ElectionManagerFactory = await ethers.getContractFactory('ElectionManager');
  const electionManager = await ElectionManagerFactory.deploy();
  await electionManager.waitForDeployment();
  
  const electionManagerAddress = await electionManager.getAddress();
  console.log('✓ ElectionManager deployed to:', electionManagerAddress);
  console.log('  Admin:', await electionManager.admin());
  console.log();

  // ========================================
  // PHASE 4: Seed Initial Constituencies
  // ========================================
  console.log('PHASE 4: Seeding Initial Constituencies');
  console.log('-'.repeat(60));
  
  const constituencies = [
    'const-001', // District 1
    'const-002', // District 2
    'const-003', // District 3
    'const-004', // District 4
    'const-005', // District 5
  ];
  
  for (const constituencyId of constituencies) {
    const tx = await voterRegistry.addConstituency(constituencyId);
    await tx.wait();
    console.log(`✓ Added constituency: ${constituencyId}`);
  }
  console.log();

  // ========================================
  // PHASE 5: Register Test Voters
  // ========================================
  console.log('PHASE 5: Registering Test Voters');
  console.log('-'.repeat(60));
  
  const testVoters = [];
  const voterCount = Math.min(10, testAccounts.length); // Register up to 10 test voters
  
  for (let i = 0; i < voterCount; i++) {
    // Simulate hashed national ID (in production, this would be SHA256(nationalId + salt))
    const voterHash = ethers.keccak256(
      ethers.toUtf8Bytes(`test-voter-${i}-nationalid-${Date.now()}`)
    );
    
    const constituencyId = constituencies[i % constituencies.length];
    
    const tx = await voterRegistry.registerVoter(voterHash, constituencyId);
    const receipt = await tx.wait();
    
    testVoters.push({
      voterHash,
      constituencyId,
      address: testAccounts[i].address,
    });
    
    console.log(`✓ Registered voter ${i + 1}/${voterCount}`);
    console.log(`  Hash: ${voterHash.slice(0, 10)}...`);
    console.log(`  Constituency: ${constituencyId}`);
    console.log(`  Address: ${testAccounts[i].address}`);
  }
  console.log();

  // ========================================
  // PHASE 6: Create Test Election (Optional)
  // ========================================
  console.log('PHASE 6: Creating Test Election');
  console.log('-'.repeat(60));
  
  const electionName = 'Test General Election 2024';
  const electionDescription = 'National parliamentary election for testing purposes';
  const startTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
  const endTime = startTime + (24 * 60 * 60); // End in 24 hours
  const allowRevoting = true;
  const revotingWindowMinutes = 30;
  
  const createElectionTx = await electionManager.createElection(
    electionName,
    electionDescription,
    startTime,
    endTime,
    allowRevoting,
    revotingWindowMinutes
  );
  
  const createElectionReceipt = await createElectionTx.wait();
  
  // Extract election ID from event
  let electionId = '';
  if (createElectionReceipt && createElectionReceipt.logs) {
    for (const log of createElectionReceipt.logs) {
      try {
        const parsedLog = electionManager.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsedLog && parsedLog.name === 'ElectionCreated') {
          electionId = parsedLog.args.electionId;
          break;
        }
      } catch (e) {
        // Skip logs that don't match
      }
    }
  }
  
  console.log(`✓ Created election: ${electionName}`);
  console.log(`  Election ID: ${electionId}`);
  console.log(`  Start time: ${new Date(startTime * 1000).toISOString()}`);
  console.log(`  End time: ${new Date(endTime * 1000).toISOString()}`);
  console.log();

  // Add candidates to the election
  const candidates = [
    { id: 'candidate-001', name: 'Alice Johnson', party: 'Progressive Party', constituency: 'const-001' },
    { id: 'candidate-002', name: 'Bob Smith', party: 'Conservative Alliance', constituency: 'const-001' },
    { id: 'candidate-003', name: 'Carol Davis', party: 'Independent', constituency: 'const-002' },
    { id: 'candidate-004', name: 'David Lee', party: 'Green Party', constituency: 'const-002' },
    { id: 'candidate-005', name: 'Emma Wilson', party: 'Labor Union', constituency: 'const-003' },
    { id: 'candidate-006', name: 'Frank Miller', party: 'Progressive Party', constituency: 'const-003' },
  ];
  
  for (const candidate of candidates) {
    const addCandidateTx = await electionManager.addCandidate(
      electionId,
      candidate.id,
      candidate.name,
      candidate.party,
      candidate.constituency
    );
    await addCandidateTx.wait();
    console.log(`✓ Added candidate: ${candidate.name} (${candidate.party}) - ${candidate.constituency}`);
  }
  console.log();

  // Note: Election will start automatically at the scheduled time
  // Or can be started manually after start time with: electionManager.startElection(electionId)
  console.log('Note: Election is scheduled to start at:', new Date(startTime * 1000).toISOString());
  console.log('      To start manually after this time, run:');
  console.log(`      await electionManager.startElection("${electionId}")`);
  console.log();

  // ========================================
  // PHASE 7: Export Contract ABIs and Addresses
  // ========================================
  console.log('PHASE 7: Exporting Contract ABIs and Addresses');
  console.log('-'.repeat(60));
  
  const deploymentResult: DeploymentResult = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      voterRegistry: voterRegistryAddress,
      voteLedger: voteLedgerAddress,
      electionManager: electionManagerAddress,
    },
    constituencies,
    testVoters,
    testElection: {
      electionId,
      name: electionName,
      candidates,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));
  console.log(`✓ Deployment info saved to: ${deploymentFile}`);
  
  // Export ABIs
  const abisDir = path.join(deploymentsDir, 'abis');
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }
  
  // Read and save ABIs from artifacts
  const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  
  const contracts = [
    { name: 'VoterRegistry', file: 'VoterRegistry.sol/VoterRegistry.json' },
    { name: 'VoteLedger', file: 'VoteLedger.sol/VoteLedger.json' },
    { name: 'ElectionManager', file: 'ElectionManager.sol/ElectionManager.json' },
  ];
  
  for (const contract of contracts) {
    const artifactPath = path.join(artifactsDir, contract.file);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    const abiFile = path.join(abisDir, `${contract.name}.json`);
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`✓ Exported ABI: ${contract.name}.json`);
  }
  console.log();

  // ========================================
  // DEPLOYMENT SUMMARY
  // ========================================
  console.log('='.repeat(60));
  console.log('DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  console.log();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId);
  console.log('Deployer:', deployer.address);
  console.log();
  console.log('Contract Addresses:');
  console.log('  VoterRegistry:', voterRegistryAddress);
  console.log('  VoteLedger:', voteLedgerAddress);
  console.log('  ElectionManager:', electionManagerAddress);
  console.log();
  console.log('Initial Data:');
  console.log('  Constituencies:', constituencies.length);
  console.log('  Test Voters:', testVoters.length);
  console.log('  Test Election:', electionId ? 'Created and Started' : 'Not created');
  console.log();
  console.log('Exported Files:');
  console.log('  Deployment Info:', deploymentFile);
  console.log('  ABIs Directory:', abisDir);
  console.log();
  console.log('✓ Deployment completed successfully!');
  console.log('='.repeat(60));
  
  return deploymentResult;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
