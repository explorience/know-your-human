"use client";

import { useState } from "react";

export default function Home() {
  const [agentAddress, setAgentAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [level, setLevel] = useState("basic");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!agentAddress || !userAddress) {
      setError("Please enter both addresses");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentAddress,
          userAddress,
          level,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }
      setResult(data);

      // Poll for completion
      if (data.status === "pending") {
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/verification?id=${data.verificationId}`);
          const statusData = await statusRes.json();
          if (statusData.status === "completed") {
            setResult(statusData);
            clearInterval(pollInterval);
          }
        }, 3000);

        // Clear after 30 seconds
        setTimeout(() => clearInterval(pollInterval), 30000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!userAddress) return;
    
    try {
      const response = await fetch(`/api/verification?userAddress=${userAddress}`);
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h1>Agent KYC Gateway</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Privacy-preserving identity verification for AI agents
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Agent Address (requester)
          <input
            type="text"
            value={agentAddress}
            onChange={(e) => setAgentAddress(e.target.value)}
            placeholder="0x..."
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          User Address (to verify)
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label>
          Verification Level
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          >
            <option value="basic">Basic ($0.25) - Phone verified</option>
            <option value="standard">Standard ($1.50) - ID document</option>
            <option value="enhanced">Enhanced ($5.00) - Biometric + sanctions</option>
          </select>
        </label>

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            padding: "0.75rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Verifying..." : "Request Verification"}
        </button>

        <button
          onClick={checkStatus}
          style={{
            padding: "0.75rem",
            backgroundColor: "transparent",
            color: "#0070f3",
            border: "1px solid #0070f3",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Check Status
        </button>

        {error && (
          <div style={{ color: "red", padding: "1rem", backgroundColor: "#fee", borderRadius: "4px" }}>
            {error}
          </div>
        )}

        {result && (
          <pre style={{ 
            padding: "1rem", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "4px",
            overflow: "auto",
            fontSize: "0.875rem"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "3rem", padding: "1rem", backgroundColor: "#eef", borderRadius: "4px" }}>
        <h3>How it works</h3>
        <ol style={{ paddingLeft: "1.25rem" }}>
          <li>Agent requests verification for a user</li>
          <li>User completes verification via Self Protocol</li>
          <li>Attestation is registered on Celo blockchain</li>
          <li>Agent queries attestation (no PII exposed)</li>
        </ol>
      </div>
    </main>
  );
}
