import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWeb3 } from "../context/web3context";  // Import Web3Context
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";

// Initialize IPFS client
const ipfsClient = ipfsHttpClient({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

const Search = () => {
  const { articleManager } = useWeb3();  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query");
  const [searchText, setSearchText] = useState(query || "");
  const [articles, setArticles] = useState([]);  // Store all matched articles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to send POST request to local API to get keywords
  const fetchKeywords = async (query) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/extract_keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Send query in the body of the request
      });

      const data = await response.json();
      if (response.ok) {
        return data.keywords;  // Assuming the server returns a list of keywords
      } else {
        throw new Error(data.message || "Failed to fetch keywords");
      }
    } catch (error) {
      console.error("Error fetching keywords:", error);
      throw error;
    }
  };

  // Function to fetch articles based on keywords
  const fetchArticlesByKeywords = async (keywords) => {
    console.log(keywords);
    
    setLoading(true);
    setError(null);
    setArticles([]); // Reset articles array on new search
  
    try {
      // Fetch all articles' titles (or hashes)
      const titleHashes = await articleManager.getAllArticles();
  
      // Loop through all articles and filter by keyword matching
      const matchingArticles = [];
      for (let i = 0; i < titleHashes.length; i++) {
        const titleHash = titleHashes[i];
  
        const [title, ipfsHash, timestamp, author, likes, dislikes] = await articleManager.getArticleByIndex(titleHash);
  
        // Check if any keyword matches the title (case-insensitive)
        if (keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()))) {
          // Fetch the article content from IPFS
          const articleContent = await fetchFromIPFS(ipfsHash);
  
          matchingArticles.push({
            title,
            content: articleContent,
            timestamp: new Date(timestamp * 1000).toLocaleString(),
            author,
            likes: ethers.utils.formatUnits(likes, 0),
            dislikes: ethers.utils.formatUnits(dislikes, 0),
          });
        }
      }
  
      // Set the matching articles state
      setArticles(matchingArticles);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch article content from IPFS
  const fetchFromIPFS = async (ipfsHash) => {
    try {
      const file = await ipfsClient.cat(ipfsHash);
      console.log("Fetched file from IPFS:", file);

      if (file instanceof Uint8Array) {
        return new TextDecoder().decode(file);
      }

      if (typeof file === 'string') {
        return file;
      } else if (typeof file === 'object' && file !== null) {
        return JSON.stringify(file);
      } else {
        throw new Error("IPFS returned an unexpected format");
      }
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      throw error;
    }
  };

  // Fetch articles when the query or searchText changes
  useEffect(() => {
    if (query) {
      fetchKeywords(query)
        .then(keywords => fetchArticlesByKeywords(keywords))  // Use the fetched keywords to fetch articles
        .catch(err => setError("Error fetching keywords: " + err.message));
    }
  }, [query]);

  // Handle 'Enter' key press in search input field
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      fetchKeywords(searchText)
        .then(keywords => fetchArticlesByKeywords(keywords))
        .catch(err => setError("Error fetching keywords: " + err.message));
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <h1 className="lg:text-4xl text-3xl font-bold">Search Results</h1>
      <h2>Search Results for: {query || "No search query"}</h2>

      <input
        type="text"
        placeholder="Search articles by title"
        className="mt-10 w-full max-w-lg px-4 py-3 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown} // Call the function on Enter key press
      />

      {loading && <p>Loading articles...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {articles.length > 0 ? (
        <div className="mt-10 w-full max-w-lg">
          {articles.map((article, index) => (
            <div key={index} className="px-4 py-3 rounded-xl bg-stone-800 text-stone-200 mb-6">
              <h3 className="text-xl font-bold">{article.title}</h3>
              <p><strong>Content:</strong> {article.content}</p>
              <p><strong>Timestamp:</strong> {article.timestamp}</p>
              <p><strong>Author:</strong> {article.author}</p>
              <p><strong>Likes:</strong> {article.likes}</p>
              <p><strong>Dislikes:</strong> {article.dislikes}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No articles found matching your query.</p>
      )}
    </div>
  );
};

export default Search;
