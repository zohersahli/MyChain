import React, { useEffect, useMemo, useState } from "react";
import { isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const CreateTransaction = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const apiBaseUrl = useMemo(() => {
    return (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    console.log("[ENV] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Missing auth token. Please login again.");
      navigate("/login");
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage("Amount must be a positive number.");
      return;
    }

    if (!toAddress.trim()) {
      setMessage("To Address is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toAddress: toAddress.trim(),
          amount: parsedAmount,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || `Request failed (${res.status})`;
        setMessage(serverMsg);
        return;
      }

      setMessage(data?.message || "Transaction sent! Check Pending Transactions.");
      setToAddress("");
      setAmount("");
    } catch {
      setMessage("Failed to send transaction (network error).");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Transaction</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="To Address"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="any"
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Transaction"}
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <p style={styles.hint}>
        API: <code>{apiBaseUrl}</code>
      </p>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: "2rem",
    backgroundColor: "#08D9D6",
    minHeight: "calc(100vh - 140px)",
    color: "#252A34",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    marginBottom: "2rem",
    fontSize: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    backgroundColor: "#252A34",
    color: "#EAEAEA",
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    opacity: 1,
  },
  message: {
    marginTop: "1rem",
    fontSize: "1rem",
    fontWeight: 600,
  },
  hint: {
    marginTop: "0.75rem",
    fontSize: "0.9rem",
    opacity: 0.8,
  },
};

export default CreateTransaction;
