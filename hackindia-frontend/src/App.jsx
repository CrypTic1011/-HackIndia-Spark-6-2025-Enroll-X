import { useState, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import Home from './components/Home';
import Leaderboard from "./components/Leaderboard";
import Contribute from './components/Contribute';
import Graph from './components/Graph';
import Search from './components/Search';
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './contract/contractConfig';

function App() {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
    } else {
      alert('Please install MetaMask');
    }
  };

  useEffect(() => {
    if (window.ethereum && !address) {
      connectWallet();
    }
  }, []);

  return (
    <div className="overflow-x-hidden text-stone-300 antialiased">
      <div className="fixed inset-0 -z-10">
        <div className="relative h-full w-full bg-black">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>
        </div>
      </div>

      <div className="p-4 flex justify-end">
        {address ? (
          <span className="text-sm text-green-400">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
        ) : (
          <button onClick={connectWallet} className="bg-indigo-600 px-4 py-2 rounded text-white">
            Connect Wallet
          </button>
        )}
      </div>

      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard contract={contract} />} />
          <Route path="/contribute" element={<Contribute contract={contract} />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
