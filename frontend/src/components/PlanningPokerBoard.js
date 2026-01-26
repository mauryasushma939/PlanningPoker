import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import FibonacciCard from './FibonacciCard';
import TeamMembers from './TeamMembers';
import AIInsightPanel from './AIInsightPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import ChatPanel from './ChatPanel';
import Footer from './Footer';

const PlanningPokerBoard = ({ roomData, onBack }) => {
  const { socket, connected } = useSocket();
  const [members, setMembers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [estimates, setEstimates] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const userRole = roomData.role || 'reviewer';
  const [copyMessage, setCopyMessage] = useState('');
  const [storyDescription, setStoryDescription] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const fibonacciValues = [1, 2, 3, 5, 8, 13, 21, '?'];

  useEffect(() => {
    if (!socket || !connected) return;

    // Join the room
    socket.emit('join-room', {
      roomId: roomData.roomId,
      userName: roomData.userName,
      userId: roomData.userId,
      role: roomData.role || 'reviewer'
    });

    // Listen for room updates
    socket.on('room-updated', (data) => {
      setMembers(data.members);
      if (data.estimates) {
        setEstimates(data.estimates);
      }
      if (data.storyDescription !== undefined) {
        setStoryDescription(data.storyDescription);
      }
    });

    // Listen for estimate submissions
    socket.on('estimate-submitted', (data) => {
      setMembers(data.members);
    });

    // Listen for estimates revealed
    socket.on('estimates-revealed', (data) => {
      setEstimates(data.estimates);
      setMembers(data.members);
      setRevealed(true);
      setResults({
        average: data.average,
        consensus: data.consensus,
        totalVotes: data.totalVotes
      });
    });

    // Listen for estimates reset
    socket.on('estimates-reset', (data) => {
      setMembers(data.members);
      setEstimates({});
      setRevealed(false);
      setResults(null);
      setSelectedCard(null);
      setStoryDescription(null);
      setDescriptionInput('');
      setIsEditingDescription(false);
    });

    // Listen for story description updates
    socket.on('story-description-updated', (data) => {
      setStoryDescription(data.storyDescription);
    });

    // Listen for errors
    socket.on('error', (data) => {
      console.error('Socket error:', data.message);
      alert(data.message);
    });

    return () => {
      socket.off('room-updated');
      socket.off('estimate-submitted');
      socket.off('estimates-revealed');
      socket.off('estimates-reset');
      socket.off('story-description-updated');
      socket.off('error');
    };
  }, [socket, connected, roomData]);

  const handleCardSelect = (value) => {
    if (revealed || userRole === 'observer') return;

    setSelectedCard(value);
    socket.emit('submit-estimate', {
      roomId: roomData.roomId,
      userId: roomData.userId,
      estimate: value
    });
  };

  const handleReveal = () => {
    // Allow revealing even if no votes yet; backend will broadcast current state
    if (Object.keys(estimates).length === 0) {
      console.warn('Revealing with no estimates yet.');
    }

    socket.emit('reveal-estimates', {
      roomId: roomData.roomId
    });
  };

  const handleReset = () => {
    socket.emit('reset-estimates', {
      roomId: roomData.roomId
    });
  };

  const handleSetStoryDescription = () => {
    if (!descriptionInput.trim()) return;
    socket.emit('set-story-description', {
      roomId: roomData.roomId,
      userId: roomData.userId,
      storyDescription: descriptionInput.trim()
    });
    setDescriptionInput('');
    setIsEditingDescription(false);
  };

  const startEditStoryDescription = () => {
    setDescriptionInput(storyDescription || '');
    setIsEditingDescription(true);
  };

  const cancelEditStoryDescription = () => {
    setDescriptionInput('');
    setIsEditingDescription(false);
  };

  const handleCopyLink = async () => {
    const params = new URLSearchParams();
    params.set('invite', roomData.roomId);

    const inviteLink = `${window.location.origin}/?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyMessage('Invite link copied');
    } catch (err) {
      console.error('Failed to copy link:', err);
      setCopyMessage('Copy failed');
    }

    setTimeout(() => setCopyMessage(''), 2000);
  };

  return (
    <div className="planning-poker-board">
      {/* Header */}
      <div className="board-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="room-info">
          <h2>{roomData.roomName}</h2>

        </div>
        <div className="header-actions">
          <button className="copy-link-btn" onClick={handleCopyLink}>
            Share invite link
          </button>
          {copyMessage && <span className="copy-status">{copyMessage}</span>}
          <div className="toggle-buttons">
          <button className="share-btn" onClick={handleCopyLink} title="Share invite link">
            🔗 Share
          </button>
          <button
            className={`toggle-btn ${showAIPanel ? 'active' : ''}`}
            onClick={() => {
              setShowAIPanel(!showAIPanel);
              if (!showAIPanel) setShowAnalytics(false);
            }}
          >
            🤖 AI
          </button>
          <button
            className={`toggle-btn ${showAnalytics ? 'active' : ''}`}
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              if (!showAnalytics) setShowAIPanel(false);
            }}
          >
            📊 Analytics
          </button>
        </div>
        </div>
      </div>

      <div className="board-content">
        {/* Main Board */}
        <div className="main-board">
          <div className="planning-top-panels">
            {/* Team Members */}
            <TeamMembers members={members} />

            {/* Story Description */}
            <div className="story-description-section">
              {storyDescription ? (
                <div className="story-description-display">
                  <div className="story-description-header">
                    <h3>Story Description</h3>
                    {!isEditingDescription && (
                      <button className="story-edit-btn" type="button" onClick={startEditStoryDescription}>
                        Edit
                      </button>
                    )}
                  </div>

                  {!isEditingDescription ? (
                    <p>{storyDescription}</p>
                  ) : (
                    <div className="description-form">
                      <textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Update the story description..."
                        rows={3}
                      />
                      <div className="description-actions">
                        <button onClick={handleSetStoryDescription} disabled={!descriptionInput.trim()}>
                          Update Story
                        </button>
                        <button className="story-cancel-btn" type="button" onClick={cancelEditStoryDescription}>
                          Cancel
                        </button>
                      </div>
                      <p className="description-note">Anyone in the room can update the story description.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="story-description-input">
                  <h3>Add Story Description</h3>
                  <div className="description-form">
                    <textarea
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      placeholder="Describe the story to be estimated..."
                      rows={3}
                    />
                    <button onClick={handleSetStoryDescription} disabled={!descriptionInput.trim()}>
                      Set Description
                    </button>
                  </div>
                  <p className="description-note">Anyone in the room can set the story description.</p>
                </div>
              )}
            </div>
          </div>

          {/* Fibonacci Cards */}
          {storyDescription && (
            <div className="cards-section">
              <h3 className="section-title">Select Your Estimate</h3>
              <div className="cards-container">
                {fibonacciValues.map((value) => (
                  <FibonacciCard
                    key={value}
                    value={value}
                    selected={selectedCard === value}
                    onSelect={handleCardSelect}
                    disabled={revealed || userRole === 'observer'}
                  />
                ))}
              </div>
              {userRole === 'observer' && (
                <div style={{color:'#fff',marginTop:'0.5rem',fontWeight:500,fontSize:'1rem',textAlign:'center'}}>Observers cannot estimate stories.</div>
              )}
            </div>
          )}

          {/* Reveal Button */}
          {storyDescription && !revealed && (
            <motion.button
              className="reveal-button"
              onClick={handleReveal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(0, 217, 255, 0.5)',
                  '0 0 40px rgba(0, 217, 255, 0.8)',
                  '0 0 20px rgba(0, 217, 255, 0.5)'
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }
              }}
            >
              <span className="pulse-ring"></span>
              Reveal Estimates
            </motion.button>
          )}

          {/* Results Section */}
          {storyDescription && revealed && results && (
            <motion.div
              className="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="results-header">
                <h3>Results</h3>
                {results.consensus && (
                  <span className="consensus-badge">✓ Consensus Reached!</span>
                )}
              </div>

              <div className="results-stats">
                <div className="stat-item">
                  <div className="stat-label">Average</div>
                  <div className="stat-value">{results.average}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Votes</div>
                  <div className="stat-value">{results.totalVotes}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Consensus</div>
                  <div className="stat-value">{results.consensus ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="estimates-list">
                <h4>All Estimates</h4>
                <div className="estimates-grid">
                  {Object.entries(estimates).map(([userId, estimate]) => {
                    const member = members.find(m => m.id === userId);
                    return (
                      <motion.div
                        key={userId}
                        className="estimate-item"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="estimate-name">
                          {member?.name || 'Unknown'}
                        </span>
                        <span className="estimate-value">{estimate}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <button className="reset-button" onClick={handleReset}>
                Start New Round
              </button>
            </motion.div>
          )}
        </div>

        {/* Side Column */}
        <div className="side-column">
          <ChatPanel
            roomId={roomData.roomId}
            userId={roomData.userId}
            userName={roomData.userName}
          />

          {showAIPanel && (
            <div className="side-panel">
              <AIInsightPanel roomId={roomData.roomId} />
            </div>
          )}

          {showAnalytics && (
            <div className="side-panel">
              <AnalyticsDashboard roomId={roomData.roomId} />
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="connection-status">
          <span className="status-indicator offline"></span>
          Reconnecting...
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PlanningPokerBoard;
