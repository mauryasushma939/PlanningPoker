import React from 'react';
import { motion } from 'framer-motion';

const FibonacciCard = ({ value, selected, onSelect, disabled }) => {
  return (
    <motion.div
      className={`fibonacci-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onSelect(value)}
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-value">{value}</div>
      {selected && (
        <motion.div
          className="card-checkmark"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          ✓
        </motion.div>
      )}
      {selected && <div className="card-glow"></div>}
    </motion.div>
  );
};

export default FibonacciCard;
