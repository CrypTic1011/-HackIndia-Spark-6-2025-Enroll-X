import React, { useState } from 'react'
import Logo from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchText.trim() !== '') {
          navigate(`/search?query=${encodeURIComponent(searchText)}`);
        }
      };

  return (
    <div className="w-full h-screen flex flex-col items-center">
    <div className='w-full flex flex-row items-center justify-end px-5 gap-2  mb-5'>
      <button className='px-4 py-2 rounded-xl bg-stone-800 text-white text-lg cursor-pointer hover:bg-stone-700 transition duration-75' onClick={() => navigate("/contribute")}>Contribute</button>
      <button className='px-4 py-2 rounded-xl bg-stone-800 text-white text-lg cursor-pointer hover:bg-stone-700 transition duration-75' onClick={() => navigate('/leaderboard')}>Leaderboard</button>
    </div>
    <h1 className="lg:text-5xl text-4xl font-bold">FactChain</h1>
    <h3 className='lg:text-2xl text-xl text-stone-500'>The Decentralized Wikipedia</h3>
    <img src={Logo} className='mt-10 lg:w-[500px] lg:h-[500px] w-[300px] h-[300px]' />
    <input 
      type="text"
      placeholder="Search articles, facts..."
      className="mt-10 w-full max-w-lg px-4 py-3 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={handleKeyDown}
    />
    <button className='mt-10 w-full max-w-md px-4 py-3 rounded-xl bg-stone-800 text-stone-200 text-xl cursor-pointer hover:bg-stone-700 transition duration-75' onClick={() => navigate("/graph")}>View Blockchain Explorer</button>
  </div>
  )
}

export default Home