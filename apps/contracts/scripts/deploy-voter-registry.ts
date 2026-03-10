import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying VoterRegistry contract...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  // Deploy VoterRegistry
  const VoterRegistryFactory = await ethers.getContractFactory('VoterRegistry');
  const voterRegistry = await VoterRegistryFactory.deploy();
  await voterRegistry.waitForDeployment();

  const address = await voterRegistry.getAddress();
  console.log('VoterRegistry deployed to:', address);
  console.log('Admin address:', await voterRegistry.admin());

  // Add some initial constituencies for testing
  console.log('\nAdding initial constituencies...');
  const constituencies = ['const-001', 'const-002', 'const-003'];
  
  for (const constituencyId of constituencies) {
    const tx = await voterRegistry.addConstituency(constituencyId);
    await tx.wait();
    console.log(`Added constituency: ${constituencyId}`);
  }

  console.log('\nDeployment complete!');
  console.log('Contract address:', address);
  console.log('Total constituencies:', constituencies.length);

  // Return deployment info
  return {
    voterRegistry: address,
    admin: deployer.address,
    constituencies,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
