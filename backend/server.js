const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const rooms = new Map();
const analytics = new Map();

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create new room
app.post('/api/rooms', (req, res) => {
  try {
    const { roomName, creatorName } = req.body;
    
    if (!roomName || !creatorName) {
      return res.status(400).json({ error: 'Room name and creator name are required' });
    }

    const roomId = uuidv4().substring(0, 8);
    const room = {
      id: roomId,
      name: roomName,
      creator: creatorName,
      members: [],
      estimates: {},
      revealed: false,
      createdAt: new Date().toISOString(),
      messages: []
    };

    rooms.set(roomId, room);
    
    // Initialize analytics for the room
    analytics.set(roomId, {
      totalStories: 0,
      avgTime: 0,
      consensusRate: 0,
      aiAcceptance: 0,
      accuracyTrend: [],
      velocityTrend: []
    });

    res.json({ roomId, room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Get AI insight
app.post('/api/ai-insight', (req, res) => {
  try {
    const { roomId, storyDescription } = req.body;

    // Simulate AI processing with realistic data
    const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];
    const suggestedEstimate = fibonacciNumbers[Math.floor(Math.random() * fibonacciNumbers.length)];
    const confidence = Math.floor(Math.random() * 20) + 75; // 75-95%

    const insight = {
      suggestedEstimate,
      confidence,
      reasoning: `Based on ${Math.floor(Math.random() * 50) + 10} similar stories, this task appears to have ${
        suggestedEstimate <= 3 ? 'low' : suggestedEstimate <= 8 ? 'medium' : 'high'
      } complexity with clear acceptance criteria.`,
      similarStories: [
        {
          name: 'User authentication flow',
          estimate: suggestedEstimate,
          accuracy: Math.floor(Math.random() * 15) + 85
        },
        {
          name: 'Payment gateway integration',
          estimate: suggestedEstimate === 1 ? 2 : suggestedEstimate - 1,
          accuracy: Math.floor(Math.random() * 15) + 80
        },
        {
          name: 'Dashboard analytics panel',
          estimate: suggestedEstimate === 21 ? 13 : suggestedEstimate + (suggestedEstimate <= 8 ? 1 : 8),
          accuracy: Math.floor(Math.random() * 15) + 82
        }
      ]
    };

    res.json({ insight });
  } catch (error) {
    console.error('Error getting AI insight:', error);
    res.status(500).json({ error: 'Failed to get AI insight' });
  }
});

// Get analytics data
app.get('/api/analytics/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const roomAnalytics = analytics.get(roomId);

    if (!roomAnalytics) {
      return res.status(404).json({ error: 'Analytics not found for this room' });
    }

    // Generate realistic analytics data
    const data = {
      metrics: {
        totalStories: roomAnalytics.totalStories || Math.floor(Math.random() * 50) + 20,
        avgTime: roomAnalytics.avgTime || `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
        consensusRate: roomAnalytics.consensusRate || Math.floor(Math.random() * 20) + 75,
        aiAcceptance: roomAnalytics.aiAcceptance || Math.floor(Math.random() * 15) + 80
      },
      accuracyTrend: roomAnalytics.accuracyTrend.length > 0 ? roomAnalytics.accuracyTrend : [
        { sprint: 'Sprint 1', accuracy: 72 },
        { sprint: 'Sprint 2', accuracy: 78 },
        { sprint: 'Sprint 3', accuracy: 85 },
        { sprint: 'Sprint 4', accuracy: 88 },
        { sprint: 'Sprint 5', accuracy: 91 }
      ],
      velocityTrend: roomAnalytics.velocityTrend.length > 0 ? roomAnalytics.velocityTrend : [
        { sprint: 'Sprint 1', planned: 34, completed: 28 },
        { sprint: 'Sprint 2', planned: 38, completed: 35 },
        { sprint: 'Sprint 3', planned: 42, completed: 40 },
        { sprint: 'Sprint 4', planned: 45, completed: 44 },
        { sprint: 'Sprint 5', planned: 48, completed: 46 }
      ]
    };

    res.json({ analytics: data });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Socket.io real-time events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins a room
  socket.on('join-room', ({ roomId, userName, userId }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Join the socket room
      socket.join(roomId);
      
      // Add user to room members if not already present
      const existingMember = room.members.find(m => m.id === userId);
      if (!existingMember) {
        const member = {
          id: userId,
          name: userName,
          socketId: socket.id,
          status: 'Thinking',
          online: true
        };
        room.members.push(member);
      } else {
        existingMember.socketId = socket.id;
        existingMember.online = true;
        existingMember.status = 'Thinking';
      }

      // Broadcast updated room state to all members
      io.to(roomId).emit('room-updated', {
        members: room.members,
        estimates: room.revealed ? room.estimates : {}
      });

      console.log(`User ${userName} joined room ${roomId}`);

      // Send existing chat history to the joining user
      if (room.messages && room.messages.length > 0) {
        socket.emit('chat-history', room.messages.slice(-100));
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // User submits estimate
  socket.on('submit-estimate', ({ roomId, userId, estimate }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Store the estimate
      room.estimates[userId] = estimate;

      // Update member status
      const member = room.members.find(m => m.id === userId);
      if (member) {
        member.status = 'Voted';
      }

      // Broadcast updated state (but don't reveal estimates yet)
      io.to(roomId).emit('estimate-submitted', {
        userId,
        members: room.members,
        estimateCount: Object.keys(room.estimates).length
      });

      console.log(`User ${userId} submitted estimate in room ${roomId}`);
    } catch (error) {
      console.error('Error submitting estimate:', error);
      socket.emit('error', { message: 'Failed to submit estimate' });
    }
  });

  // Chat message
  socket.on('chat-message', ({ roomId, userId, userName, text }) => {
    try {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const trimmed = (text || '').trim();
      if (!trimmed) return;

      const message = {
        id: uuidv4(),
        userId,
        userName,
        text: trimmed.slice(0, 500),
        createdAt: new Date().toISOString()
      };

      room.messages = room.messages || [];
      room.messages.push(message);
      // cap history
      if (room.messages.length > 200) {
        room.messages = room.messages.slice(-200);
      }

      io.to(roomId).emit('chat-message', message);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send chat message' });
    }
  });

  // Chat history on-demand (in case a client mounts after join broadcast)
  socket.on('chat-history-request', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      const history = room.messages ? room.messages.slice(-100) : [];
      socket.emit('chat-history', history);
    } catch (error) {
      console.error('Error handling chat history request:', error);
    }
  });

  // Reveal all estimates
  socket.on('reveal-estimates', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      room.revealed = true;

      // Calculate average (excluding '?' votes)
      const numericEstimates = Object.values(room.estimates).filter(e => e !== '?').map(Number);
      const average = numericEstimates.length > 0
        ? (numericEstimates.reduce((a, b) => a + b, 0) / numericEstimates.length).toFixed(1)
        : 0;

      // Check for consensus (all same value)
      const uniqueEstimates = new Set(numericEstimates);
      const consensus = uniqueEstimates.size === 1 && numericEstimates.length > 0;

      // Broadcast revealed estimates to all members
      io.to(roomId).emit('estimates-revealed', {
        estimates: room.estimates,
        members: room.members,
        average,
        consensus,
        totalVotes: Object.keys(room.estimates).length
      });

      // Update analytics
      const roomAnalytics = analytics.get(roomId);
      if (roomAnalytics) {
        roomAnalytics.totalStories += 1;
        if (consensus) {
          roomAnalytics.consensusRate = Math.min(
            100,
            roomAnalytics.consensusRate + 1
          );
        }
      }

      console.log(`Estimates revealed in room ${roomId}`);
    } catch (error) {
      console.error('Error revealing estimates:', error);
      socket.emit('error', { message: 'Failed to reveal estimates' });
    }
  });

  // Reset estimates for new round
  socket.on('reset-estimates', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Clear estimates and reset states
      room.estimates = {};
      room.revealed = false;
      
      // Reset member statuses
      room.members.forEach(member => {
        if (member.online) {
          member.status = 'Thinking';
        }
      });

      // Broadcast reset to all members
      io.to(roomId).emit('estimates-reset', {
        members: room.members
      });

      console.log(`Estimates reset in room ${roomId}`);
    } catch (error) {
      console.error('Error resetting estimates:', error);
      socket.emit('error', { message: 'Failed to reset estimates' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      console.log('Client disconnected:', socket.id);

      // Find and update the user in all rooms
      rooms.forEach((room, roomId) => {
        const member = room.members.find(m => m.socketId === socket.id);
        if (member) {
          member.online = false;
          member.status = 'Offline';
          
          // Broadcast updated members list
          io.to(roomId).emit('room-updated', {
            members: room.members,
            estimates: room.revealed ? room.estimates : {}
          });
        }
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});
