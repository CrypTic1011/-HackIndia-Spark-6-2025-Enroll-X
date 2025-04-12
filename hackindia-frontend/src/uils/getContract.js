import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract/contractConfig';

export const getContract = () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
