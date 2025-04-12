const hre = require("hardhat");
const { create } = require("ipfs-http-client");
const fs = require("fs").promises;

async function main() {
  const CONFIG = {
    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 
        articleTitle: "My Third Article",
    articleContent: {
      title: "My Third Article",
      body: "This is a sample article content for demonstration purposes.",
      timestamp: new Date().toISOString()
    },
    
    outputFile: "article.json",
    
    ipfsUrl: "http://localhost:5001"
  };

  console.log("Using configuration:");
  console.log(`- Contract Address: ${CONFIG.contractAddress}`);
  console.log(`- Article Title: ${CONFIG.articleTitle}`);
  
  try {
    const ArticleManager = await hre.ethers.getContractFactory("ArticleManager");
    const articleManager = await ArticleManager.attach(CONFIG.contractAddress);
    console.log("Connected to ArticleManager contract");

    console.log(`Connecting to IPFS at ${CONFIG.ipfsUrl}...`);
    const ipfs = create({ url: CONFIG.ipfsUrl });
    console.log("Connected to IPFS node");

    await fs.writeFile(
      CONFIG.outputFile, 
      JSON.stringify(CONFIG.articleContent, null, 2)
    );
    console.log(`Saved article content to ${CONFIG.outputFile}`);

    console.log("Uploading content to IPFS...");
    const contentBuffer = Buffer.from(JSON.stringify(CONFIG.articleContent));
    const addResult = await ipfs.add(contentBuffer);
    const ipfsHash = addResult.path;
    console.log("Content added to IPFS with hash:", ipfsHash);
    console.log(`Access your content via: https://ipfs.io/ipfs/${ipfsHash}`);

    console.log(`Adding article "${CONFIG.articleTitle}" to the contract...`);
    const tx = await articleManager.addArticle(CONFIG.articleTitle, ipfsHash);
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    console.log(`Retrieving article "${CONFIG.articleTitle}" from the contract...`);
    const article = await articleManager.getArticle(CONFIG.articleTitle);
    console.log("Retrieved article details:");
    console.log("IPFS Hash:", article[0]);
    console.log("Timestamp:", new Date(Number(article[1]) * 1000).toLocaleString());
    console.log("Author:", article[2]);

  } catch (error) {
    console.error("Error:", error);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });