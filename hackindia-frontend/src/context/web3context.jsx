// src/context/Web3Context.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import ArticleManagerABI from "../contract/ArticleManager.json";
import ArticleLeaderboardABI from "../contract/ArticleLeaderboard.json";

const Web3Context = createContext();

const ARTICLE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const LEADERBOARD_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [articleManager, setArticleManager] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const web3Provider = new BrowserProvider(window.ethereum);
    const signer = await web3Provider.getSigner();
    const address = await signer.getAddress();

    const articleManager = new Contract(
      ARTICLE_MANAGER_ADDRESS,
      ArticleManagerABI.abi,
      signer
    );

    const leaderboard = new Contract(
      LEADERBOARD_ADDRESS,
      ArticleLeaderboardABI.abi,
      signer
    );

    setProvider(web3Provider);
    setSigner(signer);
    setUserAddress(address);
    setArticleManager(articleManager);
    setLeaderboard(leaderboard);
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        userAddress,
        articleManager,
        leaderboard,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
