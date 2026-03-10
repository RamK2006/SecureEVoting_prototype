import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ElectionManager contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ElectionManager = await ethers.getContractFactory("ElectionManager");
  const electionManager = await ElectionManager.deploy();

  await electionManager.waitForDeployment();

  const address = await electionManager.getAddress();
  console.log("ElectionManager deployed to:", address);
  console.log("Admin address:", deployer.address);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
