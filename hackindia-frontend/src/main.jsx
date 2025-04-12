import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { Web3Provider } from './context/web3context.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <Web3Provider>      
        <App />
      </Web3Provider>
    </StrictMode>
  </BrowserRouter>,
)
