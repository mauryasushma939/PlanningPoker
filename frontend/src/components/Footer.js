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
          <h4>Social Media</h4>
          <span>LinkedIn</span>
          <span>Twitter</span>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <span>Why Planning Poker?</span>
          <a href="mailto:support@fls.com">support@pp_fls.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>All rights reserved © FLS Pointing Pocker @2026</span>
      </div>
    </footer>
  );
};

export default Footer;