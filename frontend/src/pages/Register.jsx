import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";



const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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

    try {
      await axios.post(`${apiBaseUrl}/register`, {
        username,
        password,
      });

      setMessage("User registered successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      setMessage("Username already exists or error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Register</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>Register</button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={{ marginTop: "0.75rem", color: "#EAEAEA", opacity: 0.8, fontSize: "0.9rem" }}>
          API: <code>{apiBaseUrl}</code>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#08D9D6",
    padding: "2rem",
  },
  form: {
    backgroundColor: "#252A34",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    color: "#EAEAEA",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    margin: "0.5rem 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    marginTop: "1rem",
    backgroundColor: "#FF2E63",
    color: "#EAEAEA",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    marginTop: "1rem",
    color: "#EAEAEA",
    textAlign: "center",
  },
};

export default Register;
