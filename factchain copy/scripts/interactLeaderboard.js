const hre = require("hardhat");
const { create } = require("ipfs-http-client");
const fs = require("fs").promises;

async function main() {
  const CONFIG = {
    contractAddress: "0xYourLeaderboardContractAddressHere",
    articleTitle: "My Leaderboard Article",
    articleContent: {
      title: "My Leaderboard Article",
      body: "This article is part of the leaderboard interaction demo.",
      timestamp: new Date().toISOString()
    },
    outputFile: "leaderboard_article.json",
    ipfsUrl: "http://localhost:5001" // Or Infura if using remote IPFS
  };

  console.log("📄 Article Title:", CONFIG.articleTitle);
  console.log("🔗 Leaderboard Contract Address:", CONFIG.contractAddress);

  try {
    // Connect to contract
    const ArticleLeaderboard = await hre.ethers.getContractFactory("ArticleLeaderboard");
    const leaderboard = await ArticleLeaderboard.attach(CONFIG.contractAddress);
    console.log("✅ Connected to ArticleLeaderboard");

    // Connect to IPFS
    console.log(`🌐 Connecting to IPFS at ${CONFIG.ipfsUrl}...`);
    const ipfs = create({ url: CONFIG.ipfsUrl });
    console.log("✅ Connected to IPFS");

    // Save article JSON locally
    await fs.writeFile(CONFIG.outputFile, JSON.stringify(CONFIG.articleContent, null, 2));
    console.log(`📝 Saved article content to ${CONFIG.outputFile}`);

    // Upload to IPFS
    const contentBuffer = Buffer.from(JSON.stringify(CONFIG.articleContent));
    const addResult = await ipfs.add(contentBuffer);
    const ipfsHash = addResult.path;
    console.log("📦 Uploaded to IPFS:", ipfsHash);
    console.log(`🔗 View: https://ipfs.io/ipfs/${ipfsHash}`);

    // Submit article to contract
    console.log(`🧾 Submitting article "${CONFIG.articleTitle}"...`);
    const tx = await leaderboard.submitArticle(CONFIG.articleTitle, ipfsHash);
    console.log("📝 TX Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Confirmed in block:", receipt.blockNumber);

    // Get article details
    const [retrievedHash, author, likes, dislikes] = await leaderboard.getArticleDetails(CONFIG.articleTitle);
    console.log("📥 Retrieved from contract:");
    console.log("IPFS Hash:", retrievedHash);
    console.log("Author:", author);
    console.log("Likes:", likes.toString());
    console.log("Dislikes:", dislikes.toString());

  } catch (error) {
    console.error("❌ Error:", error);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal Error:", error);
    process.exit(1);
  });
