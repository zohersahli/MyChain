import React from 'react';
import { isLoggedIn } from '../utils/auth';

const Home = () => {
  const username = localStorage.getItem('username');

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Welcome to MyChain</h1>
      <p style={styles.subtitle}>A simple blockchain network</p>
      {isLoggedIn() && (
        <p style={styles.userMessage}><b>Hello,{username}!</b> Enjoy your chain.</p>
      )}
    </section>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: '5rem 1rem',
    backgroundColor: '#08D9D6',
    color: '#252A34',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minHeight: 'calc(100vh - 140px)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  userMessage: {
    fontSize: '1.5rem',
    color: '#252A34',
    marginTop: '1rem',
  },
};

export default Home;
