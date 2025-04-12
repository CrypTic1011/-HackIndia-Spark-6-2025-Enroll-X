const hre = require("hardhat");

async function main() {
  console.log("Deploying ArticleManager contract...");
  
  const ArticleManager = await hre.ethers.getContractFactory("ArticleManager");
  const articleManager = await ArticleManager.deploy();
  
  await articleManager.waitForDeployment();
  
  const contractAddress = await articleManager.getAddress();
  console.log("ArticleManager deployed to:", contractAddress);
  
  console.log(`export CONTRACT_ADDRESS="${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });