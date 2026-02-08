import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from './Footer';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const LandingPage = ({ onStartSession }) => {
  const leftFeatures = [
    { title: 'Easy to get started', icon: '🚀', body: 'Type in your name to create a planning poker room and share the room through a unique link.' },
    { title: 'Desktop & mobile', icon: '💻', body: 'Runs in the browser and fits the screen of your mobile or desktop PC.' },
    { title: 'No Login Needed', icon: '🆓', body: 'Create room & start instantly' }
  ];

  const rightFeatures = [
    { title: 'Moderator control', icon: '🧭', body: 'Moderators stay in control and can reveal team estimates whenever needed.' },
    { title: 'Instant Estimation', icon: '⚡️', body: 'Real-time voting with team group chat.' },
    { title: 'Reusable rooms', icon: '♻️', body: 'Reuse the same invite link for recurring sessions and save setup time.' }
  ];

  const testimonials = [
    { quote: 'Loved by Scrum Masters and ★★★★★', name: 'Agile Coach' },
    { quote: 'Used by Agile teams & QA engineers', name: 'Scrum Master' }
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
  // const [joinRoomName, setJoinRoomName] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinRole, setJoinRole] = useState('reviewer');
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
  // Pass role to session/join logic as needed

    setJoinLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${joinRoomId.trim()}`);
      const room = response.data.room;

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const resolvedRoomName = room?.name || joinRoomId.trim();
  // You may want to pass joinRole to the backend or context here

      onStartSession({
        roomId: joinRoomId.trim(),
        roomName: resolvedRoomName,
        userName: joinUserName.trim(),
        userId,
        role: joinRole
      });
    } catch (err) {
      console.error('Error joining room:', err);
      setJoinError('Room not found. Please check the ID and try again.');
    } finally {
      setJoinLoading(false);
    }
  };
  const fibonacciCards = [0, 0.5, 1, 2, 3, 5, 8, '?'];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-inner">
          <div className="hero-content">
            <motion.h1
              className="hero-title"
              style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}
            >
              <span className="hero-title-desktop" style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
                <motion.span
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: [0, -10, 0], opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: '#00d9ff', fontWeight: 900 }}
                >
                  Fun
                </motion.span>
                <motion.span
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: [0, 10, 0], opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.4, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: '#b794f6', fontWeight: 900 }}
                >
                  Learn
                </motion.span>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                  transition={{ duration: 1.6, delay: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: '#ffd15c', fontWeight: 900 }}
                >
                  Succeed
                </motion.span>
              </span>
              <span className="hero-title-mobile">
                <motion.span
                  className="mobile-fun"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: [0, -8, 0], opacity: 1 }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                >
                  Fun
                </motion.span>
                <motion.span
                  className="mobile-learn"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: [0, 8, 0], opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.2, repeat: Infinity, repeatType: 'reverse' }}
                >
                  Learn
                </motion.span>
                <motion.span
                  className="mobile-succeed"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.12, 1], opacity: 1 }}
                  transition={{ duration: 1.6, delay: 0.4, repeat: Infinity, repeatType: 'reverse' }}
                >
                  Succeed
                </motion.span>
              </span>
            </motion.h1>
            
            <motion.p
              className="hero-subtitle"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              FLS Planning Poker is a simple, real-time online planning poker app designed to make remote estimation sessions faster, clearer, and more enjoyable for Agile teams.
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
                className="cta-button secondary join-room-btn"
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
                  {[3, 5, '?'].map((value) => (
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

      {/* Join Room Modal (overlay like Create modal) */}
      {showJoin && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowJoin(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="join-card">
              <div className="join-card-header">
                <h3>Join an Existing Room</h3>
                <button className="close-join" onClick={() => setShowJoin(false)}>×</button>
              </div>
              <form onSubmit={handleJoinRoom} className="join-form">

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
                <div className="form-group role-group">
                  <span className="role-label">Role:</span>
                  <div className="role-radio-row">
                    <label className="role-radio">
                      <input
                        type="radio"
                        name="joinRole"
                        value="reviewer"
                        checked={joinRole === 'reviewer'}
                        onChange={() => setJoinRole('reviewer')}
                        disabled={joinLoading}
                      />
                      <span className="custom-radio"></span>
                      Reviewer
                    </label>
                    <label className="role-radio">
                      <input
                        type="radio"
                        name="joinRole"
                        value="observer"
                        checked={joinRole === 'observer'}
                        onChange={() => setJoinRole('observer')}
                        disabled={joinLoading}
                      />
                      <span className="custom-radio"></span>
                      Observer
                    </label>
                  </div>
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
                    {joinLoading ? <Spinner label="Joining" /> : 'Join Room'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
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
                  <span>Planning Poker</span>
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
                  {['0', '0.5', '1', '2', '3', '5', '?', '20', '40', '100'].map((card) => (
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
                <span className="audience-app">Planning Poker</span>
                <span className="audience-rooms">Rooms</span>
              </div>
              <div className="audience-player-list">
                <div className="audience-player"><span className="dot red" />Tapan <span className="player-score">3</span></div>
                <div className="audience-player"><span className="dot purple" />Kuldip<span className="player-score">?</span></div>
                <div className="audience-player"><span className="dot yellow" />Viren<span className="player-score">5</span></div>
              </div>
              <div className="audience-chart">
                <div className="audience-pie" />
                <div className="audience-chart-labels">
                  <span>5</span>
                  <span>3</span>
                  <span>?</span>
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
      <Footer />

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
                  {loading ? <Spinner label="Creating" /> : 'Create Room'}
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
