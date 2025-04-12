import { useState } from "react";
import { useWeb3 } from "../context/web3context";
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";

const ipfsClient = ipfsHttpClient({
  host: "localhost",
  port: "5001",
  protocol: "http"
});

const Contribute = () => {
  const { articleManager, leaderboard } = useWeb3();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) return alert("Title and body are required");
  
    try {
      setSubmitting(true);
  
      const content = JSON.stringify({ title, body });
      const result = await ipfsClient.add(Buffer.from(content));
      const ipfsHash = result.path;
  
      // Submit to ArticleManager
      const tx1 = await articleManager.addArticle(title, ipfsHash);
      await tx1.wait();
  
      // Submit to ArticleLeaderboard
      const tx2 = await leaderboard.submitArticle(title, ipfsHash);
      await tx2.wait();
  
      alert("Article submitted!");
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Submit New Article</h2>
      <input
        type="text"
        placeholder="Article Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="mt-10 w-full max-w-lg px-4 py-3 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
      />
      <textarea
        placeholder="Article Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        required
        className="mt-10 w-full max-w-lg px-4 py-3 rounded-xl bg-stone-800 text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
      />
      <button type="submit" disabled={submitting} className="mt-10 w-full max-w-md px-4 py-3 rounded-xl bg-stone-800 text-stone-200 text-xl cursor-pointer hover:bg-stone-700 transition duration-75">
        {submitting ? "Submitting..." : "Submit Article"}
      </button>
    </form>
  );
};

export default Contribute;
