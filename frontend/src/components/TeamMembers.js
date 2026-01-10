import React from 'react';
import { motion } from 'framer-motion';

const TeamMembers = ({ members }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Voted':
        return '#00ff88';
      case 'Thinking':
        return '#ffd93d';
      case 'Ready':
        return '#00d9ff';
      case 'Skipped':
        return '#ff6b6b';
      default:
        return '#888';
    }
  };

  const getAvatarColor = (index) => {
    const colors = ['#00d9ff', '#b794f6', '#ffd93d', '#ff6b6b', '#00ff88', '#ff9500'];
    return colors[index % colors.length];
  };

  return (
    <div className="team-members-section">
      <div className="team-members-header">
        <h3>Team Members</h3>
        <span className="member-count">{members.length} online</span>
      </div>
      <div className="team-members-list">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            className="team-member"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div
              className="member-avatar"
              style={{ backgroundColor: getAvatarColor(index) }}
            >
              {member.name.charAt(0).toUpperCase()}
              {member.online && (
                <motion.div
                  className="online-indicator"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              )}
            </div>
            <div className="member-info">
              <div className="member-name">{member.name}</div>
              <div
                className="member-status"
                style={{ color: getStatusColor(member.status) }}
              >
                {member.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
