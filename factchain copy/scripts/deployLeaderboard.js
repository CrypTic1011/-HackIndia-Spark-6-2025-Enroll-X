const hre = require("hardhat");

async function main() {
  console.log("Deploying ArticleLeaderboard contract...");

  const ArticleLeaderboard = await hre.ethers.getContractFactory("ArticleLeaderboard");
  const articleLeaderboard = await ArticleLeaderboard.deploy();

  await articleLeaderboard.waitForDeployment();

  const contractAddress = await articleLeaderboard.getAddress();
  console.log("ArticleLeaderboard deployed to:", contractAddress);

  console.log(`export LEADERBOARD_CONTRACT_ADDRESS="${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
