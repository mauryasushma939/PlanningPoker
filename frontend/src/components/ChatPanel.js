import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const quickEmojis = ['😀', '🤣', '👍', '🔥', '🚀', '🤔', '✅', '🏆'];

const ChatPanel = ({ roomId, userId, userName }) => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleHistory = (history) => {
      setMessages(history || []);
    };

    const handleMessage = (message) => {
      setMessages((prev) => [...prev.slice(-199), message]);
    };

    socket.on('chat-history', handleHistory);
    socket.on('chat-message', handleMessage);

    // Pull history after (re)connect to cover reloads and reconnects
    if (connected) {
      socket.emit('chat-history-request', { roomId });
    }

    return () => {
      socket.off('chat-history', handleHistory);
      socket.off('chat-message', handleMessage);
    };
  }, [socket, roomId, connected]);

  useEffect(() => {
    if (socket && roomId && connected) {
      socket.emit('chat-history-request', { roomId });
    }
  }, [socket, roomId, connected]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socket || !connected) return;

    socket.emit('chat-message', {
      roomId,
      userId,
      userName,
      text
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      className="chat-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="chat-header">
        <div>
          <div className="chat-title">Team Chat</div>
          <div className="chat-subtitle">Share comments, jokes, and story notes</div>
        </div>
        <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
      </div>

      <div className="chat-body" ref={listRef}>
        {messages.map((msg) => {
          const mine = msg.userId === userId;
          return (
            <div key={msg.id} className={`chat-message ${mine ? 'self' : ''}`}>
              <div className="chat-meta">
                <span className="chat-author">{msg.userName || 'Guest'}</span>
                <span className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="chat-empty">Start the conversation for this story 👋</div>
        )}
      </div>

      <div className="chat-input-wrap">
        <div className="emoji-row">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              className="emoji-btn"
              type="button"
              onClick={() => setInput((prev) => `${prev}${emoji}`)}
            >
              {emoji}
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Discuss the story, share ideas, or drop a fun emoji"
          className="chat-textarea"
        />
        <button
          className="chat-send"
          onClick={sendMessage}
          disabled={!connected || !input.trim()}
        >
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
