// src/ipfs.js
import { create } from 'ipfs-http-client';

const client = create({
  url: "http://127.0.0.1:5001/api/v0", // your local IPFS API
});

export default client;
