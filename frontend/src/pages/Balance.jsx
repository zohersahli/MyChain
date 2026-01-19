import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";



const Balance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const apiBaseUrl = useMemo(() => {
    return (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    console.log("[ENV] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, apiBaseUrl]);

  const fetchBalance = async () => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${apiBaseUrl}/balance/${encodeURIComponent(username)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || `Request failed (${res.status})`;
        setMessage(serverMsg);
        setBalance(null);
        return;
      }

      setBalance(data?.balance ?? null);
    } catch {
      setMessage("Failed to fetch balance (network error).");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={styles.container}>
      <h2 style={styles.heading}>Current Balance</h2>

      {message && <p style={styles.error}>{message}</p>}

      {loading ? (
        <p style={styles.message}>Loading..</p>
      ) : (
        <p style={styles.balance}>
          {balance !== null ? `${balance} Coins` : "No data"}
        </p>
      )}

      <button onClick={fetchBalance} style={styles.button} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      <p style={styles.hint}>
        API: <code>{apiBaseUrl}</code>
      </p>
    </section>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: "4rem 1rem",
    backgroundColor: "#08D9D6",
    color: "#EAEAEA",
    minHeight: "calc(100vh - 140px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "2.2rem",
    marginBottom: "1.5rem",
  },
  balance: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "2rem",
    color: "#252A34",
  },
  button: {
    padding: "0.8rem 2rem",
    backgroundColor: "#252A34",
    color: "#EAEAEA",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "1.5rem",
  },
  error: {
    marginBottom: "1rem",
    color: "#FF2E63",
    fontWeight: 600,
  },
  hint: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    opacity: 0.85,
  },
};

export default Balance;
