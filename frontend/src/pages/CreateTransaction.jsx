import React, { useState } from 'react';
import { isLoggedIn } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const CreateTransaction = () => {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const fromAddress = localStorage.getItem('username');

    try {
      const res = await fetch('http://localhost:3001/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          amount: parseFloat(amount)
        })
      });

      const data = await res.json();
      setMessage(data.message || 'Transaction sent!');
    } catch (err) {
      setMessage('Failed to send transaction');
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
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send Transaction</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#08D9D6',
    minHeight: 'calc(100vh - 140px)',
    color: '#252A34',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    marginBottom: '2rem',
    fontSize: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#252A34',
    color: '#EAEAEA',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    fontSize: '1rem',
  },
};

export default CreateTransaction;
