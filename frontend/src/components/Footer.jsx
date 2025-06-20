import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>© {new Date().getFullYear()} MyChain. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#252A34',
    textAlign: 'center',
    padding: '1rem 0',
    borderTop: '2px solid #08D9D6',
  },
  text: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#EAEAEA',
  },
};

export default Footer;
