import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client'; // Import the IPFS client

// Connect to your local IPFS node
const ipfsClient = create({ url: 'http://localhost:5001/api/v0' });

const articleManagerABI = [
  "function getArticle(string memory _title) public view returns (string memory ipfsHash, uint256 timestamp, address author, uint256 likes, uint256 dislikes)"
];

const contractAddress = "0xYourContractAddress"; // Replace with the actual deployed contract address

const Search = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query");
  const [searchText, setSearchText] = useState("");
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!query) return;

      setSearchText(query);
      setLoading(true);
      setError(null);

      try {
        // Connect to the Ethereum network
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Get contract instance
        const contract = new ethers.Contract(contractAddress, articleManagerABI, signer);

        // Call the getArticle function from the contract
        const [ipfsHash, timestamp, author, likes, dislikes] = await contract.getArticle(query);

        // Fetch the article content from IPFS using the IPFS hash
        const articleContent = await fetchFromIPFS(ipfsHash);

        // Set the article state
        setArticle({
          content: articleContent,
          timestamp: new Date(timestamp * 1000).toLocaleString(),
          author,
          likes: ethers.utils.formatUnits(likes, 0),
          dislikes: ethers.utils.formatUnits(dislikes, 0),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [query]);

  // Function to fetch content from IPFS using the IPFS hash
  const fetchFromIPFS = async (ipfsHash) => {
    try {
      const file = await ipfsClient.cat(ipfsHash); // Fetch the file from IPFS using the hash
      return new TextDecoder().decode(file); // Convert the IPFS file buffer to string
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      throw error;
    }
  };

  // Function to handle the 'Enter' key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchText.trim() !== '') {
      fetchArticle();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <h1 className="lg:text-4xl text-3xl font-bold">Search Results</h1>
      <h1>Search Results for: {query}</h1>

      <input 
        type="text"
        placeholder="Search articles, facts..."
        className="mt-10 w-full max-w-lg px-4 py-3 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown} // Call the function on Enter key press
      />

      {loading && <p>Loading article...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {article && (
        <div>
          <h2>Article Details:</h2>
          <p><strong>Content:</strong> {article.content}</p>
          <p><strong>Timestamp:</strong> {article.timestamp}</p>
          <p><strong>Author:</strong> {article.author}</p>
          <p><strong>Likes:</strong> {article.likes}</p>
          <p><strong>Dislikes:</strong> {article.dislikes}</p>
        </div>
      )}
    </div>
  );
};

export default Search;
