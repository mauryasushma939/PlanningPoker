import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AIInsightPanel = ({ roomId }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/ai-insight`, {
        roomId,
        storyDescription: 'Current story being estimated'
      });
      setInsight(response.data.insight);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (loading && !insight) {
    return (
      <div className="ai-insight-panel">
        <div className="panel-header">
          <span className="panel-icon">🤖</span>
          <h3>AI Insight</h3>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      className="ai-insight-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="panel-header">
        <span className="panel-icon">🤖</span>
        <h3>AI Insight</h3>
        <button className="refresh-btn" onClick={fetchInsight} disabled={loading}>
          {loading ? '↻' : '⟳'}
        </button>
      </div>

      <div className="insight-content">
        <motion.div
          className="suggested-estimate-large"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="estimate-label">Suggested Estimate</div>
          <div className="estimate-value">{insight.suggestedEstimate}</div>
        </motion.div>

        <div className="confidence-section">
          <div className="confidence-header">
            <span>Confidence Score</span>
            <span className="confidence-value">{insight.confidence}%</span>
          </div>
          <div className="confidence-bar-container">
            <motion.div
              className="confidence-bar"
              initial={{ width: 0 }}
              animate={{ width: `${insight.confidence}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>

        <div className="reasoning-section">
          <h4>Reasoning</h4>
          <p>{insight.reasoning}</p>
        </div>

        <div className="similar-stories-section">
          <h4>Similar Past Stories</h4>
          <div className="stories-list">
            {insight.similarStories.map((story, index) => (
              <motion.div
                key={index}
                className="story-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <div className="story-name">{story.name}</div>
                <div className="story-details">
                  <span className="story-estimate">Est: {story.estimate}</span>
                  <span className="story-accuracy">
                    Accuracy: {story.accuracy}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="achievements-section">
          <h4>Achievement Badges</h4>
          <div className="badges">
            <div className="badge" title="Estimation Master">🏆</div>
            <div className="badge" title="Consensus Builder">🤝</div>
            <div className="badge" title="Quick Estimator">⚡</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsightPanel;
