import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { isLoggedIn } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

   axios.get('http://localhost:3001/blocks', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => {
  const currentUser = localStorage.getItem('username');
const allTx = res.data.flatMap(block => block.transactions || []);
const userTx = allTx.filter(tx =>
  tx.fromAddress === currentUser || tx.toAddress === currentUser
);
setTransactions(userTx);
})
.catch(err => {
  console.error('Failed to fetch transactions:', err);
});
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Mine Transactions</h2>
      <ul style={styles.list}>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          transactions.map((tx, index) => (
            <li key={index} style={styles.item}>
              <strong>From:</strong> {tx.fromAddress || 'System'} <br />
              <strong>To:</strong> {tx.toAddress} <br />
              <strong>Amount:</strong> {tx.amount}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: '4rem 1rem',
    backgroundColor: '#08D9D6',
    minHeight: 'calc(100vh - 140px)',
    color: '#252A34',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    maxWidth: '600px',
    margin: '0 auto',
  },
  item: {
    backgroundColor: '#EAEAEA',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
  },
};

export default Transactions;
