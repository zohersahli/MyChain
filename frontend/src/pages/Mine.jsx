import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const Mine = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, []);

  const handleMine = async () => {
    const username = localStorage.getItem('username') || 'Anonymous';

    try {
const res = await fetch(`http://localhost:3001/mine?address=${username}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
      const data = await res.json();
      setMessage(data.message || 'Mined successfully');
    } catch (err) {
      setMessage('Mining failed');
    }
  };

  return (
    <section style={styles.container}>
      <h2 style={styles.heading}>Mine New Block</h2>
      <button onClick={handleMine} style={styles.button}>Start Mining</button>
      {message && <p style={styles.message}>{message}</p>}
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
    fontSize: '2rem',
    marginBottom: '2rem',
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
    marginTop: '1.5rem',
    fontSize: '1rem',
  },
};

export default Mine;
