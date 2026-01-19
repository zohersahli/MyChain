import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";


const Mine = () => {
  const [message, setMessage] = useState("");
  const [isMining, setIsMining] = useState(false);
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
    }
  }, [navigate]);

  const handleMine = async () => {
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsMining(true);
    try {
      const res = await fetch(`${apiBaseUrl}/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || `Request failed (${res.status})`;
        setMessage(serverMsg);
        return;
      }

      setMessage(data?.message || "Mined successfully");
    } catch {
      setMessage("Mining failed (network error).");
    } finally {
      setIsMining(false);
    }
  };

  return (
    <section style={styles.container}>
      <h2 style={styles.heading}>Mine New Block</h2>
      <button onClick={handleMine} style={styles.button} disabled={isMining}>
        {isMining ? "Mining..." : "Start Mining"}
      </button>

      {message && <p style={styles.message}>{message}</p>}

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
    fontSize: "2rem",
    marginBottom: "2rem",
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
    marginTop: "1.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#252A34",
  },
  hint: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    opacity: 0.85,
    color: "#252A34",
  },
};

export default Mine;
