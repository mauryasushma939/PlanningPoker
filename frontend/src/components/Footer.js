import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="footer-section">
      <div className="footer-grid">
        <div className="footer-column">
          <div className="footer-logo">Agile</div>
          <p className="footer-text">
            Agile is a one man army with a passion for building and leading strong teams towards
            happiness and success.
          </p>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>

        <div className="footer-column">
          <h4>FLS Tools </h4>
          <span> <a href='https://fls-xier.vercel.app/' target='_blank' rel='noopener noreferrer'>Game</a></span>
          <span>Twitter</span>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <span>Why Planning Poker?</span>
          <a href="mailto:viren.nitkkr@gmail.com">viren.nitkkr@gmail.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>All rights reserved © FLS Pointing Pocker @2026</span>
      </div>
    </footer>
  );
};

export default Footer;