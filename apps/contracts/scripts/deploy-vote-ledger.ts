import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VoteLedger contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const VoteLedger = await ethers.getContractFactory("VoteLedger");
  const voteLedger = await VoteLedger.deploy();

  await voteLedger.waitForDeployment();

  const address = await voteLedger.getAddress();
  console.log("VoteLedger deployed to:", address);
  console.log("Admin address:", deployer.address);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
