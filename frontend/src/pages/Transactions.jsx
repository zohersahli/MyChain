import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const [confirmed, setConfirmed] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const apiBaseUrl = useMemo(() => {
    return (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    console.log("[ENV] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
  }, []);

  const fetchAll = async () => {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("username");

    if (!token || !currentUser) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Fetch both in parallel
      const [blocksRes, pendingRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/blocks`, { headers }),
        axios.get(`${apiBaseUrl}/pending-transactions`, { headers }),
      ]);

      const blocks = Array.isArray(blocksRes.data) ? blocksRes.data : [];

      // Confirmed tx from blocks (exclude Genesis string)
      const allConfirmedTx = blocks
        .flatMap((b) => (Array.isArray(b?.transactions) ? b.transactions : []))
        .filter(Boolean);

      const userConfirmed = allConfirmedTx.filter(
        (tx) => tx?.fromAddress === currentUser || tx?.toAddress === currentUser
      );

      // Pending tx from mempool
      const pendingArr = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const userPending = pendingArr.filter(
        (tx) => tx?.fromAddress === currentUser || tx?.toAddress === currentUser
      );

      setConfirmed(userConfirmed);
      setPending(userPending);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        navigate("/login");
        return;
      }
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, apiBaseUrl]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Transactions</h2>

      <div style={styles.actions}>
        <button style={styles.refreshBtn} onClick={fetchAll} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <div style={styles.apiHint}>
          API: <code>{apiBaseUrl}</code>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.section}>
        <h3 style={styles.subheading}>Pending (Not Mined Yet)</h3>
        {pending.length === 0 ? (
          <p style={styles.empty}>No pending transactions.</p>
        ) : (
          <ul style={styles.list}>
            {pending.map((tx, index) => (
              <li key={`p-${index}`} style={{ ...styles.item, ...styles.pendingItem }}>
                <div style={styles.badge}>PENDING</div>
                <strong>From:</strong> {tx.fromAddress || "System"} <br />
                <strong>To:</strong> {tx.toAddress} <br />
                <strong>Amount:</strong> {tx.amount}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.section}>
        <h3 style={styles.subheading}>Confirmed (Mined)</h3>
        {confirmed.length === 0 ? (
          <p style={styles.empty}>No confirmed transactions found.</p>
        ) : (
          <ul style={styles.list}>
            {confirmed.map((tx, index) => (
              <li key={`c-${index}`} style={styles.item}>
                <div style={styles.badgeConfirmed}>CONFIRMED</div>
                <strong>From:</strong> {tx.fromAddress || "System"} <br />
                <strong>To:</strong> {tx.toAddress} <br />
                <strong>Amount:</strong> {tx.amount}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: "4rem 1rem",
    backgroundColor: "#08D9D6",
    minHeight: "calc(100vh - 140px)",
    color: "#252A34",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1.25rem",
  },
  actions: {
    maxWidth: "700px",
    margin: "0 auto 1.5rem",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
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
  section: {
    maxWidth: "700px",
    margin: "0 auto 2rem",
  },
  subheading: {
    marginBottom: "0.75rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    backgroundColor: "#EAEAEA",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "10px",
    position: "relative",
    overflow: "hidden",
  },
  pendingItem: {
    border: "2px dashed #FF2E63",
  },
  badge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#FF2E63",
    color: "#EAEAEA",
    padding: "0.2rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  badgeConfirmed: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#252A34",
    color: "#EAEAEA",
    padding: "0.2rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  empty: {
    backgroundColor: "rgba(234,234,234,0.6)",
    padding: "0.75rem",
    borderRadius: "10px",
  },
  error: {
    maxWidth: "700px",
    margin: "0 auto 1rem",
    backgroundColor: "rgba(255,46,99,0.2)",
    padding: "0.75rem",
    borderRadius: "10px",
    fontWeight: 600,
  },
};

export default Transactions;
