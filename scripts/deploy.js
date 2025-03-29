import hre from "hardhat";

async function main() {
  const FreelancerMarketplace = await hre.ethers.getContractFactory("FreelancerMarketplace");
  const marketplace = await FreelancerMarketplace.deploy(); // Deploy contract

  await marketplace.waitForDeployment(); // Wait for deployment completion (for ethers v6)

  console.log("Contract deployed to:", await marketplace.getAddress()); // Log the contract address
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
