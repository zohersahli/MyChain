import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";



const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const apiBaseUrl = useMemo(() => {
    return (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    console.log("[ENV] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
  }, []);

  const fetchBlocks = async () => {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    try {
      const res = await axios.get(`${apiBaseUrl}/blocks`, { headers });
      setBlocks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      const status = e?.response?.status;
      if ((status === 401 || status === 403) && isLoggedIn()) {
        navigate("/login");
        return;
      }
      setError("Could not load blocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Blocks page: if you want it only for logged-in, keep this:
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, apiBaseUrl]);

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Blockchain Blocks</h1>
      <p style={styles.subtitle}>Explore the latest blocks in the chain</p>

      <div style={styles.actions}>
        <button style={styles.refreshBtn} onClick={fetchBlocks} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <div style={styles.apiHint}>
          API: <code>{apiBaseUrl}</code>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>Loading..</p>
      ) : (
        <div style={styles.blocksList}>
          {blocks.map((block, index) => (
            <div key={index} style={styles.blockCard}>
              <p><strong>Index:</strong> {block.index}</p>
              <p><strong>Timestamp:</strong> {String(block.timestamp)}</p>
              <p><strong>Hash:</strong> {block.hash}</p>
              <p><strong>Previous Hash:</strong> {block.previousHash}</p>
              <p><strong>Nonce:</strong> {block.nonce}</p>
              <p><strong>Transactions:</strong></p>
              <pre style={styles.transactions}>
                {JSON.stringify(block.transactions, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: "4rem 1rem",
    backgroundColor: "#08D9D6",
    color: "#252A34",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "calc(100vh - 140px)",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    marginBottom: "1.25rem",
  },
  actions: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "1.25rem",
  },
  refreshBtn: {
    backgroundColor: "#252A34",
    color: "#EAEAEA",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  apiHint: {
    fontSize: "0.9rem",
    opacity: 0.85,
  },
  blocksList: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  blockCard: {
    backgroundColor: "#EAEAEA",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    color: "#252A34",
  },
  transactions: {
    backgroundColor: "#fff",
    padding: "0.5rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    overflowX: "auto",
    marginTop: "0.5rem",
  },
  error: {
    color: "#FF2E63",
    marginBottom: "1rem",
    fontWeight: 600,
  },
  loading: {
    marginTop: "1rem",
    fontSize: "1.1rem",
  },
};

export default Blocks;
