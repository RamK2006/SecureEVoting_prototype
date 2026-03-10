import { expect } from "chai";
import { ethers } from "hardhat";
import { VoteLedger } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VoteLedger", function () {
  let voteLedger: VoteLedger;
  let admin: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  beforeEach(async function () {
    [admin, voter1, voter2] = await ethers.getSigners();

    const VoteLedger = await ethers.getContractFactory("VoteLedger");
    voteLedger = await VoteLedger.deploy();
    await voteLedger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await voteLedger.admin()).to.equal(admin.address);
    });

    it("Should initialize with zero votes", async function () {
      expect(await voteLedger.getTotalVotes()).to.equal(0);
    });
  });

  describe("Vote Submission", function () {
    const anonymousToken = ethers.keccak256(ethers.toUtf8Bytes("token-uuid-1"));
    const encryptedVote = "encrypted_vote_data_aes256";
    const zkProof = "zk_proof_sha256_simulation";
    const constituencyId = "const-001";

    it("Should submit a vote successfully", async function () {
      const tx = await voteLedger.submitVote(
        anonymousToken,
        encryptedVote,
        zkProof,
        constituencyId
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // Check total votes increased
      expect(await voteLedger.getTotalVotes()).to.equal(1);

      // Check constituency vote count
      expect(await voteLedger.getConstituencyVoteCount(constituencyId)).to.equal(1);

      // Check token is marked as used
      expect(await voteLedger.isTokenUsed(anonymousToken)).to.be.true;
    });

    it("Should emit VoteSubmitted event", async function () {
      await expect(
        voteLedger.submitVote(anonymousToken, encryptedVote, zkProof, constituencyId)
      )
        .to.emit(voteLedger, "VoteSubmitted")
        .withArgs(
          (voteId: any) => voteId !== ethers.ZeroHash,
          anonymousToken,
          constituencyId,
          (blockNumber: any) => blockNumber > 0,
          (timestamp: any) => timestamp > 0
        );
    });

    it("Should reject empty anonymous token", async function () {
      await expect(
        voteLedger.submitVote(ethers.ZeroHash, encryptedVote, zkProof, constituencyId)
      ).to.be.revertedWith("Invalid anonymous token");
    });

    it("Should reject empty encrypted vote", async function () {
      await expect(
        voteLedger.submitVote(anonymousToken, "", zkProof, constituencyId)
      ).to.be.revertedWith("Encrypted vote cannot be empty");
    });

    it("Should reject empty ZK proof", async function () {
      await expect(
        voteLedger.submitVote(anonymousToken, encryptedVote, "", constituencyId)
      ).to.be.revertedWith("ZK proof cannot be empty");
    });

    it("Should reject empty constituency ID", async function () {
      await expect(
        voteLedger.submitVote(anonymousToken, encryptedVote, zkProof, "")
      ).to.be.revertedWith("Constituency ID cannot be empty");
    });

    it("Should reject reuse of anonymous token", async function () {
      // Submit first vote
      await voteLedger.submitVote(anonymousToken, encryptedVote, zkProof, constituencyId);

      // Try to reuse same token
      await expect(
        voteLedger.submitVote(anonymousToken, "different_vote", zkProof, constituencyId)
      ).to.be.revertedWith("Token already used");
    });

    it("Should generate unique vote IDs", async function () {
      const token1 = ethers.keccak256(ethers.toUtf8Bytes("token-1"));
      const token2 = ethers.keccak256(ethers.toUtf8Bytes("token-2"));

      const tx1 = await voteLedger.submitVote(token1, encryptedVote, zkProof, constituencyId);
      const receipt1 = await tx1.wait();
      const event1 = receipt1?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      const voteId1 = event1 ? voteLedger.interface.parseLog(event1)?.args[0] : null;

      const tx2 = await voteLedger.submitVote(token2, encryptedVote, zkProof, constituencyId);
      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      const voteId2 = event2 ? voteLedger.interface.parseLog(event2)?.args[0] : null;

      expect(voteId1).to.not.equal(voteId2);
    });
  });

  describe("Vote Retrieval", function () {
    let voteId: string;
    const anonymousToken = ethers.keccak256(ethers.toUtf8Bytes("token-uuid-1"));
    const encryptedVote = "encrypted_vote_data_aes256";
    const zkProof = "zk_proof_sha256_simulation";
    const constituencyId = "const-001";

    beforeEach(async function () {
      const tx = await voteLedger.submitVote(
        anonymousToken,
        encryptedVote,
        zkProof,
        constituencyId
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      voteId = event ? voteLedger.interface.parseLog(event)?.args[0] : "";
    });

    it("Should retrieve vote by ID", async function () {
      const vote = await voteLedger.getVote(voteId);

      expect(vote.encryptedVote).to.equal(encryptedVote);
      expect(vote.constituencyId).to.equal(constituencyId);
      expect(vote.blockNumber).to.be.greaterThan(0);
      expect(vote.timestamp).to.be.greaterThan(0);
    });

    it("Should reject retrieval of non-existent vote", async function () {
      const fakeVoteId = ethers.keccak256(ethers.toUtf8Bytes("fake-vote-id"));
      await expect(voteLedger.getVote(fakeVoteId)).to.be.revertedWith("Vote does not exist");
    });

    it("Should retrieve complete vote details (admin only)", async function () {
      const details = await voteLedger.getVoteDetails(voteId);

      expect(details.anonymousToken).to.equal(anonymousToken);
      expect(details.encryptedVote).to.equal(encryptedVote);
      expect(details.zkProof).to.equal(zkProof);
      expect(details.constituencyId).to.equal(constituencyId);
      expect(details.blockNumber).to.be.greaterThan(0);
      expect(details.timestamp).to.be.greaterThan(0);
    });

    it("Should reject non-admin access to vote details", async function () {
      await expect(
        voteLedger.connect(voter1).getVoteDetails(voteId)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Constituency-Based Counting", function () {
    it("Should track votes by constituency", async function () {
      const const1 = "const-001";
      const const2 = "const-002";

      // Submit 3 votes to constituency 1
      for (let i = 0; i < 3; i++) {
        const token = ethers.keccak256(ethers.toUtf8Bytes(`token-const1-${i}`));
        await voteLedger.submitVote(token, "encrypted", "proof", const1);
      }

      // Submit 2 votes to constituency 2
      for (let i = 0; i < 2; i++) {
        const token = ethers.keccak256(ethers.toUtf8Bytes(`token-const2-${i}`));
        await voteLedger.submitVote(token, "encrypted", "proof", const2);
      }

      expect(await voteLedger.getConstituencyVoteCount(const1)).to.equal(3);
      expect(await voteLedger.getConstituencyVoteCount(const2)).to.equal(2);
      expect(await voteLedger.getTotalVotes()).to.equal(5);
    });

    it("Should retrieve vote IDs by constituency", async function () {
      const const1 = "const-001";

      // Submit 2 votes
      const token1 = ethers.keccak256(ethers.toUtf8Bytes("token-1"));
      const token2 = ethers.keccak256(ethers.toUtf8Bytes("token-2"));

      await voteLedger.submitVote(token1, "encrypted1", "proof1", const1);
      await voteLedger.submitVote(token2, "encrypted2", "proof2", const1);

      const voteIds = await voteLedger.getConstituencyVoteIds(const1);
      expect(voteIds.length).to.equal(2);
    });

    it("Should retrieve all vote IDs", async function () {
      const token1 = ethers.keccak256(ethers.toUtf8Bytes("token-1"));
      const token2 = ethers.keccak256(ethers.toUtf8Bytes("token-2"));
      const token3 = ethers.keccak256(ethers.toUtf8Bytes("token-3"));

      await voteLedger.submitVote(token1, "encrypted1", "proof1", "const-001");
      await voteLedger.submitVote(token2, "encrypted2", "proof2", "const-002");
      await voteLedger.submitVote(token3, "encrypted3", "proof3", "const-001");

      const allVoteIds = await voteLedger.getAllVoteIds();
      expect(allVoteIds.length).to.equal(3);
    });
  });

  describe("Block Metadata", function () {
    it("Should store block number with vote", async function () {
      const token = ethers.keccak256(ethers.toUtf8Bytes("token-1"));
      const tx = await voteLedger.submitVote(token, "encrypted", "proof", "const-001");
      const receipt = await tx.wait();

      const event = receipt?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      const voteId = event ? voteLedger.interface.parseLog(event)?.args[0] : "";

      const vote = await voteLedger.getVote(voteId);
      expect(vote.blockNumber).to.equal(receipt?.blockNumber);
    });

    it("Should store timestamp with vote", async function () {
      const token = ethers.keccak256(ethers.toUtf8Bytes("token-1"));
      const tx = await voteLedger.submitVote(token, "encrypted", "proof", "const-001");
      await tx.wait();

      const block = await ethers.provider.getBlock("latest");
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      const voteId = event ? voteLedger.interface.parseLog(event)?.args[0] : "";

      const vote = await voteLedger.getVote(voteId);
      expect(vote.timestamp).to.equal(block?.timestamp);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to transfer admin role", async function () {
      await voteLedger.transferAdmin(voter1.address);
      expect(await voteLedger.admin()).to.equal(voter1.address);
    });

    it("Should reject non-admin transfer attempt", async function () {
      await expect(
        voteLedger.connect(voter1).transferAdmin(voter2.address)
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should reject transfer to zero address", async function () {
      await expect(
        voteLedger.transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid admin address");
    });
  });

  describe("Anonymity Guarantees", function () {
    it("Should not expose voter identity in vote records", async function () {
      const token = ethers.keccak256(ethers.toUtf8Bytes("anonymous-token"));
      const tx = await voteLedger.submitVote(token, "encrypted", "proof", "const-001");
      const receipt = await tx.wait();

      const event = receipt?.logs.find((log: any) => {
        try {
          return voteLedger.interface.parseLog(log)?.name === "VoteSubmitted";
        } catch {
          return false;
        }
      });
      const voteId = event ? voteLedger.interface.parseLog(event)?.args[0] : "";

      // Public getVote should not expose token
      const publicVote = await voteLedger.getVote(voteId);
      expect(publicVote).to.not.have.property("anonymousToken");

      // Only admin can see token via getVoteDetails
      const adminVote = await voteLedger.getVoteDetails(voteId);
      expect(adminVote.anonymousToken).to.equal(token);
    });

    it("Should prevent linking votes through token reuse", async function () {
      const token = ethers.keccak256(ethers.toUtf8Bytes("token-1"));

      await voteLedger.submitVote(token, "vote1", "proof1", "const-001");

      // Second attempt with same token should fail
      await expect(
        voteLedger.submitVote(token, "vote2", "proof2", "const-001")
      ).to.be.revertedWith("Token already used");
    });
  });
});
