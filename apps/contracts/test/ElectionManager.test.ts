import { expect } from "chai";
import { ethers } from "hardhat";
import { ElectionManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ElectionManager", function () {
  let electionManager: ElectionManager;
  let admin: SignerWithAddress;
  let user: SignerWithAddress;
  let electionId: string;

  const ELECTION_NAME = "General Election 2026";
  const ELECTION_DESCRIPTION = "National parliamentary election";
  const ONE_HOUR = 3600;
  const ONE_DAY = 86400;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    const ElectionManager = await ethers.getContractFactory("ElectionManager");
    electionManager = await ElectionManager.deploy();
    await electionManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await electionManager.admin()).to.equal(admin.address);
    });
  });

  describe("Election Creation", function () {
    it("Should create an election with valid parameters", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        ELECTION_NAME,
        ELECTION_DESCRIPTION,
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );

      expect(event).to.not.be.undefined;
    });

    it("Should fail if start time is in the past", async function () {
      const startTime = (await time.latest()) - ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      await expect(
        electionManager.createElection(
          ELECTION_NAME,
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should fail if end time is before start time", async function () {
      const startTime = (await time.latest()) + ONE_DAY;
      const endTime = startTime - ONE_HOUR;

      await expect(
        electionManager.createElection(
          ELECTION_NAME,
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("End time must be after start time");
    });

    it("Should fail if duration is less than 1 hour", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + 1800; // 30 minutes

      await expect(
        electionManager.createElection(
          ELECTION_NAME,
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("Election duration must be at least 1 hour");
    });

    it("Should fail if duration exceeds 7 days", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + 8 * ONE_DAY;

      await expect(
        electionManager.createElection(
          ELECTION_NAME,
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("Election duration cannot exceed 7 days");
    });

    it("Should fail if name is empty", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      await expect(
        electionManager.createElection(
          "",
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("Election name cannot be empty");
    });

    it("Should fail if non-admin tries to create election", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      await expect(
        electionManager.connect(user).createElection(
          ELECTION_NAME,
          ELECTION_DESCRIPTION,
          startTime,
          endTime,
          true,
          30
        )
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Candidate Management", function () {
    beforeEach(async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        ELECTION_NAME,
        ELECTION_DESCRIPTION,
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );
      electionId = event?.args?.[0];
    });

    it("Should add a candidate to an election", async function () {
      const tx = await electionManager.addCandidate(
        electionId,
        "candidate-001",
        "Alice Johnson",
        "Progressive Party",
        "const-001"
      );

      await expect(tx)
        .to.emit(electionManager, "CandidateAdded");
    });

    it("Should retrieve candidate information", async function () {
      await electionManager.addCandidate(
        electionId,
        "candidate-001",
        "Alice Johnson",
        "Progressive Party",
        "const-001"
      );

      const [name, party, constituencyId] = await electionManager.getCandidate(
        electionId,
        "candidate-001"
      );

      expect(name).to.equal("Alice Johnson");
      expect(party).to.equal("Progressive Party");
      expect(constituencyId).to.equal("const-001");
    });

    it("Should get all candidates for an election", async function () {
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

      const candidates = await electionManager.getCandidates(electionId);
      expect(candidates.length).to.equal(2);
      expect(candidates[0]).to.equal("candidate-001");
      expect(candidates[1]).to.equal("candidate-002");
    });

    it("Should fail to add duplicate candidate", async function () {
      await electionManager.addCandidate(
        electionId,
        "candidate-001",
        "Alice Johnson",
        "Progressive Party",
        "const-001"
      );

      await expect(
        electionManager.addCandidate(
          electionId,
          "candidate-001",
          "Alice Johnson",
          "Progressive Party",
          "const-001"
        )
      ).to.be.revertedWith("Candidate already exists");
    });

    it("Should fail if non-admin tries to add candidate", async function () {
      await expect(
        electionManager.connect(user).addCandidate(
          electionId,
          "candidate-001",
          "Alice Johnson",
          "Progressive Party",
          "const-001"
        )
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Election Lifecycle", function () {
    beforeEach(async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        ELECTION_NAME,
        ELECTION_DESCRIPTION,
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );
      electionId = event?.args?.[0];

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
    });

    it("Should start an election at the correct time", async function () {
      await time.increase(ONE_HOUR);

      const tx = await electionManager.startElection(electionId);
      await expect(tx).to.emit(electionManager, "ElectionStarted");

      const activeElectionId = await electionManager.getActiveElection();
      expect(activeElectionId).to.equal(electionId);
    });

    it("Should fail to start election before start time", async function () {
      await expect(
        electionManager.startElection(electionId)
      ).to.be.revertedWith("Election start time not reached");
    });

    it("Should fail to start election without candidates", async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        "Empty Election",
        "No candidates",
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );
      const emptyElectionId = event?.args?.[0];

      await time.increase(ONE_HOUR);

      await expect(
        electionManager.startElection(emptyElectionId)
      ).to.be.revertedWith("Election must have at least 2 candidates");
    });

    it("Should end an election after end time", async function () {
      await time.increase(ONE_HOUR);
      await electionManager.startElection(electionId);

      await time.increase(ONE_DAY);

      const tx = await electionManager.endElection(electionId);
      await expect(tx).to.emit(electionManager, "ElectionEnded");
    });

    it("Should fail to end election before end time", async function () {
      await time.increase(ONE_HOUR);
      await electionManager.startElection(electionId);

      await expect(
        electionManager.endElection(electionId)
      ).to.be.revertedWith("Election end time not reached");
    });

    it("Should check if election is in voting window", async function () {
      await time.increase(ONE_HOUR);
      await electionManager.startElection(electionId);

      const isValid = await electionManager.isInVotingWindow(electionId);
      expect(isValid).to.be.true;

      await time.increase(ONE_DAY);
      const isValidAfter = await electionManager.isInVotingWindow(electionId);
      expect(isValidAfter).to.be.false;
    });
  });

  describe("Results Finalization", function () {
    beforeEach(async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        ELECTION_NAME,
        ELECTION_DESCRIPTION,
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );
      electionId = event?.args?.[0];

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

      await time.increase(ONE_HOUR);
      await electionManager.startElection(electionId);
      await time.increase(ONE_DAY);
      await electionManager.endElection(electionId);
    });

    it("Should finalize election results", async function () {
      const candidateIds = ["candidate-001", "candidate-002"];
      const voteCounts = [150, 100];

      const tx = await electionManager.finalizeResults(electionId, candidateIds, voteCounts);
      await expect(tx).to.emit(electionManager, "ResultsFinalized");
    });

    it("Should retrieve finalized results", async function () {
      const candidateIds = ["candidate-001", "candidate-002"];
      const voteCounts = [150, 100];

      await electionManager.finalizeResults(
        electionId,
        candidateIds,
        voteCounts
      );

      const [resultCandidates, resultVotes, totalVotes] =
        await electionManager.getResults(electionId);

      expect(resultCandidates.length).to.equal(2);
      expect(resultVotes[0]).to.equal(150);
      expect(resultVotes[1]).to.equal(100);
      expect(totalVotes).to.equal(250);
    });

    it("Should fail to finalize results twice", async function () {
      const candidateIds = ["candidate-001", "candidate-002"];
      const voteCounts = [150, 100];

      await electionManager.finalizeResults(
        electionId,
        candidateIds,
        voteCounts
      );

      // After finalization, status is Finalized, not Ended
      await expect(
        electionManager.finalizeResults(electionId, candidateIds, voteCounts)
      ).to.be.revertedWith("Election must be Ended");
    });

    it("Should fail if candidate IDs and vote counts length mismatch", async function () {
      const candidateIds = ["candidate-001", "candidate-002"];
      const voteCounts = [150];

      await expect(
        electionManager.finalizeResults(electionId, candidateIds, voteCounts)
      ).to.be.revertedWith(
        "Candidate IDs and vote counts length mismatch"
      );
    });

    it("Should fail to get results before finalization", async function () {
      await expect(
        electionManager.getResults(electionId)
      ).to.be.revertedWith("Results not finalized");
    });
  });

  describe("Election Status and Configuration", function () {
    beforeEach(async function () {
      const startTime = (await time.latest()) + ONE_HOUR;
      const endTime = startTime + ONE_DAY;

      const tx = await electionManager.createElection(
        ELECTION_NAME,
        ELECTION_DESCRIPTION,
        startTime,
        endTime,
        true,
        30
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "ElectionCreated"
      );
      electionId = event?.args?.[0];
    });

    it("Should get election status", async function () {
      const [name, description, startTime, endTime, status, isActive, isFinalized] =
        await electionManager.getElectionStatus(electionId);

      expect(name).to.equal(ELECTION_NAME);
      expect(description).to.equal(ELECTION_DESCRIPTION);
      expect(status).to.equal(0); // Draft
      expect(isActive).to.be.false;
      expect(isFinalized).to.be.false;
    });

    it("Should get election configuration", async function () {
      const [
        allowRevoting,
        revotingWindowMinutes,
        createdAt,
        startedAt,
        endedAt,
        finalizedAt,
      ] = await electionManager.getElectionConfig(electionId);

      expect(allowRevoting).to.be.true;
      expect(revotingWindowMinutes).to.equal(30);
      expect(createdAt).to.be.greaterThan(0);
      expect(startedAt).to.equal(0);
      expect(endedAt).to.equal(0);
      expect(finalizedAt).to.equal(0);
    });

    it("Should get all elections", async function () {
      const elections = await electionManager.getAllElections();
      expect(elections.length).to.equal(1);
      expect(elections[0]).to.equal(electionId);
    });
  });

  describe("Admin Management", function () {
    it("Should transfer admin role", async function () {
      await electionManager.transferAdmin(user.address);
      expect(await electionManager.admin()).to.equal(user.address);
    });

    it("Should fail to transfer admin to zero address", async function () {
      await expect(
        electionManager.transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid admin address");
    });

    it("Should fail if non-admin tries to transfer admin", async function () {
      await expect(
        electionManager.connect(user).transferAdmin(user.address)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });
});
