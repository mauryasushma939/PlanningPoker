import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AIInsightPanel = ({ roomId, storyDescription }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatStoryPoints = (estimate) => {
    const value = Number(estimate);
    return value === 1 ? 'Story Point' : 'Story Points';
  };

  const fetchInsight = async () => {
    const normalizedStoryDescription = (storyDescription || '').trim();

    if (!normalizedStoryDescription) {
      setInsight(null);
      setError('Please add a story description to get AI estimation.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/ai-insight`, {
        roomId,
        storyDescription: normalizedStoryDescription
      });
      setInsight(response.data.insight);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      const apiMessage = error.response?.data?.error;
      if (apiMessage === 'Story description is required') {
        setError('Please add a story description to get AI estimation.');
      } else {
        setError('Failed to fetch AI estimation. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, storyDescription]);

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

  if (!insight && error) {
    return (
      <div className="ai-insight-panel">
        <div className="panel-header">
          <span className="panel-icon">🤖</span>
          <h3>AI Insight</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!insight) return null;

  const includes = Array.isArray(insight.includes) ? insight.includes : [];
  const recommendedEstimate = insight.suggestedEstimate || '-';
  const showEscalation = Boolean(insight.higherEstimate && insight.higherEstimateCondition);

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
          className="ai-recommendation-card"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="ai-recommendation-line">
            <span className="ai-checkmark" aria-hidden>✅</span>
            <span className="ai-recommendation-label">Recommended estimation:</span>
            <strong className="ai-recommendation-value">
              {recommendedEstimate} {formatStoryPoints(recommendedEstimate)}
            </strong>
          </p>
        </motion.div>

        <div className="ai-because-section">
          <h4>Because it includes:</h4>
          {includes.length > 0 ? (
            <ul className="ai-because-list">
              {includes.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="ai-reasoning-note">{insight.reasoning}</p>
          )}
        </div>

        {showEscalation && (
          <p className="ai-escalation-note">
            If it also includes {insight.higherEstimateCondition}, then it should be {insight.higherEstimate} SP.
          </p>
        )}

        {insight.reasoning && includes.length > 0 && (
          <p className="ai-reasoning-note">{insight.reasoning}</p>
        )}

        <p className="ai-confidence-note">Confidence: {insight.confidence}%</p>
      </div>
    </motion.div>
  );
};

export default AIInsightPanel;
