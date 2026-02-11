import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import FibonacciCard from './FibonacciCard';
import TeamMembers from './TeamMembers';
import AIInsightPanel from './AIInsightPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import ChatPanel from './ChatPanel';
import Footer from './Footer';
import ConfirmModal from './ConfirmModal';

const PlanningPokerBoard = ({ roomData, onBack }) => {
  const { socket, connected } = useSocket();
  const [members, setMembers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [estimates, setEstimates] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState(null);
  const [showAIPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const userRole = roomData.role || 'reviewer';
  const [copyMessage, setCopyMessage] = useState('');
  const [storyDescription, setStoryDescription] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState(null); // 'back' | null
  const [showConfetti, setShowConfetti] = useState(false);

  const fibonacciValues = [0, 0.5, 1, 2, 3, 5, 8, '?'];

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
      // If consensus reached, trigger confetti for 4 seconds
      if (data.consensus) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
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

  // Prompt before leaving the room (browser back, refresh, or close)
  useEffect(() => {
    const message = 'Do you want to close the meeting room?';

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    const handlePopState = () => {
      setPendingNav('back');
      setShowLeaveConfirm(true);
      // Re-push to keep us on the page until user confirms
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    if (pendingNav === 'back') {
      if (typeof onBack === 'function') onBack();
    }
    setPendingNav(null);
  };

  const cancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingNav(null);
  };

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
        <div className="room-badge" title={roomData.roomName}>
          <div className="room-badge-label">Planning Room</div>
          <div className="room-badge-name">{roomData.roomName}</div>
        </div>
        <div className="room-info">
          <div className="header-story">
            <div className="story-description-section story-description-compact">
              {storyDescription ? (
                <div className="story-description-display">
                  <div className="story-description-header">
                    <h3>Story Description</h3>
                  </div>

                  {!isEditingDescription ? (
                    <div className="story-description-content">
                      <div className="story-field">
                        <div className="story-field-actions">
                          <button className="story-field-btn story-field-btn--primary" type="button" onClick={startEditStoryDescription}>
                            Edit
                          </button>
                        </div>
                        <div className="story-description-text">{storyDescription}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="description-form">
                      <div className="story-field story-field--editing">
                        <div className="story-field-actions">
                          <button
                            className="story-field-btn story-field-btn--primary"
                            type="button"
                            onClick={handleSetStoryDescription}
                            disabled={!descriptionInput.trim()}
                          >
                            Update
                          </button>
                        </div>
                        <textarea
                          value={descriptionInput}
                          onChange={(e) => setDescriptionInput(e.target.value)}
                          placeholder="Update the story description..."
                          rows={2}
                          className="story-description-text story-description-textarea"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="story-description-input">
                  <div className="story-description-header">
                    <h3>Add Story</h3>
                  </div>
                  <div className="description-form">
                    <div className="story-field">
                      <div className="story-field-actions">
                        <button
                          className="story-field-btn story-field-btn--primary"
                          type="button"
                          onClick={handleSetStoryDescription}
                          disabled={!descriptionInput.trim()}
                        >
                          Add
                        </button>
                      </div>
                      <textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Describe the story to be estimated..."
                        rows={2}
                        className="story-description-text story-description-textarea"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="board-content">
        {/* Main Board */}
        <div className="main-board">
          {storyDescription ? (
            <div className="estimation-top">
              <div className="estimation-left">
                <TeamMembers members={members} />
              </div>

              <div className="estimation-right">
                {!revealed ? (
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
                      <div style={{ color: '#fff', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem', textAlign: 'center' }}>
                        Observers cannot estimate stories.
                      </div>
                    )}
                  </div>
                ) : (
                  results && (
                    <motion.div
                      className="results-section results-section-inline"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="results-header">
                        <h3>Results</h3>
                        {results.consensus && <span className="consensus-badge">✓ Consensus Reached!</span>}
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
                            const member = members.find((m) => m.id === userId);
                            return (
                              <motion.div
                                key={userId}
                                className="estimate-item"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                              >
                                <span className="estimate-name">{member?.name || 'Unknown'}</span>
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
                  )
                )}

                {/* Reveal Button */}
                {!revealed && (
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
              </div>
            </div>
          ) : (
            <TeamMembers members={members} />
          )}

          {/* Results are shown inline in the right column after reveal */}
        </div>

        {/* Side Column */}
        <div className="side-column">
          <ChatPanel
            roomId={roomData.roomId}
            userId={roomData.userId}
            userName={roomData.userName}
          />

          {/* Moved: Analytics & Share buttons below the Team chat */}
          <div className="room-badge room-badge--right" title={roomData.roomName}>
            <div className="room-badge-actions">
              <div className="toggle-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className={`toggle-btn ${showAnalytics ? 'active' : ''}`}
                  onClick={() => {
                    setShowAnalytics(!showAnalytics);
                  }}
                >
                  <span className="icon" aria-hidden>📊</span>
                  <span>Analytics</span>
                </button>
                <div className="share-tooltip-wrap">
                  <button className="share-btn" onClick={handleCopyLink} aria-label="Share invite link">
                    <span className="icon" aria-hidden>🔗</span>
                    <span>Share</span>
                  </button>
                  <span className="share-tooltip" role="tooltip">Share invite link</span>
                  {copyMessage && <span className="copy-status">{copyMessage}</span>}
                </div>
              </div>
            </div>
          </div>

          {showAIPanel && (
            <div className="side-panel">
              <AIInsightPanel roomId={roomData.roomId} />
            </div>
          )}
        </div>
      </div>

      {showAnalytics && (
        <div className="analytics-below">
          <AnalyticsDashboard roomId={roomData.roomId} />
        </div>
      )}

      {/* Connection Status */}
      {!connected && (
        <div className="connection-status">
          <span className="status-indicator offline"></span>
          Reconnecting...
        </div>
      )}

      <ConfirmModal
        open={showLeaveConfirm}
        title="Leave Room"
        message="Do you want to close the meeting room?"
        confirmText="Yes, leave"
        cancelText="No, stay"
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />

      <Footer />
      {showConfetti && (
        <div className="confetti-overlay" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={`confetti confetti-${i % 6}`}>
              {['🏆','🎉','🎊','🥳','⭐','💫'][i % 6]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanningPokerBoard;
