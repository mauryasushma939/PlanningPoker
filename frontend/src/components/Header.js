import React, { useState } from 'react';
// If you use react-router-dom, you can use <Link> instead of <a> for navigation
// import { Link } from 'react-router-dom';


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="top-nav sticky-header">
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/favicon.svg" alt="FLS Planning Poker Logo" style={{ height: '38px', width: '38px' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Planning Poker</span>
        <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMenuOpen(m => !m)}>
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
        </button>
      </div>
      <nav className={`nav-links${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
        <a href="#features">Features</a>
        <a href="#audience">Audience</a>
        <a href="#contact">Contact</a>
        <a href="/about">About</a>
        <a href="/faq">FAQ</a>
        <a href="/pricing">Pricing</a>
      </nav>
    </header>
  );
};

export default Header;