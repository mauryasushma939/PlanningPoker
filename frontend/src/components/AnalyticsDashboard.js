import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AnalyticsDashboard = ({ roomId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/analytics/${roomId}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (loading && !analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="panel-header">
          <span className="panel-icon">📊</span>
          <h3>Analytics</h3>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const metrics = [
    { label: 'Total Stories', value: analytics.metrics.totalStories, icon: '📝' },
    { label: 'Avg Time', value: analytics.metrics.avgTime, icon: '⏱️' },
    { label: 'Consensus Rate', value: `${analytics.metrics.consensusRate}%`, icon: '🎯' },
    { label: 'AI Acceptance', value: `${analytics.metrics.aiAcceptance}%`, icon: '🤖' }
  ];

  return (
    <motion.div
      className="analytics-dashboard"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="panel-header">
        <span className="panel-icon">📊</span>
        <h3>Analytics</h3>
        <button className="refresh-btn" onClick={fetchAnalytics} disabled={loading}>
          {loading ? '↻' : '⟳'}
        </button>
      </div>

      <div className="analytics-content">
        {/* Metrics Grid */}
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              className="metric-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Accuracy Trend Chart */}
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4>Estimation Accuracy Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="sprint" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #00d9ff',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#00d9ff"
                strokeWidth={2}
                dot={{ fill: '#00d9ff', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Velocity Trend Chart */}
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h4>Sprint Velocity Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.velocityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="sprint" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #b794f6',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="planned" fill="#b794f6" />
              <Bar dataKey="completed" fill="#00ff88" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="achievements-analytics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h4>Team Achievements</h4>
          <div className="achievement-badges">
            <div className="achievement-badge gold">
              <div className="badge-icon">🥇</div>
              <div className="badge-name">Gold Master</div>
            </div>
            <div className="achievement-badge silver">
              <div className="badge-icon">🥈</div>
              <div className="badge-name">Silver Pro</div>
            </div>
            <div className="achievement-badge bronze">
              <div className="badge-icon">🥉</div>
              <div className="badge-name">Bronze Star</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
