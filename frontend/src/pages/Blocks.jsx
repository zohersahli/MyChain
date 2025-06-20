import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { isLoggedIn } from '../utils/auth';

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/blocks')
      .then(response => setBlocks(response.data))
      .catch(err => {
        console.error('Failed to fetch blocks:', err);
        setError('Could not load blocks.');
      });
  }, []);

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Blockchain Blocks</h1>
      <p style={styles.subtitle}>Explore the latest blocks in the chain</p>

      {isLoggedIn() && (
        <div style={styles.blocksList}>
          {error && <p style={styles.error}>{error}</p>}
          {blocks.map((block, index) => (
            <div key={index} style={styles.blockCard}>
              <p><strong>Index:</strong> {block.index}</p>
              <p><strong>Timestamp:</strong> {block.timestamp}</p>
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
    padding: '4rem 1rem',
    backgroundColor: '#08D9D6',
    color: '#252A34',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'calc(100vh - 140px)',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '2rem',
  },
  blocksList: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  blockCard: {
    backgroundColor: '#EAEAEA',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    color: '#252A34',
  },
  transactions: {
    backgroundColor: '#fff',
    padding: '0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    overflowX: 'auto',
    marginTop: '0.5rem',
  },
  error: {
    color: '#FF2E63',
    marginBottom: '1rem',
  },
};

export default Blocks;
