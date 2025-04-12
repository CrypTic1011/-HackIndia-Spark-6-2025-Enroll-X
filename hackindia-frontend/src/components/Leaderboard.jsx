import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ArticleLeaderboardABI from "../contract/ArticleLeaderboard.json";
import { useWeb3 } from "../context/web3context";

const leaderboardAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Leaderboard = () => {
  const [articles, setArticles] = useState([]);
  const { leaderboard } = useWeb3();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await leaderboard.getLeaderboard(); 
        const parsed = await Promise.all(
            leaderboardData.map(async (article) => {
              const details = await leaderboard.getArticleDetails(article.title);
              console.log(details.dislikes);
              // Ensure ratio is a valid number and calculate it properly
              const ratio = article.ratio ? (Number(article.ratio) / 100).toFixed(2) : "0.00";
              
              return {
                title: article.title,
                ipfsHash: details[0],
                author: details[1],
                likes: details[2].toString(),
                dislikes: details[3].toString(),
                ratio: `${ratio}%`, // Append percentage symbol
                titleHash: article.titleHash
              };
            })
          );
        setArticles(parsed);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      }
    };
  
    if (leaderboard) {
      fetchLeaderboard();
    }
  }, [leaderboard]);
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">🏆 Article Leaderboard</h2>
      {articles.length === 0 ? (
        <p>No articles yet.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article, index) => (
            <li
              key={index}
              className="border border-gray-600 p-4 rounded bg-gray-900"
            >
              <h3 className="text-xl font-semibold">{article.title}</h3>
              <p className="text-sm text-gray-400">
                Title Hash: {article.titleHash}
              </p>
              <p className="text-green-400 font-bold">
                Like Ratio: {article.ratio}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;
