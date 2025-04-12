const { expect } = require("chai");

describe("ArticleManager", function () {
  let ArticleManager, articleManager, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    ArticleManager = await ethers.getContractFactory("ArticleManager");
    articleManager = await ArticleManager.deploy();
    await articleManager.waitForDeployment();
  });

  it("should add and retrieve an article", async function () {
    const title = "Test Article";
    const ipfsHash = "QmTestHash";

    await articleManager.addArticle(title, ipfsHash);

    const article = await articleManager.getArticle(title);

    expect(article[0]).to.equal(ipfsHash);
    expect(article[2]).to.equal(owner.address);
  });

  it("should not allow duplicate articles", async function () {
    const title = "Duplicate Article";
    const ipfsHash = "QmDupHash";

    await articleManager.addArticle(title, ipfsHash);
    await expect(articleManager.addArticle(title, ipfsHash)).to.be.revertedWith("Article already exists");
  });
});
