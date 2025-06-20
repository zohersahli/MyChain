import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const Balance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    } else {
      fetchBalance();
    }
  }, []);

  const fetchBalance = async () => {
    const username = localStorage.getItem('username');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/balance/${username}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      setBalance('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={styles.container}>
      <h2 style={styles.heading}>Current Balance</h2>

      {loading ? (
        <p style={styles.message}>Loading..</p>
      ) : (
        <p style={styles.balance}>
          {balance !== null ? `${balance} Coins` : 'No data'}
        </p>
      )}

      <button onClick={fetchBalance} style={styles.button}>Refresh</button>
    </section>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: '4rem 1rem',
    backgroundColor: '#08D9D6',
    color: '#EAEAEA',
    minHeight: 'calc(100vh - 140px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '2.2rem',
    marginBottom: '1.5rem',
  },
  balance: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#252A34',
  },
  button: {
    padding: '0.8rem 2rem',
    backgroundColor: '#252A34',
    color: '#EAEAEA',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  message: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
  },
};

export default Balance;
