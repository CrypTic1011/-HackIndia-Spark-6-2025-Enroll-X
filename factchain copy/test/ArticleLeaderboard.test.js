const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArticleLeaderboard", function () {
  let leaderboard, owner, voter1, voter2, voter3;

  beforeEach(async () => {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const Leaderboard = await ethers.getContractFactory("ArticleLeaderboard");
    leaderboard = await Leaderboard.deploy();
    await leaderboard.submitArticle("Test Title", "Qm123");
  });

  it("should submit an article and fetch its details", async () => {
    const [hash, author, likes, dislikes] = await leaderboard.getArticleDetails("Test Title");
    expect(hash).to.equal("Qm123");
    expect(author).to.equal(owner.address);
  });

  it("should allow voting and calculate ratios", async () => {
    await leaderboard.connect(voter1).voteArticle("Test Title", true);
    await leaderboard.connect(voter2).voteArticle("Test Title", false);

    const board = await leaderboard.getLeaderboard();
    expect(board.length).to.equal(1);
    expect(board[0].ratio).to.equal(5000); // 50%
  });

  it("should not allow duplicate votes", async () => {
    await leaderboard.connect(voter1).voteArticle("Test Title", true);
    await expect(
      leaderboard.connect(voter1).voteArticle("Test Title", true)
    ).to.be.revertedWith("Already voted");
  });

  it("should delete article if dislikes exceed 51%", async () => {
    await leaderboard.connect(voter1).voteArticle("Test Title", false);
    await leaderboard.connect(voter2).voteArticle("Test Title", false);

    // Total = 2 dislikes, 0 likes => 100% dislikes → triggers deletion

    await expect(
      leaderboard.getArticleDetails("Test Title")
    ).to.be.revertedWith("Article does not exist");
  });
});
