import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="footer-section">
      <div className="footer-grid">
        <div className="footer-column">
          <div className="footer-logo">Agile<br />FLS</div>
          <p className="footer-text">
            Agile FLS is a one man army with a passion for building and leading strong teams towards
            happiness and success.
          </p>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>

        <div className="footer-column">
          <h4>Social Media</h4>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">FAQ</a>
          <a href="#">Why Planning Poker?</a>
          <a href="mailto:support@fls.com">support@fls.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>All rights reserved © Agile FLS ApS, 2026</span>
      </div>
    </footer>
  );
};

export default Footer;