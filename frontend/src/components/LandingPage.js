import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const LandingPage = ({ onStartSession }) => {
  const leftFeatures = [
    { title: 'Easy to get started', icon: '🚀', body: 'Type in your name to create a planning poker room and share the room through a unique link.' },
    { title: 'Desktop & mobile', icon: '💻', body: 'Runs in the browser and fits the screen of your mobile or desktop PC.' },
    { title: 'Configurable cards', icon: '🃏', body: 'Customize the deck to fit your needs. Remove half-points if you do not use them.' }
  ];

  const rightFeatures = [
    { title: 'Moderator control', icon: '🧭', body: 'Moderators stay in control and can reveal team estimates whenever needed.' },
    { title: 'Moderation handover', icon: '🔄', body: 'Hand over moderation to other players when you need to share control.' },
    { title: 'Reusable rooms', icon: '♻️', body: 'Reuse the same invite link for recurring sessions and save setup time.' }
  ];

  const pricing = [
    { name: 'Basic', price: 'Free', perks: ['Single room', 'Basic moderation', 'Up to 9 participants'] },
    { name: 'Pro', price: '$10 / mo', perks: ['Unlimited rooms', 'Enhanced moderation', 'Unlimited participants'] },
    { name: 'Enterprise', price: '$50 / mo', perks: ['Org-wide rooms', 'Moderator insights', 'Priority support'] }
  ];

  const testimonials = [
    { quote: 'Finally a planning poker tool that stays out of the way.', name: 'Agile Coach' },
    { quote: '30 seconds from link to reveal—perfect for remote grooming.', name: 'Scrum Master' }
  ];

  const audienceReasons = [
    'You are sitting in remote planning sessions and the facilitator is sharing the user stories on a screen. You just need a tool on the side for the planning poker game.',
    'You are used to having physical planning poker sessions and are looking for a remote substitute that is as simple as the physical playing cards.',
    'You are entering story points into your team chat and are looking for a better alternative.',
    'You are new to planning poker and are looking for a simple tool to get you started.'
  ];

  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinRoomName, setJoinRoomName] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');

    if (inviteCode) {
      setShowJoin(true);
      setJoinRoomId(inviteCode);
    }
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomName.trim() || !userName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/rooms`, {
        roomName: roomName.trim(),
        creatorName: userName.trim()
      });

      const { roomId } = response.data;
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      onStartSession({
        roomId,
        roomName: roomName.trim(),
        userName: userName.trim(),
        userId
      });
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!joinRoomId.trim() || !joinUserName.trim()) {
      setJoinError('Room ID and your name are required');
      return;
    }

    setJoinLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${joinRoomId.trim()}`);
      const room = response.data.room;

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const resolvedRoomName = room?.name || joinRoomName || joinRoomId.trim();

      onStartSession({
        roomId: joinRoomId.trim(),
        roomName: resolvedRoomName,
        userName: joinUserName.trim(),
        userId
      });
    } catch (err) {
      console.error('Error joining room:', err);
      setJoinError('Room not found. Please check the ID and try again.');
    } finally {
      setJoinLoading(false);
    }
  };
  const fibonacciCards = [1, 2, 3, 5, 8, 13];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="top-nav">
          <div className="nav-brand">Story Point Poker</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#audience">Audience</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="hero-inner">
          <div className="hero-content">
            <motion.h1
              className="hero-title"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              POKER
            </motion.h1>
            
            <motion.p
              className="hero-subtitle"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Simple online planning poker app that will speed up estimation in remote planning sessions
            </motion.p>

            <div className="cta-row">
              <motion.button
                className="cta-button"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
              >
                Get Started Now
              </motion.button>

              <motion.button
                className="cta-button secondary"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJoin(true)}
              >
                Join a Room
              </motion.button>
            </div>
          </div>

          {/* Mockup Display */}
          <motion.div
            className="mockup-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {/* Laptop Mockup */}
            <div className="laptop-mockup">
              <div className="laptop-screen">
                <div className="poker-board-preview">
                  <div className="preview-header">
                    <div className="preview-dot"></div>
                    <div className="preview-dot"></div>
                    <div className="preview-dot"></div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-cards">
                      {fibonacciCards.map((value, index) => (
                        <motion.div
                          key={value}
                          className="preview-card"
                          animate={{
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            delay: index * 0.1,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          {value}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <motion.div
              className="mobile-mockup"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="mobile-screen">
                <div className="mobile-cards">
                  {[3, 5, 8].map((value) => (
                    <div key={value} className="mobile-card">{value}</div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating AI Insight Panel */}
            <motion.div
              className="floating-panel ai-preview"
              animate={{
                y: [0, -10, 0],
                rotate: [-1, 1, -1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="panel-header">
                <span className="panel-icon">🤖</span>
                <span className="panel-title">AI Insight</span>
              </div>
              <div className="panel-content">
                <div className="suggested-estimate">5</div>
                <div className="confidence-label">Confidence: 89%</div>
              </div>
            </motion.div>

            {/* Floating Analytics Panel */}
            <motion.div
              className="floating-panel analytics-preview"
              animate={{
                y: [0, 10, 0],
                rotate: [1, -1, 1]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="panel-header">
                <span className="panel-icon">📊</span>
                <span className="panel-title">Analytics</span>
              </div>
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: '40%' }}></div>
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '80%' }}></div>
                <div className="chart-bar" style={{ height: '100%' }}></div>
              </div>
            </motion.div>

            {/* Team Member Avatars */}
            <motion.div
              className="floating-avatars"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {['#00d9ff', '#b794f6', '#ffd93d'].map((color, index) => (
                <div key={index} className="avatar-preview" style={{ backgroundColor: color }}>
                  <div className="avatar-status"></div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Join Room Panel */}
      {showJoin && (
        <motion.section
          className="join-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="join-card">
            <div className="join-card-header">
              <h3>Join an Existing Room</h3>
              <button className="close-join" onClick={() => setShowJoin(false)}>×</button>
            </div>
            <form onSubmit={handleJoinRoom} className="join-form">
              <div className="form-group">
                <label htmlFor="joinRoomId">Room ID</label>
                <input
                  type="text"
                  id="joinRoomId"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="e.g., ab12cd34"
                  disabled={joinLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="joinRoomName">Room Name (optional)</label>
                <input
                  type="text"
                  id="joinRoomName"
                  value={joinRoomName}
                  onChange={(e) => setJoinRoomName(e.target.value)}
                  placeholder="Helps teammates identify the room"
                  disabled={joinLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="joinUserName">Your Name</label>
                <input
                  type="text"
                  id="joinUserName"
                  value={joinUserName}
                  onChange={(e) => setJoinUserName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  disabled={joinLoading}
                />
              </div>
              {joinError && <div className="error-message">{joinError}</div>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowJoin(false)}
                  disabled={joinLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={joinLoading}
                >
                  {joinLoading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      )}

      {/* Key Features Section */}
      <motion.section
        id="features"
        className="key-features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-header">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">If you are not convinced yet then take a look at the key selling points</p>
        </div>

        <div className="key-feature-layout">
          <div className="key-feature-list">
            {leftFeatures.map((item) => (
              <div className="key-feature-item" key={item.title}>
                <div className="key-feature-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <motion.div
            className="key-phone-wrap"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          >
            <div className="key-ring"></div>
            <div className="key-phone">
              <div className="key-phone-top">
                <div className="key-notch" />
              </div>
              <div className="key-screen">
                <div className="key-bar">
                  <span>Story Point Poker</span>
                  <span className="key-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                </div>
                <div className="key-player-list">
                  <div className="key-player-row">
                    <span className="avatar red"></span>
                    <span>Keta</span>
                    <span className="check"></span>
                  </div>
                  <div className="key-player-row">
                    <span className="avatar purple"></span>
                    <span>Kuldip</span>
                    <span className="check"></span>
                  </div>
                  <div className="key-player-row">
                    <span className="avatar yellow"></span>
                    <span>Viren</span>
                    <span className="check"></span>
                  </div>
                </div>
                <div className="key-cards-grid">
                  {['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'].map((card) => (
                    <div key={card} className="key-card">{card}</div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="key-feature-list">
            {rightFeatures.map((item) => (
              <div className="key-feature-item" key={item.title}>
                <div className="key-feature-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Audience Section */}
      <motion.section
        id="audience"
        className="audience-hero"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="audience-grid">
          <motion.div
            className="audience-phone"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            <div className="audience-phone-top">
              <div className="audience-speaker" />
              <div className="audience-camera" />
            </div>
            <div className="audience-screen">
              <div className="audience-header">
                <span className="audience-app">Story Point Poker</span>
                <span className="audience-rooms">Rooms</span>
              </div>
              <div className="audience-player-list">
                <div className="audience-player"><span className="dot red" />Keta<span className="player-score">3</span></div>
                <div className="audience-player"><span className="dot purple" />Kuldip<span className="player-score">8</span></div>
                <div className="audience-player"><span className="dot yellow" />Viren<span className="player-score">5</span></div>
              </div>
              <div className="audience-chart">
                <div className="audience-pie" />
                <div className="audience-chart-labels">
                  <span>5</span>
                  <span>3</span>
                  <span>8</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="audience-copy">
            <h2 className="audience-title">Audience</h2>
            <p className="audience-lead">You have come to the right place if...</p>
            <div className="audience-points">
              {audienceReasons.map((line) => (
                <div className="audience-point" key={line}>
                  <span className="audience-icon">👍</span>
                  <p>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-header">
          <h2 className="section-title">What teams say</h2>
          <p className="section-subtitle">Fast to start, easy to reveal, and stays out of the way</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.quote}
              className="testimonial-card"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <p className="quote">“{t.quote}”</p>
              <div className="quote-author">{t.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
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
          <span>All rights reserved © Agile FLS ApS, 2025</span>
        </div>
      </footer>

      {/* Create Room Modal */}
      {showModal && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Create Planning Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Sprint 24 Planning"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="userName">Your Name</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., John Doe"
                  disabled={loading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
