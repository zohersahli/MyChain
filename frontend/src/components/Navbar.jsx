import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>MyChain</Link>
        {isLoggedIn() && (
          <span style={styles.welcome}>Welcome, <b>{username}</b></span>
        )}
      </div>

      <ul style={styles.menu}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
        {isLoggedIn() ? (
          <>
            <li><Link to="/transactions" style={styles.link}>Transactions</Link></li>
            <li><Link to="/mine" style={styles.link}>Mine</Link></li>
            <li><Link to="/create" style={styles.link}>Create</Link></li>
            <li><Link to="/blocks" style={styles.link}>Blocks</Link></li>
            <li><Link to="/balance" style={styles.link}>Balance</Link></li>


            <li>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" style={styles.link}>Login</Link></li>
            <li><Link to="/register" style={styles.link}>Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#252A34',
    color: '#EAEAEA',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcome: {
    fontSize: '0.9rem',
    color: '#08D9D6',
  },
  logoLink: {
    color: '#08D9D6',
    textDecoration: 'none',
  },
  menu: {
    listStyle: 'none',
    display: 'flex',
    gap: '1.5rem',
    margin: 0,
    padding: 0,
  },
  link: {
    color: '#EAEAEA',
    textDecoration: 'none',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #FF2E63',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    color: '#FF2E63',
    cursor: 'pointer',
  },
};

export default Navbar;
