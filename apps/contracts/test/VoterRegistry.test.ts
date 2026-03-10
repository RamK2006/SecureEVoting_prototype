import { expect } from 'chai';
import { ethers } from 'hardhat';
import { VoterRegistry } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('VoterRegistry', function () {
  let voterRegistry: VoterRegistry;
  let admin: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let voter3: SignerWithAddress;

  // Test data
  const CONSTITUENCY_1 = 'const-001';
  const CONSTITUENCY_2 = 'const-002';
  const VOTER_HASH_1 = ethers.keccak256(ethers.toUtf8Bytes('voter1-nationalid'));
  const VOTER_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes('voter2-nationalid'));
  const VOTER_HASH_3 = ethers.keccak256(ethers.toUtf8Bytes('voter3-nationalid'));

  beforeEach(async function () {
    // Get signers
    [admin, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy contract
    const VoterRegistryFactory = await ethers.getContractFactory('VoterRegistry');
    voterRegistry = await VoterRegistryFactory.deploy();
    await voterRegistry.waitForDeployment();

    // Add constituencies
    await voterRegistry.connect(admin).addConstituency(CONSTITUENCY_1);
    await voterRegistry.connect(admin).addConstituency(CONSTITUENCY_2);
  });

  describe('Deployment', function () {
    it('Should set the deployer as admin', async function () {
      expect(await voterRegistry.admin()).to.equal(admin.address);
    });

    it('Should initialize with zero registered voters', async function () {
      expect(await voterRegistry.getTotalRegistered()).to.equal(0);
    });

    it('Should initialize with zero voted count', async function () {
      expect(await voterRegistry.getTotalVoted()).to.equal(0);
    });
  });

  describe('Constituency Management', function () {
    it('Should allow admin to add constituency', async function () {
      const newConstituency = 'const-003';
      await expect(voterRegistry.connect(admin).addConstituency(newConstituency))
        .to.emit(voterRegistry, 'ConstituencyAdded')
        .withArgs(newConstituency, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));

      expect(await voterRegistry.constituencyExists(newConstituency)).to.be.true;
    });

    it('Should reject empty constituency ID', async function () {
      await expect(
        voterRegistry.connect(admin).addConstituency('')
      ).to.be.revertedWith('Constituency ID cannot be empty');
    });

    it('Should reject duplicate constituency', async function () {
      await expect(
        voterRegistry.connect(admin).addConstituency(CONSTITUENCY_1)
      ).to.be.revertedWith('Constituency already exists');
    });

    it('Should reject non-admin adding constituency', async function () {
      await expect(
        voterRegistry.connect(voter1).addConstituency('const-003')
      ).to.be.revertedWith('Only admin can call this function');
    });

    it('Should correctly report constituency existence', async function () {
      expect(await voterRegistry.constituencyExists(CONSTITUENCY_1)).to.be.true;
      expect(await voterRegistry.constituencyExists('non-existent')).to.be.false;
    });
  });

  describe('Voter Registration', function () {
    it('Should register a new voter successfully', async function () {
      await expect(
        voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1)
      )
        .to.emit(voterRegistry, 'VoterRegistered')
        .withArgs(VOTER_HASH_1, CONSTITUENCY_1, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));

      expect(await voterRegistry.getTotalRegistered()).to.equal(1);
    });

    it('Should return voter address on registration', async function () {
      const tx = await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
    });

    it('Should reject registration with zero hash', async function () {
      const zeroHash = ethers.ZeroHash;
      await expect(
        voterRegistry.connect(voter1).registerVoter(zeroHash, CONSTITUENCY_1)
      ).to.be.revertedWith('Invalid voter hash');
    });

    it('Should reject registration with invalid constituency', async function () {
      await expect(
        voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, 'invalid-const')
      ).to.be.revertedWith('Invalid constituency');
    });

    it('Should reject duplicate voter registration', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      
      await expect(
        voterRegistry.connect(voter2).registerVoter(VOTER_HASH_1, CONSTITUENCY_1)
      ).to.be.revertedWith('Voter already registered');
    });

    it('Should increment constituency voter count', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      await voterRegistry.connect(voter2).registerVoter(VOTER_HASH_2, CONSTITUENCY_1);
      
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_1)).to.equal(2);
    });

    it('Should track voters across different constituencies', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      await voterRegistry.connect(voter2).registerVoter(VOTER_HASH_2, CONSTITUENCY_2);
      
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_1)).to.equal(1);
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_2)).to.equal(1);
      expect(await voterRegistry.getTotalRegistered()).to.equal(2);
    });
  });

  describe('Eligibility Checks', function () {
    beforeEach(async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
    });

    it('Should return true for eligible voter', async function () {
      expect(await voterRegistry.isEligible(VOTER_HASH_1)).to.be.true;
    });

    it('Should return false for unregistered voter', async function () {
      expect(await voterRegistry.isEligible(VOTER_HASH_2)).to.be.false;
    });

    it('Should return false for voter who has voted', async function () {
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      expect(await voterRegistry.isEligible(VOTER_HASH_1)).to.be.false;
    });

    it('Should correctly report hasVoted status', async function () {
      expect(await voterRegistry.hasVoted(VOTER_HASH_1)).to.be.false;
      
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      
      expect(await voterRegistry.hasVoted(VOTER_HASH_1)).to.be.true;
    });
  });

  describe('Vote Marking', function () {
    beforeEach(async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
    });

    it('Should mark voter as voted successfully', async function () {
      await expect(voterRegistry.connect(voter1).markVoted(VOTER_HASH_1))
        .to.emit(voterRegistry, 'VoterMarkedVoted')
        .withArgs(VOTER_HASH_1, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));

      expect(await voterRegistry.hasVoted(VOTER_HASH_1)).to.be.true;
      expect(await voterRegistry.getTotalVoted()).to.equal(1);
    });

    it('Should reject marking unregistered voter', async function () {
      await expect(
        voterRegistry.connect(voter1).markVoted(VOTER_HASH_2)
      ).to.be.revertedWith('Voter not registered');
    });

    it('Should reject marking voter as voted twice', async function () {
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      
      await expect(
        voterRegistry.connect(voter1).markVoted(VOTER_HASH_1)
      ).to.be.revertedWith('Voter already marked as voted');
    });

    it('Should increment total voted count', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_2, CONSTITUENCY_1);
      
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      expect(await voterRegistry.getTotalVoted()).to.equal(1);
      
      await voterRegistry.connect(voter2).markVoted(VOTER_HASH_2);
      expect(await voterRegistry.getTotalVoted()).to.equal(2);
    });
  });

  describe('Voter Information Retrieval', function () {
    it('Should return complete voter information', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      
      const [isRegistered, hasVoted, constituencyId, registeredAt, votedAt] = 
        await voterRegistry.getVoterInfo(VOTER_HASH_1);
      
      expect(isRegistered).to.be.true;
      expect(hasVoted).to.be.false;
      expect(constituencyId).to.equal(CONSTITUENCY_1);
      expect(registeredAt).to.be.greaterThan(0);
      expect(votedAt).to.equal(0);
    });

    it('Should return updated information after voting', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      
      const [isRegistered, hasVoted, constituencyId, registeredAt, votedAt] = 
        await voterRegistry.getVoterInfo(VOTER_HASH_1);
      
      expect(isRegistered).to.be.true;
      expect(hasVoted).to.be.true;
      expect(constituencyId).to.equal(CONSTITUENCY_1);
      expect(registeredAt).to.be.greaterThan(0);
      expect(votedAt).to.be.greaterThan(0);
      expect(votedAt).to.be.greaterThanOrEqual(registeredAt);
    });

    it('Should return default values for unregistered voter', async function () {
      const [isRegistered, hasVoted, constituencyId, registeredAt, votedAt] = 
        await voterRegistry.getVoterInfo(VOTER_HASH_2);
      
      expect(isRegistered).to.be.false;
      expect(hasVoted).to.be.false;
      expect(constituencyId).to.equal('');
      expect(registeredAt).to.equal(0);
      expect(votedAt).to.equal(0);
    });
  });

  describe('Admin Management', function () {
    it('Should allow admin to transfer admin role', async function () {
      await voterRegistry.connect(admin).transferAdmin(voter1.address);
      expect(await voterRegistry.admin()).to.equal(voter1.address);
    });

    it('Should reject transfer to zero address', async function () {
      await expect(
        voterRegistry.connect(admin).transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid admin address');
    });

    it('Should reject non-admin transferring admin role', async function () {
      await expect(
        voterRegistry.connect(voter1).transferAdmin(voter2.address)
      ).to.be.revertedWith('Only admin can call this function');
    });

    it('Should allow new admin to perform admin functions', async function () {
      await voterRegistry.connect(admin).transferAdmin(voter1.address);
      
      await expect(
        voterRegistry.connect(voter1).addConstituency('const-003')
      ).to.not.be.reverted;
    });

    it('Should prevent old admin from performing admin functions', async function () {
      await voterRegistry.connect(admin).transferAdmin(voter1.address);
      
      await expect(
        voterRegistry.connect(admin).addConstituency('const-003')
      ).to.be.revertedWith('Only admin can call this function');
    });
  });

  describe('Integration Scenarios', function () {
    it('Should handle complete voter lifecycle', async function () {
      // Register voter
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      expect(await voterRegistry.isEligible(VOTER_HASH_1)).to.be.true;
      
      // Mark as voted
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      expect(await voterRegistry.isEligible(VOTER_HASH_1)).to.be.false;
      expect(await voterRegistry.hasVoted(VOTER_HASH_1)).to.be.true;
      
      // Verify counts
      expect(await voterRegistry.getTotalRegistered()).to.equal(1);
      expect(await voterRegistry.getTotalVoted()).to.equal(1);
    });

    it('Should handle multiple voters in same constituency', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      await voterRegistry.connect(voter2).registerVoter(VOTER_HASH_2, CONSTITUENCY_1);
      await voterRegistry.connect(voter3).registerVoter(VOTER_HASH_3, CONSTITUENCY_1);
      
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_1)).to.equal(3);
      expect(await voterRegistry.getTotalRegistered()).to.equal(3);
      
      await voterRegistry.connect(voter1).markVoted(VOTER_HASH_1);
      await voterRegistry.connect(voter2).markVoted(VOTER_HASH_2);
      
      expect(await voterRegistry.getTotalVoted()).to.equal(2);
      expect(await voterRegistry.isEligible(VOTER_HASH_1)).to.be.false;
      expect(await voterRegistry.isEligible(VOTER_HASH_2)).to.be.false;
      expect(await voterRegistry.isEligible(VOTER_HASH_3)).to.be.true;
    });

    it('Should maintain separate counts for different constituencies', async function () {
      await voterRegistry.connect(voter1).registerVoter(VOTER_HASH_1, CONSTITUENCY_1);
      await voterRegistry.connect(voter2).registerVoter(VOTER_HASH_2, CONSTITUENCY_2);
      
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_1)).to.equal(1);
      expect(await voterRegistry.getConstituencyVoterCount(CONSTITUENCY_2)).to.equal(1);
      expect(await voterRegistry.getTotalRegistered()).to.equal(2);
    });
  });

  describe('Gas Optimization', function () {
    it('Should efficiently handle batch registrations', async function () {
      const voters = [VOTER_HASH_1, VOTER_HASH_2, VOTER_HASH_3];
      
      for (const voterHash of voters) {
        await voterRegistry.connect(voter1).registerVoter(voterHash, CONSTITUENCY_1);
      }
      
      expect(await voterRegistry.getTotalRegistered()).to.equal(3);
    });
  });
});
