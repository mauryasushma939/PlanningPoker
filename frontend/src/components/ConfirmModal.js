import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Backdrop = ({ children, onClose }) => (
  <motion.div
    className="modal-backdrop"
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {children}
  </motion.div>
);

const ConfirmModal = ({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Backdrop onClose={onCancel}>
          <motion.div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <div className="modal-title">{title}</div>
            </div>
            <div className="modal-body">
              <p className="modal-message">{message}</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--secondary" onClick={onCancel}>
                {cancelText}
              </button>
              <button className="modal-btn modal-btn--primary" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;